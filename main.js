var game = new Phaser.Game(288, 511, Phaser.AUTO, '');

var realY = 399;
var holeY = 125;
var pipeY = 320;

var main_state = {
  preload: function() {
    game.load.image('background', 'assets/background-light.png');
    game.load.image('bird', 'assets/bird.png');
    game.load.image('ground', 'assets/ground.png');
    game.load.image('pipe-up', 'assets/pipe-up.png');
    game.load.image('pipe-down', 'assets/pipe-down.png');
  },

  create: function() {
    game.add.sprite(0, 0, 'background');
    this.crashable = game.add.group();

    this.up_pipes = game.add.group();
    this.up_pipes.createMultiple(20, 'pipe-up');
    this.down_pipes = game.add.group();
    this.down_pipes.createMultiple(20, 'pipe-down');

    this.crashable.add(this.up_pipes);
    this.crashable.add(this.down_pipes);

    this.ground = this.crashable.create(0, game.world.height-112, 'ground');
    this.ground.body.immovable = true;

    this.bird = game.add.sprite(100, game.world.height/2, 'bird');
    this.bird.body.gravity.y = 1000;
    this.bird.anchor.setTo(-0.2, 0.5);

    var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    space_key.onDown.add(this.jump, this);

    this.timer = this.game.time.events.loop(1500, this.add_pipe, this);

    // Score:
    this.score = 0;
    var font = {
      font: "30px Impact",
      fill: "#ffffff"
    };
    this.score_label = this.game.add.text(20, 20, "0", font);
  },

  update: function() {
    //game.physics.overlap(this.bird, this.crashable, this.restart_game, null, this);
    if (this.bird.angle < 20)
      this.bird.angle++;
  },

  add_up_pipe: function(x, y) {
    var pipe = this.down_pipes.getFirstDead();
    pipe.reset(x, y);
    pipe.body.velocity.x = -200;
    pipe.outOfBoundsKill = true;
  },

  add_down_pipe: function(x, y) {
    var pipe = this.up_pipes.getFirstDead();
    pipe.reset(x, y);
    pipe.body.velocity.x = -200;
    pipe.outOfBoundsKill = true;
  },

  add_pipe: function() {
    this.score++;
    this.score_label.content = this.score;

    var upperPipeY = Math.floor(Math.random()*-(pipeY));
    var lowerPipeY = pipeY+upperPipeY+holeY;
    this.add_up_pipe(game.world.width, upperPipeY);
    this.add_down_pipe(game.world.width, lowerPipeY);
    this.ground.bringToTop();
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
