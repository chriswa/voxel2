import * as _ from "lodash"
import * as geometrics from "geometrics"
import BlockTypes from "BlockTypes"
import BlockPos from "BlockPos"
import EngineChunkQuadWriter from "./EngineChunkQuadWriter"
import EngineChunkVertexArrayPool from "./EngineChunkVertexArrayPool"
import v3 from "v3"
import Pool from "Pool"
import EngineChunk from "client/engine/chunk/EngineChunk";


const occludedBrightnesses = [1, 0.7, 0.7, 0.6, 0.5, 0.5]
//const occludedBrightnesses = [1, 0.5, 0.5, 0.2, 0.1, 0.1] // HIGH CONTRAST MODE

const edgeOccludingBlockPos = new BlockPos(undefined, new v3(0, 0, 0))	 // optimization: keep these around for repeated calls to calculateVertexColours
const cornerOccludingBlockPos = new BlockPos(undefined, new v3(0, 0, 0))	 // optimization: keep these around for repeated calls to calculateVertexColours

function calculateVertexColours(airBlockPos: BlockPos, side: geometrics.SideType) {

	// determine ambient occlusion
	const brightnesses = [0, 0, 0, 0]

	// check for occlusion at right angles to the block's normal
	for (let tangentIndex = 0; tangentIndex < 4; tangentIndex += 1) {
		const tangentSide = side.tangents[tangentIndex].side

		edgeOccludingBlockPos.setAdjacentToBlockPos(airBlockPos, tangentSide)
		if (!edgeOccludingBlockPos.blockDataSource) { continue }

		if (!edgeOccludingBlockPos.isTransparent()) {
			brightnesses[tangentIndex] += 2
			brightnesses[(tangentIndex + 1) % 4] += 2
		}

		// right angle again to find the diagonal
		// n.b. anisotropy warning: it's possible that the edge occluding block is unloaded, but the diagonal is loaded, and we are only turning right!
		const diagonalTangentSide = side.tangents[(tangentIndex + 1) % 4].side

		cornerOccludingBlockPos.setAdjacentToBlockPos(edgeOccludingBlockPos, diagonalTangentSide)
		if (!cornerOccludingBlockPos.blockDataSource) { continue }

		if (!cornerOccludingBlockPos.isTransparent()) {
			brightnesses[(tangentIndex + 1) % 4] += 1
		}
	}

	for (let i = 0; i < 4; i += 1) {
		brightnesses[i] = occludedBrightnesses[brightnesses[i]]
	}

	return brightnesses
}



class ChunkPrewriter {

	quadCount: number
	vertexArrays: Array<Float32Array>
	currentVertexArray: Float32Array

	constructor(private blockData: Uint8Array, private quadIdsByBlockAndSide: Uint16Array, private vertexArrayPool: Pool<Float32Array>) {
		this.quadCount = 0
		this.vertexArrays = []
		this.currentVertexArray = undefined
	}
	addVertexArray() {
		var vertexArray = new Float32Array(this.vertexArrayPool.acquire())
		this.vertexArrays.push(vertexArray)
		return vertexArray
	}
	addQuad(blockPos: BlockPos, side: geometrics.SideType, uvs: Array<number>, brightnesses: Array<number>) {
		var quadId = this.quadCount
		this.quadCount += 1
		if (this.quadCount > this.vertexArrays.length * geometrics.maxQuadsPerMesh) {
			this.currentVertexArray = this.addVertexArray()
		}
		EngineChunkQuadWriter.drawQuad(this.currentVertexArray, quadId % geometrics.maxQuadsPerMesh, blockPos, side, uvs, brightnesses)
		this.quadIdsByBlockAndSide[blockPos.i * 6 + side.id] = quadId + 1 // add one so we can use 0 as an indicator that no quad was written
	}


