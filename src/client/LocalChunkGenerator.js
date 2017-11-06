const { CHUNK_SIZE } = require("geometrics")
const ChunkData = require("./ChunkData")

class LocalChunkGenerator {
	constructor(onChunkDataGenerated) {
		this.onChunkDataGenerated = onChunkDataGenerated
		this.chunksToGenerate = {}
	}
	queueChunkGeneration(chunkPos) {
		const chunkId = chunkPos.join(",")
		this.chunksToGenerate[chunkId] = chunkPos
	}
	cancelChunkGeneration(chunkPos) {
		const chunkId = chunkPos.join(",")
		delete this.chunksToGenerate[chunkId]
	}
	work() {
		for (let chunkId in this.chunksToGenerate) {
			const chunkPos = this.chunksToGenerate[chunkId]
			delete(this.chunksToGenerate[chunkId])
			this.generateChunk(chunkPos)
			break // only process one key!
		}
	}
	generateChunk(chunkPos) {

		/** @type {ChunkData} */
		const chunkData = ChunkData.pool.acquire() // n.b. chunkData may contain old data, so make sure to set everything!
		chunkData.setChunkPos(chunkPos)

		// SAMPLE TERRAIN GENERATION

		let blockIndex = 0
		for (let x = 0; x < CHUNK_SIZE; x += 1) {
			for (let z = 0; z < CHUNK_SIZE; z += 1) {
				const terrainHeight = Math.floor(CHUNK_SIZE / 2 + Math.random() * 3 - 1)
				for (let y = 0; y < CHUNK_SIZE; y += 1) {
					const blockData = (y + chunkPos[1] * CHUNK_SIZE < terrainHeight) ? 1 : 0
					chunkData.blocks[blockIndex] = blockData
					blockIndex += 1
				}
			}
		}

		this.onChunkDataGenerated(chunkData)
	}
}

module.exports = LocalChunkGenerator
