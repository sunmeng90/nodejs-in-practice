#Chapter 1 Getting started
##1. how to create a Node project
***Solution:*** 
```
#create project directory  
mkdir day1  
cd day1  
#create project manifest
npm init  
```
##2. how to write your own stream class
***Solution:***    
Extends Stream class
```js
var Writable = require("stream").Writable;
var util = require("util");

// inherits from writable
util.inherits(CounterStream, Writable);

function CounterStream(matchText, options) {
    Writable.call(this, options);
    this.count = 0;
    this.matcher = new RegExp(matchText, 'ig');
};
//implements _write
CounterStream.prototype._write = function(chunk, encoding, cb) {
    var matches = chunk.toString().match(this.matcher);
    if (matches) {
        this.count += matches.length;
    }
    cb();
};
```
##3.how to write a simple test and run it
***Solution:***    
module: `assert = require('assert')` usage: `assert.equal(count, 3094);`  
add test script in `package.json`  
```js
"scripts": {
    "test": "node test.js"
},
```
run test  
```js
npm test  
```

##Chapter 2 Node's environment
###Modules
####install modules  
***Solution:***    
`npm install -g express # install globally`  
`npm install express # install locally`  

####import modules  
***Solution:***    
`var express = require('express');`  
*NOTES: Node's module system is very different from include in C, or even require in Ruby and Python. The main difference is that require in Node returns an object rather than loading code into the current namespace* 

####create and manage modules
***Solution:***        
```js
//myclass.js    
function MyClass() {    
}    
MyClass.prototype = {    
    method: function() {    
        return 'Hello';    
}    
};    
var myClass = new MyClass();    
module.exports = myClass;    
```
If you need to export multiple objects, values, methods, just attach them to `exports` 

```js
//module-2.js
...
exports.method = function() {
    return 'Hello';
};
exports.method2 = function() {
    return 'Hello again';
};

//test.js
...
//how to import customiezed modules
var myClass = require('./myclass');
var module2 = require('./module-2');
console.log(myClass.method());
console.log(module2.method());
console.log(module2.method2());
```

####load group of related modules  
Node can treat directories as modules, offering opportunities for logically grouping related modules together.
***Solution:***   
Create a file called index.js to load each module and export them as a group and add a package.json file to the directory.

>packages    
>>services    
>>>package.json        
>>>index.js    
>>>userservice.js   
>>>productservice.js    
>>>orderservice.js   
>>>... 


```js
//package.json
{ 
    "name" : "group",
    "main" : "./index.js" 
}

//index.js
module.exports = {
    userservice: require('./userservice'),
    productservice: require('./productservice'),
    orderservice: require('./orderservice'),
    ...
};

//test.js
var services = require('services');
var userservice = services.userservice;
//userservice.doStuff();
```

When Node loading modules, it will look for the package.json firstly, if package.json is not present, then it'll look for index.js

####Locate script path  
***Solution:***    
Use `__dirname` or `__filename` to determine the location of the file.

####standard I/O
Text can be piped to a Node process by using command-line tools in Unix or
Windows. e.g. `cat file.txt | node testprocess.js`  
***Solution:***    
Use `process.stdout` and `process.stdin`.

```js
// Run with:
// cat file.txt | node process.js
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(text) {
    process.stdout.write(text.toUpperCase());
});
```

####console object and logging
***Solution:***   
`console.log`, `console.info`, `console.error`, and `console.warn`  
String interpolation
`console.log('Hello %s', name);` 

| Placeholder   | Type   | Example                 |
| ------------- |:------:| ------------------------|
| %s            | String | '%s', 'value'           |
| %d            | Number | '%f', 3.14              |
| %j            | JSON   | '%j', { name: 'alex' }  |

####benchmark a program
***Solution:***
Use `console.time()` and `console.timeEnd()`.

```js
var benchmark_demo = function(file){
    if(file && file.length){
        console.log('Reading file: ' + file);
        console.time('bench_label');//start benchmark
        var fstream = fs.createReadStream(file);
        fstream.on('end', ()=>{
            console.timeEnd('bench_label');//end benchmark when no more data
        });
        fstream.pipe(process.stdout);//redirect to standard out
    }

};
```

#### built-in assertion

***Solution:***
Use `var assert = require('assert'); assert.equal(1, 1, '1 should equals 1');`

#### Process object
```js
console.log("arch: ", process.arch);
console.log("platform: ", process.platform);
console.log("argv: ", process.argv);//get command line arguments
console.log("PID", process.pid);//get process id
```

#Chapter 3 Buffer
##Buffer
Buffers are raw allocations of the heap, exposed to JavaScript in an array-like manner
Create fixed size buffer
`var buf = Buffer.alloc(255); //`  
`var bufUnsafe = Buffer.allocUnsafe(255);// Allocates a new non-zero-filled Buffer of size bytes. `  

