import v3 from "v3"
import ChunkData from "../ChunkData"
import * as WorkerManager from "./WorkerManager"
import * as WorkerObligation from "./WorkerObligation"
import ChunkGeneration from "../singleplayer/ChunkGeneration"

const TASK_TYPE_ID = "TaskGenerateChunk"

export default {
	id: TASK_TYPE_ID,
	cancel(taskId: number) {
		WorkerManager.cancelTask(taskId)
	},
	queue(chunkPos: v3, chunkData: ChunkData, onComplete: () => void, onCancelled: () => void) {
		const chunkId = chunkPos.toString()
		const taskId = WorkerManager.queueTask(
			TASK_TYPE_ID,
			() => {
				//if (!this.chunksToGenerate[chunkId]) { console.log(`cancelled!`); return undefined } // if chunk generation was cancelled, stop now
				const requestPayload = {
					chunkPos: [chunkPos.a[0], chunkPos.a[1], chunkPos.a[2]],
					blockData: chunkData.blocks.buffer,
				}
				const transferableObjects = [
					chunkData.blocks.buffer,
				]
				return { requestPayload, transferableObjects }
			},
			(completePayload: WorkerManager.WorkerPayload) => {
				//if (!this.chunksToGenerate[chunkId]) { console.log(`cancelled!`); return } // if chunk generation was cancelled, stop now
				chunkData.blocks = new Uint8Array(completePayload.blockData)
				onComplete()
			},
			(cancelledPayload: WorkerManager.WorkerPayload) => {
				chunkData.blocks = new Uint8Array(cancelledPayload.blockData)
				onCancelled()
			}
		)
		return taskId
	},
	work(requestPayload, responseCallback) {
		// get request
		const chunkPosRaw: Array<number> = requestPayload.chunkPos
		const chunkPos = new v3(chunkPosRaw[0], chunkPosRaw[1], chunkPosRaw[2])
		const blockData: Uint8Array = new Uint8Array(requestPayload.blockData)

		// process request
		ChunkGeneration.generateChunk(chunkPos, blockData)

		// respond
		const responsePayload: WorkerObligation.WorkerPayload = { blockData: blockData.buffer }
		const transferableObjects: Array<any> = [blockData.buffer]
		responseCallback(responsePayload, transferableObjects)
	},
}
