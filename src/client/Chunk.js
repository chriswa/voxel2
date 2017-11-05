const { CHUNK_SIZE_CUBED } = require("geometrics")
const Pool = require("Pool")

class Chunk {
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
 * TODO: why doesn't this work?
 * @returns {Chunk}
 */
Chunk.pool = new Pool(() => new Chunk())

module.exports = Chunk
