const PIXI = require("pixi.js");
const mainjs = require("./main.js");
const playerFactory = require("./playerFactory");

module.exports = (toolId) => {

    // Range conversion
    function convertRange( value, r1, r2 ) { 
        return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
    };

    // Ticker for tool animations
    let toolTicker = new PIXI.ticker.Ticker;

    const toolsDb = [
        {
            name: "hammer",
            use: () => {
                return (deckCont, player, sprite) => {

                    // Create containers and new hammer sprite
                    let hitGroup = new PIXI.Container();
                    let hammerMeter = new PIXI.Container();
                    let hammerMeterBg = new PIXI.Sprite(mainjs.loadFromSheet["hammer-meter.png"]);

                    // Indicator for hammer strength meter
                    let hammerMeterInd = new PIXI.Graphics();
                    hammerMeterInd.beginFill(0x000000);
                    hammerMeterInd.drawRect(0, 125, 15, 3);

                    // Add graphics and sprite to hammer meter
                    hammerMeter.addChild(hammerMeterBg);
                    hammerMeter.addChild(hammerMeterInd);

                    // Position hammer sprite
                    sprite.anchor.set(0.55, 0.7);
                    sprite.position.set(0, 100);
                    sprite.rotation = Math.PI * 0.15;

                    // Add hammer + meter to container
                    hitGroup.addChild(hammerMeter);
                    hitGroup.addChild(sprite);

                    // Set original alpha to 0, for animating entry later
                    hitGroup.alpha = 0;

                    // Position meter next to hammer
                    hammerMeter.position.set(50, 10);
                    hammerMeter.rotation = Math.PI * 0.09;

                    // Position entire group
                    hitGroup.position.set(140, -100);
                    hitGroup.rotation = Math.PI * 0.03;

                    // Store direction and speed of meter indicator
                    let dirUp = true;
                    let indSpeed = 3;

                    toolTicker.add((delta) => {
                        if (dirUp == true) {
                            hammerMeterInd.position.y -= indSpeed;
                        } else {
                            hammerMeterInd.position.y += indSpeed;
                        }

                        if (hammerMeterInd.position.y < -123) {
                            dirUp = false;
                        } else if (hammerMeterInd.position.y > -1) {
                            dirUp = true;
                        }
                    })

                    toolTicker.start();

                    let newDown = () => {
                        hitGroup.removeChild(hammerMeter);
                        toolTicker.stop();

                        let amount = convertRange(hammerMeterInd.position.y, [0, -124], [0, 1]);

                        mainjs.sounds.swing._volume = amount;
                        mainjs.sounds.swing.play();

                        for(let i = 0; i <= 10; i++) {
                            // Animates hammer rotation, simulating hit
                            setTimeout(() => {
                                if (i < 2) {
                                    sprite.rotation += Math.PI * 0.06;
                                } else {
                                    sprite.rotation -= Math.PI * 0.085;
                                }

                                if (i == 10){
                                    // Adds distortion according to strength
                                    mainjs.sounds.bang._volume = amount;
                                    mainjs.sounds.bang.play();
                                    player.addDist(amount);

                                    // console.log(deckCont.children);
                                    // deckCont.removeChildAt(5);

                                    for(let j = 0; j <= 15; j++) {
                                        setTimeout(() => {
                                            if (j < 4) {
                                                let hitCircle = new PIXI.Graphics();
                                                hitCircle.beginFill(0xffffff);
                                                hitCircle.drawCircle(-125, 160, (20 * j) + (amount * 20));
                                                hitCircle.alpha = amount * 0.3;
                                                hitGroup.addChildAt(hitCircle, 0);
                                            } else {
                                                hitGroup.alpha -= 0.1;
                                            }

                                            if (j == 15) {
                                                deckCont.removeChild(hitGroup);
                                            }
                                        }, 50 * j);
                                    }
                                }
                            // Increases animation acceleration according to hit
                            }, ((30 - (i * amount * 1.5)) * i));

                            
                        };

                    }                        

                    deckCont.addChild(hitGroup);
                    for(let i = 0; i <= 5; i++) {
                        setTimeout(() => {
                            hitGroup.alpha += 0.2;
                        }, 50 * i);
                    }

                    return newDown;
                }
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