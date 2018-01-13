import * as geometrics from "geometrics"
import EngineChunkRenderer from "./EngineChunkRenderer"
import * as twgl from "twgl.js"

export default class EngineChunkMeshVAO {

	glBuffer: WebGLBuffer
	vaoInfo: any

	constructor() {

		// this would be: twgl.createBufferFromTypedArray(gl, this.array, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW)
		// ...except that we don't need to send the array to the GPU yet (because it doesn't have any data in it yet)
		this.glBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, geometrics.maxQuadsPerMesh * 4 * EngineChunkRenderer.vertexByteStride, gl.DYNAMIC_DRAW)

		const bufferInfo = {
			numElements: geometrics.maxVerts * geometrics.uniqVertsPerFace,
			indices: EngineChunkRenderer.indexBuffer,
			elementType: EngineChunkRenderer.indexBufferGlType,
			attribs: {
				a_position: { buffer: this.glBuffer, numComponents: 3, type: gl.FLOAT, stride: EngineChunkRenderer.vertexByteStride, offset: 0, },
				a_texcoord: { buffer: this.glBuffer, numComponents: 2, type: gl.FLOAT, stride: EngineChunkRenderer.vertexByteStride, offset: 12, },
				a_color: { buffer: this.glBuffer, numComponents: 3, type: gl.FLOAT, stride: EngineChunkRenderer.vertexByteStride, offset: 20, },
			},
		}

		// yes, all this stuff really does need to be set for every buffer (unless I use ARB_vertex_attrib_binding)
		this.vaoInfo = twgl.createVertexArrayInfo(gl, [EngineChunkRenderer.programInfo], bufferInfo)
	}
	partialRender(meshQuadCount: number) {
		// note: it's assumed that EngineChunkRenderer.preRender() has already been called!
		twgl.setBuffersAndAttributes(gl, EngineChunkRenderer.programInfo, this.vaoInfo) // i.e. gl.bindVertexArray(this.vaoInfo.vertexArrayObject)
		// twgl.drawBufferInfo(gl, this.vaoInfo) ... but i want to set an upper limit
		gl.drawElements(gl.TRIANGLES, meshQuadCount * geometrics.indicesPerFace, EngineChunkRenderer.indexBufferGlType, 0)
	}
	destroy() {
		EngineChunkRenderer.releaseVAO(this)
	}
}

