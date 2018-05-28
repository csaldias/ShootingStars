var music;
var player;
var panel;
var aliens;
var bullets;
var bulletTime = 0;
var cursors;
var fireButton;
var shieldButton;
var explosions;
var starfield;
var extraLifePU;
var shieldPU;
var score = 0;
var scoreString = '';
var scoreText;
var lives;
var charge = 0;
var chargeString = '';
var chargeText;
var enemyBullet;
var firingTimer = 0;
var shieldTimer = 0;
var powerUpTimer = 15000;
var preparationTimer = 4000;
var shield = false;
var stateText;
var livingEnemies = [];
var whatPowerUp = 0;

function createAliens () {

    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 10; x++)
        {
            var alien = aliens.create(x * 48, y * 50, 'invader');
            alien.anchor.setTo(0.5, 0.5);
            alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
            alien.play('fly');
            alien.body.moves = false;
        }
    }

    aliens.x = 50;
    aliens.y = 65;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(aliens).to( { x: 320 }, 900, Phaser.Easing.Linear.None, true, 0, 1000, true);

    //  When the tween loops it calls descend
    tween.onLoop.add(descend, this);
}

function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function descend() {

    aliens.y += 10;

}

function collisionHandler (bullet, alien) {

  //  When a bullet hits an alien we kill them both
  bullet.kill();
  alien.kill();

  //  Increase the score
  score += 20;
  scoreText.text = scoreString + score;

  //  And create an explosion :)
  var explosion = explosions.getFirstExists(false);
  explosion.reset(alien.body.x, alien.body.y);
  explosion.play('kaboom', 30, false, true);

  if (aliens.countLiving() == 0)
  {
      score += 1000;
      scoreText.text = scoreString + score;

      enemyBullets.callAll('kill',this);
      stateText.text = " Has ganado!, \n Dispara para empezar de nuevo";
      stateText.visible = true;

      //the "click to restart" handler
      restartButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      restartButton.onDown.addOnce(restart, this);
  }

}

function shieldHitsPlayer (player,shieldPU) {

  shieldPU.kill();
  useShield();

}

function extraLifeHitsPlayer (player,extraLife) {

  extraLife.kill();
  //resets the life count
  lives.callAll('revive');

}

function enemyHitsPlayer (player,bullet) {

  bullet.kill();

  live = lives.getFirstAlive();

  if (live)
  {
      live.kill();
  }

  //  And create an explosion :)
  var explosion = explosions.getFirstExists(false);
  explosion.reset(player.body.x, player.body.y);
  explosion.play('kaboom', 30, false, true);

  // When the player dies
  if (lives.countLiving() < 1)
  {
      player.kill();
      panel.kill();
      enemyBullets.callAll('kill');

      stateText.text=" GAME OVER \n Dispara para empezar de nuevo";
      stateText.visible = true;

      //the "click to restart" handler
      restartButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      restartButton.onDown.addOnce(restart, this);
  }

}

function enemyHitsPanel (panel, bullet) {

  bullet.kill();

  charge += 1;
  chargeText.text = chargeString + charge;

}

function shieldFire () {

  //  Grab the first bullet we can from the pool
  shields = shieldPUs.getFirstExists(false);
  shields.reset(game.rnd.integerInRange(10,790), 0);
  shields.body.setSize(40, 40, 0, 0);

  game.physics.arcade.moveToObject(shields,player,500);
  powerUpTimer = game.time.now + game.rnd.integerInRange(20000,50000);

  whatPowerUp = game.rnd.integerInRange(0,1);
}

function extraLifeFire () {

  //  Grab the first bullet we can from the pool
  extraLife = extraLifePUs.getFirstExists(false);
  extraLife.reset(game.rnd.integerInRange(10,790), 0);
  extraLife.body.setSize(40, 40, 0, 0);

  game.physics.arcade.moveToObject(extraLife,player,500);
  powerUpTimer = game.time.now + 10000;

  whatPowerUp = game.rnd.integerInRange(0,1);
}

