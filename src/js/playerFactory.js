const PIXI = require("pixi.js");
const mainjs = require("./main");
const audioEngine = require("./audioEngine");

// TODO - These globals should be moved to the main.js file
let positions = [];
let lastPos = [];
let allDecksContainer;
let playerArr = [];


// TODO - Look for repeating patterns and make into functions
// TODO - Maybe get this function into the bg file
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
}


module.exports = () => {
    // Todo Avoid using globals for some of these...
    let player = null;
    let playerBg = null;
    let active = false;
    let singleDeckContainer = new PIXI.Container();
    let deckInsert;
    let deckBtns = [];
    let deckKnobs = [];
    let mousePos = null;
    let selectedKnob = null;
    let updatedPos;

    function deckInit() {

        // Initialises container to arrange all players on same z level
        allDecksContainer = new PIXI.Container();

        // TODO - avoid or attempt to lessen use of side-effects in places such as this
        mainjs.app.stage.addChild(allDecksContainer);
    }

    function addPlayer() {
        // TODO - Try importing sprites at original resolution
        // TODO - Add player Builder function (this one is getting bloated)

        // Initialise deck body sprite and setup anchor and scale
        let deckBody = new PIXI.Sprite(mainjs.loadFromSheet["tapedeck-body.png"]);
        deckBody.anchor.set(0.5);
        deckBody.scale.set(0.3, 0.3);

        // Initialise open tape insert sprite and place + scale appropriately
        deckInsert = new PIXI.Sprite(mainjs.loadFromSheet["tapeinsert-open.png"]);
        deckInsert.anchor.set(0.5);
        deckInsert.scale.set(0.3, 0.3);
        deckInsert.position.set(0, 45);

        // Create highlight bg for cursor hover
        playerBg = new PIXI.Graphics();
        playerBg.beginFill(0xe25822);
        playerBg.drawRoundedRect((-deckBody.width / 2) - 4, (-deckBody.height / 2) - 4, deckBody.width + 8, deckBody.height + 8, 15);
        playerBg.visible = false;

        // Create offset shadow
        let playerShadow = new PIXI.Graphics();
        playerShadow.beginFill(0x000000);
        playerShadow.alpha = 0.35;
        playerShadow.drawRoundedRect((-deckBody.width / 2) - 4, (-deckBody.height / 2) + 2, deckBody.width, deckBody.height, 13);

        // Draw inactive control buttons
        let controlBtns = new PIXI.Container();
        for (let i = 1; i <= 6; i++) {
            let BtnCont = new PIXI.Container();
            let Btn = new PIXI.Sprite(mainjs.loadFromSheet["tapedeck-buttons" + i + ".png"]);
            Btn.anchor.set(0.5);

            // Draw different backgrounds for later use in cursor events
            for (let i = 0; i < 4; i++) {
                let eventBg = new PIXI.Graphics();
                let fill;
                let show = true;
                switch (i) {
                    // Inactive
                    case 0:
                        fill = 0x343434;
                        break;
                    // Active
                    case 1:
                        fill = 0xD3D3D3;
                        show = false;
                        break;
                    // Hover
                    case 2:
                        fill = 0xe25822;
                        show = false;
                        break;
                    // Click
                    case 3:
                        fill = 0xB22222;
                        show = false;
                }

                eventBg.beginFill(fill);
                eventBg.visible = show;
                eventBg.drawRect(- Btn.width / 2, - Btn.height / 2, Btn.width, Btn.height - 5);

                BtnCont.addChild(eventBg);
            };

            // Add and position button
            BtnCont.addChild(Btn);
            BtnCont.scale.set(0.3);
            BtnCont.position.set(i * 19, 0);

            // Add to array and button container
            deckBtns.push(BtnCont);
            controlBtns.addChild(BtnCont);
        };

        // Draw inactive control knobs
        let knobsContainer = new PIXI.Container();
        for (let i = 0; i < 2; i++) {
            let knob = new PIXI.Container();

            // Draw different backgrounds for cursor states
            for (let j = 0; j < 3; j++) {
                let knobInstance = new PIXI.Graphics();
                let fill;
                let show = true;

                // TODO - consistency between this and buttons ordering????
                switch (j) {
                    // Hover
                    case 0:
                        fill = 0xe25822;
                        show = false;
                        break;
                    // Inactive
                    case 1:
                        fill = 0x343434;
                        break;
                    // Active
                    case 2:
                        fill = 0xD3D3D3;
                        show = false;
                }

                knobInstance.beginFill(fill);
                knobInstance.visible = show;
                knobInstance.drawCircle(0, 0, 11 - (j * 2));

                knob.addChild(knobInstance);
            }

            // Draw knob position indicator
            let indicator = new PIXI.Graphics();
            indicator.beginFill(0x000000);
            indicator.drawRect(-1, 2, 2, 5);
            knob.addChild(indicator);

            // Position single knob
            knob.position.set(22 * i, 10);

            // Create identity and default rotation for each knob
            knob.rotation = i == 0 ? Math.PI : (Math.PI * 2 - 0.4);
            knob.lastRot = knob.rotation;
            knob.identity = i == 0 ? "Speed" : "Volume";

            // Add to array and knob container
            deckKnobs.push(knob);
            knobsContainer.addChild(knob);
        };

        // Position all control knobs and buttons
        controlBtns.position.set(-75, 118);
        knobsContainer.position.set(40, 107);

        // Add all drawn assets in display order to deck container
        singleDeckContainer.addChild(playerShadow);
        singleDeckContainer.addChild(playerBg);
        singleDeckContainer.addChild(deckBody);
        singleDeckContainer.addChild(controlBtns);
        singleDeckContainer.addChild(knobsContainer);
        singleDeckContainer.addChild(deckInsert);


        // DECK POSITIONING
        // Randomise deck rotations
        singleDeckContainer.rotation = (Math.random() - 0.5) * 0.15;

        // Load preset position from array
        let defPos = positions.splice(0, 1)[0];

        // Add some small random variance in the deck positions
        let deckPos = defPos.map(cur => {
            return cur + Math.floor((Math.random() - 0.5) * 25);
        });

        // Save preset position for reuse if deleted & set position
        lastPos.push(defPos);
        singleDeckContainer.position.set(...deckPos);
        

        // TODO - Add higher order functions here
        // Adds CURSOR EVENTS to decks
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
                    if(active) {
                        launchTape(mainjs.hand);
                    } else {
                        initControls();
                        launchTape(mainjs.hand);
                        active = true;
                    }
                    
                }
            }
        };

        // Add to decks array and container
        playerArr.push(singleDeckContainer);
        allDecksContainer.addChild(singleDeckContainer);
    }

    function removePlayer() {
        // If a player is active on this deck, stop it
        if (player) {
            player.stop()
        }

        // Remove sprite from decks array and container
        let lastPlayer = playerArr.splice(playerArr.length - 1, 1);
        allDecksContainer.removeChild(lastPlayer[0]);
        positions.unshift(...lastPos.splice(lastPos.length - 1, 1));
    }

    function initControls() {
        // Create ticker for knob control animations
        let knobTicker = new PIXI.ticker.Ticker();

        // Load instance of audioEngine
        player = audioEngine();
        let playingState = true;

        // TODO - Async wait for sound buffer before activating buttons
        // Activate buttons
        deckBtns.forEach((cur, ind) => {
            // Change bg to active, lightgrey
            cur.children[0].visible = false;
            cur.children[1].visible = true;

            // Add interactivity and cursor events
            cur.interactive = true;
            cur.buttonMode = true;

            cur.mouseover = () => {
                cur.children[2].visible = true;
            };

            cur.mouseout = () => {
                cur.children[2].visible = false;
            };

            cur.mousedown = () => {
                // Play button press sound effect
                mainjs.sounds.button.play();
                cur.children[3].visible = true;

                // Play/Stop or change loop
                if(ind == 0) {
                    if (playingState == false) {
                        player.play();
                        playingState = true;
                    } else {
                        player.stop();
                        playingState = false;
                    }
                } else {
                    player.stop();
                    player.switchLoop(ind - 1);
                    playingState = true;
                }
                
            };

            cur.mouseup = () => {
                cur.children[3].visible = false;
            };
        })

        // Activate knobs
        deckKnobs.forEach((cur, ind) => {
            // Change bg to active, lightgrey
            cur.children[2].visible = true;

            cur.interactive = true;
            cur.buttonMode = true;
            
            cur.label = new PIXI.Container();
            cur.label.visible = false;

            // Add label background (drawn during animation)
            let labelBg = new PIXI.Graphics();
            labelBg.beginFill(0x000000);
            labelBg.alpha = 0.5;
            cur.label.addChild(labelBg);

            // Draw label text
            let labelText = new PIXI.Text(cur.identity + ": ", {fontFamily : 'Press Start 2P', fontSize: 8, fill : "white"});
            labelText.position.set(5, 6);
            cur.label.addChild(labelText);

            // Draw label value (empty for now)
            let labelValue = new PIXI.Text("", {fontFamily : 'Press Start 2P', fontSize: 8, fill : "white"});
            labelValue.position.set(labelText.width + 2, 6);
            cur.label.addChild(labelValue);

            // Position and add label container to knob container
            cur.label.position.set(-85, 30);
            cur.parent.addChild(cur.label);

            // Keeps knob active while mouse is down
            let knobActive = false;

            // Knob cursor events
            cur.mouseover = () => {
                cur.children[0].visible = true;
            }

            cur.mouseout = () => {
                if (!knobActive) {
                    cur.children[0].visible = false;
                }
            }

            cur.mousedown = () => {
                knobActive = true;
                selectedKnob = cur;

                // Shows active bg and label
                cur.children[0].visible = true;
                cur.label.visible = true;

                // Add to animation ticker for label and rotation
                knobTicker.add((delta) => knobUpdate(delta));

                // Saves initial mouse position
                mousePos = mainjs.app.renderer.plugins.interaction.mouse.global.y;

                // Starts animation
                knobTicker.start();
            }

            cur.mouseup = () => {
                knobActive = false;
                cur.children[0].visible = false;
                cur.label.visible = false;

                // Stop ticker and reset mouse and active values
                knobTicker.stop();
                mousePos = null;
                selectedKnob = null;

                // Saves current rotation status
                cur.lastRot = cur.rotation;
            }

            // Repeat last function if mouse up outside
            cur.mouseupoutside = () => {
                cur.mouseup();
            }
        })
    }

    function launchTape(tape) {
        // Create new container and sprites for tape tray
        let deckTray = new PIXI.Container();
        let deckInsertClosed = new PIXI.Sprite(mainjs.loadFromSheet["tapeinsert-closed.png"]);
        let deckWindow = new PIXI.Graphics();
        let tapeSprite = new PIXI.Sprite();

        // Load tape sprite in hand and position
        tapeSprite.texture = tape.item.sprite.texture;
        tapeSprite.anchor.set(0.5);
        tapeSprite.scale.set(0.25);
        tapeSprite.position.set(0, 52);

        // Position tape tray
        deckInsertClosed.anchor.set(0.5);
        deckInsertClosed.scale.set(0.3, 0.3);
        deckInsertClosed.position.set(0, 47);

        // Draw opaque window on tray
        deckWindow.beginFill("black");
        deckWindow.alpha = 0.75;
        deckWindow.drawRect(-124, 82, 248, 137);
        deckWindow.scale.set(0.3, 0.3);

        // Add sprites to container
        deckTray.addChild(tapeSprite);
        deckTray.addChild(deckWindow);
        deckTray.addChild(deckInsertClosed);

        // Replace current tray with new one
        singleDeckContainer.removeChild(deckInsert);
        singleDeckContainer.addChild(deckTray);
        
        // Hide tape sprite in hand
        tape.item.sprite.visible = false;

        // If already playing, stop
        if (player) {
            player.stop();
        }
        
        // Load new instance of audioengine and play
        player.loadTape(tape.item.sounds);
        mainjs.sounds.insert.play();
        player.switchLoop(0);
    
        // Resets hand so tape is no longer linked to cursor
        // TODO - maybe need a global variable that stores currently active tapedecks + tapes
        resetHand(mainjs.hand);
    }

    // let curPos = mainjs.app.renderer.plugins.interaction.mouse.global.y;
    // let lastKnobPos = [Math.PI, 0.4];

    function knobUpdate () {
        // Only runs if mouse changes position
        if (updatedPos !== mainjs.app.renderer.plugins.interaction.mouse.global.y) {

            // Calculates relative position from initial mouseclick
            let relativePosition = mousePos - mainjs.app.renderer.plugins.interaction.mouse.global.y;
            if(relativePosition < 100 && relativePosition > -100) {

                // Changes knob rotation and applies effect
                knobAdjust(relativePosition);
            }
            updatedPos = mainjs.app.renderer.plugins.interaction.mouse.global.y;
        }

        
    }

    function knobAdjust (value) {

        let maxHigh = (2 * Math.PI) - 0.4;
        let rotationRads = (maxHigh * value) / 100;
        let newRads = selectedKnob.lastRot + rotationRads;
        let pixelValue = selectedKnob.label.children[2];


        // Used for converting between volume/speed values and radians
        function convertRange( value, r1, r2 ) { 
            return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
        };

        // Runs if new values is between min and max
        if (newRads <= maxHigh && newRads >= 0.4) {
            selectedKnob.rotation = newRads;
        } else {
            // Lock to max and min if mouse moves rapidly
            if (newRads > maxHigh) {
                selectedKnob.rotation = maxHigh;
            } else {
                selectedKnob.rotation = 0.4;
            }
        }

        if (selectedKnob.identity == "Volume") {
            let mod = convertRange(selectedKnob.rotation, [0.4, maxHigh], [-60, 0]);
            pixelValue.text = mod.toFixed(0) + "dB";
            player.changeVolume(mod.toFixed(2));
        } else {
            let mod = convertRange(selectedKnob.rotation, [0.4, maxHigh], [0.2, 1.8]).toFixed(2);
            pixelValue.text = mod;
            player.changeSpeed(mod);
        }

        // Draw new label background to match size
        selectedKnob.label.children[0].clear();
        selectedKnob.label.children[0].drawRect(0, 0, selectedKnob.label.width + 3, 20)
    }

    // Reset main hand
    function resetHand(handState) {
        handState.active = false;
        handState.tool = false;
        handState.item = null;
        handState.initPos = [];
    }

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