// @license magnet:?xt=urn:btih:90dc5c0be029de84e523b9b3922520e79e0e6f08&dn=cc0.txt CC0

var bar = document.getElementById('bar');
var barstyle = document.getElementById('barstyle');
var barclass = "progress progress-striped active "
var progress = 0;

var tick = function () {
    bar.setAttribute('style', 'width: ' + progress.toString () + '%');

    if (progress < 25) {
        barstyle.setAttribute('class', barclass + 'progress-danger');
    } else if (progress < 50) {
        barstyle.setAttribute('class', barclass + 'progress-warning');
    } else if (progress < 75) {
        barstyle.setAttribute('class', barclass + 'progress-info');
    } else {
        barstyle.setAttribute('class', barclass + 'progress-success');
    }

    progress += 4;

    if (progress > 50) {
        document.getElementById ('part2').setAttribute ('style', 'display: block');
    }

    if (progress <= 100) {
        setTimeout (tick, 100);
    } else {
        document.getElementById ('barcontainer').setAttribute ('style', 'display: none');
        document.getElementById ('part1').setAttribute ('style', 'display: block');
    };
};

tick ();

// @license-end
