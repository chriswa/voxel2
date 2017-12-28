const geometrics = require("geometrics")
const BlockTypes = require("BlockTypes")
const BlockPos = require("BlockPos")
const EngineChunkQuadWriter = require("./EngineChunkQuadWriter")
const EngineChunkVertexArrayPool = require("./EngineChunkVertexArrayPool")
const v3 = require("v3")

function blockDataIsTransparent(blockData) {
	return blockData === 0
}

class ChunkPrewriter {
	constructor(blockData, quadIdsByBlockAndSide, vertexArrayPool) {
		this.blockData = blockData
		this.quadIdsByBlockAndSide = quadIdsByBlockAndSide
		this.quadCount = 0
		this.vertexArrays = []
		this.currentVertexArray = undefined
		this.vertexArrayPool = vertexArrayPool
		this._edgeOccludingBlockPos = new BlockPos(true, new v3(0, 0, 0))	 // optimization: keep these around for repeated calls to calculateVertexColours
		this._cornerOccludingBlockPos = new BlockPos(true, new v3(0, 0, 0))	 // optimization: keep these around for repeated calls to calculateVertexColours
	}
	addVertexArray() {
		var vertexArray = new Float32Array(this.vertexArrayPool.acquire())
		this.vertexArrays.push(vertexArray)
		return vertexArray
	}
	addQuad(blockPos, side, uvs, brightnesses, rgb) {
		var quadId = this.quadCount
		this.quadCount += 1
		if (this.quadCount > this.vertexArrays.length * geometrics.maxQuadsPerMesh) {
			this.currentVertexArray = this.addVertexArray()
		}
		EngineChunkQuadWriter.drawQuad(this.currentVertexArray, quadId % geometrics.maxQuadsPerMesh, blockPos, side, uvs, brightnesses, rgb)
		this.quadIdsByBlockAndSide[blockPos.i * 6 + side.id] = quadId + 1 // add one so we can use 0 as an indicator that no quad was written
	}


	isTransparent(blockPos) {
		return blockDataIsTransparent(this.blockData[blockPos.i])
	}

	drawInternalChunkQuads() {
		var solidBlockPos = new BlockPos(true, new v3(0, 0, 0))
		var airBlockPos = new BlockPos(true, new v3(0, 0, 0))

		solidBlockPos.eachBlockInChunk(() => {
			
			if (!this.isTransparent(solidBlockPos)) {

				geometrics.Sides.each(side => {

					airBlockPos.setAdjacentToBlockPos(solidBlockPos, side)

					if (airBlockPos.chunk) {

						var adjacentIsTransparent = this.isTransparent(airBlockPos)
						if (adjacentIsTransparent) {

							var blockType = BlockTypes.byId[this.blockData[solidBlockPos.i]]
							var uvs = blockType.textureSides[side.id]
							var rgb = blockType.colourSides[side.id]

							// determine vertex colours (AO)
							var brightnesses = this.calculateVertexColours(airBlockPos, side)

							this.addQuad(solidBlockPos, side, uvs, brightnesses, rgb)
						}

					}

				})
			}
		})
	}

	calculateVertexColours(airBlockPos, side) {

		// determine ambient occlusion
		const brightnesses = [0, 0, 0, 0]

		// check for occlusion at right angles to the block's normal
		for (let tangentIndex = 0; tangentIndex < 4; tangentIndex += 1) {
			const tangentSide = side.tangents[tangentIndex].side

			this._edgeOccludingBlockPos.setAdjacentToBlockPos(airBlockPos, tangentSide)
			if (!this._edgeOccludingBlockPos.chunk) { continue }

			if (!this.isTransparent(this._edgeOccludingBlockPos)) {
				brightnesses[tangentIndex] += 2
				brightnesses[(tangentIndex + 1) % 4] += 2
			}

			// right angle again to find the diagonal
			// n.b. anisotropy warning: it's possible that the edge occluding block is unloaded, but the diagonal is loaded, and we are only turning right!
			const diagonalTangentSide = side.tangents[(tangentIndex + 1) % 4].side

			this._cornerOccludingBlockPos.setAdjacentToBlockPos(this._edgeOccludingBlockPos, diagonalTangentSide)
			if (!this._cornerOccludingBlockPos.chunk) { continue }

			if (!this.isTransparent(this._cornerOccludingBlockPos)) {
				brightnesses[(tangentIndex + 1) % 4] += 1
			}
		}

		const occludedBrightnesses = [1, 0.7, 0.7, 0.6, 0.5, 0.5]
		for (let i = 0; i < 4; i += 1) {
			brightnesses[i] = occludedBrightnesses[brightnesses[i]]
		}

		return brightnesses
	}
}

