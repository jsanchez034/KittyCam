/* global jsmpeg */
(function(window,document,jsmpeg){
  "use strict";

  var videoStreamer = window.videoStreamer = {
    deg: 0,
    canvas: null,
    ctx: null,
    client: null,
    player: null,

    setRotate: function(degree) {
      var canvas = this.canvas;
      canvas.style.webkitTransform = 'rotate('+degree+'deg)';
      canvas.style.mozTransform    = 'rotate('+degree+'deg)';
      canvas.style.msTransform     = 'rotate('+degree+'deg)';
      canvas.style.oTransform      = 'rotate('+degree+'deg)';
      canvas.style.transform       = 'rotate('+degree+'deg)';
    },

    initVideoStream: function(socketuri, port) {
      // Show loading notice
      this.canvas = document.getElementById('videoCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.fillStyle = '#444';
      this.ctx.fillText('Loading...', this.canvas.width/2-30, this.canvas.height/3);

      // Setup the WebSocket connection and start the player
      this.client = new WebSocket( 'ws://' + socketuri + ":" + port + '/' );
      this.player = new jsmpeg(this.client, {canvas: this.canvas});
    },

    rotateLeft: function() {
      var currentDeg = this.deg;
      this.deg = (Math.abs(currentDeg) === 360) ? -45 : currentDeg - 45;
      this.setRotate(this.deg);
      return false;
    },

    rotateRight: function() {
      var currentDeg = this.deg;
      this.deg = (Math.abs(currentDeg) === 360) ? 45 : currentDeg + 45;
      this.setRotate(this.deg);
      return false;
    },

    initVideoControls: function() {
      //Add event listeners for video canvas manipulation
      var self = this,
          _rotateLeft = function() {
            self.rotateLeft.call(self);
          },
          _rotateRight = function() {
            self.rotateRight.call(self);
          };


      document.getElementById("flip-left").addEventListener("click", _rotateLeft, false);
      document.getElementById("flip-right").addEventListener("click", _rotateRight, false);

    },

    init: function(socketuri, port) {
      this.initVideoStream(socketuri, port);
      this.initVideoControls();
    }

  };

  videoStreamer.init("192.168.2.7", "8084");

})(window,document,jsmpeg);
