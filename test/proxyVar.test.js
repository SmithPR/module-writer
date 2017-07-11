'use strict';

var assert = require('assert');

var proxyVar = require('../lib/util/proxyVar.js');
var stringify = require('../lib/stringify.js');


describe('lib/util/proxyVar.js', function(){
    describe('#proxyVar(varName, target)', function(){
        
        it('Preserves object functionality', function(){
            let myArr = [1];
            let proxyArr = proxyVar('myArr', myArr);
            assert.equal(proxyArr[0], myArr[0]);
        });
        it('Preserves class', function(){
            let proxyArr = proxyVar('myArr', [1]);
            assert.equal(proxyArr instanceof Array, true);
        });
        it('Adds stringify handlers', function(){
            let proxyArr = proxyVar('myArr', [1]);
            assert.equal(proxyArr[stringify.serializerSym](), 'myArr');
        });
    });
});