function enemyFires () {

  //  Grab the first bullet we can from the pool
  enemyBullet = enemyBullets.getFirstExists(false);

  livingEnemies.length=0;

  aliens.forEachAlive(function(alien){

      // put every living enemy in an array
      livingEnemies.push(alien);
  });


  if (enemyBullet && livingEnemies.length > 0)
  {

      var random=game.rnd.integerInRange(0,livingEnemies.length-1);

      // randomly select one of them
      var shooter=livingEnemies[random];
      // And fire the bullet from this enemy
      enemyBullet.reset(shooter.body.x, shooter.body.y);
      enemyBullet.body.setSize(7, 7, 1, 1);

      game.physics.arcade.moveToObject(enemyBullet,player,500);
      firingTimer = game.time.now + 550;
  }

}

function fireBullet () {

  //  To avoid them being allowed to fire too fast we set a time limit
  if (game.time.now > bulletTime && charge >= 5)
  {
    charge -= 5;
    chargeText.text = chargeString + charge;
    //  Grab the first bullet we can from the pool
    bullet = bullets.getFirstExists(false);

    if (bullet)
    {
        //  And fire it
        bullet.reset(player.x, player.y + 8);
        bullet.body.velocity.y = -350;
        bulletTime = game.time.now + 200;
    }
  }

}

function resetBullet (bullet) {

  //  Called if the bullet goes out of the screen
  bullet.kill();

}

function restart () {
  preparationTimer = game.time.now + 4000;
  score = 0;
  scoreText.text = scoreString + score;

  charge = 0;
  chargeText.text = chargeString + charge;
  //  A new level starts

  //resets the life count
  lives.callAll('revive');
  //  And brings the aliens back from the dead :)
  aliens.removeAll();
  createAliens();

  //revives the player
  player.revive();
  panel.revive();
  //hides the text
  stateText.visible = false;

}

var bootState = {
  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.state.start('load');
  }
}

var loadState = {
  preload: function() {
    game.load.image('bullet', 'assets/games/invaders/bullet.png');
    game.load.image('enemyBullet', 'assets/games/invaders/enemy-bullet.png');
    game.load.spritesheet('invader', 'assets/games/invaders/star.png', 32, 32);
    game.load.image('ship', 'assets/games/invaders/player.png');
    game.load.image('panel', 'assets/games/invaders/panel.png');
    game.load.spritesheet('kaboom', 'assets/games/invaders/explode.png', 128, 128);
    game.load.image('starfield', 'assets/games/invaders/starfield.png');
    game.load.image('extraLifePU', 'assets/games/invaders/hearts.png');
    game.load.image('shieldPU', 'assets/games/invaders/shield.png');
    game.load.image('background', 'assets/games/starstruck/background2.png');
    game.load.audio('musicaFondo', 'assets/audio/shootingstars.mp3');

    game.load.onLoadComplete.add(this.loadComplete, this);
  },

  loadComplete: function() {
    game.state.start('menu');
  }
}

var menuState = {
  create: function() {
    game.stage.backgroundColor = '#182d3b';
    game.input.touch.preventDefault = false;

    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    //  Welcome Message
    welcomeMsg = game.add.text(250, 220, 'Shooting Stars', { font: '50px Arial', fill: '#fff' });

    startMsg = game.add.text(150, 520, 'Presiona Espacio para Comenzar', { font: '34px Arial', fill: '#fff' });
    startMsg = game.add.text(265, 490, 'Presiona F para FullScreen', { font: '25px Arial', fill: '#fff' });

    startButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    startButton.onDown.addOnce(this.start, this);

    fullScreenButton = game.input.keyboard.addKey(Phaser.Keyboard.F);
    fullScreenButton.onDown.add(this.gofull, this);
  },

  start: function() {
    game.state.start('play');
  },

  gofull: function() {
    if (game.scale.isFullScreen) {
      game.scale.stopFullScreen();
    } else {
      game.scale.startFullScreen(false);
    }
  }
}

function useShield() {
  shieldTimer = game.time.now + 10000 // 10 segundos
  panel.y -= 50;
  shield = true;
}

