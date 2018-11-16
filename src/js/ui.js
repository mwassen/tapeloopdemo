const PIXI = require("pixi.js");
const mainjs = require("./main");


module.exports = () => {

    // Button data
    const buttons = [
        {   
            text: "decks",
            pos: [100, 40],
            menu: null,
            hover: null,
            sprite: null,
            // Adds ability to add/remove tapedecks from table
            populate: () => {
                return [];
            }
        },
        {   
            text: "tapes",
            pos: [200, 40],
            menu: null,
            hover: null,
            sprite: null,
            // Select from tape catalogue
            populate: () => {
                return [];
            }
        },
        {   
            text: "tools",
            pos: [300, 40],
            menu: null,
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
            textSprite.style.fill = "blue";
        }
        textSprite.mouseover = () => {
            btn.menu.visible = true;
            textSprite.style.fill = "blue";
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

    function setup(arr) {
        arr.forEach((obj) => {
            createBtns(obj);
        })
    }


    // Menus
    function menuBuilder(btn, x, y) {
        const curMenu = new PIXI.Container();
        const menuBg = new PIXI.Graphics();


        menuBg.beginFill(0x000000);
        menuBg.fillAlpha = 0.75;
        menuBg.drawRect(0, 0, 450, 500);
        curMenu.addChild(menuBg);
        curMenu.visible = false;
        menuBg.interactive = true;
        menuBg.hitArea = new PIXI.Rectangle(0, 0, curMenu.width, curMenu.height);
        btn.hover = false;


        btn.populate().forEach((cur) => {
            curMenu.addChild(cur);
        });


        menuBg.mouseover = () => {
            btn.hover = true;
        }

        menuBg.mouseout = () => {
            btn.hover = false;
            curMenu.visible = false;
            btn.sprite.style.fill = "white";
        }

        // curMenu
        //     .on("pointerover", mouseOver);

        curMenu.position.set(btn.pos[0], btn.pos[1] + 20);

        btn.menu = curMenu;
    }

    function setupMenus(x, y) {
        buttons.forEach((cur) => {
            menuBuilder(cur, x, y);
        })
    }

    function initMenu() {
        buttons.forEach((cur) => {
            mainjs.app.stage.addChild(cur.menu);
        })
    };
    

    return {
        init: (x, y) => {
            setupMenus(x, y);
            setup(buttons);
            initMenu();
        }
    }
}