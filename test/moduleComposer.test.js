'use strict';

var assert = require('assert');
var compose = require('../lib/moduleComposer.js');
var defaultOpts = require('../lib/defaultOpts.js');
var contentTypes = require('../lib/contentTypes.js');


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
                    orig: new contentTypes.CVar('scopeFn', function (){
                        return 0;
                    }),
                    expected: 'var scopeFn = function (){'+
                        `${rn}    return 0;`+
                        `${rn}};`
                },
                'objects as variables': {
                    orig: new contentTypes.CVar('scopeObj', { a: 1, b: 2 }),
                    expected: 'var scopeObj = { a: 1, b: 2 };'
                },
                'expression results as variables': {
                    orig: new contentTypes.CVarExpression('exprResult', function (){
                        return 2+2;
                    }),
                    expected: 'var exprResult = (function (){'+
                        `${rn}    return 2+2;`+
                        `${rn}})();`
                },
                'arbitrary code as standard functions': {
                    orig: new contentTypes.CProcedure(function(){
                        let ten = 20 / 2;
                        let two = 20 / ten;
                    }),
                    expected: 'let ten = 20 / 2;'+
                        `${rn}let two = 20 / ten;`
                },
                'arbitrary code as arrow functions': {
                    orig: new contentTypes.CProcedure(() => scopeFn()),
                    expected: 'scopeFn();'
                }
            }
        };
        var combinationTests = {
            imports: {
                orig: [testStatements.imports.npm.orig, testStatements.imports.path.orig],
                expected: testStatements.imports.npm.expected+
                    rn+testStatements.imports.path.expected
            },
            _exports: {
                orig: [testStatements._exports.string.orig, testStatements._exports.Array.orig],
                expected: 'module.exports = { foo, bar, baz };'
            },
            contents: {
                orig: [],
                expected: ''
            }
        }
        Object.keys(testStatements.contents).forEach(function(testKey, index){
            combinationTests.contents.orig.push(testStatements.contents[testKey].orig);
            if(index !== 0){
                combinationTests.contents.expected += (rn+rn);
            }
            combinationTests.contents.expected += testStatements.contents[testKey].expected;
        });


        it('Should be a function', function(){
            assert.equal(typeof compose, 'function');
        });

        describe('imports', function(){
            let tests = testStatements.imports;
            let combinedTest = combinationTests.imports;

            Object.keys(tests).forEach(function(importType){
                it(`Should return correct statements for ${importType} imports`, function(){
                    let testCase = tests[importType];
                    assert.equal(compose([testCase.orig], [], []), testCase.expected);
                });
            });

            it('Should handle multiple import statements', function(){
                assert.equal(compose(combinedTest.orig, [], []), combinedTest.expected);
            });
        });
        describe('exports', function(){
            let tests = testStatements._exports;
            let combinedTest = combinationTests._exports;

            Object.keys(tests).forEach(function(exportType){
                it(`Should return correct statements for ${exportType} exports`, function(){
                    let testCase = tests[exportType];
                    assert.equal(compose([], [testCase.orig], []), testCase.expected);
                });
            });

            it('Should handle multiple exports', function(){
                assert.equal(compose([], combinedTest.orig, []), combinedTest.expected);
            });
        });
        describe('contents', function(){
            let tests = testStatements.contents;
            let combinedTest = combinationTests.contents;

            Object.keys(tests).forEach(function(content){
                it(`Should return correct statements for ${content}`, function(){
                    let testCase = tests[content];
                    assert.equal(compose([], [], [testCase.orig]), testCase.expected);
                });
            });
            it('Should handle multiple content statements', function(){
                assert.equal(compose([], [], combinedTest.orig), combinedTest.expected);
            });

        });

        it('Should correctly compose all statements', function(){
            let expected = combinationTests.imports.expected+
                rn+rn+combinationTests.contents.expected+
                rn+rn+combinationTests._exports.expected;
            let output = compose( combinationTests.imports.orig,
                combinationTests._exports.orig,
                combinationTests.contents.orig );
            assert.equal(output, expected);
        });

        

    });
});