//Some general Three.js components
let renderer, scene, camera, controls;

let depthkit;
// Depthkit character
let character;
let rotationStep = Math.PI / 9.0;

// custom video layout
let plane1, plane2;
let planeXPos = -3.25;

let videoSrcList = [];

init();

function init() {
  // Setup renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Setup scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x282828);
  scene.fog = new THREE.Fog(0x282828, 0.0, 10.0);

  // Setup camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );
  camera.position.set(0, 2, 3);

  // Setup controls
  controls = new THREE.OrbitControls(camera);
  controls.target.set(0, 0.75, 0);
  camera.lookAt(controls.target);

  // A grid helper as a floor reference
  let gridHelper = new THREE.GridHelper(50, 50);
  scene.add(gridHelper);

  depthkit = new Depthkit();
  depthkit.load(
    "https://cdn.glitch.com/88ddef19-31c1-4772-bdd6-29b3a07403ad%2FTAKE_07_30_01_45_31_Export_07_30_04_09_05.txt?v=1596219873183",
    "https://cdn.glitch.com/88ddef19-31c1-4772-bdd6-29b3a07403ad%2FTAKE_07_30_01_45_31_Export_07_30_04_09_05.webm?v=1596219863242",
    dkCharacter => {
      character = dkCharacter;

      //Position and rotation adjustments
      dkCharacter.rotation.set(Math.PI - 3.5, 3, Math.PI / -2.0);
      // dkCharacter.rotation.y = Math.PI;
      dkCharacter.position.set(0.25, 0.92, 0);

      // Depthkit video playback control
      depthkit.video.muted = "muted"; // Necessary for auto-play in chrome now
      depthkit.setLoop(true);
      depthkit.play();

      // Add the character to the scene
      scene.add(character);
    }
  );

  // setup video planes
  // iterate through file paths/urls
  // for (let i = 0; i < 4; i += 1) {
  //   let folder = "video/";
  //   let fileName = "sample-video";
  //   let fileNumber = i;
  //   let fileExtension = ".mov";
  //   let src = folder + fileName + fileNumber + fileExtension;
  //   videoSrcList.push(src);
  // }
  // console.log("video source list: " + videoSrcList);

  // iterate through video variables
  // function createVideoVariables() {
  //   let video = [];
  //   for (let i = 0; i <= videoSrcList.length; i += 1) {
  //     video[i] = "video" + i;
  //     // video[i] = videoSrcList[i];

  //     console.log(video[i]);
  //   }
  //   return video;
  // }

  // console.log("video variables: " + createVideoVariables());

  let video1 = setUpVideo("https://cdn.glitch.com/39b7ba95-a96e-44aa-9110-0d917a3046ad%2FpartA_Trim.mp4?v=1596058682930");
  // let video1 = setUpVideo(videoSrcList[0]);
  // let video2 = setUpVideo(videoSrcList[1]);

  let texture1 = createTextureFromVideoElement(video1);
  // let texture2 = createTextureFromVideoElement(video2);
  // texture.crossOrigin = "anonymous";

  // iterate through planes to create grid
  for (let i = 0; i < 10; i += 1) {
    plane = new THREE.Mesh(
      new THREE.CubeGeometry(0.5, 0.5, 0.5),
      new THREE.MeshBasicMaterial({ map: texture1, side: THREE.DoubleSide })
    );
    // plane.position.x = planeXPos * 2;
    plane.position.x = ( Math.random() - 0.5 ) * 5;
    plane.position.y = ( Math.random() - 0.5 ) * 5;
    // plane.position.z = ( Math.random() - 0.5 ) * 10;

    // plane.position.z = -2;
    // plane.position.x = planeXPos;
    // planeXPos += 2;

    scene.add(plane);
  }


  // let columns = 4,
  //   rows = 5
  // size = 1,
  //   spacing = 1.3;

  // // var grid = new THREE.Object3d(); // just to hold them all together
  // for (let i = 0; h < columns; i += 1) {
  //   for (let j = 0; v < rows; j += 1) {
  //     let box = new THREE.Mesh(
  //       new THREE.PlaneGeometry(1.5, 1.5),
  //       new THREE.MeshBasicMaterial({ map: texture1, side: THREE.DoubleSide })
  //     );
  //     box.position.x = (i - columns / 2) * spacing;
  //     box.position.y = (j - rows / 2) * spacing;
  //     scene.add(box);
  //     // grid.add(box);
  //   }
  // }
  // // scene.add(grid);

  // plane1 = new THREE.Mesh(
  //   new THREE.PlaneGeometry(1.5, 1.5),
  //   new THREE.MeshBasicMaterial({ map: texture1, side: THREE.DoubleSide })
  // );
  // plane1.position.x -= 1.5;
  // plane1.position.z -= 4;

  // scene.add(plane1);

  // plane2 = new THREE.Mesh(
  //   new THREE.PlaneGeometry(1.5, 1.5),
  //   new THREE.MeshBasicMaterial({ map: texture2, side: THREE.DoubleSide })
  // );
  // plane2.position.x += 1.5;
  // plane2.position.z -= 4;

  // scene.add(plane2);

  let element = setUpVideo();
  draw();

  window.addEventListener("resize", onWindowResize, false);
  window.addEventListener("keydown", onKeyDown, false);

  render();
}

function setUpVideo(inSrc) {
  var videlem = document.createElement("video");
  var sourceMP4 = document.createElement("source");
  sourceMP4.type = "video/mp4";
  sourceMP4.src = inSrc;
  videlem.appendChild(sourceMP4);

  videlem.autoplay = true;
  videlem.muted = true;
  videlem.setAttribute("crossorigin", "anonymous");
  // i think this will not be not be needed if you have a server

  videlem.style.display = "none"; // this makes it so the html element isnt there

  videlem.load();
  videlem.play();
  return videlem;
}

function draw() {
  requestAnimationFrame(draw);
  renderer.render(scene, camera);

  //   let angle = 0.007;
  //   plane1.rotation.x += angle;
  //   plane1.rotation.y += angle * 0.125;

  //   plane2.rotation.x -= angle;
  //   plane2.rotation.y -= angle * 0.99;

  // controls.update();
  // camera.position.x += 0.01;
}

function createTextureFromVideoElement(video) {
  let texture = new THREE.VideoTexture(video);
  texture.crossOrigin = "anonymous";
  texture.needsUpdate;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;
  return texture;
}

function render() {
  requestAnimationFrame(render);

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
  switch (event.keyCode) {
    case 49: // key '1'
      depthkit.setMeshScalar(1);
      break;
    case 50: // key '2'
      depthkit.setMeshScalar(2);
      break;
    case 51: // key '3'
      depthkit.setMeshScalar(3);
      break;
    case 81: // key 'q'
      character.rotation.x += rotationStep;
      break;
    case 87: // key 'w'
      character.rotation.x -= rotationStep;
      break;
    case 65: // key 'a'
      character.rotation.y += rotationStep;
      break;
    case 83: // key 's'
      character.rotation.y -= rotationStep;
      break;
    case 90: // key 'z'
      character.rotation.z += rotationStep;
      break;
    case 88: // key 'x'
      character.rotation.z -= rotationStep;
      break;

    default:
      scene.updateMatrixWorld();

      var v = new THREE.Vector3();
      v.setFromMatrixPosition(character.matrixWorld);
      console.log(v);

      return;
  }
}
