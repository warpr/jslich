
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

See [Javascript License Web Labels][jslicense] and
[a convention for releasing free Javascript programs][convention] for
the standards currently supported by JSlich.

[convention]: http://www.gnu.org/philosophy/javascript-trap.html#AppendixA
[jslicense]: http://www.gnu.org/licenses/javascript-labels.html


License
-------

Copyright 2013  Kuno Woudt

JSlich is licensed under copyleft-next version 0.3.0, see
LICENSE.txt for more information.


Download
--------

FIXME: neither of these currently exist.

    site:   https://frob.nl/jslich
    code:   https://gitorious.org/jslich/jslich

