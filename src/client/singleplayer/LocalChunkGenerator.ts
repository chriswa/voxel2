import ChunkData from "../ChunkData"
import v3 from "v3"
import ChunkGeneration from "./ChunkGeneration"
import * as WorkerManager from "../worker/WorkerManager"
import Config from "../Config"
import TaskGenerateChunk from "../worker/TaskGenerateChunk"
import DebugChunkLogger from "../DebugChunkLogger"

export default class LocalChunkGenerator {

	chunksToGenerate: { [key: string]: number }

	constructor(private onChunkDataGenerated: (chunkData: ChunkData) => void) {
		this.chunksToGenerate = {}
	}
	queueChunkGeneration(chunkPos: v3) {
		DebugChunkLogger(chunkPos, "LocalChunkGenerator.queueChunkGeneration")
		const chunkId = chunkPos.toString()
		if (this.chunksToGenerate[chunkId]) { return } // already generating this chunk!
		this.chunksToGenerate[chunkId] = -1 // it's in the queue
		this.generateChunk(chunkPos)
	}
	cancelChunkGeneration(chunkPos: v3) {
		DebugChunkLogger(chunkPos, "LocalChunkGenerator.cancelChunkGeneration")
		const chunkId = chunkPos.toString()
		const taskId = this.chunksToGenerate[chunkId]
		if (taskId > 0) {
			TaskGenerateChunk.cancel(taskId)
		}
		delete this.chunksToGenerate[chunkId]
	}
	generateChunk(chunkPos: v3) {
		DebugChunkLogger(chunkPos, "LocalChunkGenerator.generateChunk")
		const chunkData = ChunkData.pool.acquire() // n.b. chunkData may contain old data, so make sure to set everything!
		chunkData.setChunkPos(chunkPos)

		const chunkId = chunkPos.toString()

		if (<boolean>Config.chunkGenWorkers) {
			
			this.chunksToGenerate[chunkId] = TaskGenerateChunk.queue(
				chunkPos, chunkData,
				() => {
					this.onChunkDataGenerated(chunkData)
					delete this.chunksToGenerate[chunkId]
				},
				() => {
					ChunkData.pool.release(chunkData)
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
