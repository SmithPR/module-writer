const fs = require('fs');
const contentTypes = require('./contentTypes.js');
const compose = require('./moduleComposer.js');

class Module {
    constructor(options){
        this.options = options;
        this._imports = [];
        this._contents = [];
        this._exports = [];
    }
    setOptions(options){
        this.options = options;
    }
    require(varName, importLoc){
        this._imports.push({
            varName: varName,
            importLoc: importLoc
        });
    }
    addVar(varName, wrappedVar){
        if(typeof varName === 'string' && typeof wrappedVar === 'function'){
            wrappedVar = wrappedVar();
            //any value or type is OK for wrappedVar
            this._contents.push(new contentTypes.CVar(varName, wrappedVar));
        }
    }
    addVarProcedure(varName, wrappedProcedure){
        if(typeof varName === 'string' && typeof wrappedProcedure === 'function'){
            wrappedProcedure = wrappedProcedure();
            if(typeof wrappedProcedure === 'function'){
                this._contents.push(new contentTypes.CVarExpression(varName, wrappedProcedure));
            }
        }
    }
    runProcedure(wrappedProcedure){
        if(typeof wrappedProcedure === 'function'){
            wrappedProcedure = wrappedProcedure();
            if(typeof wrappedProcedure === 'function'){
                this._contents.push(new contentTypes.CProcedure(wrappedProcedure));
            }
        }
    }
    exportVars(vars){
        if(typeof vars === 'string' || Array.isArray(vars)){
            this._exports.push(vars);
        }
    }
    writeToFile(filename, callback, options){
        if(options){
            setOptions();
        }
        var moduleString = compose(this._imports, this._exports, this.options);
        return fs.writeFile(filename, moduleString, callback);
    }
}

module.exports = Module;