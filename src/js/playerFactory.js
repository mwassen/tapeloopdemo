const PIXI = require("pixi.js");
const mainjs = require("./main");
const audioEngine = require("./audioEngine");

let positions = [];
let lastPos = [];
let allDecksContainer;
let playerArr = [];



function setupPositions() {
    // TODO - Loop over W & H to halve this function
    // Retreives loaded table size
    let tWidth = mainjs.tState.size[0];
    let tHeight = mainjs.tState.size[1];

    // Checks how many cells of min 300px are available
    let xAmount = Math.floor(tWidth / 300);
    let yAmount = Math.floor(tHeight / 300);

    // Assigns cell size based on table size
    let boxX = tWidth / xAmount;
    let boxY = tHeight / yAmount;

    // Calculates distance between window and table
    // TODO - Maybe table should be a container?
    let tableDiffx = (window.innerWidth - tWidth) / 2;
    let tableDiffy = (window.innerHeight - tHeight) / 2;

    let output = [];

    // Loops over available cells + adds the center point of each cell to output
    for (let y = 0; y < yAmount; y++) {
        for (let x = 0; x < xAmount; x++) {
            let xPos = (x * boxX) + (boxX / 2) + tableDiffx;
            let yPos = (y * boxY) + (boxY / 2) + tableDiffy;
            output.push([xPos, yPos]);
        }
    }
    positions = output;
};


