/*

  This file is part of JSlich, a JavaScript license checker.
  Copyright 2013, Kuno Woudt <kuno@frob.nl>.
  License: copyleft-next 0.3.0

*/

var _ = require('underscore');

var find_license_block_v1 = function (text) {
    var matches = /@licstart([\s\S]*)@licend/.exec (text);

    console.log (JSON.stringify (matches[1], null, 4));

    return null;
};

var find_license_block_v2 = function (text) {
    return null;
};



var esprima = require('esprima');

var javascript = function (body) {
    var ast = esprima.parse (body, { tolerant: true, comment: true });

    var licenses = _(ast.comments).map (function (item, idx) {
        var l = find_license_block_v1 (item.value);
        if (l) return l;
        l = find_license_block_v2 (item.value);
        return l;
    });

    console.log (JSON.stringify (licenses, null, 4));
};


module.exports.js = javascript;
