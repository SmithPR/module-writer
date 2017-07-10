/**
 * Module composer, which uses stringify.js internally to serialize
 * module parts.
 */
const defaultOpts = require('./util/defaultOpts.js');
const contentTypes = require('./util/contentTypes.js');
const stringify = require('./stringify.js');
const functionParts = require('./util/functionParts.js');

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
            return functionParts.getBody(contentObj.payload, opts);
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

module.exports = compose;
module.exports.__module = module;