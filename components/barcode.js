import React from 'react';
import Head from 'next/head';
import Button from 'react-md/lib/Buttons';
import Quagga from 'quagga';

   // Examples:
   // https://github.com/serratus/quaggaJS/blob/master/example/camera_example.html
   // https://serratus.github.io/quaggaJS/examples/live_w_locator.js
 
if (typeof window !== 'undefined') {
  window.navigator.getUserMedia =
    window.navigator.getUserMedia ||
    window.navigator.webkitGetUserMedia ||
    window.navigator.mozGetUserMedia ||
    window.navigator.msGetUserMedia;

  window.URL = window.URL || 
    window.webkitURL || 
    window.mozURL || 
    window.msURL;

   function getUserMedia(constraints, success, failure) {
     navigator.getUserMedia(constraints, function(stream) {
       var videoSrc = (window.URL && window.URL.createObjectURL(stream)) ||
                      stream;
       success.apply(null, [videoSrc]);
     }, failure);
   }
 
   function initCamera(constraints, video, callback) {
     getUserMedia(constraints, function (src) {
       video.src = src;
       video.addEventListener('loadeddata', function() {
         var attempts = 10;
         function checkVideo() {
           if (attempts > 0) {
             if (video.videoWidth > 0 && video.videoHeight > 0) {
               console.log(video.videoWidth + "px x " + video.videoHeight + "px");
               video.play();
               callback();
             } else {
               window.setTimeout(checkVideo, 100);
             }
           } else {
             callback('Unable to play video stream.');
           }
           attempts--;
         }
         checkVideo();
       }, false);
     }, function(e) {
       console.log(e);
     });
   }
 
   function copyToCanvas(video, ctx) {
     ( function frame() {
       ctx.drawImage(video, 0, 0);
       window.requestAnimationFrame(frame);
     }());
   }
}

class Barcode extends React.Component {
  constructor(props) {
    super(props);
  }

  toggle () {
    console.warn('Hello');
  }

  componentDidMount() {
    console.warn(this.canvasElem);

    let config = {
      decoder: {
        // Important details about ean readers:
        // https://github.com/serratus/quaggaJS#enabling-extended-ean
        readers: [{
          format: "ean_reader",
          config: {
            supplements: [ 'ean_5_reader', 'ean_2_reader' ]
          }
        }]
      },
      inputStream: {
        name: "Live",
        type : "LiveStream",
        target: this.canvasElem,
        constraints: {
          width: {min: 640},
          height: {min: 480},
          aspectRatio: {min: 1, max: 100},
          facingMode: "environment" // or user
        }
      },
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: 4,
      locate: true
    }

    Quagga.init(config, (err) => {
      if (err) throw err;
      Quagga.start();
    });
  }

  render() {
    return (
      <div>
        <Head>
          <link rel="stylesheet"
           href="/static/barcode.css" />
        </Head>
        <div>
          <Button onClick={this.toggle} icon>
            Toggle
          </Button>
          <div className="barcode"
            ref={(canvas) => { this.canvasElem = canvas; }}>
          </div>
        </div>
      </div>
    );
  }
}

export default Barcode;

