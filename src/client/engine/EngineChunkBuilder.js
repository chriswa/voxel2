const EngineChunkVertexArrayPool = require("./EngineChunkVertexArrayPool")

const EngineChunkBuilder = {
	drawInternalChunkQuads(chunkData, quadIdsByBlockAndSide) {
		let quadCount = 0
		const vertexArrays = []

		// e.g.
		vertexArrays.push(EngineChunkVertexArrayPool.acquire())
		quadIdsByBlockAndSide[0] = 1

		return { quadCount, vertexArrays }
	}
}

module.exports = EngineChunkBuilder
