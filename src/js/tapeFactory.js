const PIXI = require("pixi.js");
const mainjs = require("./main");

module.exports = () => {
    const tapeDb = [
        "mswsn1",
        "cnsglo1"
    ];

    let tapes = [];

    function soundArray(name) {
        let sounds = [];
        for(let i = 1; i <= 4; i++) {
            sounds[i - 1] = "./src/assets/sound/loops/" + name + "-" + i + ".ogg";
        }
        return sounds;
    };

    function initInteractive(item) {
        item.sprite.interactive = true;
        item.sprite.alpha = 0.6;
    
        // Initialise interactive features
        item.sprite.hitArea = new PIXI.Rectangle(0, 0, item.sprite.width, item.sprite.height);
        item.sprite.mouseover = function() {
            this.alpha = 1;
        }
        item.sprite.mouseout = function() {
            this.alpha = 0.6;
        }
        item.sprite.mousedown = function() {
            mainjs.hand.active = true;
            mainjs.hand.item = item;
            mainjs.hand.initPos = [item.sprite.position.x, item.sprite.position.y]
        }
        item.sprite.scale.set(0.6, 0.6);
    };

    return {
        
        init: () => {
            tapeDb.forEach((cur, ind) => {
                tapes[ind] = {
                    sprite: new PIXI.Sprite(mainjs.loadFromSheet[cur + ".png"]),
                    sounds: soundArray(cur)
                }
            });

            tapes.forEach((cur, ind) => {
                cur.sprite.position.set(500, (ind * 175) + ((window.innerHeight / 2) - 175));
                initInteractive(cur);
                mainjs.app.stage.addChild(cur.sprite);
            });
        },

        tapeReset: (tape) => {
            tapes.forEach((cur) => {
                if(cur.sprite !== tape.item.sprite) {
                    cur.sprite.alpha = 0.6;
                    cur.sprite.visible = true;
                    cur.sprite.interactive = true;
                }
            });
        }
    };
}