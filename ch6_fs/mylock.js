var fs = require('fs');

function MyLock() {
    this.locking = false;
}

MyLock.prototype.lockDir = 'config.lock';

MyLock.prototype.lock = function(cb) {
    var me = this;//Note: pay attention to this in callback, try to remove this line
    if (me.locking) return cb();
    fs.mkdir(me.lockDir, function(err) {
        if (err) return cb(err);
        fs.writeFile(me.lockDir + '/' + process.pid, function(err) {
            if (err) return cb(err);
            me.locking = true;
            cb();
        });
    });
};

MyLock.prototype.unlock = function(cb) {
    var me = this;
    if (!me.locking) return cb();
    fs.unlink(me.lockDir, function(err) {
        if (err) return cb(err);
        fs.rmdir(me.lockDir, function(err) {
            if (err) return cb();
            me.locking = false;
            cb();
        });
    });
};

module.exports = MyLock;
