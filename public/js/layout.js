// identify modal
let modal = document.getElementById("video-prompt");

// identify button that opens modal
let modalButton = document.getElementById("submit-video");

// identify <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

modalButton.onclick = function () {
  modal.style.display = "block";
  // Start video capture when clicking on the button
  startCapture();
}

// when a person clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
}

// // when a person clicks anywhere outside of the modal, close it
// window.onclick = function (event) {
//   // when a person clicks on <span> (x), close the modal
//   span.onclick = function () {
//     modal.style.display = "none";
//   }
// }

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
} 