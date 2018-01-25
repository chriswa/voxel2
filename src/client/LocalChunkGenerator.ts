import ChunkData from "./ChunkData"
import v3 from "v3"
import ChunkGeneration from "./ChunkGeneration"
import * as WorkerManager from "./WorkerManager"
import Config from "./Config"

export default class LocalChunkGenerator {

	chunksToGenerate: { [key: string]: v3 }

	constructor(private onChunkDataGenerated: (chunkData: ChunkData) => void) {
		this.chunksToGenerate = {}
	}
	queueChunkGeneration(chunkPos: v3) {
		const chunkId = chunkPos.toString()
		if (this.chunksToGenerate[chunkId]) { return } // already generating this chunk!
		this.chunksToGenerate[chunkId] = chunkPos
		this.generateChunk(chunkPos)
	}
	cancelChunkGeneration(chunkPos: v3) {
		const chunkId = chunkPos.toString()
		delete this.chunksToGenerate[chunkId]
	}
	generateChunk(chunkPos: v3) {
		const chunkData = ChunkData.pool.acquire() // n.b. chunkData may contain old data, so make sure to set everything!
		chunkData.setChunkPos(chunkPos)

		const chunkId = chunkPos.toString()

		if (<boolean>Config.chunkGenWorkers) {
			const workerTaskId = WorkerManager.queueTask(
				"w_generateChunk",
				() => {  // onStart
					//if (!this.chunksToGenerate[chunkId]) { return undefined } // if chunk generation was cancelled, stop now

					const requestPayload = {
						chunkPos: [chunkPos.a[0], chunkPos.a[1], chunkPos.a[2] ],
						blockData: chunkData.blocks.buffer,
					}
					const transferableObjects = [ chunkData.blocks.buffer ]
					return { requestPayload, transferableObjects }
				},
				(responsePayload: WorkerManager.WorkerPayload) => {
					//if (!this.chunksToGenerate[chunkId]) { return } // if chunk generation was cancelled, stop now
					chunkData.blocks = new Uint8Array(responsePayload.blockData)
					this.onChunkDataGenerated(chunkData)
					delete this.chunksToGenerate[chunkId]
				}
			)

		}
		else {
			ChunkGeneration.generateChunk(chunkPos, chunkData.blocks)
			this.onChunkDataGenerated(chunkData)
			delete this.chunksToGenerate[chunkId]
		}
	}
}
