// Communicate with loader from here?

const PIXI = require("pixi.js");

const tapeDb = [
    "mswsn1",
    "cnsglo1"
];

function soundArray(name) {
    let sounds = [];
    for(let i = 1; i <= 4; i++) {
        sounds[i - 1] = "assets/sound/loops/" + name + "-" + i + ".ogg";
    }
    return sounds;
}

module.exports = (loader) => {
    let tapeExport = [];
    tapeDb.forEach((cur, ind) => {
        tapeExport[ind] = {
            sprite: new PIXI.Sprite(loader[cur + ".png"]),
            sounds: soundArray(cur)
        }
    })
    return tapeExport;
}