*Note: The underlying memory for Buffer instances created by Buffer.allocUnsafe(size) is not initialized. The contents of the newly created Buffer are unknown and may contain sensitive data.*    
*Note: Pay attentation to non-ascii character encoding concatenation using `Buffer` see [小心buffer的拼接问题](http://cnodejs.org/topic/4faf65852e8fb5bc65113403)*

#Chapter 4 EventEmitter
>When the EventEmitter object emits an event, all of the functions attached to that specific event are called synchronously. Any values returned by the called listeners are ignored and will be discarded.

##Inherits EventEmitter

```js
var events = require('events');
var util = require('util');

function MusicPlayer() {
    this.is_playing = false;
    events.EventEmitter.call(this); //MusicPlayer will borrow EventEmitter's constructor to create musicplayer object
}

util.inherits(MusicPlayer, events.EventEmitter);

```

###Mixing existing object with EventEmitter
Sometimes you have an existing class and can’t easily rework it to inherit directly from EventEmitter. In these cases, mixing in EventEmitter may work.  
***Solution:***
Using a for-in loop is sufficient for copying the properties from one prototype to another. In this way you can copy the necessary properties from EventEmitter

```js
var EventEmitter = require('events').EventEmitter;

function MusicPlayer(track) {
    this.track = track;
    this.playing = false;
    for (var methodName in EventEmitter.prototype) {//copy all methods/props from eventemitter's prototype
        this[methodName] = EventEmitter.prototype[methodName];
    }
}
musicPlayer.on('play', function() {
    this.playing = true;
    console.log(this.toString());
});

```

##register event and event handler
one event can have multiple listeners, they will be called synchronously 
```js
var musicPlayer = new MusicPlayer();

function startPlayer(track) {
    this.is_playing = true;
    console.log('start playing');
}

function stopPlayer(track) {
    this.is_playing = false;
    console.log('stop playing');
}

musicPlayer.once('play', startPlayer); //startPlayer will be executed only once
musicPlayer.on('play', foo);
musicPlayer.addListener('play', bar); //add multile listeners to the event
musicPlayer.on('stop', stopPlayer);

```

###remove event listener
```js
musicPlayer.removeListener('play', getTitle); //remove listener from event, no more execution when event emitted

```

###error event

```js
function errHandler(err) {
    console.log('something going wrong: ' + err);
}
musicPlayer.on('error', errHandler);

```

###categorize your event names using an object
For large project, avoid writing event as a string, Instead, an object can be used with properties that refer to the event name strings which can help people get a centralized list of event names.
```js
var e = MusicPlayer.events = {
    play: 'play',
    pause: 'pause',
    stop: 'stop',
    ff: 'ff',
    rw: 'rw',
    addTrack: 'add-track'
};
...
musicPlayer.on(e.play, function() {
    console.log('Now playing');
});
```

###query listners attached to an event
```js
musicPlayer.listeners('play')
```

#Chapter 5 Streams
Streams are an event-based API for managing and modeling data, and are wonderfully efficient. By leveraging EventEmitter and Node’s non-blocking I/O libraries, the stream module allows data to be dynamically processed(r,w,r&w,t) when it’s available, and then released when it’s no longer needed.  
##Type of stream  

| Name | User methods | Description |
| ------------- | ------ | ------------------------ |
| stream.Readable | _read(size) | Used for I/O sources that generate data |
| stream.Writable | _write(chunk, encoding, callback) | Used to write to an underlying output destination |
| stream.Duplex | _read(size), _write(chunk,encoding, callback) | A readable and writable stream,like a network connection |
| stream.Transform | _flush(size), _transform(chunk, encoding, callback) | A duplex stream that changes data in some way, with no limitation on matching input data size with the output |

##Built-in streams
### fs

#### old fashion

```js
var http = require("http");
var fs = require("fs");
var url = require("url");
var path = require("path");
var zlib = require("zlib");
//const querystring = require('querystring');

const test_data_path = path.join(__dirname, '/test_data/');

var routes = new Map();
var register = function(url, fn) {
    return routes.set(url, fn);
};

...
//read file in normal way
register('/test_non_stream', (test_file, req, resp) => {
    fs.readFile(test_file, (err, data) => {
        if (err) {
            resp.statusCode = 500;
            resp.end(String(err));
        }
        resp.end(data);
    });

});

```

#### read file as a stream

```js
//read file as a stream
register('/test_stream', (test_file, req, resp) => {
    resp.writeHead(200, { 'Content-type': 'text/plain' });
    fs.createReadStream(test_file).pipe(resp);
});
```

Now instead of reading the entire file into memory, a buffer’s worth will be read at a time and sent to the client, which kind of imporoving efficiency

#### pipe stream

```js
//pipe stream
register('/test_stream_zip', (test_file, req, resp) => {
    resp.writeHead(200, { 'content-encoding': 'gzip' });
    fs.createReadStream(test_file).pipe(zlib.createGzip()).pipe(resp);
});

```

Not only read the file as stream, but also compress the file

#### catch stream error
when trying to open a non-exist file, 'error' event to be triggered. The error object passed to the handler    

```js

/*Stream with error handler*/
register('/test_stream_error', (non_exist_test_file, req, resp) => {
    resp.writeHead(200, { 'Content-type': 'text/plain' });
    var fstream = fs.createReadStream(non_exist_test_file);
    fstream.pipe(resp);
    fstream.on('error', err => {
        resp.statusCode = 500;
        resp.end(err.stack);//err object
    });
});

```

##custom stream
###implements a read stream
Extends `stream.Readable` and implements `_read()` method
```js
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
```
###implements a write stream
Extends `stream.Writable` and implements `_write()` method
```js
function MyWriter(options) {
    stream.Writable.call(this, options)
}
MyWriter.prototype = Object.create(stream.Writable.prototype, {
    constructor: {
        value: MyWriter
    }
});
MyWriter.prototype._write = function(chunk, encoding, callback) {
    process.stdout.write('==>' + chunk);
    callback();
};
```
###Implements a duplex stream
Inherit from `stream.Duplex` and implement `_read` and `_write` methods.
```js
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
```
###Implements a transform stream
To do tranformation with the stream data, inherit from `stream.Transform` and implement `_transform` method
```js
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
    //do sth with chunk
    this.push(transformedChunk);
    done();
};
```

#Chapter 6: File System-Sync & Async approaches to files

##The `fs` module allows developer to interact with the file system by providing: 

*   POSIX file I/O primitives 
*   File streaming 
*   Bulk file I/O 
*   File watching 

###POSIX file I/O wrappers
provide equivalent wrappers for POSIX methods, such as chown, rename, rmdir, mkdir 

| POSIX method | fs method | Description |
| ------------- | ------ | ------------------------ |
| rename(2) | fs.rename | Changes the name of a file |
| truncate(2) | fs.truncate | Truncates or extends a file to a specified length |
| ftruncate(2) | fs.ftruncate | Same as truncate but takes a file descriptor |
| chown(2) | fs.chown | Changes file owner and group |
| fchown(2) | fs.fchown | Same as chown but takes a file descriptor |
| lchown(2) | fs.lchown | Same as chown but doesn’t follow symbolic links |
| chmod(2) | fs.chmod | Changes file permissions |
| fchmod(2) | fs.fchmod | Same as chmod but takes a file descriptor |
| lchmod(2) | fs.lchmod | Same as chmod but doesn’t follow symbolic links |
| stat(2) | fs.stat | Gets file status |
| lstat(2) | fs.lstat | Same as stat but returns information about link if |
| provided | rather | than what the link points to |
| fstat(2) | fs.fstat | Same as stat but takes a file descriptor |
| link(2) | fs.link | Makes a hard file link |
| symlink(2) | fs.symlink | Makes a symbolic link to a file |
| readlink(2) | fs.readlink | Reads value of a symbolic link |
| realpath(2) | fs.realpath | Returns the canonicalized absolute pathname |
| unlink(2) | fs.unlink | Removes directory entry |
| rmdir(2) | fs.rmdir | Removes directory |
| mkdir(2) | fs.mkdir | Makes directory |
| readdir(2) | fs.readdir | Reads contents of a directory |
| close(2) | fs.close | Deletes a file descriptor |
| open(2) | fs.open | Opens or creates a file for reading or writing |
| utimes(2) | fs.utimes | Sets file access and modification times |
| futimes(2) | fs.futimes | Same as utimes but takes a file descriptor |
| fsync(2) | fs.fsync | Synchronizes file data with disk |
| write(2) | fs.write | Writes data to a file |
| read(2) | fs.read | Reads data from a file |
 
###streaming
The fs module provides a streaming API with fs.createReadStream and fs.create-
WriteStream. fs.createReadStream is a Readable stream, whereas fs.createWriteStream is a Writeable. see Chapter 5 streams

#v#Bulk file I/O
The bulk methods will load a file into memory or write one
out completely in one shot

###File watching
watching/detecting whether files have changed with `fs.watch` and `fs.watchFile`. `fs.watch` uses the underlying operating system’s notifications, making it very efficient. But `fs.watch` can be finicky or simply not work on network drives. For those situations, the less-efficient `fs.watchFile` method, which uses stat polling, can be used.

###Synchronous alternatives
Synchronous methods are available for all the POSIX and bulk API calls.

**Note:** As a general rule, synchronous methods should be used when first setting up your application, and not within a callback

##File system techniques
### File Descriptors
File descriptors (FDs) are integers (indexes) associated with open files within a process managed by the operating system. As a process opens files, the operating system keeps track of these open files by assigning each a unique integer that it can then use to look up more information about the file.

### File locking
File locking is helpful when preventing mutiple processes from tampering the same file. Node has no built-in support for locking a file directly. 

* But advisory locking of files can be done using syscalls such as flock. 
* The `fs` module also provides and **x** flag for any methods that involve opening a file. This flag will flag the opened file as in exclusive mode(O_EXCL).
* Exclusive mode may not work well if the lockfile exists on a network drive, since some systems don’t honor the O_EXCL flag on network drives. To circumvent this, another strategy is creating a lockfile as a directory. `mkdir` is an atomic operation (no races), has excellent cross-platform support, and works well with network drives

##Use case
###Loading configuration on startup
When application starts up, configuration file should be loaded before everything that depends on the configurations. Comparing using asynchronous API and nesting everything that depends on the configuration in the callback, the synchronous API can avoid such nested code

```js
//load configuration using async approach
//cons: all the work that depends on the config will have to nested the same callback, this can get ugly.
fs.readFile(test_config, function(err, buf) {
    if (err) throw err;
    var config = JSON.parse(buf.toString());
    init(config);
})

//load config using sync approach
try {
    var sync_config_raw = fs.readFileSync(test_config);
    var sync_config = JSON.parse(sync_config_raw.toString());
    init(sync_config);
} catch (err) {
    console.error(err);
}

```

###locking
File locking is helpful when cooperating processes need access to a common file
where the integrity of the file is maintained and data isn’t lost. In this technique, we’ll explore how to write your own file locking module.

```js
var fs = require('fs');

function MyLock() {
    this.locking = false;//lock status
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
```

###Recursive file operations
Recursive file operations are helpful and hard to get right, especially when done asynchronously. But understanding how to perform them is a good exercise in mastering evented programming with Node. In this technique, we’ll dive into recursive file operations by creating a module for searching a directory tree

```js
function find(pattern, startpath, cb) {
    var results = [];
    var asyncOps = 0;
    var errored = false;

    function error(err) {
        if (!errored) {
            cb(err);
        }
        errored = true;
    };
    console.log('start searching...');

    function finder(startpath) {
        asyncOps++; //current folder

        fs.readdir(startpath, function(err, items) {
            if (err) {
                return error(err);
            }
            items.forEach(function(item) {
                var fpath = path.join(startpath, item);
                asyncOps++;
                fs.stat(fpath, function(err, stats) {
                    if (err) {
                        return error(err);
                    }
                    if (stats.isDirectory()) {
                        finder(fpath);
                    } else if (stats.isFile() && pattern.test(fpath)) {
                        results.push(fpath);
                    }
                    asyncOps--;
                    if (asyncOps == 0) {
                        cb(null, results);
                    }
                });
            });
        });
    }
    finder(startpath);
}
```




#Unit Test
The Test script name shold be the same as the source file following by .test.js    
`describe` is a test suite     
`it` is called test case and is the smallest unit.   
##Mocha

example:
```js
var describe = require('mocha').describe;
var should = require('should');
describe('buffer_demo_test', function() {
    it('hello should equal hello', function() {
        'hello'.should.equal('hello');
    });

    it('hello should not equal world', function() {
        'hello'.should.equal('world');
    });
    //async call test, should add done in the nested callback to tell mocha the test is done
    it('file content should be hello world', function(done) {
        fs.readFile('hello world.txt', (err, data) => {
            if (err) {
                done(err); //tell mocha there is an error in test case
            }
            data.toString().should.eql('hello world');
            done(); //tell mocha test case is done
        });
    });

});

```
*Notes: Async test should add callback `done` to tell mocha the test is finished*

#FAQ
##Async function return undefined on invocation
I totally stuck in the `undefined` value from async function call, what the hell. Here is my code snippet to defined a function to read file in async fashion and return the file content.

```js
// i won't remove you, just keep the really bad case in mind
function readFileAsBufferOld(file) {
    fs.readFile(file, (err, buf) => {
        if (err) {
            console.log('Unable to read file');
        }
        console.log(buf.toString());//here we got 'hello world'
        return buf.toString();
    });
};

var file_content = readFileAsBuffer("small.txt");
console.log(fiel_content);//really???!!!!!!!!!!, undefined


```

>See this guy's post: http://cnodejs.org/topic/51b8811df78196a85c85dad3