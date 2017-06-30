const fs = require('fs');
const constants = require('./lib/constants.js');
const compose = require('./lib/moduleComposer.js');

/**
 * Writes a module containing the object passed in, which can include functions as properties.
 * @param {*} object 
 * @param {*} filename 
 * @param {*} callback 
 * @param {*} options 
 */
let writeModule = function(object, filename, callback, options){
    let objCO = {
        type: constants.contentTypes.var,
        varName: 'exportsObject',
        payload: object
    };
    let exportCO = {
        type: 'procedure',
        payload: (function(exportsObject){
            return function(){
                module.exports = exportsObject;
            };
        })()
    };
    let moduleString = compose([], [objCO, exportCO], []);
    
    fs.writeFile(filename, moduleString, callback);
};

class Module {
    constructor(opts){
        this.opts = opts;
        this._imports = [];
        this._contents = [];
        this._exports = [];
    }
    require(varName, importLoc){
        this._imports.push({
            varName: varName,
            importLoc: importLoc
        });
    }
    addVar(varName, expr){
        if(typeof varName === 'string' && typeof expr === 'function'){
            this._contents.push({
                type: constants.contentTypes.var,
                payload: expr()
            });
        }
    }
    exportVars(vars){

    }
    writeToFile(filename, callback){
        
    }
}

module.exports = { writeModule };