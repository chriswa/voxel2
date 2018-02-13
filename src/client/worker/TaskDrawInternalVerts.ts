import ChunkData from "../ChunkData"
import * as WorkerManager from "./WorkerManager"
import * as WorkerObligation from "./WorkerObligation"
import * as geometrics from "geometrics"
import v3 from "v3"
import EngineChunkBuilder from "../engine/chunk/EngineChunkBuilder"
import EngineChunkVertexArrayPool from "../engine/chunk/EngineChunkVertexArrayPool"
import Pool from "Pool"

const TASK_TYPE_ID = "TaskDrawInternalVerts"

export default {
	id: TASK_TYPE_ID,
	cancel(taskId: number) {
		WorkerManager.cancelTask(taskId)
	},
	queue(
		chunkData: ChunkData,
		quadIdsByBlockAndSidePool: Pool<Uint16Array>,
		onComplete: (quadCount: number, vertexArrays: Array<geometrics.VertexArrayType>, quadIdsByBlockAndSide: Uint16Array) => void
	) {
		const taskId = WorkerManager.queueTask(
			TASK_TYPE_ID,
			() => {

				const quadIdsByBlockAndSide = quadIdsByBlockAndSidePool.acquire()
				const initialVertexArrays = [ EngineChunkVertexArrayPool.acquire() ]

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
			(completePayload: WorkerManager.WorkerPayload) => {

				chunkData.blocks = new Uint8Array(completePayload.blockData)

				const unusedVertexArrays = completePayload.unusedVertexArrays.map(buffer => new Int32Array(buffer))
				unusedVertexArrays.forEach(vertexArray => {
					EngineChunkVertexArrayPool.release(vertexArray)
				})

				onComplete(
					<number>completePayload.quadCount,
					completePayload.vertexArrays.map(buffer => new Int32Array(buffer)),
					new Uint16Array(completePayload.quadIdsByBlockAndSide)
				)

			},
			(cancelledPayload: WorkerManager.WorkerPayload) => {
				chunkData.blocks = new Uint8Array(cancelledPayload.blockData)
				ChunkData.pool.release(chunkData) // the only reason this task is cancelled is if we're unloading the chunk

				const cancelledQuadIdsByBlockAndSide = new Uint16Array(cancelledPayload.quadIdsByBlockAndSide)
				const unusedVertexArrays = cancelledPayload.unusedVertexArrays.map(buffer => new Int32Array(buffer))
				unusedVertexArrays.forEach(vertexArray => {
					EngineChunkVertexArrayPool.release(vertexArray)
				})
				const vertexArrays = cancelledPayload.vertexArrays.map(buffer => new Int32Array(buffer))
				vertexArrays.forEach(vertexArray => {
					EngineChunkVertexArrayPool.release(vertexArray)
				})
				quadIdsByBlockAndSidePool.release(cancelledQuadIdsByBlockAndSide)
			}
		)
		return taskId
	},
	work(requestPayload, responseCallback) {
		// get request
		const blockData: Uint8Array = new Uint8Array(requestPayload.blockData)
		const quadIdsByBlockAndSide: Uint16Array = new Uint16Array(requestPayload.quadIdsByBlockAndSide)
		const initialVertexArrays: Array<geometrics.VertexArrayType> = requestPayload.initialVertexArrays.map(buffer => new Int32Array(buffer))

		// process request
		quadIdsByBlockAndSide.fill(0)
		const { quadCount, vertexArrays, unusedVertexArrays } = EngineChunkBuilder.drawInternalChunkQuads(blockData, quadIdsByBlockAndSide, initialVertexArrays)

		// respond
		const responsePayload: WorkerObligation.WorkerPayload = {
			blockData: blockData.buffer,
			quadCount,
			vertexArrays: vertexArrays.map(arr => arr.buffer),
			quadIdsByBlockAndSide: quadIdsByBlockAndSide.buffer,
			unusedVertexArrays: unusedVertexArrays.map(arr => arr.buffer),
		}
		const transferableObjects: Array<any> = [
			blockData.buffer,
			quadIdsByBlockAndSide.buffer,
			...(vertexArrays.map(arr => arr.buffer)),
			...(unusedVertexArrays.map(arr => arr.buffer)),
		]
		responseCallback(responsePayload, transferableObjects)
	},
}
