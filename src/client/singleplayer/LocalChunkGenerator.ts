import ChunkData from "../ChunkData"
import v3 from "v3"
import ChunkGeneration from "./ChunkGeneration"
import * as WorkerManager from "../worker/WorkerManager"
import TaskGenerateAndMeshChunk from "../worker/TaskGenerateAndMeshChunk"
import DebugChunkLogger from "../DebugChunkLogger"
import DebugFrameLogger from "../DebugFrameLogger"
import LocalAuthority from "./LocalAuthority"

export default class LocalChunkGenerator {

	queue: { [key: string]: v3 }
	tasks: { [key: string]: number }

	constructor(private localAuthority: LocalAuthority) {
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
			TaskGenerateAndMeshChunk.cancel(taskId)
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
			break
		}
		if (chunkPos) {
			this.generateChunk(chunkPos)
		}
	}
	generateChunk(chunkPos: v3) {
		//DebugFrameLogger("LocalChunkGenerator.generateChunk")
		//DebugChunkLogger(chunkPos, "LocalChunkGenerator.generateChunk")

		const chunkId = chunkPos.toString()

		delete this.queue[chunkId]
		
		this.tasks[chunkId] = TaskGenerateAndMeshChunk.queue(
			chunkPos,
			(chunkData, quadCount, vertexArrays, quadIdsByBlockAndSide) => {
				this.localAuthority.onChunkDataGenerated(chunkData, quadCount, vertexArrays, quadIdsByBlockAndSide)
				delete this.tasks[chunkId]
			}
		)

	}
}
