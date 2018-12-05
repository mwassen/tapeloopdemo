const PIXI = require("pixi.js");
const mainjs = require("./main");

module.exports = () => {
    // Array of available tapes, sound and sprites have to follow pattern
    const tapeDb = [
        "cnsglo1",
        "conet1",
        "mswsn1"
    ];

    function soundArray(name) {
        let sounds = [];
        // Saves URL to sounds with inserted name, always 4
        for(let i = 1; i <= 4; i++) {
            sounds[i - 1] = "./src/assets/sound/loops/" + name + "-" + i + ".ogg";
        }
        return sounds;
    };

    function createMenu() {
        let tapes = [];
        // Creates array with tape name, sprite & sound
        tapeDb.forEach((cur, ind) => {
            tapes[ind] = {
                name: cur,
                sprite: new PIXI.Sprite(mainjs.loadFromSheet[cur + ".png"]),
                sounds: soundArray(cur)
            }
        });
        return tapes;
    };

    function activeTape(tape) {
        let clickedTape = {
            sprite: new PIXI.Sprite(mainjs.loadFromSheet[tape.name + ".png"]),
            sounds: soundArray(tape.name)
        }
        clickedTape.sprite.scale.set(0.25, 0.25);

        mainjs.app.stage.addChild(clickedTape.sprite);

        mainjs.mainState.hand.active = true;
        mainjs.mainState.hand.item = clickedTape;
    };

    return {
        menuInit: () => {
            return createMenu();
        },

        addToHand: (tape) => {
            activeTape(tape);
        }
    };
}