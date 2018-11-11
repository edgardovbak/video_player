(function() {

    // Define constructor
    this.Player = function() {
        // Define option defaults
        var defaults = {
            source: "",
            type: "video/mp4",
            codecs: "avc1.42E01E, mp4a.40.2",
            segments: "",
            numberOfSegments: 596,
            seekBar: null
        }

        // Create options by extending defaults with the passed in arugments
        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = extendDefaults(defaults, arguments[0]);
        }

        init.call(this);

        /**
    	 * Toggle play/pause video
    	 * @public
         * @param {DOMelemetn}
    	 */
        Player.prototype.togglePlayPause = function(item) {
            if ( this.player.paused ||  this.player.ended) {
                if ( item ) {
                    item.title = 'Play';
                    item.innerHTML = 'Play';
                    item.className = 'play';
                }
                this.player.play();
            } else {
                if ( item ) {
                    item.title = 'Pause';
                    item.innerHTML = 'Pause';
                    item.className = 'pause';
                }
                this.player.pause();
            }
        }

        /**
         * Video volume
         * @public
         * @param {number} parameter between 0 - 1 step 0.01
         */
        Player.prototype.volume = function(value) {
            this.player.volume = value;
            console.log("volume");
        }
        /**
         * Seek volume
         * @public
         * @param {number} parameter between 0 - 100 step 1
         */
        Player.prototype.seek = function(value) {
            var newTime = this.player.duration * (value / 100);
            this.player.currentTime = newTime;
            console.log("seek");
        }
    }

    // Utility method to extend defaults with user options
    function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    }

    // Private Methods
    function init() {
        this.player = document.getElementById(this.options.player);
        this.codec = this.options.type + "; codecs=\"" + this.options.codecs + "\"";
        if ('MediaSource' in window && MediaSource.isTypeSupported(this.codec)) {
            this.MSE = new MediaSource();
            this.player.src = URL.createObjectURL(this.MSE);
            // this.player.src = "/video/video.mp4";
            this.MSE.addEventListener('sourceopen', MSEOpened.call(this), false);
            this.MSE.addEventListener('webkitsourceopen', MSEOpened.call(this), false);
        } else {
            console.error('Unsupported MIME type or codec: ', this.codec);
        }

        var mi;
        if ( !this.options.seekBar ) {
            console.error('Add a seekBar to the controls: input type=range');
        } else {
            mi = document.getElementById(this.options.seekBar);
        }

        var player = this.player;
        this.player.ontimeupdate = function( player ) {
          var percentage = ( player.target.currentTime / player.target.duration ) * 100;
          mi.value = percentage;
        };
    }

    function MSEOpened() {
        // create source buffer
        var sourceBuffer = this.MSE.addSourceBuffer(this.codec);
        // request for init segment
        var req = new XMLHttpRequest();
        var responseType = "arraybuffer";
        req.open("GET", this.options.source, true);
        req.onload = function () {
            var resp = req.response;
            var arr = new Uint8Array(resp);
            sourceBuffer.appendBuffer(arr);
            sourceBuffer.addEventListener("updateend", loadSegment.call(this));
        };
        req.onerror = function () {
            console.log("** An error occurred during the transaction");
        };
        req.send();

        var segNum = 1;
        function loadSegment() {
            if ( segNum <= numOFSegments) {
                getSegment.call(this, segNum);
                segNum++;
            } else {
                mediaSource.endOfStream();
            }
        };

        function getSegment() {
            var req = new XMLHttpRequest();
            var responseType = "arraybuffer";
            req.open("GET", this.options.segments + segNum + ".m4s", true);
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
    // End of private methods
}());
