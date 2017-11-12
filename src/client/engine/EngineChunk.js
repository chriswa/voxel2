const { CHUNK_SIZE, maxQuadsPerMesh } = require("geometrics")
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
		this.meshes = initialVertexArrays.map(initialVertexArray => new EngineChunkMesh(EngineChunkRenderer.acquireVAO(), initialVertexArray))
		this.quadIdsByBlockAndSide = quadIdsByBlockAndSide

		this.worldPos = vec3.clone(chunkData.pos)
		vec3.scale(this.worldPos, this.worldPos, CHUNK_SIZE)
		this.quadDirtyList = [] // quads which have been removed this frame and have not been written to (candidates for intra-frame reuse)
		this.quadHoleList = [] // quads which may be reused, but have already been zero'd out (dirty quads that did not get used)
	}
	addNewMesh() {
		this.meshes.push(new EngineChunkMesh(EngineChunkRenderer.acquireVAO(), EngineChunkVertexArrayPool.acquire()))
	}
	destroy() {
		this.meshes.forEach(mesh => {
			EngineChunkVertexArrayPool.release(mesh.vertexArray)
			mesh.vao.destroy()
		})
	}

	addQuad(blockPos, side, uvs) {
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

		const meshIndex = Math.floor(quadId / maxQuadsPerMesh)

		// do we need to add a new mesh?
		if (meshIndex > this.meshes.length - 1) {
			this.addNewMesh()
		}

		const mesh = this.meshes[meshIndex]
		const meshQuadId = quadId % maxQuadsPerMesh

		mesh.drawQuad(meshQuadId, blockPos, side, uvs)

		return quadId
	}
	removeQuad(quadId) {
		this.quadDirtyList.push(quadId) // leave it in the vertexArray for now, in case another quad needs to be drawn this frame!
	}

	render(renderBudget) {
		this.cleanupRemovedQuads()
		this.meshes.forEach((mesh, meshId) => {
			const quadCount = meshId === this.meshes.length - 1 ? this.quadCount % maxQuadsPerMesh : maxQuadsPerMesh
			renderBudget = mesh.render(renderBudget, quadCount)
		})
		return renderBudget
	}
	cleanupRemovedQuads() {
		this.quadDirtyList.forEach(quadId => {
			const meshIndex = Math.floor(quadId / maxQuadsPerMesh)
			const mesh = this.meshes[meshIndex]
			const meshQuadId = quadId % maxQuadsPerMesh

			mesh.clearQuad(meshQuadId)

			this.quadHoleList.push(quadId)
		})
		this.quadDirtyList = []
	}

}

module.exports = EngineChunk
