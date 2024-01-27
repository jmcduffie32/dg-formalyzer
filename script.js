const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const showVideo = document.getElementById("show-video");
const playerSelect = document.getElementById("player");
const ctx = canvas.getContext("2d");
canvas.height = 720;
canvas.width = 1280;
let detector;
let capturePoses = false;
let keypoints = [];

async function getPoses() {
  const poses = await detector.estimatePoses(video);

  for (let pose of poses) {
    keypoints.push(pose.keypoints);
    drawPoints(pose.keypoints);
  }
  if (capturePoses) {
    requestAnimationFrame(getPoses);
  }
}

function drawSegments(ctx, points) {
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach(({ x, y }) => {
    ctx.lineTo(x, y);
  });
}

function drawPoints(points) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.beginPath();
  for (let { x, y } of points.slice(5)) {
    ctx.moveTo(x, y);
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
  }
  ctx.fillStyle = "orange";
  ctx.fill();
  ctx.beginPath();
  drawSegments(ctx, [
    points[9],
    points[7],
    points[5],
    points[6],
    points[8],
    points[10],
  ]);
  drawSegments(ctx, [points[5], points[11], points[13], points[15]]);
  drawSegments(ctx, [points[6], points[12], points[14], points[16]]);
  drawSegments(ctx, [points[12], points[11]]);
  ctx.strokeStyle = 'blue';
  ctx.stroke();
}

async function play () {
  keypoints = [];
  detector = detector || await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      });
  capturePoses = true;
  video.play();
  requestAnimationFrame(getPoses);
}

canvas.onclick = () => {
  play()
};
video.onplay = () => {
  play()
};
video.onended = () => (capturePoses = false);

showVideo.onchange = (e) => {
  if (e.target.checked) {
    video.classList.remove("hidden");
  } else {
    video.classList.add("hidden");
  }
};

function playback(frame) {
  drawPoints(keypoints[frame]);
  if (keypoints[frame + 1]) {
    setTimeout(() => playback(frame + 1), 1000/30)  
  }
}

playerSelect.onchange = (e) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  video.src = e.target.value;
}

function savePlayerForm() {
  const filename = video.src.replace(".mp4", ".json");
  // Creating a blob object from non-blob data using the Blob constructor
  const blob = new Blob([JSON.stringify(keypoints)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  // Create a new anchor element
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  a.remove();
}
