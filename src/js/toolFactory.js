const PIXI = require("pixi.js");
const mainjs = require("./main.js");

module.exports = (toolId) => {
    // const tools = {
    //     hammer: {
    //         fx: "break shit"
    //     }
    // }
    const curSprite = new PIXI.Sprite(mainjs.loadFromSheet[toolId + ".png"]);

    return {
        init: () => {
            curSprite.scale.set(0.5, 0.5);
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
                console.log(mainjs.hand);
            };
            mainjs.app.stage.addChild(curSprite);
        },

    }
}