/*

  This file is part of JSlich, a JavaScript license checker.
  Copyright 2013, Kuno Woudt <kuno@frob.nl>.
  License: copyleft-next 0.3.0

*/

var _ = require('underscore')
var fs = require ('fs');
var jquery = require ('jquery');
var jsdom = require ('jsdom');
var licensedb = require ('./licensedb');
var request = require ('request');
var when = require ('when');

var global = { verbose: false };

var message = function (msg) {
    if (global.verbose) {
        console.log (msg);
    }
};

var good_licenses = function () {

    var filename = __dirname + '/../data/fsf.jsonld';

    // list of licenses documented at
    // http://www.gnu.org/licenses/javascript-labels.html
    var fsf = JSON.parse (fs.readFileSync (filename));
    var by_name = _(fsf['@graph'])
        .chain ()
        .map (function (item, idx) {
            return item['dc:identifier'] ? [ item['dc:identifier'], item ] : null;
        })
        .compact ()
        .object ()
        .value ();

    var by_uri = _(fsf['@graph'])
        .chain ()
        .map (function (item, idx) {
            return item['dc:identifier'] ? [ item['@id'], item ] : null;
        })
        .compact ()
        .object ()
        .value ();

    return { by_name: by_name, by_uri: by_uri };
}();

var download = function (url) {
    var deferred = when.defer ();

    message ("Downloading " + url + "...");
    request (url, function (error, response, body) {
        if (error) {
            deferred.reject (error);
        } else if (response.statusCode != 200) {
            deferred.reject (response.statusCode + " when downloading " + url);
        } else {
            message (" ... done");
            deferred.resolve (response.body);
        }
    });

    return deferred.promise;
};

var script_license = function (body) {
    if (!body) {
        return null;
    }

    var lines = _(body.split ("\n")).filter (function (line) {
        return !line.match (/^\s*$/);
    });

    var matches = lines[0].match (/^.*@license (magnet:[^ ]*) (.*)$/);
    if (!matches || ! _(lines).last ().match (/@license-end/)) {
        return null;
    } else {
        var license = good_licenses.by_magnet[matches[1]];
        return license ? license : null;
    }
};

var parse_weblabels = function (url) {
    var deferred = when.defer ();

    jsdom.env (url, function (errors, window) {
        if (errors) {
            return deferred.reject (errors);
        }

        var $ = jquery(window);
        var results = $('#jslicense-labels1 tr').map (function (idx, row) {
            var js_uri = $(row).find ('td:eq(0) a').attr ('href');
            var license_uri = $(row).find ('td:eq(1) a ').attr ('href');
            var license_name = $(row).find ('td:eq(1)').text ();

            return (js_uri && license_uri && license_name) ? [
                [ js_uri, { uri: license_uri,name: license_name } ]
            ] : null;
        });

        deferred.resolve (_.object (results.get ()));
    });

    return deferred.promise;
};

var analyse_weblabels = function (url, idx) {
    var deferred = when.defer ();

    parse_weblabels (url).then (function (data) {
        var results = {};

        _(data).each (function (value, key) {
            var license = (good_licenses.by_name[value.name]
                           || good_licenses.by_uri[value.uri]);

            if (license) {
                results[key] = good_licenses.by_id[license['li:id']['@id']];
            } else {
                results[key] = null;
            }
        });

        deferred.resolve (results);
    },
    function (error) {
        deferred.reject (error);
    });

    return deferred.promise;
};

var normalise_weblabels = function (results) {
    var weblabels = {};

    _(results).each (function (item) { _(weblabels).extend (item); });

    _(weblabels).each (function (license, script) {
        /* schema-less URLs should be available on both http and
         * https, and refer to the exact same file. */
        if (script.match (new RegExp("^//")))
        {
            weblabels['https:' + script] = license;
            weblabels['http:' + script] = license;
        }
    });

    return weblabels;
};

var analyse_external = function (weblabels, url) {
    var deferred = when.defer ();

    if (weblabels[url]) {
        return when.resolve ({ script: url, licenses: [ weblabels[url] ] });
    }

    download (url).then (function (data) {
        deferred.resolve ({ script: url, licenses: [ script_license (data) ] });
    },
    function (error) {
        deferred.reject (error);
    });

    return deferred.promise;
};

var analyse_page = function (url) {
    var deferred = when.defer ();

    jsdom.env (url, function (errors, window) {
        if (errors) {
            return deferred.reject (errors);
        }

        var $ = jquery(window);
        var results = $('script').map (function (idx, tag) {
            return script_license ($(tag).text ());
        });

        deferred.resolve ({ script: url, licenses: results.get () });
    });

    return deferred.promise;
};

var analyse_gathered = function (gathered) {
    var weblabels = null;
    var deferred = when.defer ();

    var promises = _(gathered['jslicense']).map (analyse_weblabels);
    when.all (promises).then (function (weblabel_data) {
        weblabels = normalise_weblabels (weblabel_data);

        var results = _(gathered['scripts']).map (function (script) {
            return analyse_external (weblabels, script);
        }).concat (_(gathered['page']).map (analyse_page));

        when.all (results).then (function (script_results) {
            deferred.resolve (script_results);
        }, function (error) {
            deferred.reject (error);
        });
    },
    function (error) {
        deferred.reject ('ERROR: downloading and parsing web labels. ' + error);
    });

    return deferred.promise;
};

module.exports = function (gathered, verbose) {
    var deferred = when.defer ();

    /* FIXME: turn this into a --verbose switch. */
    global.verbose = verbose;

    // list of licenses documented at
    // https://www.gnu.org/software/librejs/free-your-javascript.html#magnet-link-license
    licensedb.download (global.verbose).then (function () {
        good_licenses.by_magnet = licensedb.librejs_free ();
        good_licenses.by_id = licensedb.all_by_id ();

        analyse_gathered (gathered).then (function (results) {
            deferred.resolve (results);
        }, function (error) {
            deferred.reject (error);
        });
    }, function (error) {
        deferred.reject (error);
    });

    return deferred.promise;
};
