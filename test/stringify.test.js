var assert = require('assert');
var stringify = require('../lib/stringify.js');

describe('lib/stringify.js', function(){
    describe('#stringify(obj, opts)', function(){
        
        describe('primitives', function(){
            var tests = [
                {type: 'null',      val: null,      output: 'null'},
                {type: 'undefined', val: undefined, output: 'undefined'},
                {type: 'string',    val: 'foo',     output: '\'foo\''},
                {type: 'number',    val: 0,         output: '0'},
                {type: 'number',    val: 3.14,      output: '3.14'},
                {type: 'boolean',   val: true,      output: 'true'},
                {type: 'boolean',   val: false,     output: 'false'},
                {type: 'RegExp',    val: /'/g,      output: '/\'/g'}
            ];
            tests.forEach(function(test) {
                it(`Correctly stringifies type ${test.type} (${test.val})`, function(){
                    assert.equal(test.output, stringify(test.val));
                });
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
                    `\n\t'What a long string this is!  Especially if it keeps going...',`+
                    `\n\t1234567890,`+
                    `\n\t/^"[a-zA-Z_][a-zA-Z_0-9]*"$/`+
                '\n]';
                assert.equal(stringify(orig), expected);
            });
        });
    });
});