const EngineChunkBuilder = {
	/**
	 * 
	 * @param {Uint8Array} blockData
	 * @param {Uint16Array} quadIdsByBlockAndSide - n.b. this is written to!
	 * @returns {{ quadCount: {number}, vertexArrays: {Array.Float32Array} }}
	 */
	drawInternalChunkQuads(blockData, quadIdsByBlockAndSide, reusableVertexArrays = []) {

		const vertexArrayPool = EngineChunkVertexArrayPool.createPrefilledPool(reusableVertexArrays)

		const prewriter = new ChunkPrewriter(blockData, quadIdsByBlockAndSide, vertexArrayPool)
		prewriter.drawInternalChunkQuads()
		const quadCount = prewriter.quadCount
		const vertexArrays = prewriter.vertexArrays

		return { quadCount, vertexArrays }
	},

	unstitchChunk(chunk, side) {
		const blockPos = new BlockPos()
		blockPos.eachBlockOnFace(chunk, side, () => {
			chunk.removeQuad(blockPos, side)
		})
	},

	stitchChunks(newCenterChunk) {
		// requirements:
		//   - add quads on both sides of the 6 adjacent "face" neighbour chunks, if required (i.e. solid and air boundary)
		//   - update AO on both sides of the 6 adjacent "face" neighbour chunks, for faces which are perpendicular
		//   (adjacent to the 6 adjacent "face" neighbour chunks are the 12 "edge" chunks, which share an edge with the center chunk)
		//   - update AO for the "edge" chunks for all blocks along the edge which face toward the center chunk on either axis
		//   (adjacent to the 12 "edge" chunks are 8 "corner" chunks, which share a corner with the center chunk)
		//   - update AO for the "corner" chunks's single corner blocks, which face toward the center chunk on any axis
		//   (e.g. consider the grass block at (0, 31, 0) : the air block above it is in chunk (0,1,0), but AO also depends on blocks in chunks (-1,1,0), (0,1,-1) AND (-1,1,-1))
		
		// the following strategy explores all adjacent chunks once in a 3x3x3 cube, but is anisotropic:
		//   - first, xyz explores a "tie fighter" shape
		//   - next, yz adds an "I beam", leaving an "upright bagel with cream cheese" shape
		//   - finally, z fills in the last two spots
		// as more chunks get filled in, these anisotropic AO errors should disappear; with the camera far away from the edges of the loading chunks, this should not affect the player

		function fixAO(blockPos, side) {
			const quadId = blockPos.getQuadId(side)
			if (quadId > -1) {
				// TODO: fix AO (if necessary)
			}
		}

		function addFace(solidBlockPos, airBlockPos, side) {
			const blockTypeId = solidBlockPos.getBlockData()
			const blockType = BlockTypes.byId[blockTypeId]
			const uvs = blockType.textureSides[side.id]
			const brightnesses = [0.1, 0.1, 0.1, 0.1] // this.calculateVertexColours(airBlockPos, side)
			console.log(`stitch of ${newCenterChunk.chunkData.pos.toString()} addQuad to ${solidBlockPos.toString()}`)
			solidBlockPos.chunk.addQuad(solidBlockPos, side, uvs, brightnesses)
		}
		
		const nearBlockPos = new BlockPos()
		const farBlockPos = new BlockPos()

		// for each face...
		for (let axis1 = 0; axis1 < 3; axis1 += 1) {
			for (let sideIndex1 = 0; sideIndex1 < 2; sideIndex1 += 1) {
				const side1 = geometrics.Sides.byAxis[axis1][sideIndex1]
				const faceNeighbourChunk = newCenterChunk.neighboursBySideId[side1.id]
				if (faceNeighbourChunk) {

					// add quads and update perpendicular AO
					nearBlockPos.eachBlockOnFace(newCenterChunk, side1, () => {
						farBlockPos.setAdjacentToBlockPos(nearBlockPos, side1)

						// add quads
						const nearIsTransparent = nearBlockPos.isTransparent()
						const farIsTransparent = farBlockPos.isTransparent()
						if (!nearIsTransparent && farIsTransparent) {
							// add quad at nearBlockPos facing side1
							addFace(nearBlockPos, farBlockPos, side1)
						}
						else if (!farIsTransparent && nearIsTransparent) {
							// add quad at farBlockPos facing side1.opposite
							addFace(farBlockPos, nearBlockPos, side1.opposite)
						}

						// update AO
						_.each(side1.tangents, ({ side: tangentSide }) => {
							fixAO(nearBlockPos, tangentSide)
							fixAO(farBlockPos, tangentSide)
						})
					})

					// for each edge...
					for (let axis2 = axis1 + 1; axis2 < 3; axis2 += 1) {
						for (let sideIndex2 = 0; sideIndex2 < 2; sideIndex2 += 1) {
							const side2 = geometrics.Sides.byAxis[axis2][sideIndex2]
							const edgeNeighbourChunk = faceNeighbourChunk.neighboursBySideId[side2.id]
							if (edgeNeighbourChunk) {

								// update AO of blocks along edge of edgeNeighbourChunk
								farBlockPos.eachBlockOnEdge(edgeNeighbourChunk, side1, side2, () => {
									fixAO(farBlockPos, side1.opposite)
									fixAO(farBlockPos, side2.opposite)
									const tangentAxis = 3 - side1.axis - side2.axis
									fixAO(farBlockPos, geometrics.Sides.byAxis[tangentAxis][0])
									fixAO(farBlockPos, geometrics.Sides.byAxis[tangentAxis][1])
								})

								// for each corner...
								if (axis2 !== 2) {
									const axis3 = 2 // the only remaining axis
									for (let sideIndex3 = 0; sideIndex3 < 2; sideIndex3 += 1) {
										const side3 = geometrics.Sides.byAxis[axis3][sideIndex3]
										const cornerNeighbourChunk = edgeNeighbourChunk.neighboursBySideId[side3.id]
										if (cornerNeighbourChunk) {

											// update AO of single block at corner of cornerNeighbourChunk
											farBlockPos.setBlockOnCorner(cornerNeighbourChunk, side1, side2, side3)
											fixAO(farBlockPos, side1.opposite)
											fixAO(farBlockPos, side2.opposite)
											fixAO(farBlockPos, side3.opposite)
										}
									}
								}
							}
						}
					}
				}
			}
		}
	},

}

module.exports = EngineChunkBuilder