module.exports = () => {
    // This needs to be global, this module will be instanced...
    let player = null;
    let playerBg = null;
    let singleDeckContainer = new PIXI.Container();
    let deckInsert;
    let deckBtns = [];

    function deckInit() {
        allDecksContainer = new PIXI.Container();
        mainjs.app.stage.addChild(allDecksContainer);
    }

    function addPlayer() {
        // TODO - Try importing sprites at original resolution
        // TODO - Add player Builder function (this one is getting bloated)
        // Initialise deck sprite and setup anchor and scale
        // let singleDeckContainer = new PIXI.Container();
        let deckBody = new PIXI.Sprite(mainjs.loadFromSheet["tapedeck-body.png"]);
        deckInsert = new PIXI.Sprite(mainjs.loadFromSheet["tapeinsert-open.png"]);
        deckBody.anchor.set(0.5);
        deckBody.scale.set(0.3, 0.3);
        deckInsert.anchor.set(0.5);
        deckInsert.scale.set(0.3, 0.3);
        deckInsert.position.set(0, 45);

        playerBg = new PIXI.Graphics();
        playerBg.beginFill(0xe25822);
        playerBg.drawRoundedRect((-deckBody.width / 2) - 4, (-deckBody.height / 2) - 4, deckBody.width + 8, deckBody.height + 8, 15);

        playerBg.visible = false;

        // Initialise control buttons
        let controlBtns = new PIXI.Container();
        for (let i = 1; i <= 6; i++) {
            let BtnCont = new PIXI.Container();
            let Btn = new PIXI.Sprite(mainjs.loadFromSheet["tapedeck-buttons" + i + ".png"]);
            let bgArr = [new PIXI.Graphics(), new PIXI.Graphics(), new PIXI.Graphics(), new PIXI.Graphics()]
            // let bg = new PIXI.Graphics();
            // let bgHover = new PIXI.Graphics();
            // let bgClick = 

            bgArr.forEach((cur, ind) => {
                switch (ind) {
                    case 0:
                        cur.beginFill(0x696969);
                        break;
                    case 1:
                        cur.beginFill(0xD3D3D3);
                        cur.visible = false;
                        break;
                    case 2:
                        cur.beginFill(0xe25822);
                        cur.visible = false;
                        break;
                    case 3:
                        cur.beginFill(0xB22222);
                        cur.visible = false;
                }
                cur.drawRect(- Btn.width / 2, - Btn.height / 2, Btn.width, Btn.height - 5);
                BtnCont.addChild(cur);
            })

            // bg.beginFill(0x696969);
            // bg.drawRect(- Btn.width / 2, - Btn.height / 2, Btn.width, Btn.height - 5);

            // bgHover.beginFill(0xe25822);
            // bgHover.drawRect(- Btn.width / 2, - Btn.height / 2, Btn.width, Btn.height - 5);
            // bgHover.visible = false;

            // BtnCont.addChild(bg);
            // BtnCont.addChild(bgHover);
            BtnCont.addChild(Btn);
            BtnCont.scale.set(0.3);
            Btn.anchor.set(0.5);
            BtnCont.position.set(i * 20, 0);
            deckBtns.push(BtnCont);
            controlBtns.addChild(BtnCont);
        };

        controlBtns.position.set(-60, 120)

        
        singleDeckContainer.addChild(playerBg);
        singleDeckContainer.addChild(deckBody);
        singleDeckContainer.addChild(controlBtns);
        singleDeckContainer.addChild(deckInsert);

        

        // Randomise deck rotations
        singleDeckContainer.rotation = (Math.random() - 0.5) * 0.15;

        // Load preset position from array
        let defPos = positions.splice(0, 1)[0];

        // // Stop function if table is full
        // if (defPos == undefined) {
        //     console.log("no space on table");
        //     return null;
        // }

        // Add some small random variance in the positions
        let deckPos = defPos.map(cur => {
            return cur + Math.floor((Math.random() - 0.5) * 25);
        });

        // Save preset position for reuse if deleted & set position
        lastPos.push(defPos);
        singleDeckContainer.position.set(...deckPos);
        

        // TODO - Add higher order functions here
        // Adds cursor events to decks
        singleDeckContainer.interactive = true;
        singleDeckContainer.mouseover = () => {
            if(mainjs.hand.active) {
                singleDeckContainer.buttonMode = true;
                playerBg.visible = true;
            }
        }

        singleDeckContainer.mouseout = () => {
            if(mainjs.hand.active) {
                singleDeckContainer.buttonMode = false;
                playerBg.visible = false;
            }
        }

        singleDeckContainer.mousedown = () => {
            if(mainjs.hand.active) {
                singleDeckContainer.buttonMode = false;
                playerBg.visible = false;
                if(mainjs.hand.tool) {
                    initEffect(mainjs.hand);
                } else {
                    launchTape(mainjs.hand);
                }
            }
        };
        playerArr.push(singleDeckContainer);
        allDecksContainer.addChild(singleDeckContainer);
    };

    function removePlayer() {
        // If a player is active on this deck, stop it
        if (player) {
            player.stop()
        }

        // Remove sprite from decks PIXI container
        let lastPlayer = playerArr.splice(playerArr.length - 1, 1);
        allDecksContainer.removeChild(lastPlayer[0]);
        positions.unshift(...lastPos.splice(lastPos.length - 1, 1));
    }

    function launchTape(tape) {
        // mainjs.mainLoader.load(function(loader, resources) {
        //     resources["./src/assets/sound/effects/tape-insert.ogg"].sound.play();
        // });
        // Maybe this should be preloaded?
        let deckTray = new PIXI.Container();
        let deckInsertClosed = new PIXI.Sprite(mainjs.loadFromSheet["tapeinsert-closed.png"]);
        let deckWindow = new PIXI.Graphics();
        let tapeSprite = new PIXI.Sprite();
        let playingState = false;

        tapeSprite.texture = tape.item.sprite.texture;
        tapeSprite.anchor.set(0.5);
        tapeSprite.scale.set(0.25);
        tapeSprite.position.set(0, 50);

        deckInsertClosed.anchor.set(0.5);
        deckInsertClosed.scale.set(0.3, 0.3);
        deckInsertClosed.position.set(0, 45);

        

        deckWindow.beginFill("black");
        deckWindow.alpha = 0.75;
        deckWindow.drawRect(-124, 76, 248, 136);
        deckWindow.scale.set(0.3, 0.3);

        deckTray.addChild(tapeSprite);
        deckTray.addChild(deckWindow);
        deckTray.addChild(deckInsertClosed);

        deckBtns.forEach((cur, ind) => {
            cur.children[0].visible = false;
            cur.children[1].visible = true;
            cur.interactive = true;
            cur.buttonMode = true;

            cur.mouseover = () => {
                cur.children[2].visible = true;
            };

            cur.mouseout = () => {
                cur.children[2].visible = false;
            };

            cur.mousedown = () => {
                cur.children[3].visible = true;
                if(ind == 0) {
                    if (playingState == false) {
                        player.play();
                        playingState = true;
                    } else {
                        player.stop();
                        playingState = false;
                    }
                } else {
                    player.switchLoop(ind - 1);
                }
                
            };

            cur.mouseup = () => {
                cur.children[3].visible = false;
            };
        })
        
        

        singleDeckContainer.removeChild(deckInsert);
        singleDeckContainer.addChild(deckTray);
        
        
        tape.item.sprite.visible = false;

        // If already playing, stop
        if (player) {
            player.stop();
        }
        
        // Load new instance of audioengine and play
        player = audioEngine(tape.item.sounds);
        mainjs.sounds.insert.play();
        player.switchLoop(0);
        playingState = true;
    
        // Resets hand so tape is no longer linked to cursor
        // TODO - maybe need a global variable that stores currently active tapedecks + tapes
        resetHand(mainjs.hand);
    };

    function resetHand(handState) {
        handState.active = false;
        handState.tool = false;
        handState.item = null;
        handState.initPos = [];
    };

    return {
        initPositions: () => {
            setupPositions();
        },
        init: () => {
            deckInit();
            addPlayer();
        },
        newPlayer: () => {
            addPlayer();
        },
        delPlayer: () => {
            return removePlayer();
        },
        availPos: () => {
            return positions.length < 1 ? false : true;
        }
    }
}