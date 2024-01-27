const playerData = {};
const canvases = {};
const players = [
  "mcbeth",
  "kajiyama",
  "eagle",
  "ricky",
];
let maxFrame;

async function loadData() {
  for (const player of players) {
    let canvas = document.getElementById(player)
    canvas.height = 720;
    canvas.width = 1280;
    canvases[player] = canvas.getContext('2d');
     
    const resp = await fetch(`${player}.json`);
    const data = await resp.json();
    playerData[player] = data;
  }
  maxFrame = Math.max(...(players.map(p => playerData[p].length)));
}

function playSideBySide(frame) {
  for (let player of Object.keys(canvases)) {
    const ctx = canvases[player];
    const points = playerData[player][frame]
    if (points) {
      drawPointsWithCtx(ctx, points);
    }
  }
  if (frame <= maxFrame) {
    requestAnimationFrame(() => playSideBySide(frame + 1))
  }

}

function drawPointsWithCtx(ctx, points) {
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

loadData();
