document.addEventListener("DOMContentLoaded", function() { initialiseMediaPlayer(); }, false);
var mediaPlayer;

function initialiseMediaPlayer() {
   mediaPlayer = document.getElementById('media_video');
   mediaPlayer.controls = false;
}

function togglePlayPause() {
   var btn = document.getElementById('play-pause-button');
   if (mediaPlayer.paused || mediaPlayer.ended) {
      btn.title = 'pause';
      btn.innerHTML = 'pause';
      btn.className = 'pause';
      mediaPlayer.play();
   }
   else {
      btn.title = 'play';
      btn.innerHTML = 'play';
      btn.className = 'play';
      mediaPlayer.pause();
   }
}

function changeButtonType(btn, value) {
   btn.title = value;
   btn.innerHTML = value;
   btn.className = value;
}

function stopPlayer() {
   mediaPlayer.pause();
   mediaPlayer.currentTime = 0;
}

function toggleMute() {
   var btn = document.getElementById('mute-button');
   if (mediaPlayer.muted) {
      changeButtonType(btn, 'mute');
      mediaPlayer.muted = false;
   }
   else {
      changeButtonType(btn, 'unmute');
      mediaPlayer.muted = true;
   }
}

window.onload = function() {
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
}
