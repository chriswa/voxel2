import * as geometrics from "geometrics"
import Pool from "Pool"
import v3 from "v3"

export default class ChunkData {

	pos: v3
	id: string
	blocks: Uint8Array

	constructor() {
		this.pos = new v3()
		this.id = "NaN,NaN,NaN"
		this.blocks = new Uint8Array(geometrics.CHUNK_SIZE_CUBED)
	}
	setChunkPos(chunkPos: v3) {
		this.pos.setFrom(chunkPos)
		this.id = chunkPos.toString()
	}

	static pool: Pool<ChunkData> = new Pool(() => new ChunkData(), () => { })
}

//export const pool = new Pool(() => new ChunkData(), () => {})
