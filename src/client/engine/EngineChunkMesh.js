const geometrics = require("geometrics")

class EngineChunkMesh {
	constructor(vao, vertexArray) {
		this.vao = vao
		this.vertexArray = vertexArray
		this.writeList = []
	}
	drawQuad(quadId, blockPos, side, uvs, brightnesses) {
		var vertexOrder = [0, 1, 2, 3] // or [ 1, 2, 3, 0 ], depending on AO ( this was getVertexOrderAfterQuadFlipping(brightnesses) )
		var cursor = quadId * geometrics.quadVertexByteSize
		for (var i = 0; i < 4; i += 1) {
			var vertexIndex = vertexOrder[i]
			this.vertexArray[cursor++] = blockPos[0] + side.verts[vertexIndex * 3 + 0] // x is 0..33, could be 6 bits
			this.vertexArray[cursor++] = blockPos[1] + side.verts[vertexIndex * 3 + 1] // y is 0..33, could be 6 bits
			this.vertexArray[cursor++] = blockPos[2] + side.verts[vertexIndex * 3 + 2] // z is 0..33, could be 6 bits
			this.vertexArray[cursor++] = uvs[vertexIndex * 2 + 0]                      // uv could be compressed into a single integer per vertex, describing the corner to use
			this.vertexArray[cursor++] = uvs[vertexIndex * 2 + 1]                      // ... 32 bits = 31*31 = 961
			this.vertexArray[cursor++] = 1 * brightnesses[vertexIndex]									// these 3 floats could be 2 bits, since there are only 4 possible brightnesses with AO
			this.vertexArray[cursor++] = 1 * brightnesses[vertexIndex]									// ...
			this.vertexArray[cursor++] = 1 * brightnesses[vertexIndex]									// ... SUBTOTAL (without uvs): 6+6+6+2 = only 20 bits! (+32 for uvs, this is roughly 1/4 of the size!)
		}
		this.writeList.push(quadId)
	}
	clearQuad(quadId) {
		var cursor = quadId * geometrics.quadVertexByteSize
		for (var i = 0; i < 4; i += 1) {
			// make the triangles degenerate by setting their positions to the same point
			this.vertexArray[cursor + 0] = 0
			this.vertexArray[cursor + 1] = 0
			this.vertexArray[cursor + 2] = 0
			cursor += geometrics.quadVertexByteSize
		}
		this.writeList.push(quadId)
	}
	updateVAO(renderBudget) {
		if (renderBudget > 0 && this.writeList.length > 0) {

			gl.bindBuffer(gl.ARRAY_BUFFER, this.vao.glBuffer)

			// TODO: optimizations! this strategy is pretty naive...
			var minQuadIndex = Infinity
			var maxQuadIndex = 0
			this.writeList.forEach(quadToWrite => {
				minQuadIndex = Math.min(minQuadIndex, quadToWrite)
				maxQuadIndex = Math.max(maxQuadIndex, quadToWrite)
			})

			var quadPushCount = maxQuadIndex - minQuadIndex + 1

			this.writeList = []
			renderBudget -= Math.min(quadPushCount, 200) // increase the budget cost of small updates, since 1x1000 bufferSubData calls probably costs way more than 1000x1

			gl.bufferSubData(gl.ARRAY_BUFFER, minQuadIndex * 128, this.vertexArray.subarray(minQuadIndex * 32, (maxQuadIndex + 1) * 32)) // 128 = 8 elements per vertex * 4 verts per quad * 4 bytes per element?
		}
	}
	render(renderBudget, quadCount) {
		renderBudget = this.updateVAO(renderBudget)
		this.vao.partialRender(quadCount)
		return renderBudget
	}
}

module.exports = EngineChunkMesh
