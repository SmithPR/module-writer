const fs = require('fs');
const contentTypes = require('./lib/util/contentTypes.js');
const compose = require('./lib/moduleComposer.js');
const Module = require('./lib/Module');

/**
 * Writes a module containing the object passed in, which can include functions as properties.
 * @param {*} object 
 * @param {*} filename 
 * @param {*} callback 
 * @param {*} options 
 */
let writeModule = function(object, filename, callback, options){
    let objCO = new contentTypes.CVar('exportsObject', obj);
    let exportCO = new contentTypes.CProcedure((function(exportsObject){
        return function(){
            module.exports = exportsObject;
        };
    })());
    let moduleString = compose([], [], [objCO, exportCO]);
    
    return fs.writeFile(filename, moduleString, callback);
};

let writeModuleFn = function(moduleFn, filename, callback, options){
    let fnCO = new contentTypes.CProcedure(moduleFn);
    let moduleString = compose([], [], [fnCO]);
    return fs.writeFile(filename, moduleString, callback);
};

module.exports = { writeModule, writeModuleFn, Module };