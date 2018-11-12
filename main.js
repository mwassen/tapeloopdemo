let PIXI = require("pixi.js");

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
    item: null,
    initPos: []
};
let tapes, tapedeck;

// Create a Pixi Application
let app = new Application({ 
    width: window.innerWidth, 
    height: window.innerHeight,                       
    antialiasing: true, 
    transparent: false, 
    backgroundColor: 0x966F33,
    resolution: 1
});

// Load assets and launch setup
loader
    .add("assets/sprites/sheetv1.json")
    .load(setup);

// Add the canvas
document.body.appendChild(app.view);

function setup() {
    let id = PIXI.loader.resources["assets/sprites/sheetv1.json"].textures;

    // Maybe tapes should be an object with audio and whatnot attached
    tapes = [new Sprite(id["cns glo.png"]), 
            new Sprite(id["mswsn.png"])] ;
    tapedeck = new Sprite(id["Tape Deck HQ.png"]);

   // Initialise tape deck
    tapedeck.position.set(window.innerWidth / 10, window.innerHeight / 30);
    //this.stage.addChild(tapedeck);
    tapedeck.scale.set(0.6, 0.6);
    app.stage.addChild(tapedeck);
    tapedeck.interactive = true;
    tapedeck.mousedown = function(mouseData) {
        if(hand.active) {
            launchTape(hand);
        }
    }

    // initInteractive(tapedeck);

    // Initialise tapes

    tapes.forEach((cur, ind) => {
        cur.position.set(600, (ind + 1) * 175);
        initInteractive(cur);
        app.stage.addChild(cur);
    })

    // app.stage.addChild(tape);
    // console.log(app.renderer.plugins.interaction.mouse);

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
        hand.item.interactive = false;
        let mPosX = app.renderer.plugins.interaction.mouse.global.x,
            mPosY = app.renderer.plugins.interaction.mouse.global.y;

        // Needs to have cursor dissapear
        hand.item.position.set(mPosX - (hand.item.width / 2), mPosY - ((hand.item.height / 2)));

    }
    
}


// Don't think I need this
// function end() {

// }

// Helper Functions, set to other file at some point

function initInteractive(item) {
    item.interactive = true;
    item.alpha = 0.6;

    // Initialise interactive features
    item.hitArea = new PIXI.Rectangle(0, 0, item.width, item.height);
    item.mouseover = function(mouseData) {
        this.alpha = 1;
    }
    item.mouseout = function(mouseData) {
        this.alpha = 0.6;
    }
    item.mousedown = function(mouseData) {
        hand.active = true;
        hand.item = item;
        hand.initPos = [item.position.x, item.position.y]
    }
    item.scale.set(0.6, 0.6);
}

function launchTape(tape) {
    tape.item.visible = false;
    tape.item.position.set(...tape.initPos);
    hand = {active: false, item: null, initPos: []}

    // Resets other tapes
    tapes.forEach(cur => {
        if(cur !== tape.item) {
            cur.alpha = 0.6;
            cur.visible = true;
            cur.interactive = true;
        }
    })
}