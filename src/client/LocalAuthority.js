const geometrics = require("geometrics")
const Engine = require("./engine/Engine")
const VoxelsInMovingSphere = require("VoxelsInMovingSphere")
const LocalChunkGenerator = require("./LocalChunkGenerator")
const v3 = require("v3")

const chunkLoadRadius = 1

module.exports = class LocalAuthority {
	constructor() {
		this.chunks = {}
		this.chunkGenerator = new LocalChunkGenerator(chunkData => this.onChunkDataGenerated(chunkData))
		this.engine = new Engine(this)
		this.playerPos = new v3(0, 0, 0)
		this.playerRot = new v3(0, 0, 0)
		
		if (window.localStorage.playerTransform) {
			const [x, y, z, pitch, heading, _roll ] = window.localStorage.playerTransform.split(",").map(parseFloat)
			this.playerPos.set(x, y, z)
			this.playerRot.set(pitch, heading, 0)
			this.engine.authSetPlayerTransform(this.playerPos, this.playerRot)
		}
		
		this.voxelsInMovingSphere = new VoxelsInMovingSphere(chunkLoadRadius)
		this.updatePlayerPos(this.playerPos, this.playerRot) // start chunks loading
	}
	onFrame(time) {
		this.chunkGenerator.work()
		this.engine.authOnFrame(time)
	}

	updatePlayerPos(newPlayerPos, newPlayerRot) {
		
		// TESTING: store current values for reloading the page and staying in the same place
		window.localStorage.playerTransform = newPlayerPos.toString() + ',' + newPlayerRot.toString()

		// record new vectors
		this.playerPos.setFrom(newPlayerPos)
		this.playerRot.setFrom(newPlayerRot)

		// load and unload chunks as needed
		const chunkPos = geometrics.worldPosToChunkPos(newPlayerPos)
		const chunkChanges = this.voxelsInMovingSphere.update(chunkPos)
		chunkChanges.added.forEach(chunkPos => {
			this.chunkGenerator.queueChunkGeneration(chunkPos)
		})
		chunkChanges.removed.forEach(chunkPos => {
			const chunkId = chunkPos.toString()
			const chunk = this.chunks[chunkId]
			if (chunk) { this.onChunkRemoved(chunk) }                          // if already loaded, unload it
			else       { this.chunkGenerator.cancelChunkGeneration(chunkPos) } // otherwise, cancel its queued generation
		})
	}
	onChunkDataGenerated(chunkData) {
		this.chunks[chunkData.id] = chunkData
		this.engine.authAddChunkData(chunkData)
		// TODO: if engine isn't started yet, and enough (some? all?) chunks have been loaded, start it with engine.authStart()
	}
	onChunkRemoved(chunkData) {
		delete this.chunks[chunkData.id]
		this.engine.authRemoveChunkData(chunkData)
	}

	// "engine" functions are called by Engine to provide user interaction information

	engineUpdatePlayerPos(newPlayerPos, newPlayerRot) {
		this.updatePlayerPos(newPlayerPos, newPlayerRot)
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
