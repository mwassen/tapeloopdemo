/* ToDo
    -Add ability to modify existing Fx

    Observed:
    -Seems to be some kind of limiter that remains after Fx are cleared
*/

// import * as Tone from 'tone';

let Tone = require("tone");


module.exports = () => {


    return {
        newPlayer: () => {
            let curPlayer = new.TonePlayer({
                loop: true,
                autostart : true
            });

            let Fx = {
                rack: [],
                init: () => {
                    curPlayer.disconnect();
                    curPlayer.chain(...Fx.rack, Tone.Master);
                },
                // scrub: () => {
                //     Fx.rack = [];
                //     Fx.init();
                // },
                dist: (amount) => {
                    Fx.rack.push(new Tone.Distortion(amount, "2x"));
                    // console.log(Fx.rack);
                    Fx.init();
                },
                // verb: (amount) => {
                //     Fx.rack.push(new Tone.Freeverb(amount, (Math.random() * 3000)));
                //     console.log(Fx.rack);
                //     Fx.init();
                // },
            }



            // Add tone player inside here?
            return {
                loadTape: (tape) => {
                    urls = tape;
                },
        
                switchLoop: (loopNr) => {
                    // curPlayer.autostart = true;
                    curPlayer.load(urls[loopNr]);
            
                    Fx.init();
                },
        
                play: () => {
                    curPlayer.start();
                },
        
                stop: () => {
                    curPlayer.stop();
                },
        
                addDist: (nr) => {
                    Fx.dist(nr);
                },

                changeSpeed: (value) => {
                    curPlayer.playbackRate = value;
                },
                changeVolume: (value) => {
                    curPlayer.volume.value = value;
                }
            }
        },
        recordAudio: () => {
            
        }
        
    }
}