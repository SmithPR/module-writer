const stringify = require('../stringify.js');

/**
 * Returns a proxy which allows users to freely reference properties
 * when building an object to be serialized.
 * 
 * Referenced properties will be evaluated in the scope of the new module
 * Unfortunately, this approach cannot support operators.
 * @param {*} varName 
 * @param {*} target 
 */
function proxyVar(varName, target){
    let shapeKnown = true;
    target = wrapPrimitive(target);
    if(typeof target !== 'object'){
        shapeKnown = false;
        target = {};
    }

    let p = new Proxy(target, {
        in: function(target, prop){
            if(prop === stringify.serializerSym){
                return true;
            }
            return (prop in target);
        },
        get: function(target, prop){
            if(typeof prop !== 'string'){
                //serialization hook
                if(prop === stringify.serializerSym){
                    return () => varName;
                }
                console.error('module-writer: Symbol properties are not yet supported!');
                return target[prop];
            }
            
            //Passthrough for valueOf()
            if(prop === 'valueOf'){
                return target.valueOf.bind(target);
            }

            //Return a proxy which serializes to varName['prop']
            if(shapeKnown){
                //Let the original object throw an error for the user if target is not present
                return proxyVar(varName+'['+JSON.stringify(prop)+']', target[prop]);
            }else{
                //Just proxy references forever...
                return proxyVar(varName+'['+JSON.stringify(prop)+']');
            }
        },
        apply: function(target, thisArg, argumentsList){
            //Return a proxy which serializes to varName(...args)
            argumentsList = stringify(argumentsList)
                .replace(/^\[/, '(').replace(/\]$/, ')');
            return proxyVar(varName+argumentsList);
        }
    });
    return p;
};

function wrapPrimitive(val){
    switch(typeof val){
        case 'string':
            return new String(val);
        case 'number':
            return new Number(val);
        case 'boolean':
            return new Boolean(val);
        case 'symbol':
            return new Symbol(val);
        default:
            return val;
    }
};

module.exports = proxyVar;