// SELECT CANVAS
var cvs = document.getElementById("bird");
var ctx = cvs.getContext("2d");
// LOAD THE IMAGE
var sprite = new Image();
sprite.src = "img/sprite.png";
var frames = 0;
const DEGREE = Math.PI / 180;

// LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

// WE HAVE 3 STATES OF A GAME:
// - GET READY
// - GAME
// - OVER
// current key defines in which state the game is
var state = {
  current: 0,
  getReady: 0,
  game: 1,
  over: 2,
};

// Start button
const startBtn = {
  x: 120,
  y: 263,
  w: 83,
  h: 29,
};

// CONTROL THE GAME
document.addEventListener("keydown", function (e) {
  if (e.keyCode == 13) {
    // if state.current is 0 and user click on the canvas the game should start
    switch (state.current) {
      case state.getReady:
        // change state.current to 1
        state.current = state.game;
        SWOOSHING.play();
        break;
      case state.game:
        break;
      case state.over:
        bird.reset();
        pipes.reset();
        score.reset();
        frames = 0;
        state.current = state.getReady;
        break;
    }
  }
});

document.onkeydown = function (e) {
  switch (e.keyCode) {
    case 38:
      bird.jump = 1.6;
      bird.goUp();
      break;
    case 40:
      bird.jump = 1.6;
      bird.goDown();
      break;
    case 39:
      pipes.acceleration += 0.1;
  }
};

document.onkeyup = function (e) {
  if (e.keyCode == 39) {
    pipes.acceleration = 0;
  }
  FLAP.play();
  bird.reset();
};
// BACKGROUND
var bg = {
  sX: 0,
  sY: 0,
  w: 275,
  h: 226,
  x: 0,
  y: cvs.height - 226,

  // select the specific image in sprite.png and draw it to the canvas
  // drawImage takes parameters (img itself, sX (x axis in the source image where the selected image locates), sY, sWidth(width of the selected image), sHeight, dX(x axis in canvas where the selected image should be placed), dY, dWidth(width of the selected image usually the same like in source image), dHeight);
  draw: function () {
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );
    // to fit the image in Canvas
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  },
};
// FOREGROUND
var fg = {
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  y: cvs.height - 112,

  dx: 2,

  draw: function () {
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  },

  update: function () {
    if (state.current == state.game) {
      this.x = (this.x - this.dx) % (this.w / 2);
    }
  },
};
// BIRD
var bird = {
  // animation of bird when fly or fall
  animation: [
    {
      sX: 276,
      sY: 112,
    },
    {
      sX: 276,
      sY: 139,
    },
    {
      sX: 276,
      sY: 164,
    },
    {
      sX: 276,
      sY: 139,
    },
  ],
  x: 50,
  y: 150,
  w: 34,
  h: 26,
  // frame as the iterator for animation array
  frame: 0,
  radius: 12,

  gravity: 0,
  jump: 1.6,
  speed: 0,
  rotation: 0,

  draw: function () {
    var bird = this.animation[this.frame];
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(
      sprite,
      bird.sX,
      bird.sY,
      this.w,
      this.h,
      -this.w / 2,
      -this.h / 2,
      this.w,
      this.h
    );

    ctx.restore();
  },
  goUp: function () {
    this.speed = -this.jump;
    this.jump += 2;
    this.gravity -= 0.1;
  },

  goDown: function () {
    this.speed = +this.jump;
    this.jump -= 2;
    this.gravity += 0.1;
  },

  update: function () {
    // If the game on getReady status animation of bird will update slowly
    // than higher the period then birds animation is slower
    this.period = state.current == state.getReady ? 10 : 5;

    // Increment frame by one each period
    this.frame += frames % this.period == 0 ? 1 : 0;
    // Frame goes from 0 to 4, then again to 0
    this.frame = this.frame % this.animation.length;

    if (state.current == state.getReady) {
      this.y = 150; // RESET THE POSITION OF THE BIRD AFTER GAME OVER
      this.rotation = 0 * DEGREE;
    } else {
      // bird will go down because the higher the y the lower the bird
      this.speed += this.gravity;
      this.y += this.speed;

      //game over if the bird touches the ground
      if (this.y + this.h / 2 >= cvs.height - fg.h) {
        this.y = cvs.height - fg.h - this.h / 2;
        if (state.current == state.game) {
          state.current = state.over;
          DIE.play();
        }
      } else if (this.y - this.h / 2 <= 0) {
        this.y = this.h / 2;
        if (state.current == state.game) {
          state.current = state.over;
        }
      }
      // IF THE SPEED IS GREATER THAN THE JUMP MEANS THE BIRD IS FALLING DOWN
      if (this.speed >= this.jump) {
        this.rotation = 90 * DEGREE;
        this.frame = 1;
      } else {
        this.rotation = -25 * DEGREE;
      }
    }
  },

  reset: function () {
    this.speed = 0;
    this.jump = 1.6;
    this.gravity = 0;
  },
};
// GET READY MESSAGE
var getReady = {
  sX: 0,
  sY: 228,
  w: 173,
  h: 152,
  x: cvs.width / 2 - 173 / 2,
  y: 80,
  draw: function () {
    // if state of the game is getReady window will be shown
    if (state.current === state.getReady) {
      ctx.drawImage(
        sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  },
};
// GAME OVER MESSAGE
var gameOver = {
  sX: 175,
  sY: 228,
  w: 225,
  h: 202,
  x: cvs.width / 2 - 225 / 2,
  y: 80,
  draw: function () {
    // if state of the game is over window will be shown
    if (state.current === state.over) {
      ctx.drawImage(
        sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  },
};

// PIPES
const pipes = {
  position: [],

  top: {
    sX: 553,
    sY: 0,
  },
  bottom: {
    sX: 502,
    sY: 0,
  },
  w: 53,
  h: 400,
  gap: 85,
  maxYPos: -150,
  dx: 2,
  newPipe: 100,
  acceleration: 0,

  draw: function () {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      let topYPos = p.y;
      let bottomYPos = p.y + this.h + this.gap;

      // top Pipe
      ctx.drawImage(
        sprite,
        this.top.sX,
        this.top.sY,
        this.w,
        this.h,
        p.x,
        topYPos,
        this.w,
        this.h
      );
      // bottom pipe
      ctx.drawImage(
        sprite,
        this.bottom.sX,
        this.bottom.sY,
        this.w,
        this.h,
        p.x,
        bottomYPos,
        this.w,
        this.h
      );
    }
  },

  update: function () {
    if (state.current !== state.game) return;

    if (frames % this.newPipe == 0) {
      this.position.push({
        x: cvs.width,
        y: this.maxYPos * (Math.random() + 1),
      });
    }
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];

      let bottomPipeYPos = p.y + this.h + this.gap;

      // COLLISION DETECTION
      // TOP PIPE
      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > p.y &&
        bird.y - bird.radius < p.y + this.h
      ) {
        state.current = state.over;
        HIT.play();
      }

      // BOTTOM PIPE
      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > bottomPipeYPos &&
        bird.y - bird.radius < bottomPipeYPos + this.h
      ) {
        state.current = state.over;
        HIT.play();
      }

      // MOVE THE PIPE
      p.x -= this.dx + this.acceleration;

      if (p.x + this.w <= 0) {
        // if the pipes go beyond the canvas we delete them from the array
        this.position.shift();
        score.value += 1;
        SCORE_S.play();
        score.best = Math.max(score.value, score.best);
        localStorage.setItem("best", score.best);
        score.addSpeed();
      }
    }
  },

  reset: function () {
    this.position = [];
    this.dx = 2;
    this.newPipe = 100;
  },
};

