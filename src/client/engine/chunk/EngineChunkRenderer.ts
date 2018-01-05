import * as geometrics from "geometrics"
import gl from "gl"
import * as twgl from "twgl.js"
import Pool from "Pool"

const bytesPerFloat = 4
const vertexByteStride = bytesPerFloat * (3 + 2 + 3) // 32 === 4 * ( position (3 floats) + texcoord (2 floats) + rgba8 (3 floats) )

const packedAttribOrder = [
	"a_position",
	"a_texcoord",
	"a_color",
]

const vertexShaderSource = `#version 300 es
	precision mediump float;

	uniform mat4 u_worldViewProjection;
	in vec4 a_position;
	in vec2 a_texcoord;
	in vec3 a_color;
	out vec2 v_texcoord;
	out vec3 v_color;

	void main() {
		gl_Position = u_worldViewProjection * a_position;
		v_texcoord = a_texcoord;
		v_color = a_color;
	}`

const fragmentShaderSource = `#version 300 es
	precision mediump float;

	uniform sampler2D u_texture;
	in vec2 v_texcoord;
	in vec3 v_color;
	out vec4 fragColor;

	void main() {
		fragColor = texture(u_texture, v_texcoord) * vec4(v_color, 1.);
	}`

const indexBufferGlType = gl.UNSIGNED_SHORT
function createIndexBuffer() {
	const indexArray = new Uint16Array(geometrics.maxQuadsPerMesh * geometrics.indicesPerFace)
	for (let quadIndex = 0, indexIndex = 0, vertIndex = 0; quadIndex < geometrics.maxQuadsPerMesh; quadIndex += 1, indexIndex += 6, vertIndex += 4) {
		indexArray[indexIndex + 0] = vertIndex + 0
		indexArray[indexIndex + 1] = vertIndex + 1
		indexArray[indexIndex + 2] = vertIndex + 2
		indexArray[indexIndex + 3] = vertIndex + 0
		indexArray[indexIndex + 4] = vertIndex + 2
		indexArray[indexIndex + 5] = vertIndex + 3
	}
	return twgl.createBufferFromTypedArray(gl, indexArray, gl.ELEMENT_ARRAY_BUFFER)
}

class EngineChunkMeshVAO {

	renderer: EngineChunkRenderer // TODO: refactor this away
	glBuffer: WebGLBuffer
	vaoInfo: any

	constructor(renderer: EngineChunkRenderer) {
		this.renderer = renderer

		// this would be: twgl.createBufferFromTypedArray(gl, this.array, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW)
		// ...except that we don't need to send the array to the GPU yet (because it doens't have any data in it yet)
		this.glBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, geometrics.maxQuadsPerMesh * 4 * vertexByteStride, gl.DYNAMIC_DRAW)

		const bufferInfo = {
			numElements: geometrics.maxVerts * geometrics.uniqVertsPerFace,
			indices: this.renderer.indexBuffer,
			elementType: indexBufferGlType,
			attribs: {
				a_position: { buffer: this.glBuffer, numComponents: 3, type: gl.FLOAT, stride: vertexByteStride, offset: 0, },
				a_texcoord: { buffer: this.glBuffer, numComponents: 2, type: gl.FLOAT, stride: vertexByteStride, offset: 12, },
				a_color: { buffer: this.glBuffer, numComponents: 3, type: gl.FLOAT, stride: vertexByteStride, offset: 20, },
			},
		}

		// yes, all this stuff really does need to be set for every buffer (unless I use ARB_vertex_attrib_binding)
		this.vaoInfo = twgl.createVertexArrayInfo(gl, [ this.renderer.programInfo ], bufferInfo)
	}
	partialRender(quadCount: number) {
		// note: it's assumed that EngineChunkRenderer.preRender() has already been called!
		twgl.setBuffersAndAttributes(gl, this.renderer.programInfo, this.vaoInfo)
		// twgl.drawBufferInfo(gl, this.vaoInfo) ... but i want to set an upper limit
		gl.drawElements(gl.TRIANGLES, quadCount * geometrics.indicesPerFace, indexBufferGlType, 0)
	}
	destroy() {
		this.renderer.releaseVAO(this)
	}
}

class EngineChunkRenderer {

	texture: WebGLTexture
	programInfo: any
	indexBuffer: WebGLBuffer
	vaoPool: Pool<EngineChunkMeshVAO>

	constructor() {
		this.texture = twgl.createTexture(gl, { src: "minecraft15.png", mag: gl.NEAREST, min: gl.NEAREST, level: 0, auto: false })
		this.programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource], packedAttribOrder)
		this.indexBuffer = createIndexBuffer()
		this.vaoPool = new Pool(() => new EngineChunkMeshVAO(this))
	}
	acquireVAO() {
		return this.vaoPool.acquire()
	}
	releaseVAO(vao: EngineChunkMeshVAO) {
		this.vaoPool.release(vao)
	}
	initRenderProgram() {
		gl.useProgram(this.programInfo.program)
		const uniforms = {
			u_texture: this.texture,
		}
		twgl.setUniforms(this.programInfo, uniforms)
	}
	setWorldViewProjectionMatrix(worldViewProjectionMatrix: Array<number>) {
		const uniforms = {
			u_worldViewProjection: worldViewProjectionMatrix,
		}
		twgl.setUniforms(this.programInfo, uniforms)
	}
}

export default new EngineChunkRenderer()
