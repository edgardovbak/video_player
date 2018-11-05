var mediaPlayer;
var mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';

creating the MediaSource
if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
    var mediaSource = new MediaSource();
    var url = URL.createObjectURL(mediaSource);
    mediaSource.addEventListener('sourceopen', sourceOpen, false);
} else {
    console.error("mediasource or syntax not supported");
}

function sourceOpen (_) {
    console.log(this.readyState);
    var mediaSource = this;
    var videoSourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
    initVideo();
};

function initVideo () {
    clearLog();
    mediaPlayer = document.getElementById('media_video');
    mediaPlayer.controls = false;
    mediaPlayer.src = url;
   fetch("https://html5-demos.appspot.com/static/test.webm").then(function(response) {
      // The data has to be a JavaScript ArrayBuffer
      return response.arrayBuffer();
   }).then(function(videoData) {
      videoSourceBuffer.appendBuffer(videoData);
   });
}

// Gets the mpd file and parses it
function getData(url) {
    if (url !== "") {
        var xhr = new XMLHttpRequest(); // Set up xhr request
        xhr.open("GET", url, true); // Open the request
        xhr.responseType = "text"; // Set the type of response expected
        xhr.send();

        //  Asynchronously wait for the data to return
        xhr.onreadystatechange = function () {
            if (xhr.readyState == xhr.DONE) {
                var tempoutput = xhr.response;
                var parser = new DOMParser(); //  Create a parser object

                // Create an xml document from the .mpd file for searching
                var xmlData = parser.parseFromString(tempoutput, "text/xml", 0);
                log("parsing mpd file");

                // Get and display the parameters of the .mpd file
                getFileType(xmlData);

                // Set up video object, buffers, etc
                setupVideo();

                // Initialize a few variables on reload
                clearVars();
            }
        }

        // Report errors if they happen during xhr
        xhr.addEventListener("error", function (e) {
            log("Error: " + e + " Could not load url.");
        }, false);
    }
}

var mediaSource = new MediaSource();
var url = URL.createObjectURL(mediaSource);
var videoSourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
initVideo();
// mediaSource.addEventListener('sourceopen', sourceOpen, false);


// window.onload = function() {
    var seekBar = document.getElementById("seek_bar");
    //Event listener for the seek bar
    seekBar.addEventListener("change", function() {
        //Calculate new time
        var newTime = mediaPlayer.duration * (seekBar.value / 100);
        mediaPlayer.currentTime = newTime;
    });

    //As video progresses, seekBar moves forward
    seekBar.addEventListener("timeupdate", function() {
        var value = (100 / mediaPlayer.duration) * mediaPlayer.currentTime;
        seekBar.value = value;
    });

    // Pause the video when the slider handle is being dragged
    seekBar.addEventListener("mousedown", function() {
        mediaPlayer.pause();
    });

    // Play the video when the slider handle is dropped
    seekBar.addEventListener("mouseup", function() {
        mediaPlayer.play();
    });

    var volumeBar = document.getElementById("volume_bar");
    //Event listener for the volume slider
    volumeBar.addEventListener("change", function() {
        mediaPlayer.volume = volumeBar.value;
    });

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

    var stopPlayer = document.getElementById('stop-button');
    stopPlayer.addEventListener("click", function() {
        mediaPlayer.pause();
        mediaPlayer.currentTime = 0;
    });
// }
