const LocalAuthority = require("./LocalAuthority")

// TODO: fsm with menu... but for now, just start a local game
const authority = new LocalAuthority()

function render(time) {
	authority.render(time)
	requestAnimationFrame(render)
}
requestAnimationFrame(render)
