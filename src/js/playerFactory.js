const PIXI = require("pixi.js");
const mainjs = require("./main.js");
const audioEngine = require("./audioEngine");
const tapeFactory = require("./tapeFactory")

module.exports = (tapes) => {
    const curSprite = new PIXI.Sprite(mainjs.loadFromSheet["tapedeck.png"]);
    let player;
    

    function launchTape(tape) {
        tape.item.sprite.visible = false;
        tape.item.sprite.position.set(...tape.initPos);
        
        // Resets other tapes - FIX THIS
        tapes.tapeReset(tape);
        player = audioEngine(tape.item.sounds);
        player.switchLoop(0);
        // player.play;
    
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
    }
    return {
        init: () => {
            curSprite.scale.set(0.6, 0.6);
            curSprite.position.set(window.innerWidth / 10, (window.innerHeight - curSprite.height) / 2);
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
            mainjs.app.stage.addChild(curSprite);
        },

    }
}