var game = new Phaser.Game(288, 511, Phaser.AUTO, '');

var realY = 399;
var holeY = 100;
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
    crashable = game.add.group();

    this.up_pipes = game.add.group();
    this.up_pipes.createMultiple(20, 'pipe-up');
    this.down_pipes = game.add.group();
    this.down_pipes.createMultiple(20, 'pipe-down');

    this.ground = game.add.sprite(0, game.world.height-112, 'ground');
    this.ground.body.immovable = true;

    this.bird = game.add.sprite(100, game.world.height/2, 'bird');
    this.bird.body.gravity.y = 1000;

    var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    space_key.onDown.add(this.jump, this);

    this.timer = this.game.time.events.loop(1500, this.add_pipe, this);
  },

  update: function() {
    game.physics.overlap(this.bird, this.ground, this.restart_game, null, this);
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
    var upperPipeY = Math.floor(Math.random()*-(game.world.height-pipeY-holeY));
    console.log(upperPipeY);
    var lowerPipeY = pipeY+upperPipeY+holeY;
    this.add_up_pipe(game.world.width, upperPipeY);
    this.add_down_pipe(game.world.width, lowerPipeY);
    this.ground.bringToTop();
  },

  jump: function() {
    this.bird.body.velocity.y = -350;
  },

  restart_game: function() {
    this.game.time.events.remove(this.timer);
    this.game.state.start('main');
  }
}

game.state.add('main', main_state);
game.state.start('main');
