// Modules
/* global require */
const PIXI = require("pixi.js");
const tapeFactory = require("./tapeFactory");
const toolFactory = require("./toolFactory");
const playerFactory = require("./playerFactory");
const table = require("./bg");

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
	

// Global Variables
let hand = {
	active: false,
	tool: false,
	item: null,
	initPos: []
};
let state;

// Create a Pixi Application
let app = new Application({
	width: window.innerWidth,
	height: window.innerHeight,
	antialiasing: true,
	transparent: false,
	backgroundColor: 0x2F4F4F,
	resolution: 1
});

// Load assets and launch setup
loader
	.add("./src/assets/sprites/sheetv1.json")
	.load(setup);

// Append the canvas
document.body.appendChild(app.view);

function setup() {
	// Define and export reference to sprite sheet
	const loadFromSheet = loader.resources["./src/assets/sprites/sheetv1.json"].textures;
	exports.loadFromSheet = loadFromSheet;

	// Load elements
	const tableBg = table();
	const tapes = tapeFactory();
	const tapedeck = playerFactory(tapes);
	const hammer = toolFactory("hammer");

	// Initialise elements
	tableBg.init();
	tapedeck.init();
	hammer.init();
	tapes.init();

	console.log(tableBg.height());

	// Load the play state into gameLoop
	state = play;

	// Start the game loop
	app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
	state(delta);
}

function play(delta) {
	// ToDo: Needs to have cursor dissapear

	if (hand.active) {
		let mPosX = app.renderer.plugins.interaction.mouse.global.x,
			mPosY = app.renderer.plugins.interaction.mouse.global.y;
		if(hand.tool) {
			hand.item.interactive = false;
			hand.item.position.set(mPosX - (hand.item.width / 2), mPosY - ((hand.item.height / 2)));
		} else {
			hand.item.sprite.interactive = false;
			hand.item.sprite.position.set(mPosX - (hand.item.sprite.width / 2), mPosY - ((hand.item.sprite.height / 2)));
		}
	}
}

// Exports to modules
exports.hand = hand;
exports.app = app;