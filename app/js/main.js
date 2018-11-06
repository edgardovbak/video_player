// helper function
var log = function(msg) {
  console.log(msg);
};

var FILE,CODEC,mediaSource,mediaPlayer;
var NUM_CHUNKS = 6;

document.addEventListener("DOMContentLoaded", function() { initialiseMediaPlayer(); }, false);

function initialiseMediaPlayer() {
   mediaPlayer = document.getElementById('media_video');
   mediaPlayer.controls = false;
   window.MediaSource = window.MediaSource || window.WebKitMediaSource;
   if (!!!window.MediaSource) {
       alert('MediaSource API is not available');
   }
   start('mp4');
}

function callback() {
    var sourceBuffer = mediaSource.addSourceBuffer(CODEC);
    GET(FILE, function(uInt8Array) {
        var file = new Blob([uInt8Array], {type: 'video/mp4'});
        var chunkSize = Math.ceil(file.size / NUM_CHUNKS);
        var i = 0;
        (function readChunk_(i) {
            var reader = new FileReader();
            reader.onload = function(e) {
                sourceBuffer.appendBuffer(new Uint8Array(e.target.result));
                console.log(e.target);
                if (i == NUM_CHUNKS - 1) {
                    mediaSource.endOfStream();
                } else {
                    if (mediaPlayer.paused) {
                        mediaPlayer.play();
                    }
                    readChunk_(++i);
                }
            };
            var startByte = chunkSize * i;
            var chunk = file.slice(startByte, startByte + chunkSize);
            reader.readAsArrayBuffer(chunk);
        })(i);
    });
}
function GET(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.send();
    xhr.onload = function(e) {
        if (xhr.status != 200) {
            alert("Unexpected status code " + xhr.status + " for " + url);
            return false;
        }
                console.log(xhr.response);
        callback(new Uint8Array(xhr.response));
    };
}
function start(type) {
    if (type == 'webm') {
        FILE = 'test.webm';
        CODEC = 'video/webm; codecs="vorbis,vp8"';
    }
    if (type == 'mp4') {
        FILE = '/video/video_dashinit.mp4';
        CODEC = 'video/mp4; codecs="avc1.64000d,mp4a.40.2"';
    }
    mediaSource = new MediaSource();
    mediaPlayer.src = window.URL.createObjectURL(mediaSource);
    mediaSource.addEventListener('sourceopen', callback, false);
    mediaSource.addEventListener('webkitsourceopen', callback, false);
    mediaSource.addEventListener('webkitsourceended', function(e) {
    }, false);
}

window.onload = function() {

    var togglePlayPause = document.getElementById('play-pause-button');
    togglePlayPause.addEventListener("click", function() {
        if (mediaPlayer.paused || mediaPlayer.ended) {
           togglePlayPause.title = 'pause';
           togglePlayPause.innerHTML = 'pause';
           togglePlayPause.className = 'pause';
           mediaPlayer.play();
        }
        else {
           togglePlayPause.title = 'play';
           togglePlayPause.innerHTML = 'play';
           togglePlayPause.className = 'play';
           mediaPlayer.pause();
        }
    });

    var seekBar = document.getElementById("seek-bar");
    //Event listener for the seek bar
    seekBar.addEventListener("change", function() {
        //Calculate new time
        var newTime = mediaPlayer.duration * (seekBar.value / 100);
        mediaPlayer.currentTime = newTime;
    });
    console.log(mediaPlayer.duration );
    //As video progresses, seekBar moves forward
    seekBar.addEventListener("timeupdate", function() {
        console.log(1231);
        var value = (100 / mediaPlayer.duration) * mediaPlayer.currentTime;
        seekBar.value = value;
    }, false);

    // Pause the video when the slider handle is being dragged
    seekBar.addEventListener("mousedown", function() {
        mediaPlayer.pause();
    });

    // Play the video when the slider handle is dropped
    seekBar.addEventListener("mouseup", function() {
        mediaPlayer.play();
    });

    var volumeBar = document.getElementById("volume-bar");
    //Event listener for the volume slider
    volumeBar.addEventListener("change", function() {
        mediaPlayer.volume = volumeBar.value;
    });

    var stopPlayer = document.getElementById('stop-button');
    stopPlayer.addEventListener("click", function() {
        mediaPlayer.pause();
        mediaPlayer.currentTime = 0;
    });
}
