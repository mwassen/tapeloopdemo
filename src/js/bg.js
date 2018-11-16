const PIXI = require("pixi.js");
const mainjs = require("./main.js");

module.exports = () => {
    const table = new PIXI.Container();
    function setup() {
        const tableW = window.innerWidth - 200;
        const tableH = window.innerHeight - 200;

        for (let i = 0; i < tableH; i += 64) {
            for (let j = 0; j < tableW; j += 256) {
                // let plankSelect = ((j / 256) % 3) + 1;
                let plankSelect = Math.floor(Math.random() * 3);
                // const plank = plankArr[plankSelect];
                const plank = new PIXI.Sprite(mainjs.loadFromSheet["plank" + (plankSelect + 1) + ".png"]);
                plank.scale.set(0.5, 0.5);
                plank.position.set(j, i);
                table.addChild(plank);
            } 
        }

        // const stroke = new PIXI.Graphics()
        //     .beginFill(0xC19A6B)
        //     .drawRect(-15, -15, table.width + 30, table.height + 30);

        // table.children.unshift("hellooo");

        // console.log(table.children);
        table.position.set((window.innerWidth - table.width) / 2,(window.innerHeight - table.height) / 2);

        mainjs.app.stage.addChild(table);
    };


    return {
        init: () => {
            setup(); 
        },
        width: () => {
            return table.width;
        },
        height: () => {
            return table.height;
        }
    }
}