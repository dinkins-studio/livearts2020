// display video
let capture;
let blob;
chunks = [];
const recordButton = document.getElementById('record');
const deleteButton = document.getElementById('delete');
const submitButton = document.getElementById('submit');
const privacyButton = document.getElementById('privacy');
const vidParent = document.getElementById('video-placeholder');

// Separate function to start video
function startCapture() {
  capture = createCapture(VIDEO, {
    video: true,
    audio: true,
  });
  // Place and size the video
  capture.parent('#video-placeholder');
  capture.size(320, 240);
  capture.elt.volume = 0;
}

function setup() {
  noCanvas();
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
  const elt = document.getElementById("recorded");
  if (elt) elt.remove();

  chunks.length = 0;
  let stream = capture.elt.srcObject;
  recorder = new MediaRecorder(stream);


  recorder.ondataavailable = e => {
    if (e.data.size) {
      chunks.push(e.data);
    }
  };

  recorder.onstop = exportVideo;

  recordButton.onclick = e => {
    recorder.stop();
    recordButton.textContent = 're-rec';
    recordButton.onclick = record;
  };

  recorder.start();

  recordButton.textContent = 'stop';
}

// display video recording on webpage
function exportVideo(e) {
  blob = new Blob(chunks);
  // console.log(blob);
  let vid = document.createElement('video');
  vid.id = 'recorded';
  vid.controls = true;
  let videodata = URL.createObjectURL(blob);
  console.log(videodata);
  vid.src = videodata;
  // postToDatabase(blob);
  // document.body.parent.appendChild(vid)



  document.getElementById("recording").parentElement.appendChild(vid);
  vid.play();
}
recordButton.onclick = record;

deleteButton.onclick = e => {
  let unsatisfactoryTake = document.getElementById("recorded");
  unsatisfactoryTake.remove();
  deleteButton.textContent = 'deleted!';
};

submitButton.onclick = e => {
  console.log(blob);
  postToDatabase(blob);
  submitButton.textContent = 'submitted!';
};

privacyButton.onclick = e => {
  window.alert("By clicking “submit” you grant this website permission to save the video you upload to a database managed by Stephanie Dinkins Studio in order to display your video on this website.");
};