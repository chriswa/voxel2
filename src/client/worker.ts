import * as WorkerObligation from "./WorkerObligation"
import v3 from "v3"
import ChunkGeneration from "./ChunkGeneration"
import EngineChunkBuilder from "./engine/chunk/EngineChunkBuilder"

importScripts('//unpkg.com/lodash@4.17.4/lodash.js')

WorkerObligation.registerTaskHandlers({
	"w_generateChunk": (requestPayload, responseCallback) => {
		// get request
		const chunkPosRaw: Array<number> = requestPayload.chunkPos
		const chunkPos = new v3(chunkPosRaw[0], chunkPosRaw[1], chunkPosRaw[2])
		const blockData: Uint8Array = new Uint8Array(requestPayload.blockData)

		// process request
		ChunkGeneration.generateChunk(chunkPos, blockData)

		// respond
		const responsePayload: WorkerObligation.WorkerPayload = { blockData: blockData.buffer }
		const transferableObjects: Array<any> = [ blockData.buffer ]
		responseCallback(responsePayload, transferableObjects)
	},
	"w_chunkPreBuild": (requestPayload, responseCallback) => {
		// get request
		const blockData: Uint8Array = new Uint8Array(requestPayload.blockData)
		const quadIdsByBlockAndSide: Uint16Array = new Uint16Array(requestPayload.quadIdsByBlockAndSide)
		const initialVertexArrays: Array<Float32Array> = requestPayload.vertexArrays.map(buffer => new Float32Array(buffer))

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
	}
})
