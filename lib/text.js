/* -*- encoding: utf-8 -*-

  This file is part of JSlich, a JavaScript license checker.
  Copyright 2013, Kuno Woudt <kuno@frob.nl>.
  License: copyleft-next 0.3.0

*/

var _ = require('underscore');
var Tokenizer = require('sentence-tokenizer');

var sentences = function (text) {
    var t = new Tokenizer('jslich');
    t.setEntry (text);
    return t.getSentences ();
};

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

var clear_decorations = function (text) {
    return text.replace (/[\*\|=-]/g, ' ');
};

var trim_lines = function (text) {
    return _(text.split ('\n')).map (
        function (item) { return item.trim (); }).join ('\n');
};

var text_to_fragments = function (notice) {
    return (_(sentences(trim_lines (
        clear_decorations (normalize_copyright (notice)))))
        .chain ()
        .reduce (split_on_placeholder, [])
        .map (function (item) { return clear_punctuation(item).trim (); })
        .filter (function (item) { return item.length > 0; })
        .filter (function (item) { return item !== 'copyright'; })
        .value ());
};

module.exports.to_fragments = text_to_fragments;
