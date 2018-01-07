import * as geometrics from "geometrics"
import v3 from "v3"
import BlockTypes from "./BlockTypes"
import EngineChunk from "client/engine/chunk/EngineChunk"

//interface ChunkLike {
//	blockData: Uint8Array
//	neighbours: Array<ChunkLike>
//	alterOneBlock: (blockPos: BlockPos, val: number) => Array<number>
//}

export default class BlockPos {

	engineChunk: EngineChunk
	pos: v3
	blockDataOverride: Uint8Array
	i: number

	constructor(engineChunk?: EngineChunk, pos?: v3, blockDataOverride?: Uint8Array) {
		this.engineChunk = engineChunk
		this.pos = pos ? pos.clone() : new v3()
		this.blockDataOverride = blockDataOverride
		this.recalculateIndex()
	}
	clone() {
		return new BlockPos(this.engineChunk, this.pos)
	}
	recalculateIndex() {
		this.i = geometrics.vectorToBlockIndex(this.pos)
	}
	get blockDataSource(): Uint8Array {
		return this.engineChunk ? this.engineChunk.chunkData.blocks : this.blockDataOverride
	}

	getQuadId(side: geometrics.SideType) {
		return (this.engineChunk ? this.engineChunk.quadIdsByBlockAndSide[this.i * 6 + side.id] - 1 : -1)
	}
	getWorldPoint(outV3: v3) {
		outV3.setFrom(this.engineChunk.worldPos).multiplyScalar(geometrics.CHUNK_SIZE).add(this.pos)
	}
	getBlockData() {
		if (this.engineChunk) {
			return this.engineChunk.chunkData.blocks[this.i]
		}
		else if (this.blockDataOverride) {
			return this.blockDataOverride[this.i]
		}
		else {
			return 0
		}
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
		this.engineChunk = refBlockPos.engineChunk
		this.blockDataOverride = refBlockPos.blockDataOverride
		let newAxisPos = refBlockPos.pos.a[side.axis] + side.axisDelta
		let newIndex = refBlockPos.i + side.deltaIndex
		if (newAxisPos < 0 || newAxisPos >= geometrics.CHUNK_SIZE) {
			if (this.engineChunk) {
				if (this.engineChunk.neighboursBySideId) {
					const neighbourChunk = this.engineChunk.neighboursBySideId[side.id]
					this.engineChunk = neighbourChunk
				}
				else {
					this.engineChunk = undefined
				}
			}
			else {
				this.blockDataOverride = undefined
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
				this.engineChunk = this.engineChunk.neighboursBySideId[ geometrics.Sides.byName.TOP.id ]
				this.pos.a[1] -= geometrics.CHUNK_SIZE
				if (!this.engineChunk) { return }
			}
		}
		if (dy < 0) {
			this.pos.a[1] += dy
			while (this.pos.a[1] < 0) {
				this.engineChunk = this.engineChunk.neighboursBySideId[ geometrics.Sides.byName.BOTTOM.id ]
				this.pos.a[1] += geometrics.CHUNK_SIZE
				if (!this.engineChunk) { return }
			}
		}
		if (dz > 0) {
			this.pos.a[2] += dz
			while (this.pos.a[2] > geometrics.CHUNK_SIZE-1) {
				this.engineChunk = this.engineChunk.neighboursBySideId[ geometrics.Sides.byName.NORTH.id ]
				this.pos.a[2] -= geometrics.CHUNK_SIZE
				if (!this.engineChunk) { return }
			}
		}
		if (dz < 0) {
			this.pos.a[2] += dz
			while (this.pos.a[2] < 0) {
				this.engineChunk = this.engineChunk.neighboursBySideId[ geometrics.Sides.byName.SOUTH.id ]
				this.pos.a[2] += geometrics.CHUNK_SIZE
				if (!this.engineChunk) { return }
			}
		}
		if (dx > 0) {
			this.pos.a[0] += dx
			while (this.pos.a[0] > geometrics.CHUNK_SIZE-1) {
				this.engineChunk = this.engineChunk.neighboursBySideId[ geometrics.Sides.byName.EAST.id ]
				this.pos.a[0] -= geometrics.CHUNK_SIZE
				if (!this.engineChunk) { return }
			}
		}
		if (dx < 0) {
			this.pos.a[0] += dx
			while (this.pos.a[0] < 0) {
				this.engineChunk = this.engineChunk.neighboursBySideId[ geometrics.Sides.byName.WEST.id ]
				this.pos.a[0] += geometrics.CHUNK_SIZE
				if (!this.engineChunk) { return }
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

	eachBlockOnFace(chunk: EngineChunk, side: geometrics.SideType, callback: () => void) {
		this.engineChunk = chunk
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
	eachBlockOnEdge(chunk: EngineChunk, side1: geometrics.SideType, side2: geometrics.SideType, callback: () => void) {
		this.engineChunk = chunk
		const a = this.pos.a
		const freeAxis = side1.axis !== 0 && side2.axis !== 0 ? 0 : side1.axis !== 1 && side2.axis !== 1 ? 1 : 2
		a[side1.axis] = side1.axisDelta === 1 ? geometrics.CHUNK_SIZE - 1 : 0
		a[side2.axis] = side2.axisDelta === 1 ? geometrics.CHUNK_SIZE - 1 : 0
		for (a[freeAxis] = 0; a[freeAxis] < geometrics.CHUNK_SIZE; a[freeAxis] += 1) {
			this.recalculateIndex()
			callback()
		}
	}
	setBlockOnCorner(chunk: EngineChunk, side1: geometrics.SideType, side2: geometrics.SideType, side3: geometrics.SideType) {
		this.engineChunk = chunk
		const a = this.pos.a
		a[side1.axis] = side1.axisDelta === 1 ? geometrics.CHUNK_SIZE - 1 : 0
		a[side2.axis] = side2.axisDelta === 1 ? geometrics.CHUNK_SIZE - 1 : 0
		a[side3.axis] = side3.axisDelta === 1 ? geometrics.CHUNK_SIZE - 1 : 0
		this.recalculateIndex()
	}

	toString() {
		return `BlockPos(${this.pos.toString()} @ ${this.engineChunk ? this.engineChunk.chunkData.pos.toString() : "no-chunk"})`
	}
}
