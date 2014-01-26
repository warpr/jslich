
JSlich
======

Hello!

You're reading the README.md for JSlich (JavaScript license checker),
a tool you can use to check whether all the javascript used on a
webpage is properly licensed using free software licenses, in a
machine readable way.

NOTE: Consider this alpha status.  Basic functionality is in place,
but there are no tests and some features and polish is missing.


Install
-------

JSlich requires phantomjs and nodejs, on a recent Ubuntu:

     sudo add-apt-repository ppa:chris-lea/node.js
     sudo apt-get update
     sudo apt-get install phantomjs nodejs
     npm install


Usage
-----


    jslich <url> [delay]

    url       URL to check, the page will be loaded in a headless
              browser window and javascript resource urls will be
              captured and analysed.


    delay     Not all javascript resources will be requested after
              the DOM is constructed if the page uses a javascript
              module loader.

              Specify a delay in seconds to allow the page to load
              more javascript.



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

Use the [magnet link method][magnet] introduced in LibreJS 5.0.

### License third-party or externally hosted scripts

Use [Javascript License Web Labels][weblabels].

[magnet]: https://www.gnu.org/software/librejs/free-your-javascript.html#magnet-link-license
[weblabels]: https://www.gnu.org/licenses/javascript-labels.html



License
-------

Copyright 2013,2014  Kuno Woudt

JSlich is licensed under copyleft-next version 0.3.0, see
LICENSE.txt for more information.


Download
--------

    site:   https://frob.nl/jslich
    code:   https://gitorious.org/jslich/jslich
