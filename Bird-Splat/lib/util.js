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
