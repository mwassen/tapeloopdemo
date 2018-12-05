// Modules
/* global require */
const PIXI = require("pixi.js");
const {Howl, Howler} = require("howler");
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

// Stores global state details - targetted by side-effects throughout
let mainState = {
	decks: {
		container: null,
		placed: []
	},
	hand: {
		active: false,
		item: null
	},
	table: {
		freePositions: [],
		usedPositions: [],
		size: []
	}
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
	exports.loadFromSheet = loader.resources["./src/assets/sprites/sheetv1.json"].textures;

	// Load elements
	const tableBg = table();
	tableBg.init();

	const interface = userI();
	mainState.decks.placed.push(playerFactory());

	// Initialise elements
	interface.init();
	mainState.decks.placed[0].init();

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

	if (mainState.hand.active) {
		let mPosX = app.renderer.plugins.interaction.mouse.global.x,
			mPosY = app.renderer.plugins.interaction.mouse.global.y;

		mainState.hand.item.sprite.interactive = false;
		mainState.hand.item.sprite.position.set(mPosX - (mainState.hand.item.sprite.width / 2), mPosY - ((mainState.hand.item.sprite.height / 2)));
		
		// if(hand.tool) {
		// 	mainState.hand.item.interactive = false;
		// 	mainState.hand.item.position.set(mPosX - (hand.item.width / 2), mPosY - ((hand.item.height / 2)));
		// } else {
			
		// }
	}
}

// Exports to modules
exports.app = app;
exports.sounds = soundFx;
exports.mainState = mainState;