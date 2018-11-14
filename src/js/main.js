// Modules
/* global require */
const PIXI = require("pixi.js");
const tapeFactory = require("./tapeFactory");
const toolFactory = require("./toolFactory");
const playerFactory = require("./playerFactory");

// Aliases
let Application = PIXI.Application,
	Container = PIXI.Container,
	loader = PIXI.loader,
	loadFromSheet,
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

// Items
let tapes, 
	tapedeck, 
	player, 
	hammer, 
	state;

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

// Append the canvas
document.body.appendChild(app.view);

function setup() {
	loadFromSheet = loader.resources["./src/assets/sprites/sheetv1.json"].textures;
	exports.loadFromSheet = loadFromSheet;

	tapes = tapeFactory();
	tapedeck = playerFactory(tapes);
	hammer = toolFactory("hammer");

	// Initialise tapedeck
	tapedeck.init();

	// Initialise hammer (toolbox)
	hammer.init();

	// Initialise tapes
	tapes.init();

	// Load the play state into gameLoop
	state = play;

	//Start the game loop
	app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
	state(delta);
}

function play(delta) {
	if (hand.active) {
		hand.item.sprite.interactive = false;
		let mPosX = app.renderer.plugins.interaction.mouse.global.x,
			mPosY = app.renderer.plugins.interaction.mouse.global.y;

		// ToDo: Needs to have cursor dissapear
		hand.item.sprite.position.set(mPosX - (hand.item.sprite.width / 2), mPosY - ((hand.item.sprite.height / 2)));
	}
}

// Exports to modules
exports.hand = hand;
exports.app = app;