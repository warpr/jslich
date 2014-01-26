#!/usr/bin/env node
/* -*- mode: javascript -*-

  This file is part of JSlich, a JavaScript license checker.
  Copyright 2013, Kuno Woudt <kuno@frob.nl>.
  License: copyleft-next 0.3.0

*/

var _ = require ('underscore');
var fs = require ('fs');
var chalk = require ('chalk');
var path = require ('path');
var when = require ('when');
var request = require ('request');
var jslich = require ('../');

var display_license_name = function (license) {
    titles = _(license['dc:title']).isArray () ?
        license['dc:title'] : [ license['dc:title'] ];

    var title = null;
    _(titles).each (function (candidate) {
        if (title) {
            return;
        };

        /* FIXME: use environment LANGUAGE? */
        if (candidate['@language'] == 'en' ||
            candidate['@language'] == 'en-US') {
            title = candidate['@value'];
        }
    });

    return title ? title : titles[0];
};

var display_license_row = function (status, msg) {
    console.log ('    ' + status + ' ' + msg);
};

var report_results = function (results) {

    var totals = { 'free': 0, 'non-free': 0 };

    _(results).each (function (item) {
        console.log ("\n" + item.script);

        _(item.licenses).each (function (license) {
            if (license) {
                totals['free']++;
                display_license_row (
                    chalk.green ('✓'),
                    chalk.grey (display_license_name (license)));
            } else {
                totals['non-free']++;
                display_license_row (
                    chalk.red ('×'),
                    chalk.red ('no free/open license was found for this script'));
            }
        });

        if (item.licenses.length == 0) {
            display_license_row (
                chalk.green ('✓'),
                chalk.grey ('no scripts found'));
        }
    });

    console.log ("");
    if (totals['non-free'] > 0)
    {
        console.log (chalk.red (totals['non-free'] + ' failed'));
    }
    else if (totals['free'] > 0)
    {
        console.log (chalk.green (totals['free'] + ' passed'));
    }
    else
    {
        console.log (chalk.orange ('no scripts found'));
    }
};

var main = function (gathered) {
    jslich.analyse (gathered).then (
        report_results,
        function (error) {
            console.error ('ERROR:', error);
        });
};

var input = fs.readFileSync('/dev/stdin').toString();
main (JSON.parse (input));
