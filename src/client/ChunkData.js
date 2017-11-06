const { CHUNK_SIZE_CUBED } = require("geometrics")
const Pool = require("Pool")

class ChunkData {
	constructor() {
		this.pos = vec3.create()
		this.id = "NaN,NaN,NaN"
		this.blocks = new Uint8Array(CHUNK_SIZE_CUBED)
	}
	setChunkPos(chunkPos) {
		vec3.copy(this.pos, chunkPos)
		this.id = chunkPos.join(",")
	}
}

/**
 * @static
 * @memberOf ChunkData
 * @returns {ChunkData}
 */
ChunkData.pool = new Pool(() => new ChunkData())

module.exports = ChunkData
