// Modules
/* global require */
const PIXI = require("pixi.js");
const {Howl, Howler} = require("howler");
// const tapeFactory = require("./tapeFactory");
// const toolFactory = require("./toolFactory");
const playerFactory = require("./playerFactory");
const table = require("./bg");
const userI = require("./ui");

// Aliases
let Application = PIXI.Application,
	// Container = PIXI.Container,
	loader = PIXI.loader;
	// resources = PIXI.loader.resources,
	// Graphics = PIXI.Graphics,
	// TextureCache = PIXI.utils.TextureCache,
	// Sprite = PIXI.Sprite,
	// Text = PIXI.Text,
	// TextStyle = PIXI.TextStyle;
	
// Global Variables
let hand = {
	active: false,
	tool: false,
	item: null,
	initPos: []
};

let soundFx = {
	// Tape Cassette Insert by Fats Million - https://freesound.org/people/Fats%20Million/sounds/187788/
	insert: new Howl({
		src: ["./src/assets/sound/effects/tape-insert.ogg"],
		volume: 0.5
	}),
	// Tape machine button press metal by hanneswannerberger - https://freesound.org/people/hanneswannerberger/sounds/275631/
	button: new Howl({
		src: ["./src/assets/sound/effects/tape-button.ogg"],
		volume: 0.15
	})
}

let tableState = {
	size: null,
	decks: [],
	tapes: null
};

let state;

// Create a Pixi Application
let app = new Application({
	width: window.innerWidth,
	height: window.innerHeight,
	antialiasing: false,
	transparent: true,
	resolution: 1
});



// Load assets and launch setup
loader
	.add("./src/assets/sprites/sheetv1.json")
	// .add("./src/assets/sound/effects/tape-insert.ogg")
	.load(setup);

// Append the canvas
document.body.appendChild(app.view);

function setup() {
	// Define and export reference to sprite sheet
	const loadFromSheet = loader.resources["./src/assets/sprites/sheetv1.json"].textures;
	exports.loadFromSheet = loadFromSheet;

	// Load elements
	const tableBg = table();
	const interface = userI();
	tableState.decks.push(playerFactory());


	// Initialise elements
	tableBg.init();
	tableState.size = [tableBg.width(), tableBg.height()];
	interface.init(tableState.size);
	tableState.decks[0].initPositions();
	tableState.decks[0].init(tableState.size);

	// Load the play state into gameLoop
	state = play;

	// Start the game loop
	app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
	state(delta);
}

function play(delta) {
	// TODO - Needs to have cursor dissapear

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
exports.tState = tableState;
exports.sounds = soundFx;
// exports.mainLoader = loader;