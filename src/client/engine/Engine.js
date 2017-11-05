const vec3 = require("gl-matrix/src/gl-matrix/vec3")
const Gfx = require("../Gfx")

module.exports = class Engine {
	constructor(authority) {
		this.authority = authority
		this.started = false
		this.playerPos = vec3.fromValues(0, 0, 0) // placeholder value until authority updates us
	}

	// "auth" methods are called by authority
	authSetPlayerPos(newPos) {
		vec3.copy(this.playerPos, newPos)
	}
	authAddChunk(chunk) {
		console.log("add chunk: ", chunk)
		// TODO: send voxelData to a webworker to be turned into vertex data
	}
	authRemoveChunk(chunk) {
		console.log("remove chunk: ", chunk)
	}
	authAddEntity() {
	}
	authRemoveEntity() {
	}
	authUpdateInventory() { // ?
	}
	authStart() {
		this.started = true
	}
	authRender(time) {
		// TODO: if started, do player control including gravity, and send current position to this.authority.simUpdatePlayerPos()
		// TODO: also call any other this.authority.sim* methods depending on player input

		// TESTING
		//vec3.add(this.playerPos, this.playerPos, [0.1, 0, 0])
		//this.authority.engineUpdatePlayerPos(this.playerPos)

		Gfx.render(time)
	}
}