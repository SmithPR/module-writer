const stringify = require('../stringify.js');

var getArgs = function(fn, opts){
    let argsString;
    fn = stringify(fn, opts);
    
    argsString = /^(?!=>).*\(([^{()]*)\)/.exec(fn);
    if(argsString && argsString[1]){
        //This a standard function, or arrow fn with parens
        //Return a list of argument names
    }else{
        //This could be an arrow function without parens
        argsString = /^([^{}()=>,]*)=>/.exec(fn);
        if(argsString && argsString[1]){
            return [argsString[1].trim()];
        }
    }
    return [];
};

//Simple function to return only the bodies of functions
var getBody = function(fn, opts){
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

module.exports = { getBody };