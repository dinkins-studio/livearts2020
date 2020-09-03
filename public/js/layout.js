// identify modal
let modal = document.getElementById("video-prompt");

// identify button that opens modal
let modalButton = document.getElementById("submit-video");

// identify <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

modalButton.onclick = function () {
  // mute depthkit character
  depthkit.video.muted = true;

  modal.style.display = "block";
  // Start video capture when clicking on the button
  startCapture();
}

// $(modalButton).click(function(event, wasTriggered) {
//   if (wasTriggered) {
//     depthkit.video.muted = "muted";
//       // alert('triggered in code');
//   } else {
//       // alert('triggered by mouse');
//   }
// });

// $(modalButton).trigger('click', true);

// when a person clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
  depthkit.video.muted = false;
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
} 