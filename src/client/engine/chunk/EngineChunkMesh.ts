import EngineChunkQuadWriter from "./EngineChunkQuadWriter"
import EngineChunkRenderer from "./EngineChunkRenderer"
import EngineChunkMeshVAO from "./EngineChunkMeshVAO"
import * as geometrics from "geometrics"
import v3 from "v3"
import BlockPos from "BlockPos"

export default class EngineChunkMesh {

	writeList: Array<number>

	constructor(public vao: EngineChunkMeshVAO, public vertexArray: Float32Array, private initialWriteCount: number = 0) {
		this.vao = vao !== undefined ? vao : EngineChunkRenderer.acquireVAO()
		this.writeList = []
	}
	drawQuad(quadId: number, blockPos: BlockPos, side: geometrics.SideType, uvs: Array<number>, brightnesses: Array<number>) {
		EngineChunkQuadWriter.drawQuad(this.vertexArray, quadId, blockPos, side, uvs, brightnesses)
		this.writeList.push(quadId)
	}
	clearQuad(quadId: number) {
		EngineChunkQuadWriter.clearQuad(this.vertexArray, quadId)
		this.writeList.push(quadId)
	}
	updateVAO(renderBudget: number) {
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

			gl.bufferSubData(gl.ARRAY_BUFFER,
				minQuadIndex * geometrics.quadVertexByteSize, // dstByteOffset
				this.vertexArray,
				minQuadIndex * geometrics.quadVertexByteSize / 4, // srcOffset (elements, not bytes!)
				quadPushCount * geometrics.quadVertexByteSize // length (bytes)
			)
		}
		return renderBudget
	}
	render(renderBudget: number, quadCount: number) {
		renderBudget = this.updateVAO(renderBudget)
		this.vao.partialRender(quadCount)
		return renderBudget
	}
}
