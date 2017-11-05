const { CHUNK_SIZE, CHUNK_SIZE_CUBED } = require("geometrics")
const Chunk = require("./Chunk")

class LocalChunkGenerator {
	constructor(onChunkGenerated) {
		this.onChunkGenerated = onChunkGenerated
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
	doSomeWork() {
		for (let chunkId in this.chunksToGenerate) {
			const chunkPos = this.chunksToGenerate[chunkId]
			delete(this.chunksToGenerate[chunkId])
			this.generateChunk(chunkPos)
			break // only process one key!
		}
	}
	generateChunk(chunkPos) {
		const chunk = Chunk.pool.acquire() // n.b. chunk.blocks may contain old data
		chunk.setChunkPos(chunkPos)
		let blockIndex = 0
		for (let x = 0; x < CHUNK_SIZE; x += 1) {
			for (let z = 0; z < CHUNK_SIZE; z += 1) {

				const terrainHeight = Math.floor(CHUNK_SIZE / 2 + Math.random() * 3 - 1)

				for (let y = 0; y < CHUNK_SIZE; y += 1) {

					const blockData = (y + chunkPos[1] * CHUNK_SIZE < terrainHeight) ? 1 : 0
					chunk.blocks[blockIndex] = blockData

					blockIndex += 1
				}
			}
		}
		this.onChunkGenerated(chunk)
	}
}

module.exports = LocalChunkGenerator
