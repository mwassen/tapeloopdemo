/* ToDo
    -Add ability to modify existing Fx

    Observed:
    -Seems to be some kind of limiter that remains after Fx are cleared
*/

// import * as Tone from 'tone';

let Tone = require("tone");


module.exports = (loop) => {
    let urls = loop,
        soundEngine = new Tone.Player({
            url: urls[0],
            loop: true
        });

    // console.log(urls);

    let Fx = {
        rack: [],
        init: () => {
            soundEngine.disconnect();
            soundEngine.chain(...Fx.rack, Tone.Master);
        },
        scrub: () => {
            Fx.rack = [];
            Fx.init();
        },
        dist: (amount) => {
            Fx.rack.push(new Tone.Distortion(amount));
            console.log(Fx.rack);
            Fx.init();
        },
        verb: (amount) => {
            Fx.rack.push(new Tone.Freeverb(amount, (Math.random() * 3000)));
            console.log(Fx.rack);
            Fx.init();
        },
    };

    return {
        switchLoop: (loopNr) => {
            // console.log(loopNr);
            soundEngine.stop();
            soundEngine = new Tone.Player({
                url: urls[loopNr],
                loop: true,
                autostart: true
            });
            Fx.init();
        },

        play: () => {
            soundEngine.start();
        },

        stop: () => {
            soundEngine.stop();
        },

        addDist: () => {
            Fx.dist(0.1);
        },

        addRev: () => {
            Fx.verb(0.1);
        },
        clearFx: () => {
            Fx.scrub();
        }
    }
}