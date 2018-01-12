import LocalAuthority from "./LocalAuthority"

// support browser gl debugging tool "Spector" capturing from very start of script execution
// http://www.realtimerendering.com/blog/debugging-webgl-with-spectorjs/
if (global.spector) {
	//spector.captureNextFrame(gl)
	global.spector.startCapture(gl, 10000) // max calls to capture
	setTimeout(() => {
		global.spector.stopCapture()
	}, 2000)
}

// TODO: fsm with menu... but for now, just start a local game
const authority = new LocalAuthority()

// main loop
function onFrame(time: number) {
	authority.onFrame(time)
	requestAnimationFrame(onFrame)
}
requestAnimationFrame(onFrame)



//import Worker = require("worker-loader!./Worker");
import Worker from "worker-loader!./Worker"
const worker = new Worker();
worker.postMessage({ a: 1 });
worker.addEventListener("message", (event) => { console.log("worker responded with: ", event) });
