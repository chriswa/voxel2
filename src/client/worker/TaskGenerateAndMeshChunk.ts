import v3 from "v3"
import ChunkData from "../ChunkData"
import * as WorkerManager from "./WorkerManager"
import * as WorkerObligation from "./WorkerObligation"
import * as ChunkGeneration from "../singleplayer/ChunkGeneration"
import * as geometrics from "geometrics"
import EngineChunkBuilder from "../engine/chunk/EngineChunkBuilder"
import EngineChunkVertexArrayPool from "../engine/chunk/EngineChunkVertexArrayPool"
import EngineChunkQuadLookupPool from "../engine/chunk/EngineChunkQuadLookupPool"
import Pool from "Pool"

const TASK_TYPE_ID = "TaskGenerateAndMeshChunk"

export default {
	id: TASK_TYPE_ID,
	cancel(taskId: number) {
		WorkerManager.cancelTask(taskId)
	},
	queue(chunkPos: v3, onComplete: (chunkData: ChunkData, quadCount: number, vertexArrays: Array<geometrics.VertexArrayType>, quadIdsByBlockAndSide: Uint16Array) => void) {
		const chunkId = chunkPos.toString()
		let chunkData

		const taskId = WorkerManager.queueTask(
			TASK_TYPE_ID,
			() => {
				// this allocation is deferred until the task starts, because the onCancelled handler (below) doesn't get called if the task is cancelled before it starts)
				chunkData = ChunkData.pool.acquire() // n.b. chunkData may contain old data, so make sure to set everything!
				chunkData.setChunkPos(chunkPos)

				const quadIdsByBlockAndSide = EngineChunkQuadLookupPool.acquire()
				const initialVertexArrays = [EngineChunkVertexArrayPool.acquire()]

				const requestPayload = {
					chunkPos: [chunkPos.a[0], chunkPos.a[1], chunkPos.a[2]],
					blockData: chunkData.blocks.buffer,
					quadIdsByBlockAndSide: quadIdsByBlockAndSide.buffer,
					initialVertexArrays: initialVertexArrays.map(a => a.buffer),
				}
				const transferableObjects = [
					chunkData.blocks.buffer,
					quadIdsByBlockAndSide.buffer,
					...(initialVertexArrays.map(a => a.buffer)),
				]
				return { requestPayload, transferableObjects }
			},
			(completePayload: WorkerManager.WorkerPayload) => {
				chunkData.blocks = new Uint8Array(completePayload.blockData)

				const unusedVertexArrays = completePayload.unusedVertexArrays.map(buffer => new Uint32Array(buffer))
				unusedVertexArrays.forEach(vertexArray => {
					EngineChunkVertexArrayPool.release(vertexArray)
				})

				const quadCount = <number>completePayload.quadCount
				const vertexArrays = completePayload.vertexArrays.map(buffer => new Uint32Array(buffer))
				const quadIdsByBlockAndSide = new Uint16Array(completePayload.quadIdsByBlockAndSide)

				onComplete(chunkData, quadCount, vertexArrays, quadIdsByBlockAndSide)
			},
			(cancelledPayload: WorkerManager.WorkerPayload) => {
				chunkData.blocks = new Uint8Array(cancelledPayload.blockData)
				ChunkData.pool.release(chunkData)

				const cancelledQuadIdsByBlockAndSide = new Uint16Array(cancelledPayload.quadIdsByBlockAndSide)
				EngineChunkQuadLookupPool.release(cancelledQuadIdsByBlockAndSide)

				const unusedVertexArrays = cancelledPayload.unusedVertexArrays.map(buffer => new Uint32Array(buffer))
				unusedVertexArrays.forEach(vertexArray => {
					EngineChunkVertexArrayPool.release(vertexArray)
				})

				const vertexArrays = cancelledPayload.vertexArrays.map(buffer => new Uint32Array(buffer))
				vertexArrays.forEach(vertexArray => {
					EngineChunkVertexArrayPool.release(vertexArray)
				})
			}
		)
		return taskId
	},
	work(requestPayload, responseCallback) {
		// get request
		const chunkPosRaw: Array<number> = requestPayload.chunkPos
		const chunkPos = new v3(chunkPosRaw[0], chunkPosRaw[1], chunkPosRaw[2])
		const blockData: Uint8Array = new Uint8Array(requestPayload.blockData)
		const quadIdsByBlockAndSide: Uint16Array = new Uint16Array(requestPayload.quadIdsByBlockAndSide)
		const initialVertexArrays: Array<geometrics.VertexArrayType> = requestPayload.initialVertexArrays.map(buffer => new Uint32Array(buffer))

		// process request
		ChunkGeneration.generateChunk(chunkPos, blockData)
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
