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

// var chalk = require('chalk');
// var licenses = require('./licenses');
// var text = require('./text');


var good_licenses = function () {

    // list of licenses documented at
    // http://www.gnu.org/licenses/javascript-labels.html
    var fsf = JSON.parse (fs.readFileSync (__dirname + '/../data/fsf.jsonld'));
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

    request (url, function (error, response, body) {
        if (error) {
            deferred.reject (error);
        } else if (response.statusCode != 200) {
            deferred.reject (response.statusCode + " when downloading " + url);
        } else {
            deferred.resolve (response.body);
        }
    });

    return deferred.promise;
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
        return when.resolve ([ url, weblabels[url] ]);
    }

    download (url).then (function (data) {
        var lines = _(data.split ("\n")).filter (function (line) {
            return !line.match (/^\s*$/);
        });

        var matches = lines[0].match (/^.*@license (magnet:[^ ]*) (.*)$/);
        if (!matches || ! _(lines).last ().match (/@license-end/)) {
            deferred.resolve ({ script: url, license: null });
        } else {
            var license = good_licenses.by_magnet[matches[1]];
            deferred.resolve ([ url, license ? license : null ]);
        }
    },
    function (error) {
        deferred.reject (error);
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
        });

        when.all (results).then (function (script_results) {
            var scripts = _(script_results).object ();

            // console.log (JSON.stringify (script_results, null, 4));
            // deferred.resolve ({ "KOEK": "TAART" });
            deferred.resolve (scripts);
        });

        // console.log ('weblabels:', weblabels);
        // console.log ('results:', results);
        console.log ('todo:', gathered);
    },
    function (error) {
        deferred.reject ('ERROR: downloading and parsing web labels. ' + error);
    });

    return deferred.promise;
};

module.exports = function (gathered) {
    var deferred = when.defer ();

    // list of licenses documented at
    // https://www.gnu.org/software/librejs/free-your-javascript.html#magnet-link-license
    licensedb.download ().then (function () {
        good_licenses.by_magnet = licensedb.librejs_free ();
        good_licenses.by_id = licensedb.all_by_id ();

        analyse_gathered (gathered).then (function (results) {
            console.log ('have results for:', _(results).keys ());
        }, function (error) {
            deferred.reject (error);
        });
    }, function (error) {
        deferred.reject (error);
    });

    return deferred.promise;
};
