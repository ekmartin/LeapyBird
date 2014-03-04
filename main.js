var game = new Phaser.Game(576, 511, Phaser.AUTO, '');

var realY = 399;
var holeY = 125;
var pipeY = 320;
var pipeSpeed = -150;

var yPos = null;
var delta;
var yLimit = 0;
var jumpLimit = -20;

var controller = new Leap.Controller();
controller.connect();

var main_state = {
  preload: function() {
    game.load.image('background-large', 'assets/background-large.png');
    game.load.image('bird', 'assets/bird.png');
    game.load.image('grounds', 'assets/grounds.png');
    game.load.image('pipe-up', 'assets/pipe-up.png');
    game.load.image('pipe-down', 'assets/pipe-down.png');
  },

  create: function() {
    game.add.sprite(0, 0, 'background-large');
    this.crashable = game.add.group();

    this.pipes = game.add.group();
    this.up_pipes = game.add.group();
    this.up_pipes.createMultiple(20, 'pipe-up');
    this.down_pipes = game.add.group();
    this.down_pipes.createMultiple(20, 'pipe-down');

    this.crashable.add(this.up_pipes);
    this.crashable.add(this.down_pipes);

    this.grounds = game.add.group();
    this.grounds.createMultiple(2, 'grounds');

    this.crashable.add(this.grounds);

    this.bird = game.add.sprite(100, game.world.height/2, 'bird');
    this.bird.body.gravity.y = 1000;
    this.bird.anchor.setTo(-0.2, 0.5);

    var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    space_key.onDown.add(this.jump, this);

    this.add_ground(0);
    this.timer = this.game.time.events.loop(1300, this.add_pipe, this);

    // Score:
    this.score = 0;
    var font = {
      font: "30px Impact",
      fill: "#ffffff"
    };
    var debugFont = {
      font: "15px Impact",
      fill: "#ffffff"
    };
    this.score_label = this.game.add.text(20, 20, "0", font);
    this.debug_label = this.game.add.text(20, 60, "Her: ", debugFont);
  },

  update: function() {
    game.physics.overlap(this.bird, this.crashable, this.restart_game, null, this);
    if (this.grounds.countLiving() == 1) {
      var ground = this.grounds.getFirstAlive();
      this.add_ground(ground.body.x + ground.body.width);
    }
    if (this.bird.angle < 20) {
      this.bird.angle++;
    }
    if (!this.bird.inWorld) {
      this.restart_game();
    }
    var frame = controller.frame();
    if (frame.pointables.length > 0) {
      var pointable = frame.pointables[0];
      var pointPosition = pointable.tipPosition;

      // Initalize:
      if (yPos === null) {
        yPos = pointPosition[1];
        delta = 0;
      }

      // If the pointable is moving upwards, reset the delta:
      if ((pointPosition[1] - yPos) > upLimit) {
        delta = 0;
      }
      else {
        // If not, add the downwards movement to the delta-tracker (jump when it gets above a value).
        delta += (pointPosition[1] - yPos);
      }

      // If the pointable has moved more than 20 units down, jump.
      if (delta < jumpLimit) {
        this.jump();
        delta = 0;
      }
      //this.debug_label.content = "d: " + delta + " Pos: " + pointPosition[1];
      yPos = pointPosition[1];
    }
  },

  add_up_pipe: function(x, y) {
    var pipe = this.down_pipes.getFirstDead();
    pipe.reset(x, y);
    pipe.body.velocity.x = pipeSpeed;
    pipe.outOfBoundsKill = true;
  },

  add_down_pipe: function(x, y) {
    var pipe = this.up_pipes.getFirstDead();
    pipe.reset(x, y);
    pipe.body.velocity.x = pipeSpeed;
    pipe.outOfBoundsKill = true;
  },

  add_ground: function(x) {
    var ground = this.grounds.getFirstDead();
    ground.reset(x, game.world.height-112);
    ground.body.velocity.x = pipeSpeed;
    ground.outOfBoundsKill = true;
  },

  add_pipe: function() {
    this.score++;
    this.score_label.content = this.score;

    var upperPipeY = Math.floor(Math.random()*-(pipeY/2))-100;
    var lowerPipeY = pipeY+upperPipeY+holeY;
    this.add_up_pipe(game.world.width, upperPipeY);
    this.add_down_pipe(game.world.width, lowerPipeY);
  },

  jump: function() {
    this.bird.body.velocity.y = -350;
    var animation = this.game.add.tween(this.bird);
    animation.to({
      angle: -20
    }, 100);
    animation.start();
  },

  restart_game: function() {
    this.game.time.events.remove(this.timer);
    this.game.state.start('main');
  }
}

game.state.add('main', main_state);
game.state.start('main');
