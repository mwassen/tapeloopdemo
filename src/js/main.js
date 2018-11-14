/* global require */
const PIXI = require("pixi.js");
const audioEngine = require("./audioEngine");
const tapeFactory = require("./tapeFactory");

// Aliases
let Application = PIXI.Application,
	Container = PIXI.Container,
	loader = PIXI.loader,
	resources = PIXI.loader.resources,
	Graphics = PIXI.Graphics,
	TextureCache = PIXI.utils.TextureCache,
	Sprite = PIXI.Sprite,
	Text = PIXI.Text,
	TextStyle = PIXI.TextStyle;

// Global Vars
let hand = {
	active: false,
	tool: false,
	item: null,
	initPos: []
};
let tapes, tapedeck, player, hammer, state;

// let tapeData = [
//     {id: "csnglo1", sprite: new Sprite(id["cns glo.png"])},
//     {id: "mswsn1", sprite: new Sprite(id["mswsn.png"])}
// ]

// Create a Pixi Application
let app = new Application({
	width: window.innerWidth,
	height: window.innerHeight,
	antialiasing: true,
	transparent: false,
	backgroundColor: 0xfafafa,
	resolution: 1
});

// Load assets and launch setup
loader
	.add("./src/assets/sprites/sheetv1.json")
	.load(setup);

// Add the canvas
document.body.appendChild(app.view);

function setup() {
	let id = PIXI.loader.resources["./src/assets/sprites/sheetv1.json"].textures;


	tapes = tapeFactory(id);
	// console.log(tapes);
	tapedeck = new Sprite(id["tapedeck.png"]);
	hammer = new Sprite(id["hammer.png"]);

	// Initialise tape deck
	tapedeck.scale.set(0.6, 0.6);
	tapedeck.position.set(window.innerWidth / 10, (window.innerHeight - tapedeck.height) / 2);
	tapedeck.interactive = true;
	tapedeck.mousedown = function() {
		if(hand.active) {
			if(hand.tool) {
				initEffect(hand);
			} else {
				launchTape(hand);
			}
		}
	};
	app.stage.addChild(tapedeck);

	// Initialise hammer (toolbox)
	hammer.position.set(window.innerWidth / 1.8, (window.innerHeight - hammer.height) / 2);
	hammer.interactive = true;
	hammer.alpha = 0.6;
	hammer.mouseover = function() {
		this.alpha = 1;
	};
	hammer.mouseout = function() {
		this.alpha = 0.6;
	};
	hammer.mousedown = function() {
		hand.active = true;
		hand.tool = true;
		hand.item = hammer;
		hand.initPos = [hammer.position.x, hammer.position.y]
	};
	app.stage.addChild(hammer);


	// Initialise tapes
	tapes.forEach((cur, ind) => {
		cur.sprite.position.set(500, (ind * 175) + ((window.innerHeight / 2) - 175));
		initInteractive(cur);
		app.stage.addChild(cur.sprite);
	});

	state = play;

	//Start the game loop
	app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
	state(delta);
}

function play(delta) {
	// app.render(app.stage);

	if (hand.active) {
		hand.item.sprite.interactive = false;
		let mPosX = app.renderer.plugins.interaction.mouse.global.x,
			mPosY = app.renderer.plugins.interaction.mouse.global.y;

		// Needs to have cursor dissapear
		hand.item.sprite.position.set(mPosX - (hand.item.sprite.width / 2), mPosY - ((hand.item.sprite.height / 2)));

	}

}


// Don't think I need this
// function end() {

// }

// Helper Functions, set to other file at some point

function initInteractive(item) {
	item.sprite.interactive = true;
	item.sprite.alpha = 0.6;

	// Initialise interactive features
	item.sprite.hitArea = new PIXI.Rectangle(0, 0, item.sprite.width, item.sprite.height);
	item.sprite.mouseover = function() {
		this.alpha = 1;
	}
	item.sprite.mouseout = function() {
		this.alpha = 0.6;
	}
	item.sprite.mousedown = function() {
		hand.active = true;
		hand.item = item;
		hand.initPos = [item.sprite.position.x, item.sprite.position.y]
	}
	item.sprite.scale.set(0.6, 0.6);
}

function launchTape(tape) {
	tape.item.sprite.visible = false;
	tape.item.sprite.position.set(...tape.initPos);

	// Side-effects, should maybe avoid (bad form)

	// Resets other tapes
	tapes.forEach((cur) => {
		if(cur.sprite !== tape.item.sprite) {
			cur.sprite.alpha = 0.6;
			cur.sprite.visible = true;
			cur.sprite.interactive = true;
		}
	});
	player = audioEngine(tape.item.sounds);
	player.switchLoop(0);
	player.play;

	// maybe need a global variable that stores currently active tapedecks + tapes

	resetHand(hand);
}

function initEffect(handState) {
	handState.item.position.set(...handState.initPos);
	handState.item.interactive = true;
	resetHand(hand);

}

function resetHand(handState) {
	handState.active = false;
	handState.tool = false;
	handState.item = null;
	handState.initPos = [];
}

