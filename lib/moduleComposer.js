/**
 * Module composer, which uses stringify.js internally to serialize
 * module parts.
 */
const defaultOpts = require('./defaultOpts.js');
const contentTypes = require('./contentTypes.js');
const stringify = require('./stringify.js');

/**
 * Creates a string representing the module specified by the input parameters
 * 
 * @param {Array} imports 
 * @param {Array} exports 
 * @param {Array} contents
 * @param {object} opts
 * 
 * @return {string}     The composed module
 */
var compose = function(imports, _exports, contents, opts){
    opts = Object.assign({}, defaultOpts, opts);

    //Stringify each import, content item, and export
    imports = imports.map(function(importObj){
        return `var ${importObj.varName} = require(${stringify(importObj.importLoc, opts)});`
    })
    contents = contents.map(function(contentObj){
        //Different logic per contentType class

        if(contentObj instanceof contentTypes.CVar){
            return `var ${contentObj.varName} = ${stringify(contentObj.payload, opts)};`
        
        }else if(contentObj instanceof contentTypes.CVarExpression){
            return `var ${contentObj.varName} = (${stringify(contentObj.payload, opts)})();`
        
        }else if(contentObj instanceof contentTypes.CProcedure){
            return getFunctionBody(contentObj.payload, opts);
        }
        return '';
    });
    _exports = processExports(_exports, opts);
    
    //Add breaks between items
    imports = imports.length ? imports.join(opts.lineBreak) : '';
    contents = contents.length ? contents.join(opts.lineBreak+opts.lineBreak) : '';
    _exports = _exports.length ? 'module.exports = { '+_exports.join(', ')+' };' : '';

    //Return non-empty statement groups with line breaks in between
    return [ imports, contents, _exports ].filter(function(statements){
        return statements !== '';
    }).join(opts.lineBreak+opts.lineBreak);
};

//Recursive function to handle nested arrays of exports
var processExports = function(_exports, opts){
    let result = [];
    _exports.forEach(function(exportItem){
        if(Array.isArray(exportItem)){
            result = result.concat(processExports(exportItem));
        }else if(typeof exportItem === 'string'){
            result.push(exportItem);
        }
    });
    return result;
};

//Simple function to return only the bodies of functions
var getFunctionBody = function(fn, opts){
    let bracketContents;
    let leadingSpaces;
    let arrowContents;
    fn = stringify(fn, opts);

    bracketContents = /{([\s\S]*)}[^}]*$/.exec(fn);
    if(bracketContents && bracketContents[1]){
        //Function has a standard body
        fn = bracketContents[1];

        //Remove first indent level (may not match opts.indent)
        leadingSpaces = (new RegExp(`${opts.lineBreak}(\\s*)`)).exec(fn);
        if(leadingSpaces && leadingSpaces[1]){
            fn = fn.replace(new RegExp(opts.lineBreak+leadingSpaces[1], 'g'), opts.lineBreak);
        }
        //Remove newline at beginning and end of body if there was no code on the same line as the outer brackets
        fn = fn.replace(new RegExp(`^\\s*${opts.lineBreak}`), '').replace(new RegExp(`${opts.lineBreak}\\s*$`), '');
        return fn;
    }else{
        //This may be a bracketless arrow function
        arrowContents = /=>([\s\S]*)$/.exec(fn);
        if(arrowContents && arrowContents[1]){
            return arrowContents[1].trim()+';';
        }
    }
    return '';
};

module.exports = compose;