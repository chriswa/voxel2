const { CHUNK_SIZE, maxQuadsPerMesh } = require("geometrics")
//const ChunkData = require("../ChunkData")
const EngineChunkMesh = require("EngineChunkMesh")

class EngineChunk {
	/**
	 * 
	 * @param {ChunkData} chunkData 
	 */
	constructor(engine, chunkData, initialVertexArrays = [], quadCount = 0) {
		this.engine = engine
		this.chunkData = chunkData
		this.worldPos = vec3.clone(chunkData.pos)
		vec3.scale(this.worldPos, this.worldPos, CHUNK_SIZE)
		this.meshes = initialVertexArrays.map(initialVertexArray => new EngineChunkMesh(engine, initialVertexArray))
		this.quadCount = quadCount
		this.quadDirtyList = [] // quads which have been removed this frame and have not been written to (candidates for immediate writing)
		this.quadHoleList = [] // quads which may be reused, but have already been zero'd out (dirty quads that did not get used)
	}
	addNewMesh() {
		this.meshes.push(new EngineChunkMesh(this.engine))
	}
	destroy() {
		this.meshes.forEach(mesh => mesh.destroy())
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