	drawInternalChunkQuads() {
		var solidBlockPos = new BlockPos(undefined, new v3(0, 0, 0), this.blockData)
		var airBlockPos = new BlockPos(undefined, new v3(0, 0, 0), this.blockData)

		solidBlockPos.eachBlockInChunk(() => {
			
			if (!solidBlockPos.isTransparent()) {

				geometrics.Sides.each(side => {

					airBlockPos.setAdjacentToBlockPos(solidBlockPos, side)

					if (airBlockPos.blockDataSource) { // still within the same chunk

						var adjacentIsTransparent = airBlockPos.isTransparent()
						if (adjacentIsTransparent) {

							var blockType = BlockTypes.byId[this.blockData[solidBlockPos.i]]
							var uvs = blockType.textureSides[side.id]

							// determine vertex colours (AO)
							var brightnesses = calculateVertexColours(airBlockPos, side)

							this.addQuad(solidBlockPos, side, uvs, brightnesses)
						}

					}

				})
			}
		})
	}

}

export default {
	drawInternalChunkQuads(
		blockData: Uint8Array,
		quadIdsByBlockAndSide: Uint16Array,
		reusableVertexArrays: Array<Float32Array> = []
	): {quadCount: number, vertexArrays: Array<Float32Array>} {

		const vertexArrayPool = EngineChunkVertexArrayPool.createPrefilledPool(reusableVertexArrays)

		const prewriter = new ChunkPrewriter(blockData, quadIdsByBlockAndSide, vertexArrayPool)
		prewriter.drawInternalChunkQuads()
		const quadCount = prewriter.quadCount
		const vertexArrays = prewriter.vertexArrays

		return { quadCount, vertexArrays }
	},

	unstitchChunk(chunk: EngineChunk, side: geometrics.SideType) {
		const blockPos = new BlockPos()
		blockPos.eachBlockOnFace(chunk, side, () => {
			chunk.removeQuad(blockPos, side)
		})
	},

	stitchChunks(newCenterChunk: EngineChunk) {
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

		const aoAirBlockPos = new BlockPos(undefined, new v3(0, 0, 0))	 // optimization
		
		function fixAO(solidBlockPos: BlockPos, side: geometrics.SideType) {
			const quadId = solidBlockPos.getQuadId(side)
			if (quadId >= 0) {
				const blockTypeId = solidBlockPos.getBlockData()
				const blockType = BlockTypes.byId[blockTypeId]
				const uvs = blockType.textureSides[side.id]
				aoAirBlockPos.setAdjacentToBlockPos(solidBlockPos, side)
				const brightnesses = calculateVertexColours(aoAirBlockPos, side)
				solidBlockPos.engineChunk.updateQuadAO(solidBlockPos, side, uvs, brightnesses)
			}
		}

		function addFace(solidBlockPos: BlockPos, airBlockPos: BlockPos, side: geometrics.SideType) {
			//console.log(`addFace for ${solidBlockPos.toString()} (${solidBlockPos.engineChunk.chunkData.pos.toString()}) facing ${side.name}: i.e. ${airBlockPos.toString()} (${airBlockPos.engineChunk.chunkData.pos.toString()})`)
			const blockTypeId = solidBlockPos.getBlockData()
			const blockType = BlockTypes.byId[blockTypeId]
			const uvs = blockType.textureSides[side.id]
			const brightnesses = calculateVertexColours(airBlockPos, side)
			solidBlockPos.engineChunk.addQuad(solidBlockPos, side, uvs, brightnesses)
		}
		
		const nearBlockPos = new BlockPos()
		const farBlockPos = new BlockPos()

		// for each face...
		for (let axis1 = 0; axis1 < 3; axis1 += 1) {
			for (let sideIndex1 = 0; sideIndex1 < 2; sideIndex1 += 1) {
				const side1 = geometrics.Sides.byAxis[axis1][sideIndex1]
				const faceNeighbourChunk = newCenterChunk.neighboursBySideId[side1.id]
				if (faceNeighbourChunk) {

					//console.log(`stitching ${newCenterChunk.id} on ${side1.name} to ${faceNeighbourChunk.id}`)

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
							addFace(farBlockPos, nearBlockPos, side1.opposite) // problem?
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
