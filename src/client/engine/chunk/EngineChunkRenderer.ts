import * as geometrics from "geometrics"
import gl from "gl"
import * as twgl from "twgl.js"
import Pool from "Pool"
import EngineChunkMeshVAO from "./EngineChunkMeshVAO"

//const bytesPerFloat = 4
//const vertexByteStride = bytesPerFloat * (3 + 2 + 1) // 32 === 4 * ( position (3 floats) + texcoord (2 floats) + rgba8 (3 floats) )
const vertexByteStride = 4 * 2

const packedAttribOrder = [
	"a_packed",
]

const vertexShaderSource = `#version 300 es
	precision mediump float;

	uniform mat4 u_worldViewProjection;
	in ivec2 a_packed;
	out vec2 v_texcoord;
	out float v_color;

	void main() {
		vec4 position = vec4(
			float((a_packed[0] >> 0) & 0x3f),
			float((a_packed[0] >> 6) & 0x3f),
			float((a_packed[0] >> 12) & 0x3f),
			1.
		);
		vec2 texcoord = vec2(
			float((a_packed[1] >> 0) & 0x1f) / 16.,
			float((a_packed[1] >> 5) & 0x1f) / 16.
		);
		float color = float((a_packed[0] >> 18) & 0x1f) / 16.;

		gl_Position = u_worldViewProjection * position;
		v_texcoord = texcoord;
		v_color = color;
	}`

const fragmentShaderSource = `#version 300 es
	precision mediump float;

	uniform sampler2D u_texture;
	in vec2 v_texcoord;
	in float v_color;
	out vec4 fragColor;

	void main() {
		fragColor = texture(u_texture, v_texcoord) * vec4(v_color, v_color, v_color, 1.);
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

const EngineChunkRenderer = {

	vertexByteStride: vertexByteStride,
	indexBufferGlType: indexBufferGlType,

	texture: twgl.createTexture(gl, { src: "minecraft15.png", mag: gl.NEAREST, min: gl.NEAREST, level: 0, auto: false, crossOrigin: "anonymous" }),
	programInfo: twgl.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource], packedAttribOrder),
	indexBuffer: createIndexBuffer(),
	vaoPool: <Pool<EngineChunkMeshVAO>>new Pool(() => {
		return new EngineChunkMeshVAO()
	}),

	createBufferInfo(glBuffer: WebGLBuffer) {
		return {
			numElements: geometrics.maxVerts * geometrics.uniqVertsPerFace,
			indices: this.indexBuffer,
			elementType: this.indexBufferGlType,
			attribs: {
				a_packed: { buffer: glBuffer, numComponents: 2, type: gl.INT, stride: this.vertexByteStride, offset: 0, },
				//a_position: { buffer: glBuffer, numComponents: 3, type: gl.FLOAT, stride: this.vertexByteStride, offset: 0, },
				//a_texcoord: { buffer: glBuffer, numComponents: 2, type: gl.FLOAT, stride: this.vertexByteStride, offset: 12, },
				//a_color: { buffer: glBuffer, numComponents: 1, type: gl.FLOAT, stride: this.vertexByteStride, offset: 20, },
			},
		}
	},

	acquireVAO() {
		return this.vaoPool.acquire()
	},
	releaseVAO(vao: EngineChunkMeshVAO) {
		//console.log(`releaseVAO`)
		this.vaoPool.release(vao)
	},
	initRenderProgram() {
		gl.useProgram(this.programInfo.program)
		const uniforms = {
			u_texture: this.texture,
		}
		twgl.setUniforms(this.programInfo, uniforms)
	},
	setWorldViewProjectionMatrix(worldViewProjectionMatrix: twgl.Mat4) {
		const uniforms = {
			u_worldViewProjection: worldViewProjectionMatrix,
		}
		twgl.setUniforms(this.programInfo, uniforms)
	},
}

export default EngineChunkRenderer
