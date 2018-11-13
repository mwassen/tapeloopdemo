export function initInteractive(item) {
    item.interactive = true;
    item.alpha = 0.6;

    // Initialise interactive features
    item.hitArea = new PIXI.Rectangle(0, 0, item.width, item.height);
    item.mouseover = function(mouseData) {
        // console.log("hellooooo");
        this.alpha = 1;
    }
    item.mouseout = function(mouseData) {
        this.alpha = 0.6;
    }
    item.mousedown = function(mouseData) {
        hand.active = true;
        hand.item = item;
        // console.log(hand.active);
    }
    item.scale.set(0.6, 0.6);
}