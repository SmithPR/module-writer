'use strict';

var assert = require('assert');
var Module = require('../lib/Module.js');
var compose = require('../lib/moduleComposer.js');
var contentTypes = require('../lib/util/contentTypes.js');

describe('lib/Module.js', function(){
    describe('Module class', function(){

        describe('constructor(options)', function(){

            let expectedProperties = {
                options: 'object',
                setOptions: 'function',
                require: 'function',
                addVar: 'function',
                addVarProcedure: 'function',
                runProcedure: 'function',
                exportVars: 'function',
                writeToFile: 'function'
            };

            describe('Shape of returned instance', function(){
                let moduleInstance = new Module({indent: '  '});

                Object.keys(expectedProperties).forEach(function(propName){
                    it(`Has a ${expectedProperties[propName]} property called "${propName}"`, function(){
                        assert.equal(typeof moduleInstance[propName],
                            expectedProperties[propName]);
                    });
                });
            });
            it('Should correctly accept options', function(){

            });
            it('Should still work without arguments', function(){

            });
        });
    });
});