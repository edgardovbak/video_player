// helper function
var log = function(msg) {
  console.log(msg);
};

var CODEC,mediaSource,mediaPlayer;

var numOFSegments = 596;
var segNum = 1;

document.addEventListener("DOMContentLoaded", function() { initialiseMediaPlayer(); }, false);

function initialiseMediaPlayer() {
   mediaPlayer = document.getElementById('media_video');
   mediaPlayer.controls = false;

   mediaPlayerSource('mp4');

   mediaPlayerControls();
}

function mediaPlayerSource(type) {
    if (type == 'webm') {
        CODEC = 'video/webm; codecs="vorbis,vp8"';
    }
    if (type == 'mp4') {
        CODEC = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
    }
    if ('MediaSource' in window && MediaSource.isTypeSupported(CODEC)) {
        mediaSource = new MediaSource();
        mediaPlayer.src = URL.createObjectURL(mediaSource);
        mediaSource.addEventListener('sourceopen', MSEOpened, false);
        mediaSource.addEventListener('webkitsourceopen', MSEOpened, false);
    } else {
        console.error('Unsupported MIME type or codec: ', CODEC);
    }
}

function MSEOpened() {
    // create source buffer
    var sourceBuffer = mediaSource.addSourceBuffer(CODEC);
    // request for init segment
    var req = new XMLHttpRequest();
    var responseType = "arraybuffer";
    req.open("GET", "http://www-itec.uni-klu.ac.at/ftp/datasets/DASHDataset2014/BigBuckBunny/1sec/bunny_91917bps/BigBuckBunny_1s_init.mp4", true);
    req.onload = function () {
        var resp = req.response;
        var arr = new Uint8Array(resp);
        sourceBuffer.appendBuffer(arr);
        sourceBuffer.addEventListener("updateend", loadSegment);
    };
    req.onerror = function () {
        console.log("** An error occurred during the transaction");
    };
    req.send();

    function loadSegment() {
        if ( segNum <= numOFSegments) {
            getSegment(segNum);
            segNum++;
        } else {
            mediaSource.endOfStream();
        }
    };

    function getSegment() {
        var req = new XMLHttpRequest();
        var responseType = "arraybuffer";
        req.open("GET", "http://www-itec.uni-klu.ac.at/ftp/datasets/DASHDataset2014/BigBuckBunny/1sec/bunny_91917bps/BigBuckBunny_1s" + segNum + ".m4s", true);
        req.onload = function () {
            var resp = req.response;
            var arr = new Uint8Array(resp);
            sourceBuffer.appendBuffer(arr);
            sourceBuffer.addEventListener("updateend", loadSegment);
        };
        req.onerror = function () {
            log("** An error occurred during the transaction");
        };
        req.send();
    }
}

function mediaPlayerControls() {

    var togglePlayPause = document.getElementById('media_controls_play-pause-button');
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

    var seekBar = document.getElementById("media_controls_seek-bar");
    //Event listener for the seek bar
    seekBar.addEventListener("change", function() {
        //Calculate new time
        var newTime = mediaPlayer.duration * (seekBar.value / 100);
        mediaPlayer.currentTime = newTime;
    });

    //As video progresses, seekBar moves forward
    mediaPlayer.ontimeupdate = function(){
      var percentage = ( mediaPlayer.currentTime / mediaPlayer.duration ) * 100;
      seekBar.value = percentage;
    };

    // Pause the video when the slider handle is being dragged
    seekBar.addEventListener("mousedown", function() {
        mediaPlayer.pause();
    });

    // Play the video when the slider handle is dropped
    seekBar.addEventListener("mouseup", function() {
        mediaPlayer.play();
    });

    var volumeBar = document.getElementById("media_controls_volume-bar");
    //Event listener for the volume slider
    volumeBar.addEventListener("change", function() {
        mediaPlayer.volume = volumeBar.value;
    });

    var resetPlayer = document.getElementById('media_controls_reset-button');
    resetPlayer.addEventListener("click", function() {
        mediaPlayer.pause();
        mediaPlayer.currentTime = 0;
    });
}
