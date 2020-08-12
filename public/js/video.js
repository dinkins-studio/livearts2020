// display video
let capture;
const button = document.getElementById('record');
const vidParent = document.getElementById('video-placeholder');
chunks = [];

function setup() {
  noCanvas();

  capture = createCapture(VIDEO, {
    video: true,
    audio: true,
  });

  // echo cancellation attempt 1
  // capture = createCapture(VIDEO, {
  //   video: true,
  //   audio: true,
  //   echoCancellancellation: true
  // });

  // echo cancellation attempt 2
  // let constraints = {
  //   video: {
  //     mandatory: {

  //       minWidth: 1280;
  //       minHeight: 720;
  //     },
  //     optional: [{
  //       maxFrameRate: 10;
  //     }]
  //   },
  //    audio: {
  //      echoCancellation: true
  //    } 
  // };

  //   capture = createCapture(constraints, function(stream));

  capture.size(640, 480);
}

async function postToDatabase(blob) {
  let formdata = new FormData(); //create a from to of data to upload to the server
  formdata.append('videoBlob', blob, 'myvideo' + new Date().getTime() + '.webm'); // append the sound blob and the name of the file. third argument will show up on the server as req.file.originalname
  var options = {
    method: 'POST',
    body: formdata, // with our form data packaged above
    headers: new Headers({
      'enctype': 'multipart/form-data' // the enctype is important to work with multer on the server
    })
  };
  const response = await fetch('/upload', options);
  console.log(response);
}

// record video
function record() {
  chunks.length = 0;
  // let stream = document.querySelector('canvas').captureStream(30),
  let stream = capture.elt.srcObject;

  // i can't seem to get it to record the actual video html element
  // let stream = document.querySelector('#stream').captureStream(30),
  // let stream = document.getElementById('stream').captureStream(30),
  recorder = new MediaRecorder(stream);

  recorder.ondataavailable = e => {
    if (e.data.size) {
      chunks.push(e.data);
    }
  };
  recorder.onstop = exportVideo;
  button.onclick = e => {
    recorder.stop();
    button.textContent = 'start recording';
    button.onclick = record;
  };
  recorder.start();
  button.textContent = 'stop recording';
}

// display video recording on webpage
function exportVideo(e) {
  let blob = new Blob(chunks);
  console.log(blob);
  let vid = document.createElement('video');
  vid.id = 'recorded';
  vid.controls = true;
  let videodata = URL.createObjectURL(blob);
  console.log(videodata);
  vid.src = videodata;
  postToDatabase(blob);
  // document.body.parent.appendChild(vid)
  document.getElementById("video-placeholder").parentElement.appendChild(vid);
  vid.play();
}
button.onclick = record;