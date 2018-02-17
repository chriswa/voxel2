import * as geometrics from "geometrics"
import Engine from "../engine/Engine"
import VoxelsInMovingSphere from "VoxelsInMovingSphere"
import LocalChunkGenerator from "./LocalChunkGenerator"
import v3 from "v3"
import ChunkData from "../ChunkData"
import Config from "../Config"
import DebugChunkLogger from "../DebugChunkLogger"
import DebugHud from "../engine/DebugHud"

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
		this.chunkGenerator = new LocalChunkGenerator(this)
		this.engine = new Engine(this)
		this.playerPos = new v3(0, 0, 0)
		this.playerRot = new v3(0, 0, 0)
		
		//const storedPlayerTransformString: string = window.localStorage.getItem("playerTransform")
		//if (storedPlayerTransformString) {
		//	const [x, y, z, pitch, heading, _roll ] = storedPlayerTransformString.split(",").map(parseFloat)
		//	this.playerPos.set(x, y, z)
		//	this.playerRot.set(pitch, heading, 0)
		//	this.engine.authSetPlayerTransform(this.playerPos, this.playerRot)
		//}
		
		this.voxelsInMovingSphere = new VoxelsInMovingSphere(chunkLoadRadius)
		this.updatePlayerPos(this.playerPos, this.playerRot) // start chunks loading
	}
	onFrame(time: number) {
		this.chunkGenerator.onFrame()
		this.engine.authOnFrame(time)
		DebugHud.updateChunks(Object.keys(this.chunks).length)
	}

	updatePlayerPos(newPlayerPos: v3, newPlayerRot: v3) {
		
		// TESTING: store current values for reloading the page and staying in the same place
		//if (<boolean>Config.rememberPlayerTransform) {
		//	window.localStorage.setItem("playerTransform", newPlayerPos.toString() + ',' + newPlayerRot.toString())
		//}

		// record new vectors
		this.playerPos.setFrom(newPlayerPos)
		this.playerRot.setFrom(newPlayerRot)

		if (<boolean>Config["chunkLoading"]) {

			// load and unload chunks as needed
			const chunkPos = geometrics.worldPosToChunkPos(newPlayerPos)
			this.voxelsInMovingSphere.update(
				chunkPos,
				(chunkPos) => {
					this.loadChunk(chunkPos)
				},
				(chunkPos) => {
					this.unloadChunk(chunkPos)
				}
			)
		}
	}

	loadChunk(chunkPos: v3) {
		//DebugChunkLogger(chunkPos, "LocalAuthority.loadChunk")
		this.chunkGenerator.queueChunkGeneration(chunkPos) // this will call this.onChunkDataGenerated asynchronously
	}
	unloadChunk(chunkPos: v3) {
		//DebugChunkLogger(chunkPos, "LocalAuthority.unloadChunk")
		const chunkId = chunkPos.toString()
		const chunk = this.chunks[chunkId]
		if (chunk) { this.onChunkRemoved(chunk) }                    // if already loaded, unload it
		else { this.chunkGenerator.cancelChunkGeneration(chunkPos) } // otherwise, cancel its queued generation
	}
	onChunkDataGenerated(chunkData: ChunkData, quadCount: number, vertexArrays: Array<geometrics.VertexArrayType>, quadIdsByBlockAndSide: Uint16Array) {
		//DebugChunkLogger(chunkData.pos, "LocalAuthority.onChunkDataGenerated")
		//console.log(`add chunk ${chunkData.id}`)
		this.chunks[chunkData.id] = chunkData
		this.engine.authAddChunkData(chunkData, quadCount, vertexArrays, quadIdsByBlockAndSide)
		// TODO: if engine isn't started yet, and enough (some? all?) chunks have been loaded, start it with engine.authStart()
	}
	onChunkRemoved(chunkData: ChunkData) {
		//DebugChunkLogger(chunkData.pos, "LocalAuthority.onChunkRemoved")
		delete this.chunks[chunkData.id]
		this.engine.authRemoveChunkData(chunkData)
		ChunkData.pool.release(chunkData)
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
