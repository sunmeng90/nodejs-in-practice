var fs = require('fs');
var path = require('path');


module.exports = {
    findSync: findSync,
    find: find
};


function findSync(pattern, startpath) {
    var results = [];
    var stat = fs.statSync(startpath);
    if (!stat.isDirectory()) {
        throw new Exception(startpath + "is not directory");
    }
    (function finder(startpath) {
        var items = fs.readdirSync(startpath);
        for (var i = 0; i < items.length; i++) {
            var fpath = path.join(startpath, items[i]);
            var fstat = fs.statSync(fpath);
            if (fstat.isDirectory()) {
                finder(fpath);
            } else if (fstat.isFile() && pattern.test(fpath)) {
                results.push(fpath);
            }
        }
    })(startpath);
    //finder(startpath);
    return results;
}

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


// console.log(findSync(/\.js$/, "."));

/*find(/\.js$/, ".", function(err, results) {
    console.log(results);
});
*/
