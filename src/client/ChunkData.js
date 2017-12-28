const { CHUNK_SIZE_CUBED } = require("geometrics")
const Pool = require("Pool")
const v3 = require("v3")

class ChunkData {
	constructor() {
		this.pos = new v3()
		this.id = "NaN,NaN,NaN"
		this.blocks = new Uint8Array(CHUNK_SIZE_CUBED)
	}
	setChunkPos(chunkPos) {
		this.pos.setFrom(chunkPos)
		this.id = chunkPos.toString()
	}
}

/**
 * @static
 * @memberOf ChunkData
 * @returns {ChunkData}
 */
ChunkData.pool = new Pool(() => new ChunkData())

module.exports = ChunkData
