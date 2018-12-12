const PIXI = require("pixi.js");
const mainjs = require("./main.js");

module.exports = (toolId) => {
    // const tools = {
    //     hammer: {
    //         fx: "break shit"
    //     }
    // }

    const toolsDb = [
        {
            name: "hammer",
            use: (player) => {
                console.log(player);
            }
            
        }
    ];

    function menuDraw() {
        let toolsArr = [];
        toolsDb.forEach((cur, ind) => {
            toolsArr[ind] = {
                name: cur.name,
                sprite: new PIXI.Sprite(mainjs.loadFromSheet["menu-" + cur.name + ".png"]),
                inHand: new PIXI.Sprite(mainjs.loadFromSheet["hand-" + cur.name + "1.png"]),
                apply: cur.use
            }
        });
        return toolsArr;
    };

    function equip(tool) {

        console.log(tool);
        tool.inHand.scale.set(0.75);

        mainjs.mainState.hand.cont.addChild(tool.inHand);

        mainjs.mainState.hand.tool = true;
        mainjs.mainState.hand.active = true;
        mainjs.mainState.hand.data = tool.apply;
    };

    return {
        initMenu: () => {
            return menuDraw();
        },
        addToHand: (tool) => {
            equip(tool);
        }

    }
}