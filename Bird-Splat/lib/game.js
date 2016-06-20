var Bird = require("./bird.js");
var Asteroid = require('./asteroid.js');
var Util = require('./util.js');

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
