var myfinder = require('../index').myfinder;
var describe = require('mocha').describe;
var should = require('should');
var testDir = '.';


const mochaTimeOut = 5000; //ms

describe('recursive finder', function() {
    it('sync find', function() {
        // this.timeout(mochaTimeOut);
        var results = myfinder.findSync(/\.js$/, testDir);
        // console.log(results);
        results.should.be.an.Array;
        results.should.not.be.empty;
        results.length.should.be.above(0);
        results.should.containEql('index.js');
        // results.should.containEql('nindex.js');
    });

    it('async find', function(done) {
        this.timeout(mochaTimeOut);
        myfinder.find(/\.js$/, testDir, function(err, results) {
            if (err) {
                return err;
            }
            results.should.be.an.Array;
            results.should.not.be.empty;
            done();
        });
    });
});
