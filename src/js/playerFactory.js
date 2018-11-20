const PIXI = require("pixi.js");
const mainjs = require("./main");
const audioEngine = require("./audioEngine");

let positions = [];
let lastPos = [];
let allDecksContainer;
let playerArr = [];



function setupPositions() {
    // TODO - Loop over W & H to halve this function
    // Retreives loaded table size
    let tWidth = mainjs.tState.size[0];
    let tHeight = mainjs.tState.size[1];

    // Checks how many cells of min 300px are available
    let xAmount = Math.floor(tWidth / 300);
    let yAmount = Math.floor(tHeight / 300);

    // Assigns cell size based on table size
    let boxX = tWidth / xAmount;
    let boxY = tHeight / yAmount;

    // Calculates distance between window and table
    // TODO - Maybe table should be a container?
    let tableDiffx = (window.innerWidth - tWidth) / 2;
    let tableDiffy = (window.innerHeight - tHeight) / 2;

    let output = [];

    // Loops over available cells + adds the center point of each cell to output
    for (let y = 0; y < yAmount; y++) {
        for (let x = 0; x < xAmount; x++) {
            let xPos = (x * boxX) + (boxX / 2) + tableDiffx;
            let yPos = (y * boxY) + (boxY / 2) + tableDiffy;
            output.push([xPos, yPos]);
        }
    }
    positions = output;
};


module.exports = () => {
    // This needs to be global, this module will be instanced...
    let player = null;
    let playerBg = null;

    function deckInit() {
        allDecksContainer = new PIXI.Container();
        mainjs.app.stage.addChild(allDecksContainer);
    }

    function addPlayer() {
        // Initialise deck sprite and setup anchor and scale
        let singleDeckContainer = new PIXI.Container();
        const deckSprite = new PIXI.Sprite(mainjs.loadFromSheet["tapedeck.png"]);
        deckSprite.anchor.set(0.5);
        deckSprite.scale.set(0.3, 0.3);

        playerBg = new PIXI.Graphics();
        playerBg.beginFill(0xe25822);
        playerBg.drawRoundedRect(-(deckSprite.width / 2) - 4, -(deckSprite.height / 2) - 4, deckSprite.width + 8, deckSprite.height + 8, 15);

        playerBg.visible = false;

        
        singleDeckContainer.addChild(playerBg);
        singleDeckContainer.addChild(deckSprite);
        

        // Randomise deck rotations
        singleDeckContainer.rotation = (Math.random() - 0.5) * 0.15;

        // Load preset position from array
        let defPos = positions.splice(0, 1)[0];

        // Stop function if table is full
        if (defPos == undefined) {
            console.log("no space on table");
            return;
        }

        // Add some small random variance in the positions
        let deckPos = defPos.map(cur => {
            return cur + Math.floor((Math.random() - 0.5) * 25);
        });

        // Save preset position for reuse if deleted & set position
        lastPos.push(defPos);
        singleDeckContainer.position.set(...deckPos);
        

        // TODO - Add higher order functions here
        singleDeckContainer.interactive = true;
        singleDeckContainer.mouseover = () => {
            if(mainjs.hand.active) {
                singleDeckContainer.buttonMode = true;
                playerBg.visible = true;
            }
        }

        singleDeckContainer.mouseout = () => {
            if(mainjs.hand.active) {
                singleDeckContainer.buttonMode = false;
                playerBg.visible = false;
            }
        }

        singleDeckContainer.mousedown = () => {
            if(mainjs.hand.active) {
                singleDeckContainer.buttonMode = false;
                playerBg.visible = false;
                if(mainjs.hand.tool) {
                    initEffect(mainjs.hand);
                } else {
                    launchTape(mainjs.hand);
                }
            }
        };
        playerArr.push(singleDeckContainer);
        allDecksContainer.addChild(singleDeckContainer);
    };

    function removePlayer() {

        // Ensures that one deck is always on the table
        if (playerArr.length > 1) {

            // If a player is active on this deck, stop it
            if (player) {
                player.stop()
            }

            // Remove sprite from decks PIXI container
            let lastPlayer = playerArr.splice(playerArr.length - 1, 1);
            allDecksContainer.removeChild(lastPlayer[0]);
            positions.unshift(...lastPos.splice(lastPos.length - 1, 1));

        } else {
            console.log("can't have an empty table");
        }
    }

    function launchTape(tape) {
        tape.item.sprite.visible = false;

        if (player) {
            player.stop();
        }
        
        player = audioEngine(tape.item.sounds);
        player.switchLoop(0);
    
        // TODO - maybe need a global variable that stores currently active tapedecks + tapes
        resetHand(mainjs.hand);
    };

    function resetHand(handState) {
        handState.active = false;
        handState.tool = false;
        handState.item = null;
        handState.initPos = [];
    };

    return {
        initPositions: () => {
            setupPositions();
        },
        init: () => {
            deckInit();
            addPlayer();
        },
        newPlayer: () => {
            addPlayer();
        },
        delPlayer: () => {
            removePlayer();
        }
    }
}