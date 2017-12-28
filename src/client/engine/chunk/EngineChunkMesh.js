const EngineChunkQuadWriter = require("./EngineChunkQuadWriter")
const geometrics = require("geometrics")

class EngineChunkMesh {
	constructor(vao, vertexArray, initialWriteCount = 0) {
		this.vao = vao
		this.vertexArray = vertexArray
		this.initialWriteCount = initialWriteCount
		this.writeList = []
	}
	drawQuad(quadId, blockPos, side, uvs, brightnesses) {
		EngineChunkQuadWriter.drawQuad(this.vertexArray, quadId, blockPos, side, uvs, brightnesses)
		this.writeList.push(quadId)
	}
	clearQuad(quadId) {
		EngineChunkQuadWriter.clearQuad(this.vertexArray, quadId)
		this.writeList.push(quadId)
	}
	updateVAO(renderBudget) {
		if (renderBudget > 0 && (this.writeList.length > 0 || this.initialWriteCount)) {

			gl.bindBuffer(gl.ARRAY_BUFFER, this.vao.glBuffer)

			// TODO: optimizations! this strategy is pretty naive...
			var minQuadIndex = Infinity
			var maxQuadIndex = 0

			if (this.initialWriteCount) {
				minQuadIndex = 0
				maxQuadIndex = this.initialWriteCount - 1
				this.initialWriteCount = 0
			}

			this.writeList.forEach(quadToWrite => {
				minQuadIndex = Math.min(minQuadIndex, quadToWrite)
				maxQuadIndex = Math.max(maxQuadIndex, quadToWrite)
			})
			this.writeList = [] // reset writeList

			var quadPushCount = maxQuadIndex - minQuadIndex + 1
			renderBudget -= Math.max(quadPushCount, 200) // increase the budget cost of small updates, since 1x1000 bufferSubData calls probably costs way more than 1000x1

			//const subarray = this.vertexArray.subarray(minQuadIndex * geometrics.quadVertexByteSize, (maxQuadIndex + 1) * geometrics.quadVertexByteSize)
			//gl.bufferSubData(gl.ARRAY_BUFFER, minQuadIndex * geometrics.quadVertexByteSize, subarray)
			console.log([ // DEBUG
				window.chunkName,
				minQuadIndex * geometrics.quadVertexByteSize, // dst byte offset
				this.vertexArray,
				minQuadIndex * geometrics.quadVertexByteSize, // srcOffset
				quadPushCount * geometrics.quadVertexByteSize // length
			])
			gl.bufferSubData(gl.ARRAY_BUFFER,
				minQuadIndex * geometrics.quadVertexByteSize, // dst byte offset
				this.vertexArray,
				minQuadIndex * geometrics.quadVertexByteSize, // srcOffset
				quadPushCount * geometrics.quadVertexByteSize // length
			)
		}
		return renderBudget
	}
	render(renderBudget, quadCount) {
		renderBudget = this.updateVAO(renderBudget)
		this.vao.partialRender(quadCount)
		return renderBudget
	}
}

module.exports = EngineChunkMesh
