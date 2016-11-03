var stream = require('stream');
var fs = require('fs');
var util = require('util');

var path = require('path');
var test_file_small = path.join(__dirname, 'test_data/small.txt');
var test_csv_small = path.join(__dirname, 'test_data/csv_small.csv');

// var test_file_large = path.join(__dirname, 'test_data/large.txt');


/*function MyReader(options) {
    stream.Readable.call(this.options);
}

//Object.create(proto, [,propertiesObject])
MyReader.prototype = Object.create(stream.Readable.prototype, { constructor: { value: MyReader } });

*/
//read stream
function MyReader(source) {
    stream.Readable.call(this);
    this.source = source;
    this._buffer = "";

    source.on('readable', function() {
        this.read();
    }.bind(this));
}

util.inherits(MyReader, stream.Readable);

MyReader.prototype._read = function(size) {
    var chunk;
    var line;
    var lineIndex;
    if (this._buffer.length === 0) {
        chunk = this.source.read();
        this._buffer += chunk;
    }
    lineIndex = this._buffer.indexOf('\n');
    if (lineIndex !== -1) {
        line = this._buffer.slice(0, lineIndex);
        this._buffer = this._buffer.slice(lineIndex + 1);
        this.emit('newline', line);
        this.push(line);
    }

};

var sample = fs.createReadStream(test_file_small);

var myreader = new MyReader(sample);

myreader.on('newline', function(line) {
    console.log("line: " + line);
});

//write stream
function MyWriter(options) {
    stream.Writable.call(this, options)
}


MyWriter.prototype = Object.create(stream.Writable.prototype, {
    constructor: {
        value: MyWriter
    }
});

MyWriter.prototype._write = function(chunk, encoding, callback) {
    process.stdout.write('>>' + chunk);
    callback();
};

//test code
process.stdin.pipe(new MyWriter());

//duplex stream
function MyDuplex(options) {
    stream.Duplex.call(this, options);
    this.waiting = false;
}

MyDuplex.prototype = Object.create(stream.Duplex.prototype, {
    constructor: {
        value: MyDuplex
    }
});

MyDuplex.prototype._read = function(size) {
    if (!this.waiting) {
        this.push('Feed me data >');
        this.waiting = true;
    }
};

MyDuplex.prototype._write = function(chunk, encoding, callback) {
    this.waiting = false;
    this.push(chunk);
    callback();
};

//test code
var myD = new MyDuplex();
process.stdin.pipe(myD).pipe(process.stdout);

//transform stream
function MyTransform(options) {
    stream.Transform.call(this, options);
    this.value = '';
    this.headers = [];
    this.values = [];
    this.line = 0;
}

MyTransform.prototype = Object.create(stream.Transform.prototype, {
    constructor: {
        value: MyTransform
    }
});

MyTransform.prototype._transform = function(chunk, encoding, done) {
    var c = '';
    var i;
    chunk = chunk.toString();
    for (i = 0; i < chunk.length; i++) {
        c = chunk.charAt(i);
        if (c === ',') {
            this.addValue();
        } else if (c === '\n') {
            this.addValue();
            if (this.line > 0) {
                this.push(JSON.stringify(this.toObject()));
            }
            this.values = [];
            this.line++;
        } else {
            this.value += c;
        }
    }
    done();
};

MyTransform.prototype.addValue = function() {
    if (this.line === 0) {
        this.headers.push(this.value);
    } else {
        this.values.push(this.value);
    }
    this.value = '';
};

MyTransform.prototype.toObject = function() {
    var i;
    var obj = {};
    for (i = 0; i < this.headers.length; i++) {
        obj[this.headers[i]] = this.values[i];
    }
    return obj;
};

//test code
var myT = new MyTransform();
fs.createReadStream(test_csv_small).pipe(myT).pipe(process.stdout);

