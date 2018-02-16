import * as geometrics from "geometrics"
import * as EngineChunkRenderer from "./EngineChunkRenderer"
import * as twgl from "twgl.js"

export default class EngineChunkMeshVAO {

	glBuffer: WebGLBuffer
	vaoInfo: any

	constructor() {

		// this would be: twgl.createBufferFromTypedArray(gl, this.array, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW)
		// ...except that we don't need to send the array to the GPU yet (because it doesn't have any data in it yet)
		this.glBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, geometrics.bufferByteSize, gl.DYNAMIC_DRAW)

		const bufferInfo = EngineChunkRenderer.createBufferInfo(this.glBuffer)

		// yes, all this stuff really does need to be set for every buffer (unless I use ARB_vertex_attrib_binding)
		this.vaoInfo = twgl.createVertexArrayInfo(gl, [EngineChunkRenderer.programInfo], bufferInfo)
	}
	partialRender(meshQuadCount: number) {
		// note: it's assumed that EngineChunkRenderer.preRender() has already been called!
		twgl.setBuffersAndAttributes(gl, EngineChunkRenderer.programInfo, this.vaoInfo) // i.e. gl.bindVertexArray(this.vaoInfo.vertexArrayObject)
		// twgl.drawBufferInfo(gl, this.vaoInfo) ... but i want to set an upper limit
		// gl.drawElementsInstanced(type, numElements, elementType === undefined ? gl.UNSIGNED_SHORT : bufferInfo.elementType, offset, instanceCount)
		gl.drawElementsInstanced(gl.TRIANGLES, 6, EngineChunkRenderer.indexBufferGlType, 0, meshQuadCount)
	}
	destroy() {
		EngineChunkRenderer.releaseVAO(this)
	}
}

