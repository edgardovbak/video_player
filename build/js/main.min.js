var mediaPlayer;
var mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';

// creating the MediaSource
if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
    var mediaSource = new MediaSource();
    var url = URL.createObjectURL(mediaSource);
    mediaSource.addEventListener('sourceopen', sourceOpen, false);
} else {
    console.error("mediasource or syntax not supported");
}

function sourceOpen (_) {
    console.log(this.readyState);
    clearLog();
    mediaPlayer = document.getElementById('media_video');
    var mediaSource = this;
    mediaPlayer.src = url;
    var videoSourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
    initVideo();
};

function initVideo () {

    mediaPlayer.controls = false;

   fetch("https://html5-demos.appspot.com/static/test.webm").then(function(response) {
      // The data has to be a JavaScript ArrayBuffer
      return response.arrayBuffer();
   }).then(function(videoData) {
      videoSourceBuffer.appendBuffer(videoData);
   });
}

//  Load video's initialization segment
function initVideo(range, url) {
  var xhr = new XMLHttpRequest();
  if (range || url) { // make sure we've got incoming params

    // Set the desired range of bytes we want from the mp4 video file
    xhr.open('GET', url);
    xhr.setRequestHeader("Range", "bytes=" + range);
    segCheck = (timeToDownload(range) * .8).toFixed(3); // use .8 as fudge factor
    xhr.send();
    xhr.responseType = 'arraybuffer';
    try {
      xhr.addEventListener("readystatechange", function () {
         if (xhr.readyState == xhr.DONE) { // wait for video to load
          // Add response to buffer
          try {
            videoSource.appendBuffer(new Uint8Array(xhr.response));
            // Wait for the update complete event before continuing
            videoSource.addEventListener("update",updateFunct, false);

          } catch (e) {
            log('Exception while appending initialization content', e);
          }
        }
      }, false);
    } catch (e) {
      log(e);
    }
  } else {
    return // No value for range or url
  }
}

//  Get video segments
function fileChecks() {
  // If we're ok on the buffer, then continue
  if (bufferUpdated == true) {
    if (index < segments.length) {
      // Loads next segment when time is close to the end of the last loaded segment
      if ((videoElement.currentTime - lastTime) >= segCheck) {
        playSegment(segments[index].getAttribute("mediaRange").toString(), file);
        lastTime = videoElement.currentTime;
        curIndex.textContent = index + 1; // Display current index
        index++;
      }
    } else {
      videoElement.removeEventListener("timeupdate", fileChecks, false);
    }
  }
}

function timeToDownload(range) {
  var vidDur = range.split("-");
  // Time = size * 8 / bitrate
  return (((vidDur[1] - vidDur[0]) * 8) / bandwidth)
}

function updateFunct() {
  //  This is a one shot function, when init segment finishes loading,
  //    update the buffer flag, call getStarted, and then remove this event.
  bufferUpdated = true;
  getStarted(file); // Get video playback started
  //  Now that video has started, remove the event listener
  videoSource.removeEventListener("update", updateFunct);
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

//  Play segment plays a byte range (format nnnn-nnnnn) of a media file
function playSegment(range, url) {
  var xhr = new XMLHttpRequest();
  if (range || url) { // Make sure we've got incoming params
    xhr.open('GET', url);
    xhr.setRequestHeader("Range", "bytes=" + range);
    xhr.send();
    xhr.responseType = 'arraybuffer';
    try {
      xhr.addEventListener("readystatechange", function () {
        if (xhr.readyState == xhr.DONE) { //wait for video to load
          //  Calculate when to get next segment based on time of current one
            segCheck = (timeToDownload(range) * .8).toFixed(3); // Use .8 as fudge factor
            segLength.textContent = segCheck;
          // Add received content to the buffer
          try {
            videoSource.appendBuffer(new Uint8Array(xhr.response));
          } catch (e) {
            log('Exception while appending', e);
          }
        }
      }, false);
    } catch (e) {
      log(e);
      return // No value for range
    }
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
