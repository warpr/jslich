/* -*- encoding: utf-8 -*-

  This file is part of JSlich, a JavaScript license checker.
  Copyright 2013, Kuno Woudt <kuno@frob.nl>.
  License: copyleft-next 0.3.0

*/

var fs = require('fs');
var _ = require('underscore');
var text = require('./text');

var license_info = function (data) {
    if (!data['li:notice'])
        return null;

    var ret = {
        'id': data['@id'],
        'li:id': data['li:id'],
        'free': data['li:libre'] && data['li:libre'].length > 0
    }

    var _notices = _(data['li:notice']).isArray () ?
        _(data['li:notice']) : _([ data['li:notice'] ]);

    ret['notices'] = _notices.map (function (item, idx) {
        return { 'fragments': text.to_fragments (item['li:text']) };
    });

    return ret;
};

var parse = function (licensedb_dir) {
    var licenses = {};
    var files = fs.readdirSync (licensedb_dir);

    _(files).each (function (filename, idx) {
        var l = license_info (JSON.parse (
            fs.readFileSync (licensedb_dir + filename)));

        if (l) {
            licenses[l['li:id']] = l;
        }
    });

    return licenses;
};

var build = function (licensedb_dir, license_data) {
    var licenses = parse (licensedb_dir);

    fs.writeFileSync (license_data, JSON.stringify (licenses, null, 4));

    console.log ('Wrote license data to', license_data);
};

var data = function () {
    var license_info = __dirname + '/../data/licenses.json';
    return JSON.parse (fs.readFileSync (license_info));
};

module.exports.data = data;
module.exports.build = build;
