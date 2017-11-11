const twgl = require("twgl.js")
const geometrics = require("geometrics")
const EngineChunk = require("./EngineChunk")
const EngineChunkRenderer = require("./EngineChunkRenderer")

module.exports = class Engine {
	constructor(authority) {
		this.authority = authority
		this.started = false
		this.playerPos = vec3.fromValues(0, 0, 0) // placeholder value until authority updates us
		this.chunks = {}
		this.chunkRenderer = new EngineChunkRenderer()
	}

	// "auth" methods are called by authority
	authSetPlayerPos(newPos) {
		vec3.copy(this.playerPos, newPos)
	}
	authAddChunkData(chunkData) {
		// TODO: pass chunkData to webworker, when it's finished, get back chunkData, 0+ vertex buffers, and quadCount: use those to pre-build an EngineChunk, then "stitch" it to neighbouring chunks

		// ...but for now
		const { vertexBuffers, quadCount } = VoxelMesher.drawInternalChunkQuads(chunkData)
		const engineChunk = new EngineChunk(this, chunkData, vertexBuffers, quadCount)
		this.chunks[chunkData.id] = engineChunk

	}
	authRemoveChunkData(_chunkData) {
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

		//const Gfx = require("../Gfx")
		//Gfx.render(time)

		this.chunkRenderer.preRender()

		let renderBudget = 100 // ??????
		_.each(this.chunks, chunk => {
			renderBudget = chunk.render(renderBudget)
		})
	}
}