const score = {
  best: parseInt(localStorage.getItem("best")) || 0,
  value: 0,

  draw: function () {
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";

    if (state.current == state.game) {
      ctx.lineWidth = 2;
      ctx.font = "35px Teko";
      ctx.fillText(this.value, cvs.width / 2, 50);
      ctx.strokeText(this.value, cvs.width / 2, 50);
    } else if (state.current == state.over) {
      // SCORE VALUE
      ctx.font = "25px Teko";
      ctx.fillText(this.value, 225, 176);
      ctx.strokeText(this.value, 225, 176);
      // BEST SCORE
      ctx.fillText(this.best, 222, 218);
      ctx.strokeText(this.best, 222, 218);
    }
  },

  reset: function () {
    this.value = 0;
  },

  addSpeed: function () {
    pipes.dx += 0.2;
    if (pipes.newPipe > 50) {
      pipes.newPipe -= 1;
    } else {
      pipes.newPipe = 50;
    }
  },
};

function draw() {
  // fill canvas with blueish color
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  bg.draw();
  pipes.draw();
  fg.draw();
  bird.draw();
  getReady.draw();
  gameOver.draw();
  score.draw();
}

function update() {
  bird.update();
  fg.update();
  pipes.update();
}

function loop() {
  // update the position of our images (such as pipes)
  update();
  draw();
  // count amount of frames per second
  frames++;
  // requestAnimationFrame method means that you want to perform an animation and update the animation calling callback function as the argument
  requestAnimationFrame(loop);
}
loop();
