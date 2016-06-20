/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/lib/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Game = __webpack_require__(1);
	var GameView = __webpack_require__(4);
	
	document.addEventListener("DOMContentLoaded", function(){
	  var canvasEl = document.getElementsByTagName("canvas")[0];
	  canvasEl.width = Game.DIM_X;
	  canvasEl.height = Game.DIM_Y;
	
	  var ctx = canvasEl.getContext("2d");
	  var game = new Game();
	
	  var startGame = function() {
	    new GameView(game, ctx).start();
	    document.removeEventListener( "click", startGame );
	  };
	
	  game.draw(ctx);
	  ctx.font = "30px Ariel";
	  ctx.fillStyle = "white";
	  ctx.fillText("Click to start.", 350, 200);
	  ctx.fillText("Press 'Up' to flap and 'Down' to dive.", 350, 250);
	  ctx.fillText("Press 'Space' to pause or continue game", 350, 350);
	  ctx.fillText("Press 'g' to turn on or off God Mode", 350, 400);
	
	  document.addEventListener( "click", startGame );
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Bird = __webpack_require__(2);
	var Asteroid = __webpack_require__(6);
	var Util = __webpack_require__(3);
	
	var Game = function() {
	
	  this.bird = [ new Bird() ];
	  this.asteroids = [ new Asteroid() ];
	
	  this.timeSinceLastAsteroid = 0;
	
	  this.birdIsGod = false;
	
	  this.shouldGameContinue = true;
	};
	
	Game.BG_COLOR = "#000000";
	Game.DIM_X = 1000;
	Game.DIM_Y = 600;
	//frames per second
	Game.FPS = 5;
	
	Game.prototype.addAsteroid = function() {
	  var asteroid = new Asteroid();
	
	  var numOfAsterorids = this.asteroids.length;
	  for (var i = 0; i < numOfAsterorids; i++) {
	    if ( this.collideCheck(asteroid, this.asteroids[i]) ) {
	      break;
	    }
	    if ( i === numOfAsterorids - 1 ) {
	      this.asteroids.push( asteroid );
	    }
	  }
	};
	
	Game.prototype.removeAllAsteroids = function() {
	  this.asteroids = [ new Asteroid() ];
	};
	
	Game.prototype.allObjects = function() {
	  return( [].concat(this.bird, this.asteroids) );
	};
	
	Game.prototype.draw = function (ctx) {
	  ctx.clearRect(0, 0, Game.DIM_X, Game.DIM_Y);
	  ctx.fillStyle = Game.BG_COLOR;
	  ctx.fillRect(0, 0, Game.DIM_X, Game.DIM_Y);
	
	  this.allObjects().forEach(function (object) {
	    object.draw(ctx);
	  });
	};
	
	Game.prototype.moveObjects = function (timeDelta) {
	  this.allObjects().forEach(function (object) {
	    object.move(timeDelta);
	  });
	};
	
	Game.prototype.shouldGameAddAsteroid = function(timeDelta) {
	  // comment out code to test game with only one asteroid
	  this.timeSinceLastAsteroid += timeDelta;
	  return( this.timeSinceLastAsteroid >= 1000 );
	};
	
	Game.prototype.step = function (timeDelta) {
	  // check to see if the game should add an asteroid
	  if (this.shouldGameAddAsteroid(timeDelta)) {
	    this.addAsteroid();
	    this.timeSinceLastAsteroid = 0;
	  }
	
	  // remove asteroids that are out of bounds
	  for (var i = 0; i < this.asteroids.length; i++) {
	    if( this.asteroids[i].pos[0] < -300 ) {
	      this.asteroids.splice(i,1);
	    }
	  }
	
	  if ( this.birdIsGod === false ) {
	    this.birdOutOfBounds();
	    this.birdCollideCheckAll();
	  }
	
	  this.moveObjects(timeDelta);
	};
	
	Game.prototype.collideCheck = function(objectOne, objectTwo) {
	  var target = objectOne.radius + objectTwo.radius;
	  return ( Util.dist( objectOne.pos, objectTwo.pos ) <= target );
	};
	
	Game.prototype.birdPostCollision = function(bird, asteroid) {
	  // Remember, in Canvas, the y-coordinates are reversed!!!!
	  // cos( pi / 2 ) ~ 0.71
	  // bird should fall if it hits the 'fourth quarter of the asteroid's left side' or 'the fourth quadrent of the asteroid'
	
	  if ( ( bird.pos[1] > asteroid.pos[1] + asteroid.radius * 0.71 ) || ( bird.pos[0] > asteroid.pos[0] && bird.pos[1] > asteroid.pos[1] ) ) {
	    return "fall";
	  } else {
	    return "splat";
	  }
	};
	
	Game.prototype.collisionResult = function(bird, asteroid) {
	  //remove listener
	  this.shouldGameContinue = false;
	
	  this._birdPostCollision = this.birdPostCollision(bird, asteroid);
	
	  if( this._birdPostCollision === "fall") {
	    bird.fallAfterCollision();
	  } else {
	    bird.splatAfterCollision();
	  }
	
	  asteroid.afterCollisionWithBird();
	};
	
	Game.prototype.birdCollideCheckAll = function() {
	  var bird = this.bird[0];
	  for (var i = 0; i < this.asteroids.length; i++) {
	    if (this.collideCheck(bird, this.asteroids[i])) {
	        this.collisionResult(bird, this.asteroids[i]);
	        break;
	    }
	  }
	};
	
	Game.prototype.birdOutOfBounds = function(bird) {
	  if ( this.bird[0].pos[1] < 0 || this.bird[0].pos[1] > 600 ) {
	    this.shouldGameContinue = false;
	  }
	};
	
	module.exports = Game;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(3);
	var MovingObject = __webpack_require__(5);
	
	var Bird = function() {
	
	  var options = {
	    pos: [500, 300],
	    color: "#505050",
	    vel: [0, 1],
	    radius: 20
	  };
	
	  var bird = this;
	  MovingObject.call(bird, options);
	};
	
	Util.inherits(Bird, MovingObject);
	
	Bird.prototype.jump = function(e) {
	  switch (e.keyCode) {
	    case ( 38 ):
	      this.pos[1] -= 30;
	      break;
	    case ( 40 ):
	      this.pos[1] += 30;
	      break;
	  }
	};
	
	Bird.prototype.splatAfterCollision = function() {
	  this.vel = [-2, 0];
	};
	
	Bird.prototype.fallAfterCollision = function() {
	  this.vel = [-1, 1];
	};
	
	module.exports = Bird;


/***/ },
/* 3 */
/***/ function(module, exports) {

	var Util = {
	
	  inherits: function(ChildClass, BaseClass) {
	    function Surrogate() {}
	    Surrogate.prototype = BaseClass.prototype;
	    ChildClass.prototype = new Surrogate();
	    ChildClass.prototype.constructor = ChildClass;
	  },
	
	  dist: function (pos1, pos2) {
	    return Math.sqrt(
	      Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2)
	    );
	  }
	
	};
	
	module.exports = Util;


/***/ },
/* 4 */
/***/ function(module, exports) {

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


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(3);
	
	var MovingObject = function(options) {
	  this.pos = options.pos;
	  this.vel = options.vel;
	  this.radius = options.radius;
	  this.color = options.color;
	};
	
	MovingObject.prototype.draw = function(ctx) {
	
	  ctx.fillStyle = this.color;
	
	  ctx.beginPath();
	  ctx.arc(
	    this.pos[0], this.pos[1], this.radius, 0, 2 * Math.PI, true
	  );
	  ctx.fill();
	};
	
	MovingObject.NORMAL_FRAME_TIME_DELTA = 1000/60;
	
	MovingObject.prototype.move = function(timeDelta) {
	  var velocityScale = timeDelta / MovingObject.NORMAL_FRAME_TIME_DELTA,
	    offsetX = this.vel[0] * velocityScale,
	    offsetY = this.vel[1] * velocityScale;
	
	this.pos = [this.pos[0] + offsetX, this.pos[1] + offsetY];
	};
	
	module.exports = MovingObject;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(3);
	var MovingObject = __webpack_require__(5);
	
	var Asteroid = function() {
	
	  this.obj = "asteroid";
	
	  // var position =
	
	  var options = {
	    pos: [ 1200, Math.random() * 600 ],
	    color: "green",
	    vel: [-2, 0],
	    radius: 50 + Math.random() * 100
	  };
	
	  var asteroid = this;
	  MovingObject.call(asteroid, options);
	};
	
	Util.inherits(Asteroid, MovingObject);
	
	Asteroid.prototype.afterCollisionWithBird = function() {
	  // Bird is not big enough to cause any damage
	  // wrote this just to be fair to the asteroid
	};
	
	module.exports = Asteroid;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map