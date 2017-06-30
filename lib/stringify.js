/**
 * Serialization function based on Node's util.inspect
 * 
 * Only serializes objects/functions which can be created
 * using literal expressions.
 */

const defaultOpts = {
    maxDepth: 25,
    indent: '\t',
    lineBreak: '\r\n',
    breakLength: 75
};

function getConstructorOf(obj) {
    while (obj) {
        var descriptor = Object.getOwnPropertyDescriptor(obj, 'constructor');
        if (descriptor !== undefined &&
            typeof descriptor.value === 'function' &&
            descriptor.value.name !== '') {
            return descriptor.value;
        }
        obj = Object.getPrototypeOf(obj);
    }
    return null;
}

function stringify(obj, opts){
    opts = Object.assign({}, defaultOpts, opts)
    return formatValue(obj, opts.maxDepth , [], opts);
};

function formatValue(value, recurseTimes, seen, opts){

    //Note: Skip Proxy handling
    //Note: Skip custom inspect functions

    //Primitive support
    var primitive = formatPrimitive(value, opts);
    if (primitive) {
        return primitive;
    }

    // Look up the keys of the object.
    // Note: Skipping symbol keys for now.
    var keys = Object.keys(value);

    var formatted;
    var raw = value;

    // Convert some objects into primitives...
    try {
        // the .valueOf() call can fail for a multitude of reasons
        raw = value.valueOf();
    } catch (e) {
        // ignore...
    }
    if (typeof raw === 'string') {
        // for boxed Strings, we have to remove the 0-n indexed entries,
        // since they just noisy up the output and are redundant
        keys = keys.filter(function(key) {
            if (typeof key === 'symbol') {
                    return true;
            }
            return !(key >= 0 && key < raw.length);
        });
    }

    if(keys.length === 0){
        
        // Actually print boxed primitives
        if( typeof raw === 'string' ||
            typeof raw === 'symbol' ||
            typeof raw === 'number' ||
            typeof raw === 'boolean' ){
            // Note: Skip Date, Error type handling
            return formatPrimitive(raw, opts);
        }

        // Note: Skip ArrayBuffer, SharedArrayBuffer, External handling
    }
    
    var constructor = getConstructorOf(value);
    var empty = false;
    var formatter;
    var braces;

    // Note: Skip Set, Map, ArrayBuffer, DataView, TypedArray, Promise,
    // MapIterator, SetIterator handling

    if(Array.isArray(value)){
        //Array literal syntax
        constructor = null;
        braces = ['[', ']'];
        empty = value.length === 0; // Do not handle string props on arrays
        formatter = formatArray;
    }else{
        //Object literal syntax
        if (constructor && constructor.name === 'Object'){
            constructor = null;
        }
        braces = ['{', '}'];
        empty = keys.length === 0;
        formatter = formatObject
    }

    if(constructor){
        //Prepend comment with original class name
        braces[0] = `/* ${constructor.name} */ ${braces[0]}`;
    }
    if(empty){
        return braces[0]+braces[1];
    }
    if(recurseTimes < 0){
        return braces[0]+'/* [Module-writer]: Max depth reached! */'+braces[1];
    }
    
    seen.push(value);
    output = formatter(value, keys, recurseTimes, seen, opts);
    seen.pop();
    return reduceToSingleString(output, braces, opts);
};

function formatPrimitive(value, opts){
    var type;

    if (value === undefined){
        return 'undefined';
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null){
        return 'null';
    }

    type = typeof value;

    if (type === 'string') {
        return '\'' +
            JSON.stringify(value)
                .replace(/^"|"$/g, '')
                .replace(/'/g, "\\'")
                .replace(/\\"/g, '"') +
        '\'';
    }
    if (type === 'number'){
        return formatNumber(value, opts);
    }
    if (type === 'boolean'){
        return '' + value;
    }
    // es6 symbol primitive
    if (type === 'symbol'){
        return value.toString();
    }

    // functions
    if (type === 'function'){
        return formatFunction(value, opts);
    }

    // Regular expressions
    if (value instanceof RegExp) {
      return RegExp.prototype.toString.call(value);
    }
};

function formatNumber(value, opts){
    if(Object.is(value, -0)){
        return '-0';
    }
    return ''+value;
};

function formatFunction(value, opts){
    //Switch to specified line endings
    let fnBlock = Function.prototype.toString.call(value).replace(/\r?\n/g, `${opts.lineBreak}`);
    
    //Prevent odd spacing in function blocks
    let leadingSpaces = (new RegExp(`${opts.lineBreak}(\\s*)}(?!.*${opts.lineBreak}).*$`)).exec(fnBlock);
    if(leadingSpaces && leadingSpaces[1]){
        return fnBlock.replace(new RegExp(opts.lineBreak+leadingSpaces[1], 'g'), opts.lineBreak);
    }else{
        return fnBlock;
    }
}

function formatObject(value, keys, recurseTimes, seen, opts){
    return keys.map(function(key) {
        return formatProperty(value, key, recurseTimes, seen, opts, false);
    });
};

function formatArray(value, keys, recurseTimes, seen, opts){
    var output = [];
    let index = 0;
    while (index < value.length) {
        // We do not care if the array is sparse, since it is being converted to a literal.
        output.push(formatProperty(value, String(index), recurseTimes, seen, opts, true));
        index++;
    }
    //Skip handling string keys, since they are not expressed literally for Arrays
    return output;
};

function formatProperty(value, key, recurseTimes, seen, opts, inArray){
    var name;
    var output;
    var propVal = value[key];
    // Note: Do not handle complex property descriptors, for now

    if(seen.indexOf(propVal) > -1){
        //This property is one of its own parents (circular ref)
        output = '/* [Module-writer] Circular reference */ undefined'
    }else{
        //Recurse to stringify the property
        if(recurseTimes === null){
            //No recursion limit
            output = formatValue(propVal, null, seen, opts);
        }else{
            output = formatValue(propVal, recurseTimes-1, seen, opts);
        }
        //Add a level of indentation 
        if (output.indexOf(opts.lineBreak) > -1) {
            output = output.replace(new RegExp(opts.lineBreak, 'g'), opts.lineBreak+opts.indent);
        }
    }

    if(inArray){
        //Do not include a property name
        return output;
    }else{
        //Include a property name
        name = JSON.stringify('' + key);
        
        //Escape names if needed
        if (/^"[a-zA-Z_][a-zA-Z_0-9]*"$/.test(name)) {
            name = name.substr(1, name.length - 2);
        } else {
            name = name.replace(/'/g, "\\'")
                .replace(/\\"/g, '"')
                .replace(/^"|"$/g, "'")
                .replace(/\\\\/g, '\\');
        }
        return `${name}: ${output}`;
    }
};

function reduceToSingleString(output, braces, opts){
    var length = output.reduce(function(prev, cur){
        return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
    }, 0);
    if(length > opts.breakLength){
        return braces[0]+opts.lineBreak+opts.indent+
            output.join(`,${opts.lineBreak}${opts.indent}`)+
            opts.lineBreak+braces[1];
    }else{
        return braces[0]+' '+output.join(', ')+' '+braces[1];
    }
};

//Expose default opts to tests
stringify.defaultOpts = defaultOpts;

//Export the stringify operation
module.exports = stringify;