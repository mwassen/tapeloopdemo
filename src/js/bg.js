const PIXI = require("pixi.js");
const mainjs = require("./main.js");

module.exports = () => {
    tableSize = [];
    
    // Creates a floor background
    function floorSetup() {
        const floorW = window.innerWidth + 256;
        const floorH = window.innerHeight + 256;
        const floorCont = new PIXI.Container();

        // Loops over height and width, placing tiles
        for (let i = -256; i < floorH; i += 256) {
            for (let j = -256; j < floorW; j += 256) {

                let floorTile = new PIXI.Sprite(mainjs.loadFromSheet["floortiles-1.png"]);
                floorTile.position.set(j, i);
                floorCont.addChild(floorTile);
            }
        }

        mainjs.app.stage.addChild(floorCont);
    };

    function setup() {
        const table = new PIXI.Container();
        let tableTexture = new PIXI.Container();
        const tableW = window.innerWidth - 200;
        const tableH = window.innerHeight - 200;

        // Places planks over height and width
        for (let i = 0; i < tableH; i += 64) {

            // Randomises plank x positions
            let iter = Math.ceil(Math.random() * 7);

            for (let j = 0; j < tableW + 400; j += 256) {       
                
                // Offsets x position
                let xPos = j - (((i / 64) % iter) * (256 / iter));

                // Selects random plank
                let plankSelect = Math.floor(Math.random() * 3);
                const plank = new PIXI.Sprite(mainjs.loadFromSheet["plank" + (plankSelect + 1) + ".png"]);

                plank.scale.set(0.5, 0.5);
                plank.position.set(xPos, i);

                tableTexture.addChild(plank);
            } 
        }

        // Creates and applies mask to plank texture
        let tableMask = new PIXI.Sprite(PIXI.Texture.WHITE);
        tableMask.x = 0;
        tableMask.y = 0;
        tableMask.width = Math.round(tableW / 256) * 256;
        tableMask.height = Math.round(tableH / 64) * 64;

        tableTexture.mask = tableMask;
        tableTexture.addChild(tableMask);


        table.addChild(tableTexture);

        // Sets position to center of screen
        table.position.set((window.innerWidth - table.width) / 2,(window.innerHeight - table.height) / 2);

        // Add border to table
        let tableBorder = new PIXI.Graphics();
        tableBorder.beginFill(0x794100);
        tableBorder.drawRoundedRect(-15, -15, table.width + 30, table.height + 30, 10);
        table.addChildAt(tableBorder, 0);

        // Sets current width and height for use in other functions
        tableSize = [table.width, table.height];

        // Creates a series of concentric shadows around the table
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

        // TODO: should handle state in a more cohesive manner!!
        width: () => {
            return tableSize[0];
        },
        height: () => {
            return tableSize[1];
        }
    }
}