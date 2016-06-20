var GameView = function(game, ctx) {
  this.ctx = ctx;
  this.game = game;
  this.bird = this.game.bird[0];

  this.pauseGame = false;

  this.onKeydownHandler = this.onKeydown.bind(this);
};

GameView.prototype.onKeydown = function(e) {
// comment out this part before deployment - BEGIN
// Or use them to cheat
  // press "s" to remove all asteroids
  if ( e.keyCode === 83 ) {
    this.removeAllAsteroids();
  }
  // press "x" to lose
  if ( e.keyCode === 88 ) {
    this.game.shouldGameContinue = false;
  }
  // press "space bar" to pause or continue game
  if ( e.keyCode === 32 ) {
    this.pauseGameToggle();
  }
  // press "g" to turn God Mode on or off
  if ( e.keyCode === 71 ) {
    this.turnOnGodModeToggle();
  }
// comment out this part before deployment - END

  this.bird.jump(e);
};


// development methods - BEGIN
GameView.prototype.pauseGameToggle = function() {
  if ( this.pauseGame ) {
    this.pauseGame = false;
  } else {
    this.pauseGame = true;
  }
};

GameView.prototype.turnOnGodModeToggle = function() {
  if ( this.game.birdIsGod ) {
    this.game.birdIsGod = false;
  } else {
    this.game.birdIsGod = true;
  }
};

GameView.prototype.removeAllAsteroids = function() {
  this.game.removeAllAsteroids();
};
// development methods - END


GameView.prototype.addEventListener = function() {
  document.addEventListener( "keydown", this.onKeydownHandler );
};

GameView.prototype.removeEventListener = function() {
  document.removeEventListener( "keydown", this.onKeydownHandler );
};

GameView.prototype.stop = function() {
  this.removeEventListener();
  document.addEventListener( "click", this.restartGame );
};


GameView.prototype.start = function () {

  this.addEventListener();
  this.game.birdIsGod = false;
  this.lastTime = 0;
  this.millisecondCount = 0;
  //start the animation
  requestAnimationFrame(this.animate.bind(this));
};

GameView.prototype.animate = function(time){
  // the time variable is the time since DOMContentLoaded
  // gets automatically passed into the requestAnimationFrame callback
  // we need to remove the time between DOMContentLoaded and clicks to start the game
  // otherwise, timeDelta will be wrong and the game will be running during this break
  // that's where timeAdjustment comes in
  this.timeAdjustment = this.timeAdjustment || time;
  // runTime is the time since GameView.prototype.start was invoked
  this.runTime = time - this.timeAdjustment;
  // EVERYTHING depends on timeDelta
  var timeDelta;
  if (this.pauseGame) {
    timeDelta = 0;
  } else {
    timeDelta = this.runTime - this.lastTime;
  }

  this.game.step(timeDelta);
  // Make sure this.game.draw gets invoked before this.ctx.fillText get invoked
  // Otherwise, the text will not render
  this.game.draw(this.ctx);

  // if we don't check shouldGameContinue, score would just increment with runTime forever
  if ( this.game.shouldGameContinue ) {
    this.score = parseInt(this.runTime / 1000);
  } else {
    this.stop();
    this.ctx.font = "30px Ariel";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Game Over.", 350, 200);
    this.ctx.fillText("You survived for " + this.score + " seconds.", 350, 250);
    this.ctx.fillText("Click to Play Again", 350, 300);
  }

  this.lastTime = this.runTime;

  this.ctx.font = "30px Ariel";
  this.ctx.fillStyle = "white";
  this.ctx.fillText("score: " + this.score, 100, 100);

  //every call to animate requests causes another call to animate
  requestAnimationFrame(this.animate.bind(this));

};

GameView.prototype.restartGame = function() {
  window.location.reload();
};

module.exports = GameView;
