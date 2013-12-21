/*

  This file is part of JSlich, a JavaScript license checker.
  Copyright 2013, Kuno Woudt <kuno@frob.nl>.
  License: copyleft-next 0.3.0

*/

var chalk = require('chalk');
var licenses = require('./licenses');
var _ = require('underscore')
var text = require('./text');

var verify_match = function (notice1, notice2) {
    return _.reduce (_.zip (notice1, notice2), function (memo, item) {
        return _.isString (item[0]) ? (memo && item[0] === item[1]) : memo;
    }, true);
};

var match_fragments = function (notice1, notice2) {
    var match = false;

    _(notice2).map (function (n2_item, n2_idx) {
        if (notice1[0] === n2_item)
        {
            match = match || verify_match (notice1, notice2.slice (n2_idx));
        }
    });

    return match;
};

var find_license_block_v1 = function (comment) {
    var matches = /@licstart([\s\S]*)@licend/.exec (comment);
    var match = false;

    var fragments = text.to_fragments (matches[1]);

    _(licenses.data ()).map (function (license, key) {
        if (match)
            return;

        _(license['notices']).map (function (notice, idx) {
            if (match_fragments (notice['fragments'], fragments))
            {
                match = key;
            }
        });
    });

    return match;
};

var find_license_block_v2 = function (text) {
    return null;
};

var esprima = require('esprima');

var javascript = function (filename, body) {
    var ast = esprima.parse (body, { tolerant: true, comment: true });

    var licenses = _(ast.comments).chain ().map (function (item, idx) {
        var l = find_license_block_v1 (item.value);
        if (l) return l;
        l = find_license_block_v2 (item.value);
        return l;
    }).filter (function (item) { return item; }).value ();

    var free = licenses.length > 0;
    var status = free ? chalk.green.bold ('✓') : chalk.red.bold ('✗');

    console.log (status + ' ' + filename + ': ' +
                 (free ? licenses.join (', ') : 'non-free'));

    return free;
};


module.exports.js = javascript;
