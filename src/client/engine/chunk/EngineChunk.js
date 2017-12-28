const geometrics = require("geometrics")
//const ChunkData = require("../ChunkData")
const EngineChunkVertexArrayPool = require("./EngineChunkVertexArrayPool")
const EngineChunkRenderer = require("./EngineChunkRenderer")
const EngineChunkMesh = require("./EngineChunkMesh")

/**
 * @callback acquireVAO
 * @returns {EngineChunkMeshVAO}
 */
class EngineChunk {
	/**
	 * create a renderable chunk using pre-generated chunkData and pre-built vertex arrays
	 * @param {ChunkData} chunkData
	 * @param {number} quadCount
	 * @param {Array.<Float32Array>} initialVertexArrays
	 * @param {UInt16Array} quadIdsByBlockAndSide
	 */
	constructor(chunkData, quadCount, initialVertexArrays, quadIdsByBlockAndSide) {
		this.chunkData = chunkData
		this.quadCount = quadCount
		this.meshes = []
		initialVertexArrays.forEach((initialVertexArray, i) => {
			const initialWriteCount = Math.min(geometrics.maxQuadsPerMesh, quadCount - (i * geometrics.maxQuadsPerMesh))
			this.meshes.push(new EngineChunkMesh(EngineChunkRenderer.acquireVAO(), initialVertexArray, initialWriteCount))
		})
		this.quadIdsByBlockAndSide = quadIdsByBlockAndSide

		this.worldPos = chunkData.pos.clone().multiplyScalar(geometrics.CHUNK_SIZE)
		this.neighboursBySideId = []
		this.quadDirtyList = [] // quads which have been removed this frame and have not been written to (candidates for intra-frame reuse)
		this.quadHoleList = [] // quads which may be reused, but have already been zero'd out (dirty quads that did not get used)
	}
	addNewMesh() {
		this.meshes.push(new EngineChunkMesh(EngineChunkRenderer.acquireVAO(), new Float32Array(EngineChunkVertexArrayPool.acquire()), 0))
	}
	destroy() {
		this.meshes.forEach(mesh => {
			EngineChunkVertexArrayPool.release(mesh.vertexArray)
			mesh.vao.destroy()
		})
	}

	attachNeighbour(side, neighbourChunk) {
		this.neighboursBySideId[side.id] = neighbourChunk
	}
	detatchNeighbour(side) {
		this.neighboursBySideId[side.id] = undefined
	}

	addQuad(blockPos, side, uvs, brightnesses) {
		let quadId
		// prefer to draw over dirty quads, which will need to be updated anyway
		if (this.quadDirtyList.length) {
			quadId = this.quadDirtyList.shift()
		}
		// second preference is to fill up holes left by previously cleaned up quads, to avoid expanding our draw range and ultimately running out of space
		else if (this.quadHoleList.length) {
			quadId = this.quadHoleList.shift()
		}
		// if there are no dirty quads or holes to fill, append quads to the end
		else {
			quadId = this.quadCount
			this.quadCount += 1
		}

		const meshIndex = Math.floor(quadId / geometrics.maxQuadsPerMesh)

		// do we need to add a new mesh?
		if (meshIndex > this.meshes.length - 1) {
			this.addNewMesh()
		}

		const mesh = this.meshes[meshIndex]
		const meshQuadId = quadId % geometrics.maxQuadsPerMesh

		mesh.drawQuad(meshQuadId, blockPos, side, uvs, brightnesses)

		this.quadIdsByBlockAndSide[blockPos.i * 6 + side.id] = quadId + 1

		return quadId
	}
	removeQuad(blockPos, side) {
		const quadId = this.quadIdsByBlockAndSide[blockPos.i * 6 + side.id] - 1
		if (quadId > -1) {
			this.quadIdsByBlockAndSide[blockPos.i * 6 + side.id] = 0
			this.quadDirtyList.push(quadId) // leave it in the vertexArray for now, in case another quad needs to be drawn this frame!
		}
	}

	render(renderBudget) {
		window.chunkName = this.chunkData.pos.toString() // DEBUG
		this.cleanupRemovedQuads()
		this.meshes.forEach((mesh, meshId) => {
			const quadCount = meshId === this.meshes.length - 1 ? this.quadCount % geometrics.maxQuadsPerMesh : geometrics.maxQuadsPerMesh
			renderBudget = mesh.render(renderBudget, quadCount)
		})
		return renderBudget
	}
	cleanupRemovedQuads() {
		this.quadDirtyList.forEach(quadId => {
			const meshIndex = Math.floor(quadId / geometrics.maxQuadsPerMesh)
			const mesh = this.meshes[meshIndex]
			const meshQuadId = quadId % geometrics.maxQuadsPerMesh

			mesh.clearQuad(meshQuadId)

			this.quadHoleList.push(quadId)
		})
		this.quadDirtyList = []
	}

}

module.exports = EngineChunk
