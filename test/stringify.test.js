'use strict';

var assert = require('assert');
var stringify = require('../lib/stringify.js');


const regexEqual = function(x, y) {
    return (x instanceof RegExp) && (y instanceof RegExp) && 
        (x.source === y.source) && (x.global === y.global) && 
        (x.ignoreCase === y.ignoreCase) && (x.multiline === y.multiline);
};
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
                        '\r\n    if(a > b) return 1;'+
                        '\r\n    else if(a === b) return 0;'+
                        '\r\n    else return -1;'+
                        '\r\n}'
                },
                fnNoSpaces: {
                    orig: testFnNoLeadingSpaces,
                    expected: 'function (){'+
                        '\r\n    return foo;'+
                        '\r\n}'
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
                        '\r\n    return \'baz\';'+
                        '\r\n}'
                }
            };
            testCases.simpleFn.output = stringify(testCases.simpleFn.orig);
            testCases.fnNoSpaces.output = stringify(testCases.fnNoSpaces.orig);
            testCases.arrowFn.output = stringify(testCases.arrowFn.orig);
            testCases.arrowFnLong.output = stringify(testCases.arrowFnLong.orig);
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
                    `\r\n\tstringProp: 'What a long string this is!  Especially if it keeps going...',`+
                    `\r\n\tnumProp: 1234567890,`+
                    `\r\n\tRegExpProp: /^"[a-zA-Z_][a-zA-Z_0-9]*"$/`+
                '\r\n}';
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
                    `\r\n\t'What a long string this is!  Especially if it keeps going...',`+
                    `\r\n\t1234567890,`+
                    `\r\n\t/^"[a-zA-Z_][a-zA-Z_0-9]*"$/`+
                '\r\n]';
                assert.equal(stringify(orig), expected);
            });
        });

        describe('Complex objects', function(){

        });
    });
});