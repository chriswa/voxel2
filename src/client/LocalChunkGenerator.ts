import ChunkData from "./ChunkData"
import v3 from "v3"
import ChunkGeneration from "./ChunkGeneration"
import * as WorkerManager from "./WorkerManager"
import config from "./config"

const useWorkers = <boolean>config.chunkGenWorkers

export default class LocalChunkGenerator {

	chunksToGenerate: { [key: string]: v3 }

	constructor(private onChunkDataGenerated: (chunkData: ChunkData) => void) {
		this.chunksToGenerate = {}
	}
	queueChunkGeneration(chunkPos: v3) {
		const chunkId = chunkPos.toString()
		this.chunksToGenerate[chunkId] = chunkPos
	}
	cancelChunkGeneration(chunkPos: v3) {
		const chunkId = chunkPos.toString()
		delete this.chunksToGenerate[chunkId]
	}
	work() {
		let firstChunkId
		for (let chunkId in this.chunksToGenerate) {
			firstChunkId = chunkId
			break
		}
		if (firstChunkId) {
			const chunkPos = this.chunksToGenerate[firstChunkId]
			delete this.chunksToGenerate[firstChunkId]
			this.generateChunk(chunkPos)
		}
	}
	generateChunk(chunkPos: v3) {
		const chunkData = ChunkData.pool.acquire() // n.b. chunkData may contain old data, so make sure to set everything!
		chunkData.setChunkPos(chunkPos)

		if (useWorkers) {
			const workerTaskId = WorkerManager.queueTask(
				"generateChunk",
				() => {  // onStart
					const requestPayload = {
						chunkPos: [chunkPos.a[0], chunkPos.a[1], chunkPos.a[2] ],
						chunkBlockDataBuffer: chunkData.blocks.buffer,
					}
					const transferableObjects = [ chunkData.blocks.buffer ]
					return { requestPayload, transferableObjects }
				},
				(responsePayload: WorkerManager.WorkerPayload) => {
					chunkData.blocks = new Uint8Array(responsePayload.chunkBlockDataBuffer)
					this.onChunkDataGenerated(chunkData)
				}
			)

		}
		else {
			ChunkGeneration.generateChunk(chunkPos, chunkData.blocks)
			this.onChunkDataGenerated(chunkData)
		}
	}
}
