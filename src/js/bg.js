const PIXI = require("pixi.js");
const mainjs = require("./main.js");

module.exports = () => {
    tableSize = [];
    
    function floorSetup() {
        // TODO - Add gaussan blur shadow to table

        const floorW = window.innerWidth + 256;
        const floorH = window.innerHeight + 256;
        const floorCont = new PIXI.Container();

        for (let i = -256; i < floorH; i += 256) {
            for (let j = -256; j < floorW; j += 256) {
                let floorTile = new PIXI.Sprite(mainjs.loadFromSheet["floortiles-1.png"]);
                // floorTile.scale.set(2);
                floorTile.position.set(j, i);
                floorCont.addChild(floorTile);
            }
        }
        mainjs.app.stage.addChild(floorCont);
    };

    function setup() {
        const table = new PIXI.Container();
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

        table.position.set((window.innerWidth - table.width) / 2,(window.innerHeight - table.height) / 2);

        // Add border to table
        let tableBorder = new PIXI.Graphics();
        tableBorder.beginFill(0x794100);
        tableBorder.drawRoundedRect(-15, -15, table.width + 30, table.height + 30, 10);
        table.addChildAt(tableBorder, 0);

        tableSize = [table.width, table.height];


        for (let i = 1; i < 5; i++) {
            let tableShadow = new PIXI.Graphics();
            tableShadow.beginFill(0x000000);
            tableShadow.alpha = 0.15;
            tableShadow.drawRoundedRect(-15 - (i * 15), -15 - (i * 15), table.width + (i * 15), table.height + (i * 15));
            table.addChildAt(tableShadow, 0);
        }
        
    
        mainjs.app.stage.addChild(table);
    };


    return {
        init: () => {
            floorSetup();
            setup(); 
        },
        width: () => {
            return tableSize[0];
        },
        height: () => {
            return tableSize[1];
        }
    }
}