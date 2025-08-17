const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d"); //allows us to draw on canvas
const p1ScoreEl = document.getElementById("p1Score");
const p2ScoreEl = document.getElementById("p2Score");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const twoPlayerChk = document.getElementById("twoPlayer");

let running = true;
let twoPlayer = false;
let p1Score = 0;
let p2Score = 0;