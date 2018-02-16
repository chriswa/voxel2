import * as geometrics from "geometrics"
import gl from "gl"
import * as twgl from "twgl.js"
import Pool from "Pool"
import EngineChunkMeshVAO from "./EngineChunkMeshVAO"

const packedAttribOrder = [
	"a_packed",
	"a_junk", // see junkBuffer below
]

const vertexShaderSource = `#version 300 es
	precision mediump float;

	const vec3 sideTransforms[24] = vec3[](
		vec3(0., 1., 1.), vec3(1., 1., 1.), vec3(1., 1., 0.), vec3(0., 1., 0.),
		vec3(0., 0., 0.), vec3(1., 0., 0.), vec3(1., 0., 1.), vec3(0., 0., 1.),
		vec3(1., 0., 1.), vec3(1., 1., 1.), vec3(0., 1., 1.), vec3(0., 0., 1.),
		vec3(0., 0., 0.), vec3(0., 1., 0.), vec3(1., 1., 0.), vec3(1., 0., 0.),
		vec3(1., 0., 0.), vec3(1., 1., 0.), vec3(1., 1., 1.), vec3(1., 0., 1.),
		vec3(0., 0., 1.), vec3(0., 1., 1.), vec3(0., 1., 0.), vec3(0., 0., 0.)
	);

	uniform mat4 u_worldViewProjection;
	in ivec2 a_packed;
	in int a_junk;
	out vec2 v_texcoord;
	out float v_color;

	void main() {
		int cornerId = gl_VertexID % 4; 
		cornerId += a_junk; // XXX: force this attribute to not get optimized away
		int sideId = (a_packed[0] >> 15) & 0x7;
		vec3 cornerPos = sideTransforms[(sideId * 4) + cornerId];
		//float cornerX = sideTransforms[(sideId * 12) + (cornerId * 3) + 0];
		//float cornerY = sideTransforms[(sideId * 12) + (cornerId * 3) + 1];
		//float cornerZ = sideTransforms[(sideId * 12) + (cornerId * 3) + 2];

		vec4 position = vec4(
			float((a_packed[0] >> 0) & 0x1f) + cornerPos.x,
			float((a_packed[0] >> 5) & 0x1f) + cornerPos.y,
			float((a_packed[0] >> 10) & 0x1f) + cornerPos.z,
			1.
		);
		vec2 texcoord = vec2(
			(float((a_packed[1] >> 0) & 0xf) + cornerPos.x) / 16.,
			(float((a_packed[1] >> 4) & 0xf) + cornerPos.x) / 16.
		);
		float color = 1.;float((a_packed[1] >> 8) & 0xf) / 15.; // 0 .. 15 -> 0.0 .. 1.0

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

export const indexBufferGlType = gl.UNSIGNED_SHORT
export const indexBuffer = twgl.createBufferFromTypedArray(gl, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.ELEMENT_ARRAY_BUFFER)

// Firefox complains when every vertex attrib has a non-zero divisor, so add a junk buffer
// apparently what I'm doing is an "exotic corner case" and is disallowed by the WebGL2 spec: https://www.khronos.org/registry/webgl/specs/latest/2.0/#5.7
export const junkBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, junkBuffer)
gl.bufferData(gl.ARRAY_BUFFER, geometrics.maxQuadsPerMesh * 4, gl.DYNAMIC_DRAW)

export const texture = twgl.createTexture(gl, { src: "minecraft15.png", mag: gl.NEAREST, min: gl.NEAREST, level: 0, auto: false, crossOrigin: "anonymous" })
export const programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource], packedAttribOrder)
export const vaoPool = <Pool<EngineChunkMeshVAO>>new Pool(() => {
	return new EngineChunkMeshVAO()
})


export function createBufferInfo(glBuffer: WebGLBuffer) {
	return {
		numElements: geometrics.maxVerts * geometrics.uniqVertsPerFace,
		indices: indexBuffer,
		elementType: indexBufferGlType,
		attribs: {
			a_junk: { buffer: junkBuffer, numComponents: 1, type: gl.BYTE, divisor: 0, },
			a_packed: { buffer: glBuffer, numComponents: 2, type: gl.INT, stride: geometrics.quadByteStride, offset: 0, divisor: 1, },
			//a_position: { buffer: glBuffer, numComponents: 3, type: gl.FLOAT, stride: geometrics.quadByteStride, offset: 0, },
			//a_texcoord: { buffer: glBuffer, numComponents: 2, type: gl.FLOAT, stride: geometrics.quadByteStride, offset: 12, },
			//a_color: { buffer: glBuffer, numComponents: 1, type: gl.FLOAT, stride: geometrics.quadByteStride, offset: 20, },
		},
	}
}

export function acquireVAO() {
	return vaoPool.acquire()
}

export function releaseVAO(vao: EngineChunkMeshVAO) {
	//console.log(`releaseVAO`)
	vaoPool.release(vao)
}

export function initRenderProgram() {
	gl.useProgram(programInfo.program)
	const uniforms = {
		u_texture: texture,
	}
	twgl.setUniforms(programInfo, uniforms)
}

export function setWorldViewProjectionMatrix(worldViewProjectionMatrix: twgl.Mat4) {
	const uniforms = {
		u_worldViewProjection: worldViewProjectionMatrix,
	}
	twgl.setUniforms(programInfo, uniforms)
}
