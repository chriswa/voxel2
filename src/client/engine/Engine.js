//const twgl = require("twgl.js")
const geometrics = require("geometrics")
const EngineChunk = require("./EngineChunk")
const EngineChunkRenderer = require("./EngineChunkRenderer")
const EngineChunkBuilder = require("./EngineChunkBuilder")
const Pool = require("Pool")

const quadIdsByBlockAndSidePool = new Pool(() => new Uint16Array(geometrics.CHUNK_SIZE_CUBED * geometrics.facesPerCube))

module.exports = class Engine {
	constructor(authority) {
		this.authority = authority
		this.started = false
		this.playerPos = vec3.fromValues(0, 0, 0) // placeholder value until authority updates us
		this.chunks = {}
	}


	// "auth" methods are called by authority
	authSetPlayerPos(newPos) {
		vec3.copy(this.playerPos, newPos)
	}
	authAddChunkData(chunkData) {
		// TODO: pass chunkData to webworker, when it's finished, get back chunkData, 0+ vertex buffers, and quadCount: use those to pre-build an EngineChunk, then "stitch" it to neighbouring chunks
		// ...but for now
		const quadIdsByBlockAndSide = quadIdsByBlockAndSidePool.acquire()
		const { quadCount, vertexArrays } = EngineChunkBuilder.drawInternalChunkQuads(chunkData, quadIdsByBlockAndSide)
		const chunk = new EngineChunk(chunkData, quadCount, vertexArrays, quadIdsByBlockAndSide)
		this.chunks[chunkData.id] = chunk
	}
	authRemoveChunkData(chunkData) {
		const chunk = this.chunks[chunkData.id]
		quadIdsByBlockAndSidePool.release(chunk.quadIdsByBlockAndSide)
		chunk.destroy()
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
	authRender(_time) {
		// TODO: if started, do player control including gravity, and send current position to this.authority.simUpdatePlayerPos()
		// TODO: also call any other this.authority.sim* methods depending on player input

		// TESTING
		//vec3.add(this.playerPos, this.playerPos, [0.1, 0, 0])
		//this.authority.engineUpdatePlayerPos(this.playerPos)

		//const Gfx = require("../Gfx")
		//Gfx.render(time)

		EngineChunkRenderer.preRender()

		let renderBudget = 1000 // TODO: this is a totally arbitrary number
		_.each(this.chunks, chunk => {
			renderBudget = chunk.render(renderBudget)
		})
	}
}