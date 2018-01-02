import { CHUNK_SIZE_CUBED } from "geometrics"
import Pool from "Pool"
import v3 from "v3"

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

export default ChunkData
