import ChunkData from "../ChunkData"
import * as WorkerManager from "../WorkerManager"
import * as WorkerObligation from "../WorkerObligation"
import v3 from "v3"
import EngineChunkBuilder from "../engine/chunk/EngineChunkBuilder"

const TASK_TYPE_ID = "TaskDrawInternalVerts"

export default {
	id: TASK_TYPE_ID,
	queue(
		chunkData: ChunkData,
		initialVertexArrays: Array<Float32Array>,
		quadIdsByBlockAndSide: Uint16Array,
		onComplete: (quadCount: number, vertexArrays: Array<Float32Array>, quadIdsByBlockAndSide: Uint16Array) => void
	) {
		const taskId = WorkerManager.queueTask(
			TASK_TYPE_ID,
			() => {
				const requestPayload = {
					blockData: chunkData.blocks.buffer,
					quadIdsByBlockAndSide: quadIdsByBlockAndSide.buffer,
					initialVertexArrays: initialVertexArrays.map(a => a.buffer),
				}
				const transferableObjects = [
					chunkData.blocks.buffer,
					quadIdsByBlockAndSide.buffer,
					...(initialVertexArrays.map(a => a.buffer))
				]
				return { requestPayload, transferableObjects }
			},
			(responsePayload: WorkerManager.WorkerPayload) => {

				chunkData.blocks = new Uint8Array(responsePayload.blockData)
				onComplete(
					<number>responsePayload.quadCount,
					responsePayload.vertexArrays.map(buffer => new Float32Array(buffer)),
					new Uint16Array(responsePayload.quadIdsByBlockAndSide)
				)

			}
		)
		return taskId
	},
	work(requestPayload, responseCallback) {
		// get request
		const blockData: Uint8Array = new Uint8Array(requestPayload.blockData)
		const quadIdsByBlockAndSide: Uint16Array = new Uint16Array(requestPayload.quadIdsByBlockAndSide)
		const initialVertexArrays: Array<Float32Array> = requestPayload.initialVertexArrays.map(buffer => new Float32Array(buffer))

		// process request
		const { quadCount, vertexArrays } = EngineChunkBuilder.drawInternalChunkQuads(blockData, quadIdsByBlockAndSide, initialVertexArrays)

		// respond
		const responsePayload: WorkerObligation.WorkerPayload = {
			blockData: blockData.buffer,
			quadCount,
			vertexArrays: vertexArrays.map(arr => arr.buffer),
			quadIdsByBlockAndSide: quadIdsByBlockAndSide.buffer,
		}
		const transferableObjects: Array<any> = [
			blockData.buffer,
			quadIdsByBlockAndSide.buffer,
			...(vertexArrays.map(arr => arr.buffer)),
		]
		responseCallback(responsePayload, transferableObjects)
	},
}
