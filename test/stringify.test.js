'use strict';

var assert = require('assert');
var stringify = require('../lib/stringify.js');


const regexEqual = function(x, y) {
    return (x instanceof RegExp) && (y instanceof RegExp) && 
        (x.source === y.source) && (x.global === y.global) && 
        (x.ignoreCase === y.ignoreCase) && (x.multiline === y.multiline);
};

describe('lib/stringify.js', function(){
    describe('#stringify(obj, opts)', function(){
        
        describe('primitives', function(){
            var tests = [
                {type: 'null',      val: null,      expected: 'null'},
                {type: 'undefined', val: undefined, expected: 'undefined'},
                {type: 'string',    val: 'foo',     expected: '\'foo\''},
                {type: 'number',    val: 0,         expected: '0'},
                {type: 'number',    val: 3.14,      expected: '3.14'},
                {type: 'boolean',   val: true,      expected: 'true'},
                {type: 'boolean',   val: false,     expected: 'false'}
            ];
            tests.forEach(function(test) {
                let output = stringify(test.val);
                it(`Correctly stringifies type ${test.type} (${test.val})`, function(){
                    assert.equal(test.expected, output);
                });
                it(`Stringified ${test.type} ${test.val} evals to the original input`, function(){
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
            let orig = function(a, b){
                if(a > b) return 1;
                else if(a === b) return 0;
                else return -1;
            };
            let expected = 'function (a, b){'+
                '\r\n    if(a > b) return 1;'+
                '\r\n    else if(a === b) return 0;'+
                '\r\n    else return -1;'+
                '\r\n}';
            let output = stringify(orig);
            it('Correctly stringifies functions', function(){
                assert.equal(output, expected);
            });
            it('Stringified functions work properly', function(){
                assert.equal(0, (eval(`(${output})`))(5, 5));
            });
        });

        describe('Arrays', function(){
            var orig;
            var expected;
            it('Correctly stringifies simple arrays', function(){
                assert.equal('[ 1, \'foo\', null ]', stringify([ 1, 'foo', null ]));
            });
            
            it('Breaks long arrays onto multiple lines', function(){
                orig = [
                    'What a long string this is!  Especially if it keeps going...',
                    1234567890,
                    /^"[a-zA-Z_][a-zA-Z_0-9]*"$/
                ];
                expected = '[' +
                    `\r\n\t'What a long string this is!  Especially if it keeps going...',`+
                    `\r\n\t1234567890,`+
                    `\r\n\t/^"[a-zA-Z_][a-zA-Z_0-9]*"$/`+
                '\r\n]';
                assert.equal(stringify(orig), expected);
            });
        });
    });
});