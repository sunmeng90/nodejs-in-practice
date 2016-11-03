var db = require('../index').mydatabase;
var describe = require('mocha').describe;
var should = require('should');


describe('mydatabase', function() {
    var testdb = new db('./test.db');

    it('load', function(done) {
        var testdb1 = new db('./test.db');
        testdb1.on('load', function() {
            should(testdb._records).be.a.Object;
            done();
        });
    });
    
    it('set', function(done) {
        testdb.set(1, { 'name': 'sunmeng1', 'age': 20, birthday: '2010-10-10' }, function() {
            testdb._records[1].should.be.a.Object;
            done();
        });
        //TODO: !!! how to call done directly with multiple async call=
        // testdb.set(2, { 'name': 'sunmeng2', 'age': 20, birthday: '2010-10-10' });
        // testdb.set(3, { 'name': 'sunmeng3', 'age': 20, birthday: '2010-10-10' });
        // testdb.set(4, { 'name': 'sunmeng4', 'age': 20, birthday: '2010-10-10' });
        // testdb.set(5, { 'name': 'sunmeng5', 'age': 20, birthday: '2010-10-10' });
        // testdb.set(6, { 'name': 'sunmeng6', 'age': 20, birthday: '2010-10-10' });
    });

    it('delete', function(done) {
        testdb.delete(6, function() {
            should(testdb._records[6]).be.null;
            done();
        });
    });

});
