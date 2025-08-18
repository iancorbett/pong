const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d"); //allows us to draw on canvas
const p1ScoreEl = document.getElementById("p1Score");
const p2ScoreEl = document.getElementById("p2Score");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const twoPlayerChk = document.getElementById("twoPlayer");

const W = canvas.width;
const H = canvas.height;
const PADDLE_W = 12;
const PADDLE_H = 90;
const BALL_SIZE = 12;
const PLAYER_X = 30;
const AI_X = W - 30 - PADDLE_W;
const PLAYER_SPEED = 360;       // make user faster
const AI_SPEED = 320;           // make ai slower
const BALL_START_SPEED = 360;   
const BALL_SPEED_GROWTH = 1.03;

let running = true;
let twoPlayer = false;
let p1Score = 0;
let p2Score = 0;

const state = {
    playerY: H/2 - PADDLE_H/2,
    aiY: H/2 - PADDLE_H/2,
    ballX: W/2 - BALL_SIZE/2,
    ballY: H/2 - BALL_SIZE/2,
    ballVX: randDir() * BALL_START_SPEED,
    ballVY: BALL_START_SPEED * (Math.random() * 0.5 - 0.25),
    lastTime: 0
  };

  const keys = {
    up: false, down: false,    
    p2up: false, p2down: false 
  };

  function randDir(){ return Math.random() < 0.5 ? 1 : -1; }

function resetBall(towards = 1) {
  state.ballX = W/2 - BALL_SIZE/2;
  state.ballY = H/2 - BALL_SIZE/2;
  state.ballVX = BALL_START_SPEED * towards;
  state.ballVY = BALL_START_SPEED * (Math.random() * 0.5 - 0.25);
}

function restartGame() {
    p1Score = 0; p2Score = 0;
    state.playerY = H/2 - PADDLE_H/2;
    state.aiY = H/2 - PADDLE_H/2;
    resetBall(randDir());
    state.lastTime = 0;
    running = true;
    updateScoreUI();
  }

function updateScoreUI() {
    p1ScoreEl.textContent = p1Score;
    p2ScoreEl.textContent = p2Score;
  }

  window.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "ArrowUp": case "KeyW": keys.up = true; break;
      case "ArrowDown": case "KeyS": keys.down = true; break;
      case "KeyO": keys.p2up = true; break;
      case "KeyL": keys.p2down = true; break;
      case "Space": running = !running; break;
      case "KeyR": restartGame(); break;
    }
  });

  window.addEventListener("keyup", (e) => {
    switch (e.code) {
      case "ArrowUp": case "KeyW": keys.up = false; break;
      case "ArrowDown": case "KeyS": keys.down = false; break;
      case "KeyO": keys.p2up = false; break;
      case "KeyL": keys.p2down = false; break;
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const y = ((t.clientY - rect.top) / rect.height) * H;
    state.playerY = Math.max(0, Math.min(H - PADDLE_H, y - PADDLE_H/2));
  }, { passive: true });

pauseBtn.addEventListener("click", () => running = !running);
restartBtn.addEventListener("click", restartGame);
twoPlayerChk.addEventListener("change", (e) => twoPlayer = e.target.checked);

function tick(ts) {
    if (!state.lastTime) state.lastTime = ts; // sets to current ts if starting
    const dt = Math.min((ts - state.lastTime) / 1000, 0.033);
    state.lastTime = ts;
  
    update(dt);
    draw();
  
    requestAnimationFrame(tick);
  }

  function update(dt) {
    if (!running) return;
  
    // if key is up decrease speed if down increase speed
    if (keys.up) state.playerY -= PLAYER_SPEED * dt;
    if (keys.down) state.playerY += PLAYER_SPEED * dt;
    state.playerY = clamp(state.playerY, 0, H - PADDLE_H);

    if (twoPlayer) {
        if (keys.p2up) state.aiY -= PLAYER_SPEED * dt;
        if (keys.p2down) state.aiY += PLAYER_SPEED * dt;
      } else {
        const aiCenter = state.aiY + PADDLE_H/2;
        const target = state.ballY + BALL_SIZE/2 + (state.ballVX > 0 ? 0 : 40);
        const dir = Math.sign(target - aiCenter);
        const far = Math.abs(target - aiCenter) > 6 ? 1 : 0;
        state.aiY += dir * AI_SPEED * dt * far;
      }
      state.aiY = clamp(state.aiY, 0, H - PADDLE_H);

      state.ballX += state.ballVX * dt;
      state.ballY += state.ballVY * dt;

      if (state.ballY <= 0 && state.ballVY < 0) state.ballVY = -state.ballVY;
      // state measured from bottom of ball which is whywe include size when detecting impact with top
      if (state.ballY + BALL_SIZE >= H && state.ballVY > 0) state.ballVY = -state.ballVY;
    
      const ballCenterY = state.ballY + BALL_SIZE/2;

      //left paddle collision
      if (state.ballX <= PLAYER_X + PADDLE_W &&
        state.ballX >= PLAYER_X - BALL_SIZE &&
        ballCenterY >= state.playerY &&
        ballCenterY <= state.playerY + PADDLE_H &&
        state.ballVX < 0) {
      const rel = (ballCenterY - (state.playerY + PADDLE_H/2)) / (PADDLE_H/2); 
      state.ballVX = -state.ballVX * BALL_SPEED_GROWTH;
      state.ballVY = Math.abs(state.ballVX) * 0.45 * rel;
    }

  }  