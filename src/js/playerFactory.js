const PIXI = require("pixi.js");
const mainjs = require("./main");
const audioEngine = require("./audioEngine");

let positions = [];
let lastPos = [];
let allDecksContainer;
let playerArr = [];


// TODO - Look for repeating patterns and make into functions

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
    let deckKnobs = [];
    let mousePos = null;
    let selectedKnob = null;

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

        let playerShadow = new PIXI.Graphics();
        playerShadow.beginFill(0x000000);
        playerShadow.alpha = 0.35;
        playerShadow.drawRoundedRect((-deckBody.width / 2) - 4, (-deckBody.height / 2) + 2, deckBody.width, deckBody.height, 13);

        // Initialise control buttons
        let controlBtns = new PIXI.Container();
        for (let i = 1; i <= 6; i++) {
            let BtnCont = new PIXI.Container();
            let Btn = new PIXI.Sprite(mainjs.loadFromSheet["tapedeck-buttons" + i + ".png"]);
            let bgArr = [new PIXI.Graphics(), new PIXI.Graphics(), new PIXI.Graphics(), new PIXI.Graphics()];

            bgArr.forEach((cur, ind) => {
                switch (ind) {
                    case 0:
                        cur.beginFill(0x343434);
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
            BtnCont.addChild(Btn);
            BtnCont.scale.set(0.3);
            Btn.anchor.set(0.5);
            BtnCont.position.set(i * 19, 0);
            deckBtns.push(BtnCont);
            controlBtns.addChild(BtnCont);
        };

        let knobsContainer = new PIXI.Container();

        for(let i = 0; i < 2; i++) {
            let knob = new PIXI.Container();

            for (let j = 0; j < 3; j++) {
                let knobInstance = new PIXI.Graphics();
                let fill;
                let show = true;
                switch (j) {
                    case 0:
                        fill = 0xe25822;
                        show = false;
                        break;
                    case 1:
                        fill = 0x343434;
                        break;
                    case 2:
                        fill = 0xD3D3D3;
                        show = false;
                }

                knobInstance.beginFill(fill);
                knobInstance.drawCircle(0, 0, 11 - (j * 2));
                knobInstance.visible = show;
                knob.addChild(knobInstance);
            }

            let indicator = new PIXI.Graphics();
            indicator.beginFill(0x000000);
            indicator.drawRect(-1, 2, 2, 5);
            knob.addChild(indicator);

            knob.position.set(22 * i, 10);


            knobsContainer.addChild(knob);
            knob.rotation = i == 0 ? Math.PI : (Math.PI * 2 - 0.4);
            knob.lastRot = knob.rotation;
            knob.identity = i == 0 ? "Speed" : "Volume";
            deckKnobs.push(knob);
        };

        knobsContainer.position.set(40, 107);

        controlBtns.position.set(-75, 118);

        singleDeckContainer.addChild(playerShadow);
        singleDeckContainer.addChild(playerBg);
        singleDeckContainer.addChild(deckBody);
        singleDeckContainer.addChild(controlBtns);
        singleDeckContainer.addChild(knobsContainer);
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

        // TODO - Isolate what only needs to happen the first time
        let deckTray = new PIXI.Container();
        let deckInsertClosed = new PIXI.Sprite(mainjs.loadFromSheet["tapeinsert-closed.png"]);
        let deckWindow = new PIXI.Graphics();
        let tapeSprite = new PIXI.Sprite();
        let knobTicker = new PIXI.ticker.Ticker();
        let playingState = false;

        tapeSprite.texture = tape.item.sprite.texture;
        tapeSprite.anchor.set(0.5);
        tapeSprite.scale.set(0.25);

        // TODO - Change wheels positions on opensprite
        tapeSprite.position.set(0, 52);

        deckInsertClosed.anchor.set(0.5);
        deckInsertClosed.scale.set(0.3, 0.3);
        deckInsertClosed.position.set(0, 47);

        

        deckWindow.beginFill("black");
        deckWindow.alpha = 0.75;
        deckWindow.drawRect(-124, 82, 248, 137);
        deckWindow.scale.set(0.3, 0.3);

        deckTray.addChild(tapeSprite);
        deckTray.addChild(deckWindow);
        deckTray.addChild(deckInsertClosed);


        // TODO - Async wait for sound buffer before activating buttons
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
                mainjs.sounds.button.play();
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

        deckKnobs.forEach((cur, ind) => {
            cur.children[2].visible = true;
            cur.interactive = true;
            cur.buttonMode = true;
            
            let btnActive = false;

            cur.label = new PIXI.Container();
            cur.label.visible = false;

            let labelBg = new PIXI.Graphics();
            labelBg.beginFill(0x000000);
            labelBg.alpha = 0.5;
            
            cur.label.addChild(labelBg);

            let labelText = new PIXI.Text(cur.identity + ": ", {fontFamily : 'Press Start 2P', fontSize: 8, fill : "white"});
            labelText.position.set(5, 6);
            cur.label.addChild(labelText);

            let labelValue = new PIXI.Text("10", {fontFamily : 'Press Start 2P', fontSize: 8, fill : "white"});
            labelValue.position.set(labelText.width + 2, 6);
            // labelValue.visible = false;
            cur.label.addChild(labelValue);

            // labelBg.drawRect(0, 0, cur.label.width + 38, 20);

            cur.label.position.set(-85, 30);

            cur.parent.addChild(cur.label);
            // cur.label.visible = true;

            cur.mouseover = () => {
                cur.children[0].visible = true;
            }

            cur.mouseout = () => {
                if (!btnActive) {
                    cur.children[0].visible = false;
                }
            }

            cur.mousedown = () => {
                cur.children[0].visible = true;
                btnActive = true;
                cur.label.visible = true;
                // mainjs.tState.mouseInitPos = mainjs.app.renderer.plugins.interaction.mouse.global.y;

                // mainjs.tState.knobActive = true;

                knobTicker.add((delta) => knobUpdate(delta));
                mousePos = mainjs.app.renderer.plugins.interaction.mouse.global.y;
                selectedKnob = cur;
                knobTicker.start();
            }

            cur.mouseup = () => {
                cur.children[0].visible = false;
                btnActive = false;
                cur.label.visible = false;
                // mainjs.tState.knobActive = false;
                // mainjs.tState.mouseInitPos = null;
                knobTicker.stop();
                mousePos = null;
                selectedKnob = null;
                cur.lastRot = cur.rotation;
            }

            cur.mouseupoutside = () => {
                cur.children[0].visible = false;
                btnActive = false;
                cur.label.visible = false;

                // mainjs.tState.knobActive = false;
                // mainjs.tState.mouseInitPos = null;
                knobTicker.stop();
                mousePos = null;
                selectedKnob = null;
                cur.lastRot = cur.rotation;
            }
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

    let curPos = mainjs.app.renderer.plugins.interaction.mouse.global.y;
    let updatedPos;
    // let lastKnobPos = [Math.PI, 0.4];

    function knobUpdate () {
        if (updatedPos !== mainjs.app.renderer.plugins.interaction.mouse.global.y) {
            let relativePosition = mousePos - mainjs.app.renderer.plugins.interaction.mouse.global.y;
            if(relativePosition < 100 && relativePosition > -100) {
                knobAdjust(relativePosition);
            }
            
        }

        updatedPos = mainjs.app.renderer.plugins.interaction.mouse.global.y;
    };

    function knobAdjust (value) {
        // console.log(value);
        let maxHigh = (2 * Math.PI) - 0.4;
        let rotationRads = (maxHigh * value) / 100;
        let newRads = selectedKnob.lastRot + rotationRads;
        function convertRange( value, r1, r2 ) { 
            return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
        };
        let pixelValue = selectedKnob.label.children[2];

        if(newRads < maxHigh && newRads > 0.4) {
            selectedKnob.rotation = newRads;
        
        } else {
            if (newRads > maxHigh) {
                selectedKnob.rotation = maxHigh;
            } else {
                selectedKnob.rotation = 0.4;
            }
        }

        if (selectedKnob.identity == "Volume") {
            let mod = convertRange(selectedKnob.rotation, [0.4, maxHigh], [-60, 0]).toFixed(0);
            pixelValue.text = mod + "dB";
            player.changeVolume(mod);
            
        } else {
            let mod = convertRange(selectedKnob.rotation, [0.4, maxHigh], [0.2, 1.8]).toFixed(2);
            pixelValue.text = mod;
            player.changeSpeed(mod);


        }

        selectedKnob.label.children[0].clear();
        selectedKnob.label.children[0].drawRect(0, 0, selectedKnob.label.width + 3, 20)
        // TODO - calculate bounds for volume function
        // changeVolume(value);
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