var Util = require("./util");
var MovingObject = require("./moving_object");

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
