const fs = require('fs');
const util = require('util');
const _ = require('lodash');

/**
 * Writes a module containing the object passed in, which can include functions as properties.
 * @param {*} object 
 * @param {*} filename 
 * @param {*} callback 
 * @param {*} options 
 */
let writeModule = function(object, filename, callback, options){
    console.log('Preparing data for serialization...')
    let maxDepth = 25;
    let prepObject = function(obj, depth){
        let newObj;
        let nextDepth = depth+1;

        if (typeof obj !== 'object' || Array.isArray(obj)){
            return obj;
        }
        if(depth > maxDepth){
            console.error('Max depth exceeded!');
            return obj;
        }

        newObj = {};
        _.forIn((obj), (prop, key)=>{
            if(typeof prop === 'function'){
                prop.inspect = prop.toString;
            }else if(typeof prop === 'object'){
                prop = prepObject(prop, nextDepth);
            }
            newObj[key] = prop;
        });
        return newObj;
    };
    object = prepObject(object, 0);
    console.log('Serializing data...')
    let fileContents = `
const moduleData = ${util.inspect(object, { depth:25, maxArrayLength: null })};
module.exports = moduleData;
    `;
    console.log('Writing data to file...');
    fs.writeFile(filename, fileContents, callback);
};

class Module {
    constructor(opts){
        this.options = opts;
        this.requires = [];
        this.vars = [];
    }
    require(varName, importLoc){
        this.requires.push([varName, importLoc]);
    }
    addVar(varName, expr){

    }
    exportVars(Vars){

    }
    writeToFile(filename, callback){
        
    }
}

module.exports = { writeModule };