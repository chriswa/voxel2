import * as geometrics from "geometrics"
import Engine from "./engine/Engine"
import VoxelsInMovingSphere from "VoxelsInMovingSphere"
import LocalChunkGenerator from "./LocalChunkGenerator"
import v3 from "v3"
import ChunkData from "./ChunkData"
import Config from "./Config"

const chunkLoadRadius = <number>Config.chunkRange

export default class LocalAuthority {

	chunks: { [key: string]: ChunkData }
	chunkGenerator: LocalChunkGenerator
	engine: Engine
	playerPos: v3
	playerRot: v3
	voxelsInMovingSphere: VoxelsInMovingSphere

	constructor() {
		this.chunks = {}
		this.chunkGenerator = new LocalChunkGenerator(chunkData => this.onChunkDataGenerated(chunkData))
		this.engine = new Engine(this)
		this.playerPos = new v3(0, 0, 0)
		this.playerRot = new v3(0, 0, 0)
		
		const storedPlayerTransformString: string = window.localStorage.getItem("playerTransform")
		if (storedPlayerTransformString) {
			const [x, y, z, pitch, heading, _roll ] = storedPlayerTransformString.split(",").map(parseFloat)
			this.playerPos.set(x, y, z)
			this.playerRot.set(pitch, heading, 0)
			this.engine.authSetPlayerTransform(this.playerPos, this.playerRot)
		}
		
		this.voxelsInMovingSphere = new VoxelsInMovingSphere(chunkLoadRadius)
		this.updatePlayerPos(this.playerPos, this.playerRot) // start chunks loading

		//this.loadChunk(new v3(0, -1, 1))
		//this.loadChunk(new v3(0, -1, 0))
		//this.loadChunk(new v3(1, -1, 0))
		//this.loadChunk(new v3(1, -1, 1))
		
		//for (let x = -1; x <= 4; x += 1) {
		//	for (let y = -1; y <= 1; y += 1) {
		//		for (let z = -1; z <= 4; z += 1) {
		//			this.loadChunk(new v3(x, y, z))
		//		}
		//	}
		//}
		//setTimeout(() => { this.loadChunk(new v3(1, 0, 0)) }, 1000)
		//setTimeout(() => { this.unloadChunk(this.chunks["1,0,0"]) }, 2000)
		//setTimeout(() => {
		//	for (let x = -2; x <= 2; x += 1) {
		//		for (let y = -2; y <= 2; y += 1) {
		//			for (let z = -2; z <= 2; z += 1) {
		//				this.unloadChunk(new v3(x, y, z))
		//			}
		//		}
		//	}
		//}, 10000)
	}
	onFrame(time: number) {
		this.engine.authOnFrame(time)
	}

	updatePlayerPos(newPlayerPos: v3, newPlayerRot: v3) {
		
		// TESTING: store current values for reloading the page and staying in the same place
		if (<boolean>Config.rememberPlayerTransform) {
			window.localStorage.setItem("playerTransform", newPlayerPos.toString() + ',' + newPlayerRot.toString())
		}

		// record new vectors
		this.playerPos.setFrom(newPlayerPos)
		this.playerRot.setFrom(newPlayerRot)

		if (<boolean>Config["chunkLoading"]) {

			// load and unload chunks as needed
			const chunkPos = geometrics.worldPosToChunkPos(newPlayerPos)
			this.voxelsInMovingSphere.update(chunkPos)
			if (this.voxelsInMovingSphere.added.length) {
				console.log(`%cLocalAuthority: new chunk center is ${chunkPos.id}`, 'color: teal;')
			}
			this.voxelsInMovingSphere.added.forEach(chunkPos => {
				this.loadChunk(chunkPos)
			})
			this.voxelsInMovingSphere.removed.forEach(chunkPos => {
				this.unloadChunk(chunkPos)
			})

		}
	}

	loadChunk(chunkPos: v3) {
		this.chunkGenerator.queueChunkGeneration(chunkPos) // this will call this.onChunkDataGenerated asyncronously
	}
	unloadChunk(chunkPos: v3) {
		const chunkId = chunkPos.toString()
		const chunk = this.chunks[chunkId]
		if (chunk) { this.onChunkRemoved(chunk) }                    // if already loaded, unload it
		else { this.chunkGenerator.cancelChunkGeneration(chunkPos) } // otherwise, cancel its queued generation
	}
	onChunkDataGenerated(chunkData: ChunkData) {
		//console.log(`add chunk ${chunkData.id}`)
		this.chunks[chunkData.id] = chunkData
		this.engine.authAddChunkData(chunkData)
		// TODO: if engine isn't started yet, and enough (some? all?) chunks have been loaded, start it with engine.authStart()
	}
	onChunkRemoved(chunkData: ChunkData) {
		delete this.chunks[chunkData.id]
		this.engine.authRemoveChunkData(chunkData)
	}

	// "engine" functions are called by Engine to provide user interaction information

	engineUpdatePlayerPos(newPlayerPos: v3, newPlayerRot: v3) {
		this.updatePlayerPos(newPlayerPos, newPlayerRot)
	}
	//enginePlaceBlockCreative(_blockType, _targetBlockPos, _targetBlockSide) { // e.g. for testing
	//}
	//engineDestroyBlockCreative(_targetBlockPos) { // e.g. for testing
	//}
	//engineUseItem(_itemInventorySlot, _buttonAndModifiers, _targetBlockPos, _targetBlockSide) { // e.g. place dirt block, open chest (right click with most items, including no-item)
	//}
	//engineBreakBlock(_blockPos, _percentBroken) { // should be called with 0 first, then finally 1 when the block is broken
	//}
}
