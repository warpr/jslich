
JSlich
======

Hello!

You're reading the README.md for JSlich (JavaScript license checker),
a tool you can just to check whether all the javascript used on on a
webpage is properly licensed using free software licenses, in a
machine readable way.


Install
------------

JSlich requires phantomjs and nodejs, on a recent Ubuntu:

     sudo add-apt-repository ppa:chris-lea/node.js
     sudo apt-get update
     sudo apt-get install phantomjs nodejs
     npm install


Usage
-----

(JSlich isn't finished yet, so nothing useful is here yet).

Run bin/gather to get a list of javascript URLs used by a page, and
the associated javascript web labels page, if the page has one.


License your JavaScript
-----------------------

The goal of JSlich is to help you mark your javascript as free
software in a way which will allow LibreJS [librejs] to load the
javascript on your web site or web application.

It only supports a subset of the license detection methods supported
by LibreJS:

### License embedded scripts on a webpage

Use the [magnet link method][magnet] introduced in LibreJS 5.0.

### License individual scripts

(FIXME: write this, presumably this will be the same as above)

### License third-party or externally hosted scripts

(FIXME: [Javascript License Web Labels][weblabels] should work for this, right?)

[magnet]: https://www.gnu.org/software/librejs/free-your-javascript.html#magnet-link-license
[weblabels]: https://www.gnu.org/licenses/javascript-labels.html



License
-------

Copyright 2013,2014  Kuno Woudt

JSlich is licensed under copyleft-next version 0.3.0, see
LICENSE.txt for more information.


Download
--------

FIXME: neither of these currently exist.

    site:   https://frob.nl/jslich
    code:   https://gitorious.org/jslich/jslich
