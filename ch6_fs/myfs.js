var stream = require('stream');
var fs = require('fs');
var util = require('util');

var path = require('path');
var test_file_small = path.join(__dirname, 'test/data/small.txt');
var test_csv_small = path.join(__dirname, 'test/data/csv_small.csv');

var test_config = path.join(__dirname, 'test/data/test_config.json');

var init = function(config) {
    console.log('init...');
    console.log('apply configuration for: ' + config['site title']);
    console.log('init end');

};

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


//file descriptor
