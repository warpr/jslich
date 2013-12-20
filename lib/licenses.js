/* -*- encoding: utf-8 -*-

  This file is part of JSlich, a JavaScript license checker.
  Copyright 2013, Kuno Woudt <kuno@frob.nl>.
  License: copyleft-next 0.3.0

*/

var fs = require('fs');
var _ = require('underscore');
var summarize = require('summarizely');

var normalize_copyright = function (text) {
    return (text.toLowerCase ()
        .replace (/\(c\)/g, 'copyright')
        .replace (/&copy;/g, 'copyright')
        .replace (/©/g, 'copyright')
        .replace (/copyright copyright/g, 'copyright'));
};

var clear_punctuation = function (text) {
    /* FIXME: this replaces accented and other non-ascii characters.
       This should be done properly when we get non-english license texts. */
    return text.replace(/\n/g, ' ').replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ');
};

var split_on_placeholder = function (memo, item) {
    return memo.concat (item.split (/{{[^}]*}}/));
};

var notice_fragments = function (notice) {
    return (_(summarize(normalize_copyright (notice['li:text'])))
        .chain ()
        .reduce (split_on_placeholder, [])
        .map (function (item) { return clear_punctuation(item).trim (); })
        .filter (function (item) { return item.length > 0; })
        .filter (function (item) { return item !== 'copyright'; })
        .value ());
};

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
        return { 'fragments': notice_fragments (item) };
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

module.exports.build = build;
