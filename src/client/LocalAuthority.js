const geometrics = require("geometrics")
const Engine = require("./engine/Engine")
const VoxelsInMovingSphere = require("VoxelsInMovingSphere")
const LocalChunkGenerator = require("./LocalChunkGenerator")

const chunkLoadRadius = 2

module.exports = class LocalAuthority {
	constructor() {
		this.chunks = {}
		this.chunkGenerator = new LocalChunkGenerator(chunk => this.onChunkGenerated(chunk))
		this.engine = new Engine(this)
		this.playerPos = vec3.create()
		this.voxelsInMovingSphere = new VoxelsInMovingSphere(chunkLoadRadius)
		this.updatePlayerPos(vec3.fromValues(0, 0, 0)) // start chunks loading
	}
	render(time) {
		this.chunkGenerator.doSomeWork()
		this.engine.authRender(time)
	}

	updatePlayerPos(newPlayerPos) {
		vec3.copy(this.playerPos, newPlayerPos) // record new playerPos
		const chunkPos = geometrics.worldPosToChunkPos(newPlayerPos)
		const chunkChanges = this.voxelsInMovingSphere.update(chunkPos)
		chunkChanges.added.forEach(chunkPos => {
			this.chunkGenerator.queueChunkGeneration(chunkPos)
		})
		chunkChanges.removed.forEach(chunkPos => {
			const chunkId = chunkPos.join(",")
			console.log(`CHUNK CHANGES: ${chunkId} REMOVED`)
			const chunk = this.chunks[chunkId]
			if (chunk) { // if already loaded, unload it
				this.onChunkRemoved(chunk)
			}
			else { // otherwise, cancel the generation
				this.chunkGenerator.cancelChunkGeneration(chunkPos)
			}
		})
	}
	onChunkGenerated(chunk) { // called by chunkLoader
		this.chunks[chunk.id] = chunk
		this.engine.authAddChunk(chunk)
		// TODO: if engine isn't started yet, and enough (some? all?) chunks have been loaded, call engine.authStart()
	}
	onChunkRemoved(chunk) {
		delete this.chunks[chunk.id]
		this.engine.authRemoveChunk(chunk)
	}

	// "engine" functions are called by Engine to provide user interaction information

	engineUpdatePlayerPos(newPlayerPos) {
		this.updatePlayerPos(newPlayerPos)
	}
	enginePlaceBlockCreative(_blockType, _targetBlockPos, _targetBlockSide) { // e.g. for testing
	}
	engineDestroyBlockCreative(_targetBlockPos) { // e.g. for testing
	}
	engineUseItem(_itemInventorySlot, _buttonAndModifiers, _targetBlockPos, _targetBlockSide) { // e.g. place dirt block, open chest (right click with most items, including no-item)
	}
	engineBreakBlock(_blockPos, _percentBroken) { // should be called with 0 first, then finally 1 when the block is broken
	}
}
