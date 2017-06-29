'use strict';

var assert = require('assert');
var stringify = require('../lib/stringify.js');


const regexEqual = function(x, y) {
    return (x instanceof RegExp) && (y instanceof RegExp) && 
        (x.source === y.source) && (x.global === y.global) && 
        (x.ignoreCase === y.ignoreCase) && (x.multiline === y.multiline);
};

//Default line endings
const rn = stringify.defaultOpts.lineBreak;
const rnt = stringify.defaultOpts.lineBreak+stringify.defaultOpts.indent;

let testFnNoLeadingSpaces = function(){
    return foo;
};

describe('lib/stringify.js', function(){
    describe('#stringify(obj, opts)', function(){
        
        describe('primitives', function(){
            var tests = [
                {type: 'null',      val: null,      expected: 'null'},
                {type: 'undefined', val: undefined, expected: 'undefined'},
                {type: 'string',    val: 'foo',     expected: '\'foo\''},
                {type: 'number',    val: 0,         expected: '0'},
                {type: 'number',    val: -0,        expected: '-0'},
                {type: 'number',    val: 3.14,      expected: '3.14'},
                {type: 'boolean',   val: true,      expected: 'true'},
                {type: 'boolean',   val: false,     expected: 'false'}
            ];
            tests.forEach(function(test) {
                let output = stringify(test.val);
                it(`Correctly stringifies type ${test.type} (${test.expected})`, function(){
                    assert.equal(test.expected, output);
                });
                it(`Stringified ${test.type} ${test.expected} evals to the original input`, function(){
                    assert.equal(test.val, eval(output));
                });
            });
            
        });

        describe('boxed primitives', function(){
            var tests = [
                {type: 'String',    val: new String('foo'),  expected: '\'foo\''},
                {type: 'Number',    val: new Number(0),      expected: '0'},
                {type: 'Number',    val: new Number(3.14),   expected: '3.14'},
                {type: 'Boolean',   val: new Boolean(true),  expected: 'true'},
                {type: 'Boolean',   val: new Boolean(false), expected: 'false'}
            ];
            tests.forEach(function(test) {
                let output = stringify(test.val);
                it(`Correctly stringifies wrapper ${test.type} (${test.val})`, function(){
                    assert.equal(test.expected, output);
                });
                it(`Stringified ${test.type} ${test.val} evals to the original primitive`, function(){
                    assert.equal(test.val.valueOf(), eval(output).valueOf());
                });
            });
        });

        describe('Regular Expressions', function(){
            let orig = /'/g;
            let expected = '/\'/g'
            let output = stringify(orig);

            it(`Correctly stringifies RegExp (${orig})`, function(){
                assert.equal(expected, output);
            });
            it(`Stringified RegExp ${orig} evals to the original Regular Expression`, function(){
                assert.equal(true, regexEqual(orig, eval(output)));
            });
        });

        describe('functions', function(){
            let testCases = {
                simpleFn: {
                    orig: function(a, b){
                        if(a > b) return 1;
                        else if(a === b) return 0;
                        else return -1;
                    },
                    expected: 'function (a, b){'+
                        `${rn}    if(a > b) return 1;`+
                        `${rn}    else if(a === b) return 0;`+
                        `${rn}    else return -1;`+
                        `${rn}}`
                },
                fnNoSpaces: {
                    orig: testFnNoLeadingSpaces,
                    expected: 'function (){'+
                        `${rn}    return foo;`+
                        `${rn}}`
                },
                arrowFn: {
                    orig: foo => { 'bar' },
                    expected: 'foo => { \'bar\' }'
                },
                arrowFnLong: {
                    orig: (foo, bar) => {
                        return 'baz';
                    },
                    expected: '(foo, bar) => {'+
                        `${rn}    return \'baz\';`+
                        `${rn}}`
                },
                generatorFn: {
                    orig: function* idMaker() {
                        var index = 0;
                        while (index < 3)
                            yield index++;
                    },
                    expected: 'function* idMaker() {'+
                        `${rn}    var index = 0;`+
                        `${rn}    while (index < 3)`+
                        `${rn}        yield index++;`+
                        `${rn}}`
                }
            };
            Object.keys(testCases).forEach(testName => {
                testCases[testName].output = stringify(testCases[testName].orig);
            });
            
            it('Correctly stringifies functions', function(){
                assert.equal(testCases.simpleFn.output, testCases.simpleFn.expected);
            });
            it('Stringified functions work properly', function(){
                assert.equal(0, (eval(`(${testCases.simpleFn.output})`))(5, 5));
            });
            it('Does not remove leading spaces unless closing bracket has them', function(){
                assert.equal(testCases.fnNoSpaces.output, testCases.fnNoSpaces.expected);
            });
            it('Correctly stringifies ES6 short arrow functions', function(){
                assert.equal(testCases.arrowFn.output, testCases.arrowFn.expected);
            });
            it('Correctly stringifies ES6 long arrow functions', function(){
                assert.equal(testCases.arrowFnLong.output, testCases.arrowFnLong.expected);
            });
            it('Correctly stringifies ES6 generator functions', function(){
                assert.equal(testCases.generatorFn.output, testCases.generatorFn.expected);
            });
        });

        describe('object', function(){
            it('Correctly stringifies empty objects', function(){
                assert.equal('{}', stringify({}));
            });
            it('Correctly stringifies simple objects', function(){
                assert.equal('{ a: 1, b: \'foo\', c: null }', stringify({ a: 1, b: 'foo', c: null }));
            });
            
            it('Preserves odd property names', function(){
                assert.equal('{ \'0\': 1 }', stringify({ '0': 1 }));
            });

            it('Breaks long objects onto multiple lines', function(){
                let orig = {
                    stringProp: 'What a long string this is!  Especially if it keeps going...',
                    numProp: 1234567890,
                    RegExpProp: /^"[a-zA-Z_][a-zA-Z_0-9]*"$/
                };
                let expected = '{' +
                    `${rnt}stringProp: 'What a long string this is!  Especially if it keeps going...',`+
                    `${rnt}numProp: 1234567890,`+
                    `${rnt}RegExpProp: /^"[a-zA-Z_][a-zA-Z_0-9]*"$/`+
                `${rn}}`;
                assert.equal(stringify(orig), expected);
            });
        });

        describe('Arrays', function(){
            it('Correctly stringifies empty Arrays', function(){
                assert.equal('[]', stringify([]));
            });
            it('Correctly stringifies simple Arrays', function(){
                assert.equal('[ 1, \'foo\', null ]', stringify([ 1, 'foo', null ]));
            });
            
            it('Breaks long Arrays onto multiple lines', function(){
                let orig = [
                    'What a long string this is!  Especially if it keeps going...',
                    1234567890,
                    /^"[a-zA-Z_][a-zA-Z_0-9]*"$/
                ];
                let expected = '[' +
                    `${rnt}'What a long string this is!  Especially if it keeps going...',`+
                    `${rnt}1234567890,`+
                    `${rnt}/^"[a-zA-Z_][a-zA-Z_0-9]*"$/`+
                `${rn}]`;
                assert.equal(stringify(orig), expected);
            });
        });

        describe('Complex objects', function(){
            
        });
    });
});