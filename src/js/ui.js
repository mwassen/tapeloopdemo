const PIXI = require("pixi.js");
const mainjs = require("./main");
const playerFactory = require("./playerFactory");
const tapeFactory = require("./tapeFactory");
const FontFaceObserver = require("fontfaceobserver");


module.exports = () => {
    let font = new FontFaceObserver('Press Start 2P');
    let tableSize = [];

    // Button data
    // Todo: make this into a factory function
    let buttons = [
        {   
            text: "decks",
            pos: [100, 40],
            menu: null,
            menuSize: [200, 130],
            hover: null,
            sprite: null,
            // Adds ability to add/remove tapedecks from table
            populate: () => {
                let addDeck = new PIXI.Text("add deck", {fontFamily : 'Press Start 2P', fontSize: 8, fill : "white"}); 
                let removeDeck = new PIXI.Text("remove deck", {fontFamily : 'Press Start 2P', fontSize: 8, fill : "white"});
                let resetTable = new PIXI.Text("reset table", {fontFamily : 'Press Start 2P', fontSize: 8, fill : "white"}); 
                let btnArr = [addDeck, removeDeck, resetTable];

                btnArr.forEach((btn, ind) => {
                    btn.position.set(30, 30 * (ind + 1));
                    btn.interactive = true;
                    btn.buttonMode = true;
                    btn.hitArea = new PIXI.Rectangle(0, -10, 150, btn.height + 20);
                    btn.mouseover = () => {
                        btn.style.fill = 0xe25822;
                    };
                    btn.mouseout = () => {
                        btn.style.fill = "white";
                    };
                    btn.mouseup = () => {
                        btn.style.fill = 0xe25822;
                    };
                })

                addDeck.mousedown = () => {
                    addDeck.style.fill = "blue";
                    // TODO add container that stores tapes behind the UI
                    let newDeck = playerFactory();
                    newDeck.newPlayer();
                    mainjs.tState.decks.push(newDeck);
                    // console.log(mainjs.tState.decks);
                };

                removeDeck.mousedown = () => {
                    // console.log(mainjs.tState.decks);
                    let deckArr = mainjs.tState.decks;
                    let deckObj = deckArr.splice(deckArr.length - 1, 1)[0];
                    // console.log(deckObj);
                    deckObj.delPlayer();
                    removeDeck.style.fill = "blue";
                };

                resetTable.mousedown = () => {
                    resetTable.style.fill = "blue";
                    location.reload();
                };

                return btnArr;
            }
        },
        {   
            text: "tapes",
            pos: [200, 40],
            menu: null,
            menuSize: [200, 500],
            hover: null,
            sprite: null,
            // Select from tape catalogue
            populate: () => {
                let tapeFact = tapeFactory();
                let tapeArray = tapeFact.menuInit();
                let fullContainer = new PIXI.Container();

                // console.log(tapeArray);

                tapeArray.forEach((cur, ind) => {
                    let tapeBtn = new PIXI.Container();
                    let sprite = cur.sprite;
                    let name = new PIXI.Text(cur.name, {fontFamily : 'Press Start 2P', fontSize: 8, fill : "white"});
                    let tapeBg = new PIXI.Graphics();


                    // sprite.anchor.set(0.5);
                    // name.anchor.set(0, 0.5);
                    sprite.scale.set(0.2);

                    tapeBg.beginFill(0xe25822);
                    tapeBg.drawRect(-2, -2, sprite.width + 4, sprite.height + 4);
                    tapeBg.visible = false;
                    

                    sprite.position.set(0, 0);

                    name.position.set(95, 24);
                    tapeBtn.addChild(tapeBg);
                    tapeBtn.addChild(sprite);
                    tapeBtn.addChild(name);
                    tapeBtn.interactive = true;
                    tapeBtn.buttonMode = true;
                    tapeBtn.hitArea = new PIXI.Rectangle(0, 0, 175, tapeBtn.height);
                    tapeBtn.position.set(15, ind * 65);

                    tapeBtn.mouseover = () => {
                        tapeBg.visible = true;
                        name.style.fill = 0xe25822;
                    };

                    tapeBtn.mouseout = () => {
                        tapeBg.visible = false;
                        name.style.fill = "white";
                    };

                    tapeBtn.mousedown = () => {
                        tapeFact.addToHand(cur);
                    };

                    fullContainer.addChild(tapeBtn);
                });

                fullContainer.position.set(0, 15);
                
                return [fullContainer];
            }
        },
        {   
            text: "tools",
            pos: [300, 40],
            menu: null,
            menuSize: [200, 500],
            hover: null,
            sprite: null,
            // Select tools
            populate: () => {
                return [];
            } 
        }
    ];

    function createBtns(btn) {
        let textSprite = new PIXI.Text(btn.text, {fontFamily : 'Press Start 2P', fontSize: 16, fill : "white"}); 

        textSprite.position.set(...btn.pos);
        textSprite.interactive = true;
        textSprite.buttonMode = true;
        textSprite.hitArea = new PIXI.Rectangle(0, 0, textSprite.width, textSprite.height + 10);

        // cursor events
        textSprite.mouseup = () => {
            textSprite.style.fill = 0xe25822;
        }
        textSprite.mouseover = () => {
            btn.menu.visible = true;
            textSprite.style.fill = 0xe25822;
        }
        textSprite.mouseout = () => {
            // hover state changes when cursor moves down to menu
            if(btn.hover == false) {
                btn.menu.visible = false;
                btn.sprite.style.fill = "white";
            }
        }
        // Add sprite to button object
        btn.sprite = textSprite;

        // Add text sprite to stage
        mainjs.app.stage.addChild(textSprite);
    };

    function setup() {
        // Ensures font is loaded before rendering elements
        font.load().then(function () {
            // console.log("font loaded");
            buttons.forEach((btn) => {
                createBtns(btn);
            })
            setupMenus();
            initMenu();
        }, function () {
            console.log('Font is not available');
            buttons.forEach((btn) => {
                createBtns(btn);
            })
            setupMenus();
            initMenu();
        });        
    }

    // Menus
    function menuBuilder(btn) {
        const curMenu = new PIXI.Container();
        const menuBg = new PIXI.Graphics();


        menuBg.beginFill(0x000000);
        menuBg.fillAlpha = 0.75;
        menuBg.drawRect(0, 0, ...btn.menuSize);
        curMenu.addChild(menuBg);
        curMenu.visible = false;
        curMenu.interactive = true;
        btn.hover = false;


        btn.populate().forEach((cur) => {
            curMenu.addChild(cur);
        });


        curMenu.mouseover = () => {
            btn.hover = true;
        }

        curMenu.mouseout = () => {
            btn.hover = false;
            curMenu.visible = false;
            btn.sprite.style.fill = "white";
        }

        curMenu.position.set(btn.pos[0], btn.pos[1] + 20);

        btn.menu = curMenu;
    }

    function setupMenus() {
        buttons.forEach((cur) => {
            menuBuilder(cur);
        })
    }

    function initMenu() {
        buttons.forEach((cur) => {
            mainjs.app.stage.addChild(cur.menu);
        })
    };

    // function firstPlayer() {
    //     let tapedeck1 = playerFactory.
    // }
    

    return {
        init: (size) => {
            tableSize = size;
            setup();
            // firstPlayer();
        }
    }
}