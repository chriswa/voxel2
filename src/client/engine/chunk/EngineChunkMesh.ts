import EngineChunkQuadWriter from "./EngineChunkQuadWriter"
import EngineChunkRenderer from "./EngineChunkRenderer"
import EngineChunkMeshVAO from "./EngineChunkMeshVAO"
import * as geometrics from "geometrics"
import v3 from "v3"
import BlockPos from "BlockPos"

export default class EngineChunkMesh {

	readyToRender: boolean = false
	minDirtyQuad: number = Infinity
	maxDirtyQuad: number = -Infinity

	constructor(public vao: EngineChunkMeshVAO, public vertexArray: Float32Array, initialWriteCount: number = 0) {
		this.vao = vao !== undefined ? vao : EngineChunkRenderer.acquireVAO()
		if (initialWriteCount) {
			//console.log(`initialWriteCount = ${initialWriteCount}`)
			this.minDirtyQuad = 0
			this.maxDirtyQuad = initialWriteCount - 1
		}
	}
	drawQuad(quadId: number, blockPos: BlockPos, side: geometrics.SideType, uvs: Array<number>, brightnesses: Array<number>) {
		EngineChunkQuadWriter.drawQuad(this.vertexArray, quadId, blockPos, side, uvs, brightnesses)
		this.minDirtyQuad = Math.min(this.minDirtyQuad, quadId)
		this.maxDirtyQuad = Math.max(this.maxDirtyQuad, quadId)
	}
	clearQuad(quadId: number) {
		EngineChunkQuadWriter.clearQuad(this.vertexArray, quadId)
		this.minDirtyQuad = Math.min(this.minDirtyQuad, quadId)
		this.maxDirtyQuad = Math.max(this.maxDirtyQuad, quadId)
	}
	updateQuadAO(quadId: number, blockPos: BlockPos, side: geometrics.SideType, uvs: Array<number>, brightnesses: Array<number>) {
		const changed = EngineChunkQuadWriter.updateQuadAO(this.vertexArray, quadId, blockPos, side, uvs, brightnesses)
		if (changed) {
			this.minDirtyQuad = Math.min(this.minDirtyQuad, quadId)
			this.maxDirtyQuad = Math.max(this.maxDirtyQuad, quadId)
		}
	}

	updateVAO(renderBudget: number) {
		if (renderBudget > 0 && this.minDirtyQuad !== Infinity) {

			//console.log(`EngineChunkMesh buffering quads ${this.minDirtyQuad} .. ${this.maxDirtyQuad}`)

			var quadPushCount = this.maxDirtyQuad - this.minDirtyQuad + 1
			renderBudget -= Math.max(quadPushCount, 200) // increase the budget cost of small updates, since 1x1000 bufferSubData calls probably costs way more than 1000x1

			gl.bindBuffer(gl.ARRAY_BUFFER, this.vao.glBuffer)
			gl.bufferSubData(gl.ARRAY_BUFFER,
				this.minDirtyQuad * geometrics.quadVertexByteSize * 4, // dstByteOffset
				this.vertexArray,
				this.minDirtyQuad * geometrics.quadVertexByteSize, // srcOffset
				quadPushCount * geometrics.quadVertexByteSize // length (bytes)
			)

			// nothing left to write
			this.minDirtyQuad = Infinity
			this.maxDirtyQuad = -Infinity

			this.readyToRender = true

			//gl.bindBuffer(gl.ARRAY_BUFFER, this.vao.glBuffer)
			//gl.bufferSubData(gl.ARRAY_BUFFER,
			//	this.minDirtyQuad * geometrics.quadVertexByteSize * 4, // dstByteOffset
			//	this.vertexArray,
			//	this.minDirtyQuad * geometrics.quadVertexByteSize, // srcOffset
			//	1 * geometrics.quadVertexByteSize // length (bytes)
			//)

			//gl.bindBuffer(gl.ARRAY_BUFFER, this.vao.glBuffer)
			//gl.bufferSubData(gl.ARRAY_BUFFER, this.minDirtyQuad * 128, this.vertexArray.subarray(this.minDirtyQuad * 32, (this.minDirtyQuad + 1) * 32)) // 128 = 8 elements per vertex * 4 verts per quad * 4 bytes per element?


			//this.minDirtyQuad += 1
			//if (this.minDirtyQuad > this.maxDirtyQuad) {
			//	this.minDirtyQuad = Infinity
			//	this.maxDirtyQuad = -Infinity
			//}
		}
		return renderBudget
	}
	render(renderBudget: number, quadCount: number) {
		renderBudget = this.updateVAO(renderBudget)
		if (this.readyToRender) {
			this.vao.partialRender(quadCount)
		}
		return renderBudget
	}
}
