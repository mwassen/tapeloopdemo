const PIXI = require("pixi.js");
const mainjs = require("./main.js");
const audioEngine = require("./audioEngine");

let positions = [];
let lastPos = [];
let playerArr = [];
let deckContainer;

function setupPositions(size) {
    let tWidth = mainjs.tState.size[0];
    let tHeight = mainjs.tState.size[1];

    let xAmount = Math.floor(tWidth / 300);
    let yAmount = Math.floor(tHeight / 300);

    let boxX = tWidth / xAmount;
    let boxY = tHeight / yAmount;

    // Maybe table should be a container?
    let tableDiffx = (window.innerWidth - tWidth) / 2;
    let tableDiffy = (window.innerHeight - tHeight) / 2;

    let output = [];

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
    let activeTape = null;

    function deckInit() {
        deckContainer = new PIXI.Container();
        mainjs.app.stage.addChild(deckContainer);

    }

    function addPlayer() {
        const curSprite = new PIXI.Sprite(mainjs.loadFromSheet["tapedeck.png"]);
        curSprite.anchor.set(0.5);
        curSprite.scale.set(0.3, 0.3);
        curSprite.rotation = (Math.random() - 0.5) * 0.2;
        let deckPos = positions.splice(0, 1);
        if (deckPos[0] == undefined) {
            console.log("no space on table");
            return;
        }
        lastPos.push(deckPos[0]);
        // console.log(positions);
        // console.log(lastPos);
        curSprite.position.set(...deckPos[0]);
        curSprite.interactive = true;
        curSprite.mousedown = function() {
            if(mainjs.hand.active) {
                if(mainjs.hand.tool) {
                    initEffect(mainjs.hand);
                } else {
                    launchTape(mainjs.hand);
                }
            }
        };
        playerArr.push(curSprite);
        deckContainer.addChild(curSprite)
        mainjs.tState.decks.push(curSprite);
    };

    function removePlayer() {
        if (playerArr.length > 1) {
            let lastPlayer = playerArr.splice(playerArr.length - 1, 1);
            deckContainer.removeChild(lastPlayer[0]);
            positions.unshift(...lastPos.splice(lastPos.length - 1, 1));
            // console.log("DEL - available positions: " + positions);
            // console.log("DEL - last used position: " + lastPos);
        } else {
            console.log("can't have an empty table");
        }
        
    }

    function launchTape(tape) {
        tape.item.sprite.visible = false;
        tape.item.sprite.position.set(...tape.initPos);
        
        // mainjs.tState.tapes.tapeReset(tape);
        let player = audioEngine(tape.item.sounds);
        player.switchLoop(0);
    
        // maybe need a global variable that stores currently active tapedecks + tapes
        resetHand(mainjs.hand);
    };

    function initEffect(handState) {
        handState.item.position.set(...handState.initPos);
        handState.item.interactive = true;
        resetHand(handState);
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