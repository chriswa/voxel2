const geometrics = require("geometrics")
const v3 = require("v3")
const BlockTypes = require("./BlockTypes")

/**
 * @interface ChunkLike
 * @member {Array.UInt8Array} blockData
 * @member {Array.ChunkLike} neighbours
 */
/**
 * @function
 * @name ChunkLike#alterOneBlock
 * @param {BlockPos} blockPos
 * @param {number} newBlockDatum
 * @returns {Array<number>}
 */

class BlockPos {
	/**
	 * @constructor
	 * @param {ChunkLike} chunk
	 * @param {v3} pos
	 */
	constructor(chunk, pos) {
		this.chunk = chunk
		this.pos = pos ? pos.clone() : new v3()
		this.recalculateIndex()
	}
	clone() {
		return new BlockPos(this.chunk, this.pos)
	}
	recalculateIndex() {
		this.i = geometrics.vectorToBlockIndex(this.pos)
	}

	getQuadId(side) {
		return (this.chunk ? this.chunk.quadIdsByBlockAndSide[this.i * 6 + side.id] - 1 : -1)
	}
	getWorldPoint(outV3) {
		outV3.setFrom(this.chunk.pos).multiplyScalar(geometrics.CHUNK_SIZE).add(this.pos)
	}
	getBlockData() {
		return this.chunk ? this.chunk.chunkData.blocks[this.i] : 0
	}
	getBlockType() {
		return BlockTypes.byId[this.getBlockData()]
	}
	isOpaque() {
		return this.getBlockData() !== 0
	}
	isTransparent() {
		return this.getBlockData() === 0
	}
	//setBlockData(newBlockData) {
	//	this.chunk.alterOneBlock(this, newBlockData)
	//}
	setAdjacentToBlockPos(refBlockPos, side) {
		this.pos.setFrom(refBlockPos.pos)
		this.chunk = refBlockPos.chunk
		let newAxisPos = refBlockPos.pos.a[side.axis] + side.axisDelta
		let newIndex = refBlockPos.i + side.deltaIndex
		if (newAxisPos < 0 || newAxisPos >= geometrics.CHUNK_SIZE) {
			if (this.chunk) {
				if (this.chunk.neighboursBySideId) {
					const neighbourChunk = this.chunk.neighboursBySideId[side.id]
					this.chunk = neighbourChunk
				}
				else {
					this.chunk = false
				}
			}
			newAxisPos += geometrics.CHUNK_SIZE * -side.axisDelta
			newIndex += geometrics.CHUNK_SIZE * -side.deltaIndex
		}
		this.pos.a[side.axis] = newAxisPos
		this.i = newIndex
	}
	/*getAdjacentBlockPos(side) {
		var neighbourChunk = this.chunk.neighboursBySideId[side.id]
		if (side === geometrics.Sides.TOP) {
			if (this.pos.a[1] === geometrics.CHUNK_SIZE - 1) {
				return neighbourChunk ? new BlockPos( neighbourChunk, this.pos.a[0], 0, this.pos.a[2] ) : BlockPos.badPos
			}
		}
		else if (side === geometrics.Sides.BOTTOM) {
			if (this.pos.a[1] === 0) {
				return neighbourChunk ? new BlockPos( neighbourChunk, this.pos.a[0], geometrics.CHUNK_SIZE - 1, this.pos.a[2] ) : BlockPos.badPos
			}
		}
		else if (side === geometrics.Sides.NORTH) {
			if (this.pos.a[2] === geometrics.CHUNK_SIZE - 1) {
				return neighbourChunk ? new BlockPos( neighbourChunk, this.pos.a[0], this.pos.a[1], 0 ) : BlockPos.badPos
			}
		}
		else if (side === geometrics.Sides.SOUTH) {
			if (this.pos.a[2] === 0) {
				return neighbourChunk ? new BlockPos( neighbourChunk, this.pos.a[0], this.pos.a[1], geometrics.CHUNK_SIZE - 1 ) : BlockPos.badPos
			}
		}
		else if (side === geometrics.Sides.EAST) {
			if (this.pos.a[0] === geometrics.CHUNK_SIZE - 1) {
				return neighbourChunk ? new BlockPos( neighbourChunk, 0, this.pos.a[1], this.pos.a[2] ) : BlockPos.badPos
			}
		}
		else if (side === geometrics.Sides.WEST) {
			if (this.pos.a[0] === 0) {
				return neighbourChunk ? new BlockPos( neighbourChunk, geometrics.CHUNK_SIZE - 1, this.pos.a[1], this.pos.a[2] ) : BlockPos.badPos
			}
		}
		return new BlockPos(this.chunk, this.pos.a[0] + side.dx, this.pos.a[1] + side.dy, this.pos.a[2] + side.dz)
	}*/
	add(dx, dy, dz) {
		if (dy > 0) {
			this.pos.a[1] += dy
			while (this.pos.a[1] > geometrics.CHUNK_SIZE-1) {
				this.chunk = this.chunk.neighboursBySideId[ geometrics.Sides.TOP.id ]
				this.pos.a[1] -= geometrics.CHUNK_SIZE
				if (!this.chunk) { return }
			}
		}
		if (dy < 0) {
			this.pos.a[1] += dy
			while (this.pos.a[1] < 0) {
				this.chunk = this.chunk.neighboursBySideId[ geometrics.Sides.BOTTOM.id ]
				this.pos.a[1] += geometrics.CHUNK_SIZE
				if (!this.chunk) { return }
			}
		}
		if (dz > 0) {
			this.pos.a[2] += dz
			while (this.pos.a[2] > geometrics.CHUNK_SIZE-1) {
				this.chunk = this.chunk.neighboursBySideId[ geometrics.Sides.NORTH.id ]
				this.pos.a[2] -= geometrics.CHUNK_SIZE
				if (!this.chunk) { return }
			}
		}
		if (dz < 0) {
			this.pos.a[2] += dz
			while (this.pos.a[2] < 0) {
				this.chunk = this.chunk.neighboursBySideId[ geometrics.Sides.SOUTH.id ]
				this.pos.a[2] += geometrics.CHUNK_SIZE
				if (!this.chunk) { return }
			}
		}
		if (dx > 0) {
			this.pos.a[0] += dx
			while (this.pos.a[0] > geometrics.CHUNK_SIZE-1) {
				this.chunk = this.chunk.neighboursBySideId[ geometrics.Sides.EAST.id ]
				this.pos.a[0] -= geometrics.CHUNK_SIZE
				if (!this.chunk) { return }
			}
		}
		if (dx < 0) {
			this.pos.a[0] += dx
			while (this.pos.a[0] < 0) {
				this.chunk = this.chunk.neighboursBySideId[ geometrics.Sides.WEST.id ]
				this.pos.a[0] += geometrics.CHUNK_SIZE
				if (!this.chunk) { return }
			}
		}
		this.recalculateIndex()
	}

