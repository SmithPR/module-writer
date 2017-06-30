'use strict';

var assert = require('assert');
var compose = require('../lib/moduleComposer.js');
var stringify = require('../lib/stringify.js');
var defaultOpts = require('../lib/defaultOpts.js');
var constants = require('../lib/constants.js');


//Default line endings
const rn = defaultOpts.lineBreak;
const t = defaultOpts.indent;
const rnt = rn+t;

describe('lib/moduleComposer.js', function(){
    describe('#compose(imports, exports, contents, opts)', function(){
        var testStatements = {
            imports: {
                npm: {
                    orig: { varName: '_', importLoc: 'lodash' },
                    expected: 'var _ = require(\'lodash\');'
                },
                path: {
                    orig: { varName: 'myUtils', importLoc: '../lib/utils.js' },
                    expected: 'var myUtils = require(\'../lib/utils.js\');'
                }
            },
            _exports: {
                string: {
                    orig: 'foo',
                    expected: 'module.exports = { foo };'
                },
                Array: {
                    orig: ['bar', 'baz'],
                    expected: 'module.exports = { bar, baz };'
                }
            },
            contents: {
                'functions as variables': {
                    orig: {
                        type: constants.contentTypes.var,
                        varName: 'scopeFn',
                        payload: function (){
                            return 0;
                        }
                    },
                    expected: 'var scopeFn = function (){'+
                        `${rn}    return 0;`+
                        `${rn}};`
                },
                'objects as variables': {
                    orig: {
                        type: constants.contentTypes.var,
                        varName: 'scopeObj',
                        payload: { a: 1, b: 2 }
                    },
                    expected: 'var scopeObj = { a: 1, b: 2 };'
                },
                'expression results as variables': {
                    orig: {
                        type: constants.contentTypes.varExpression,
                        varName: 'exprResult',
                        payload: function (){
                            return 2+2;
                        }
                    },
                    expected: 'var exprResult = (function (){'+
                        `${rn}    return 2+2;`+
                        `${rn}})();`
                },
                'arbitrary code as standard functions': {
                    orig: {
                        type: constants.contentTypes.procedure,
                        payload: function (){
                            let ten = 20 / 2;
                            let two = 20 / ten;
                        }
                    },
                    expected: 'let ten = 20 / 2;'+
                        `${rn}let two = 20 / ten;`
                },
                'arbitrary code as arrow functions': {
                    orig: {
                        type: constants.contentTypes.procedure,
                        payload: () => scopeFn()
                    },
                    expected: 'scopeFn();'
                }
            }
        }
        it('Should be a function', function(){
            assert.equal(typeof compose, 'function');
        });

        describe('imports', function(){
            let tests = testStatements.imports;

            Object.keys(tests).forEach(function(importType){
                it(`Should return correct statements for ${importType} imports`, function(){
                    let testCase = tests[importType];
                    assert.equal(compose([testCase.orig], [], []), testCase.expected);
                });
            });

            it('Should handle multiple import statements', function(){
                let expected = tests.npm.expected+rn+tests.path.expected;
                assert.equal(compose([tests.npm.orig, tests.path.orig], [], []), expected);
            });
        });
        describe('exports', function(){
            let tests = testStatements._exports;

            Object.keys(tests).forEach(function(exportType){
                it(`Should return correct statements for ${exportType} exports`, function(){
                    let testCase = tests[exportType];
                    assert.equal(compose([], [testCase.orig], []), testCase.expected);
                });
            });

            it('Should handle multiple exports', function(){
                let expected = 'module.exports = { foo, bar, baz };';
                assert.equal(compose([], [tests.string.orig, tests.Array.orig], []), expected);
            });
        });
        describe('contents', function(){

            let tests = testStatements.contents;

            Object.keys(tests).forEach(function(content){
                it(`Should return correct statements for ${content}`, function(){
                    let testCase = tests[content];
                    assert.equal(compose([], [], [testCase.orig]), testCase.expected);
                });
            });

        });

        // it('Should correctly compose all statements', function(){

        // });

        

    });
});