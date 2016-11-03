var lockClass = require('../index').mylock;
var describe = require('mocha').describe;
var should = require('should');
var fs = require('fs');
var mylock = new lockClass();

describe('locking => ', function() {
        it('lock should be created', function(done) {
            mylock.lock(function(err) {
                if (err) throw err;
                console.log('get lock successfully');
                mylock.locking.should.be.true;
                done();
            });

        });

        it('lock should be removed', function(done) {
            mylock.lock(function(err) {
                if (err) throw err;
                console.log('get lock successfully');
                mylock.unlock(function() {
                    console.log('lock released');
                    done();
                });
            });

        });
    }

);


process.on('exit', function() {
    if (mylock.locking) {
        console.log('start remove lock on script exiting');
        fs.unlinkSync(mylock.lockDir + '/' + process.pid);
        fs.rmdirSync(mylock.lockDir);
        console.log('Remove lock on exit');
    }
})
