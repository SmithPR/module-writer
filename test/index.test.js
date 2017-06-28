var assert = require('assert');
var index = require('../index.js');


describe('index.js', function() {

    describe('#writeModule(object, filename, callback, options)', function() {
        it('Should be a function', function() {
            assert.equal(typeof index.writeModule, 'function');
        });
    });
    
});
