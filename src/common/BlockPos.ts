import * as  geometrics from "geometrics"
import v3 from "v3"
import BlockTypes from "./BlockTypes"

interface ChunkLike {
	blockData: Uint8Array
	neighbours: Array<ChunkLike>
	alterOneBlock: (blockPos: BlockPos, val: number) => Array<number>
}

export default class BlockPos {

	chunk: ChunkLike
	pos: v3
	i: number

	constructor(chunk?: ChunkLike, pos?: v3) {
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

	getQuadId(side: geometrics.SideType) {
		return (this.chunk ? this.chunk.quadIdsByBlockAndSide[this.i * 6 + side.id] - 1 : -1)
	}
	getWorldPoint(outV3: v3) {
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
	setAdjacentToBlockPos(refBlockPos: BlockPos, side: geometrics.SideType) {
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
	add(dx: number, dy: number, dz: number) {
		if (dy > 0) {
			this.pos.a[1] += dy
			while (this.pos.a[1] > geometrics.CHUNK_SIZE-1) {
				this.chunk = this.chunk.neighboursBySideId[ geometrics.Sides.byName.TOP.id ]
				this.pos.a[1] -= geometrics.CHUNK_SIZE
				if (!this.chunk) { return }
			}
		}
		if (dy < 0) {
			this.pos.a[1] += dy
			while (this.pos.a[1] < 0) {
				this.chunk = this.chunk.neighboursBySideId[ geometrics.Sides.byName.BOTTOM.id ]
				this.pos.a[1] += geometrics.CHUNK_SIZE
				if (!this.chunk) { return }
			}
		}
		if (dz > 0) {
			this.pos.a[2] += dz
			while (this.pos.a[2] > geometrics.CHUNK_SIZE-1) {
				this.chunk = this.chunk.neighboursBySideId[ geometrics.Sides.byName.NORTH.id ]
				this.pos.a[2] -= geometrics.CHUNK_SIZE
				if (!this.chunk) { return }
			}
		}
		if (dz < 0) {
			this.pos.a[2] += dz
			while (this.pos.a[2] < 0) {
				this.chunk = this.chunk.neighboursBySideId[ geometrics.Sides.byName.SOUTH.id ]
				this.pos.a[2] += geometrics.CHUNK_SIZE
				if (!this.chunk) { return }
			}
		}
		if (dx > 0) {
			this.pos.a[0] += dx
			while (this.pos.a[0] > geometrics.CHUNK_SIZE-1) {
				this.chunk = this.chunk.neighboursBySideId[ geometrics.Sides.byName.EAST.id ]
				this.pos.a[0] -= geometrics.CHUNK_SIZE
				if (!this.chunk) { return }
			}
		}
		if (dx < 0) {
			this.pos.a[0] += dx
			while (this.pos.a[0] < 0) {
				this.chunk = this.chunk.neighboursBySideId[ geometrics.Sides.byName.WEST.id ]
				this.pos.a[0] += geometrics.CHUNK_SIZE
				if (!this.chunk) { return }
			}
		}
		this.recalculateIndex()
	}

	eachBlockInChunk(callback: () => void) {
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

	eachBlockOnFace(chunk: ChunkLike, side: geometrics.SideType, callback: () => void) {
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
	eachBlockOnEdge(chunk: ChunkLike, side1: geometrics.SideType, side2: geometrics.SideType, callback: () => void) {
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
	setBlockOnCorner(chunk: ChunkLike, side1: geometrics.SideType, side2: geometrics.SideType, side3: geometrics.SideType) {
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
