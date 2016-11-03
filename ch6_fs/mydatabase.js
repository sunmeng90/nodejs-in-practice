var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

function MyDatabase(path) {
    this.path = path;
    this._records = Object.create(null);
    this._writeStream = fs.createWriteStream(path, { encoding: 'utf-8', flags: 'a' });
    this._load();
}


MyDatabase.prototype = Object.create(EventEmitter.prototype);

MyDatabase.prototype._load = function() {
    var me = this;
    var stream = fs.createReadStream(me.path, { encoding: 'utf-8' });
    var db = me;
    var data = '';
    stream.on('readable', function() {
        data += stream.read();
        var records = data.split('\n');
        data = records.pop();
        for (var i = 0; i < records.length; i++) {
            var record = JSON.parse(records[i]);
            if (record.value == null) {
                delete db._records[record.key];
            } else {
                db._records[record.key] = record.value;
            }
        }
    });
    stream.on('end', function() {
        console.log('database loaded', me._records);
        db.emit('load');
    })
}

MyDatabase.prototype.set = function(key, value, cb) {
    var me = this;
    var line = JSON.stringify({ key: key, value: value }) + '\n';
    if (value == null) {
        delete me._records[key];
    } else {
        me._records[key] = value;
    }
    me._writeStream.write(line, cb);
}

MyDatabase.prototype.delete = function(key, cb) {
    return this.set(key, null, cb);
}

module.exports = MyDatabase;

