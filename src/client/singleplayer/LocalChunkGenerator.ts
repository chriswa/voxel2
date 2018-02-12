import ChunkData from "../ChunkData"
import v3 from "v3"
import ChunkGeneration from "./ChunkGeneration"
import * as WorkerManager from "../worker/WorkerManager"
import Config from "../Config"
import TaskGenerateChunk from "../worker/TaskGenerateChunk"
import DebugChunkLogger from "../DebugChunkLogger"
import DebugFrameLogger from "../DebugFrameLogger"

export default class LocalChunkGenerator {

	queue: { [key: string]: v3 }
	tasks: { [key: string]: number }

	constructor(private onChunkDataGenerated: (chunkData: ChunkData) => void) {
		this.queue = {}
		this.tasks = {}
	}
	queueChunkGeneration(chunkPos: v3) {
		//DebugChunkLogger(chunkPos, "LocalChunkGenerator.queueChunkGeneration")
		const chunkId = chunkPos.toString()
		if (this.queue[chunkId] || this.tasks[chunkId]) { return } // already generating this chunk!
		this.queue[chunkId] = chunkPos.clone()
	}
	cancelChunkGeneration(chunkPos: v3) {
		//DebugChunkLogger(chunkPos, "LocalChunkGenerator.cancelChunkGeneration")
		const chunkId = chunkPos.toString()
		const taskId = this.tasks[chunkId]
		if (taskId) {
			TaskGenerateChunk.cancel(taskId)
			delete this.tasks[chunkId]
		}
		else if (this.queue[chunkId]) {
			delete this.queue[chunkId]
		}
	}
	onFrame() {
		let chunkPos
		for (var chunkId in this.queue) { // NOT A LOOP!
			chunkPos = this.queue[chunkId]
			this.generateChunk(chunkPos)
			break
		}
	}
	generateChunk(chunkPos: v3) {
		//DebugFrameLogger("LocalChunkGenerator.generateChunk")
		//DebugChunkLogger(chunkPos, "LocalChunkGenerator.generateChunk")

		const chunkId = chunkPos.toString()

		if (<boolean>Config.chunkGenWorkers) {
			delete this.queue[chunkId]
			
			this.tasks[chunkId] = TaskGenerateChunk.queue(
				chunkPos,
				(chunkData) => {
					this.onChunkDataGenerated(chunkData)
					delete this.tasks[chunkId]
				}
			)


		}
		else {
			const chunkData = ChunkData.pool.acquire() // n.b. chunkData may contain old data, so make sure to set everything!
			chunkData.setChunkPos(chunkPos)
			ChunkGeneration.generateChunk(chunkPos, chunkData.blocks)
			this.onChunkDataGenerated(chunkData)
			delete this.queue[chunkId]
		}
	}
}