	eachBlockInChunk(callback) {
		const a = this.pos.a
		this.i = 0
		for (a[0] = 0; a[0] < geometrics.CHUNK_SIZE; a[0] += 1) {
			for (a[2] = 0; a[2] < geometrics.CHUNK_SIZE; a[2] += 1) {
				for (a[1] = 0; a[1] < geometrics.CHUNK_SIZE; a[1] += 1) {
					callback()
					this.i += 1
				}
			}
		}
	}

	eachBlockOnFace(chunk, side, callback) {
		this.chunk = chunk
		const a = this.pos.a
		const freeAxis1 = side.axis === 0 ? 1 : 0
		const freeAxis2 = side.axis === 2 ? 1 : 2
		a[side.axis] = side.axisDelta === 1 ? geometrics.CHUNK_SIZE - 1 : 0 // locked axis
		for (a[freeAxis1] = 0; a[freeAxis1] < geometrics.CHUNK_SIZE; a[freeAxis1] += 1) {
			for (a[freeAxis2] = 0; a[freeAxis2] < geometrics.CHUNK_SIZE; a[freeAxis2] += 1) {
				this.recalculateIndex()
				callback()
			}
		}
	}
	eachBlockOnEdge(chunk, side1, side2, callback) {
		this.chunk = chunk
		const a = this.pos.a
		const freeAxis = side1.axis !== 0 && side2.axis !== 0 ? 0 : side1.axis !== 1 && side2.axis !== 1 ? 1 : 2
		a[side1.axis] = side1.axisDelta === 1 ? geometrics.CHUNK_SIZE - 1 : 0
		a[side2.axis] = side2.axisDelta === 1 ? geometrics.CHUNK_SIZE - 1 : 0
		for (a[freeAxis] = 0; a[freeAxis] < geometrics.CHUNK_SIZE; a[freeAxis] += 1) {
			this.recalculateIndex()
			callback()
		}
	}
	setBlockOnCorner(chunk, side1, side2, side3) {
		this.chunk = chunk
		const a = this.pos.a
		a[side1.axis] = side1.axisDelta === 1 ? geometrics.CHUNK_SIZE - 1 : 0
		a[side2.axis] = side2.axisDelta === 1 ? geometrics.CHUNK_SIZE - 1 : 0
		a[side3.axis] = side3.axisDelta === 1 ? geometrics.CHUNK_SIZE - 1 : 0
		this.recalculateIndex()
	}

	toString() {
		return `BlockPos(${this.pos.toString()} @ ${this.chunk.chunkData.pos.toString()})`
	}
}

module.exports = BlockPos