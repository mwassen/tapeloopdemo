const PIXI = require("pixi.js");
const mainjs = require("./main.js");

module.exports = (toolId) => {
    const tools = {
        hammer: {
            fx: "break shit"
        }
    }
    const curSprite = new PIXI.Sprite(mainjs.loadFromSheet[toolId + ".png"]);
    console.log(mainjs.hand);
    console.log(mainjs.app)




    return {
        init: () => {
            curSprite.position.set(window.innerWidth / 1.8, (window.innerHeight - curSprite.height) / 2);
            curSprite.interactive = true;
            curSprite.alpha = 0.6;
            curSprite.mouseover = function() {
                this.alpha = 1;
            };
            curSprite.mouseout = function() {
                this.alpha = 0.6;
            };
            curSprite.mousedown = function() {
                mainjs.hand.active = true;
                mainjs.hand.tool = true;
                mainjs.hand.item = curSprite;
                mainjs.hand.initPos = [curSprite.position.x, curSprite.position.y]
            };
            mainjs.app.stage.addChild(curSprite);
        },

    }
}