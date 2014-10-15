enchant();
 
window.onload = function() {
    var game = new Game(320, 440);
    game.preload('res/sky.png',
                'res/skyend.png',
                 'res/bigplanesheet.png',
                 'res/package.png',
                 'res/Hit.mp3',
                 'res/sky.mp3');
    game.fps = 30;
    game.scale = 1;
    game.onload = function() {
        var scene = new SceneGame();
        game.pushScene(scene);
    }
    window.scrollTo(0,0);
    game.start();   
};

/**
 * SceneGame  
 */
var SceneGame = Class.create(Scene, {
    /**
     * The main gameplay scene.     
     */
    initialize: function() {
        var game, label, bg, airplane, packageGroup;
 
        // Call superclass constructor
        Scene.apply(this);
 
        // Access to the game singleton instance
        game = Game.instance;
 
        label = new Label('Score: 0');
        label.x = 100;
        label.y = 7;
        label.color = '#ffffff';
        label.font = '16px strong Arial, sans-serif';
        label.textAlign = 'center';
        //label._style.textShadow ="-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
        this.scoreLabel = label;        
 
        bg = new Sprite(320,440);
        bg.image = game.assets['res/sky.png'];

        airplane = new Airplane();
        airplane.x = game.width/2 - airplane.width/2;
        airplane.y = 280;
        this.airplane = airplane;

        packageGroup = new Group();
        this.packageGroup = packageGroup;
 
        this.addChild(bg);
        this.addChild(packageGroup);
        this.addChild(airplane);
        this.addChild(label);

        this.addEventListener(Event.TOUCH_START,this.handleTouchControl);
        this.addEventListener(Event.LEFT_BUTTON_DOWN,this.handleLeftButton);
        this.addEventListener(Event.RIGHT_BUTTON_DOWN,this.handleRightButton);
	this.addEventListener(Event.ENTER_FRAME,this.update);

        // Instance variables
        this.generatePackageTimer = 0;
        this.scoreTimer = 0;
        this.score = 0;
	this.currentLane = 1;
        this.bgm = game.assets['res/sky.mp3']; // Add this line
 
        // Start BGM
        this.bgm.play();
    },

    handleTouchControl: function (evt) {
        var laneWidth, lane;
        laneWidth = 320/3;
        lane = Math.floor(evt.x/laneWidth);
        lane = Math.max(Math.min(2,lane),0);
	this.currentLane = lane;
        this.airplane.switchToLaneNumber(lane);
    },

    handleLeftButton: function (evt) {
	var lane;
	if(this.currentLane>0){
		lane = --this.currentLane;
        	this.airplane.switchToLaneNumber(lane);
	}
    },

    handleRightButton: function (evt) {
	var lane;
	if(this.currentLane<2){
		lane = ++this.currentLane;
        	this.airplane.switchToLaneNumber(lane);
	}
    },

    handleAButton: function (evt) {
	var lane;
	if(this.currentLane<2){
		lane = ++this.currentLane;
        	this.airplane.switchToLaneNumber(lane);
	}
    },

    update: function(evt) {
        // Score increase as time pass
        this.scoreTimer += evt.elapsed * 0.001;
        if(this.scoreTimer >= 0.5)
        {
            this.setScore(this.score + 1);
            this.scoreTimer -= 0.5;
        }

        // Check if it's time to create a new set of obstacles
        this.generatePackageTimer += evt.elapsed * 0.001;
        if(this.generatePackageTimer >= 0.5)
        {
            var package;
            this.generatePackageTimer -= 0.5;
            package = new Package(Math.floor(Math.random()*3));
            this.packageGroup.addChild(package);
        }

        // Check collision
        for (var i = this.packageGroup.childNodes.length - 1; i >= 0; i--) {
            var package;
            package = this.packageGroup.childNodes[i];
            if(package.intersect(this.airplane)){
                var game;
                game = Game.instance;
                game.assets['res/Hit.mp3'].play();                    
                this.packageGroup.removeChild(package);
                this.bgm.stop();
                game.replaceScene(new SceneGameOver(this.score));        
                break;
            }
        }

        // Loop BGM
        if( this.bgm.currentTime >= this.bgm.duration ){
            this.bgm.play();
        }
    },

    setScore: function (value) {
        this.score = value;
        this.scoreLabel.text = 'Score: ' + this.score;
    }
});

/**
 * Airplane
 */
 var Airplane = Class.create(Sprite, {
    /**
     * The player character.     
     */
    initialize: function() {
        // Call superclass constructor
        //Sprite.apply(this,[30, 43]);
        Sprite.apply(this,[48, 48]);
        this.image = Game.instance.assets['res/bigplanesheet.png'];
        this.animationDuration = 0;
        this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);
    },

    updateAnimation: function (evt) {        
        this.animationDuration += evt.elapsed * 0.001;       
        if(this.animationDuration >= 0.25)
        {
            this.frame = (this.frame + 1) % 2;
            this.animationDuration -= 0.25;
        }
    },

    switchToLaneNumber: function(lane){     
        var targetX = 160 - this.width/2 + (lane-1)*90;
        this.x = targetX;
    }
});

 /**
 * Package Cube
 */
var Package = Class.create(Sprite, {
    /**
     * The obstacle that the airplane must avoid
     */
    initialize: function(lane) {
        // Call superclass constructor
        Sprite.apply(this,[48, 49]);
        this.image  = Game.instance.assets['res/package.png'];      
        this.rotationSpeed = 0;
        this.setLane(lane);
        this.addEventListener(Event.ENTER_FRAME, this.update);
    },

    setLane: function(lane) {
        var game, distance;
        game = Game.instance;        
        distance = 90;
     
        this.rotationSpeed = Math.random() * 100 - 50;
     
        this.x = game.width/2 - this.width/2 + (lane - 1) * distance;
        this.y = -this.height;    
        this.rotation = Math.floor( Math.random() * 360 );    
    },

    update: function(evt) { 
        var ySpeed, game;
     
        game = Game.instance;
        ySpeed = 300;
     
        this.y += ySpeed * evt.elapsed * 0.001;
        this.rotation += this.rotationSpeed * evt.elapsed * 0.001;           
        if(this.y > game.height)
        {
            this.parentNode.removeChild(this);          
        }
    }
});

/**
 * SceneGameOver  
 */
var SceneGameOver = Class.create(Scene, {
    initialize: function(score) {
        var gameOverLabel, scoreLabel;
        Scene.apply(this);
        //this.backgroundColor = 'black';
        var bgend = new Sprite(320,440);
        var game = Game.instance;
        bgend.image = game.assets['res/skyend.png'];
        /*gameOverLabel = new Label("GAME OVER<br>Tap to Restart");
        gameOverLabel.x = 8;
        gameOverLabel.y = 128;
        gameOverLabel.color = 'white';
        gameOverLabel.font = '32px strong';
        gameOverLabel.textAlign = 'center';*/

        scoreLabel = new Label('Your Score<br>' + score);
        scoreLabel.x = 9;
        scoreLabel.y = 80;
        scoreLabel.color = '#ffffff';
        scoreLabel.font = '20px strong Arial, sans-serif';
        scoreLabel.textAlign = 'center';
        this.addChild(bgend);
        //this.addChild(gameOverLabel);
        this.addChild(scoreLabel);

        this.addEventListener(Event.UP_BUTTON_DOWN,this.handleUpButton);
        this.addEventListener(Event.TOUCH_START, this.touchToRestart);


    },

    touchToRestart: function(evt) {
        var game = Game.instance;
        game.replaceScene(new SceneGame());
    },

    handleUpButton: function (evt) {
	this.touchToRestart(evt);
    }


});