function stopUsingShield() {
  panel.y += 50;
  shield = false;
}


var playState = {
  create: function() {
    game.stage.backgroundColor = '#182d3b';
    game.input.touch.preventDefault = false;

    music = game.add.audio('musicaFondo');
    music.loopFull();
    music.play();

    //  The scrolling starfield background
      starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // The Power Up shield
    shieldPUs = game.add.group();
    shieldPUs.enableBody = true;
    shieldPUs.physicsBodyType = Phaser.Physics.ARCADE;
    shieldPUs.createMultiple(2, 'shieldPU');
    shieldPUs.setAll('anchor.x', 0.5);
    shieldPUs.setAll('anchor.y', 1);
    shieldPUs.setAll('outOfBoundsKill', true);
    shieldPUs.setAll('checkWorldBounds', true);

    // The Power Up life
    extraLifePUs = game.add.group();
    extraLifePUs.enableBody = true;
    extraLifePUs.physicsBodyType = Phaser.Physics.ARCADE;
    extraLifePUs.createMultiple(2, 'extraLifePU');
    extraLifePUs.setAll('anchor.x', 0.5);
    extraLifePUs.setAll('anchor.y', 1);
    extraLifePUs.setAll('outOfBoundsKill', true);
    extraLifePUs.setAll('checkWorldBounds', true);

    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  The hero!
    player = game.add.sprite(400, 500, 'ship');
    panel = game.add.sprite(400, 530, 'panel');
    player.anchor.setTo(0.5, 0.5);
    panel.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    game.physics.enable(panel, Phaser.Physics.ARCADE);
    player.body.setSize(16, 14, 6, 4);
    panel.body.setSize(75, 6, -5);


    //  The baddies!
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    createAliens();

    //  The score
    scoreString = 'Puntos: ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

    //  Lives
    lives = game.add.group();
    game.add.text(game.world.width - 120, 10, 'Vidas: ', { font: '34px Arial', fill: '#fff' });

    // Charge
    chargeString = 'Carga: ';
    chargeText = game.add.text(10, 550, chargeString + charge, { font: '34px Arial', fill: '#fff' });
    //  Text
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '42px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    for (var i = 0; i < 3; i++) {
      var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
      ship.anchor.setTo(0.5, 0.5);
      ship.angle = 90;
      ship.alpha = 0.8;
    }

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    fullScreenButton = game.input.keyboard.addKey(Phaser.Keyboard.F);
    fullScreenButton.onDown.add(this.gofull, this);

  },

  update: function() {
    //  Scroll the background
    starfield.tilePosition.y += 4;

    if (player.alive) {
      //  Reset the player, then check for movement keys
      player.body.velocity.setTo(0, 0);
      panel.body.velocity.setTo(0, 0);

      if (cursors.left.isDown && player.x > 50) {
        player.body.velocity.x = -400;
        panel.body.velocity.x = -400;
      }
      else if (cursors.right.isDown && player.x < 750) {
        player.body.velocity.x = 400;
        panel.body.velocity.x = 400;
      }
      //  Firing?
      if (fireButton.isDown && !shield) fireBullet();

      if (game.time.now > firingTimer && game.time.now > preparationTimer) enemyFires();

      if (game.time.now > powerUpTimer && whatPowerUp == 1) extraLifeFire();
      else if (game.time.now > powerUpTimer) shieldFire();

      if (game.time.now > shieldTimer && shield) stopUsingShield();

      //  Run collision
      game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
      game.physics.arcade.overlap(extraLifePUs, player, extraLifeHitsPlayer, null, this);
      game.physics.arcade.overlap(shieldPUs, player, shieldHitsPlayer, null, this);
      game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
      game.physics.arcade.overlap(enemyBullets, panel, enemyHitsPanel, null, this);
    }
  },

  gofull: function() {
    if (game.scale.isFullScreen) {
      game.scale.stopFullScreen();
    } else {
      game.scale.startFullScreen(false);
    }
  }
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example');

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);

game.state.start('boot');
