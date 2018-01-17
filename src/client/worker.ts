import * as WorkerObligation from "./WorkerObligation"
import v3 from "v3"
import ChunkGeneration from "ChunkGeneration"

WorkerObligation.registerTaskHandlers({
	"generateChunk": (requestPayload, responseCallback) => {
		// get request
		const chunkPosRaw: Array<number> = requestPayload.chunkPos
		const chunkPos = new v3(chunkPosRaw[0], chunkPosRaw[1], chunkPosRaw[2])
		const chunkBlockData: Uint8Array = new Uint8Array(requestPayload.chunkBlockDataBuffer)

		// process request
		ChunkGeneration.generateChunk(chunkPos, chunkBlockData)

		// respond
		const responsePayload: WorkerObligation.WorkerPayload = { "chunkBlockDataBuffer": chunkBlockData.buffer, "hello": "window" }
		const transferableObjects: Array<any> = [ chunkBlockData.buffer ]
//		console.log(responsePayload)
		responseCallback(responsePayload, transferableObjects)
	},
	"chunkPreBuild": (requestPayload, responseCallback) => {
		console.log(`TODO: worker chunkPreBuild`)
		responseCallback({}, [])
	}
})
