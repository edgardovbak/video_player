// helper function
var log = function(msg) {
  console.log(msg);
};

document.addEventListener("DOMContentLoaded", function() { initialiseMediaPlayer(); }, false);

function initialiseMediaPlayer() {
    var myPlayer = new Player({
        playPauseButton: "media_controls_play-pause-button",
        player: "media_video",
        seekBar: "media_controls_seek-bar",
        volumeBar: "media_controls_volume-bar",
        source: "http://www-itec.uni-klu.ac.at/ftp/datasets/DASHDataset2014/BigBuckBunny/1sec/bunny_91917bps/BigBuckBunny_1s_init.mp4",
        segments: "http://www-itec.uni-klu.ac.at/ftp/datasets/DASHDataset2014/BigBuckBunny/1sec/bunny_91917bps/BigBuckBunny_1s",
    });

    var togglePlayPauseButton = document.getElementById('media_controls_play-pause-button');
    //Event listener for the play button
    togglePlayPauseButton.addEventListener("click", function() {
           myPlayer.togglePlayPause(this);
    });

    var seekBar = document.getElementById("media_controls_seek-bar");
    //Event listener for the seek bar
    seekBar.addEventListener("change", function() {
        myPlayer.seek(seekBar.value);
    });

    var volumeBar = document.getElementById("media_controls_volume-bar");
    //Event listener for the volume slider
    volumeBar.addEventListener("change", function() {
        myPlayer.volume(volumeBar.value);
    });

}
