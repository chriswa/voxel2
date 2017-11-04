const twgl = require("twgl.js")
const m4 = twgl.m4
const gl = document.getElementById("mainCanvas").getContext("webgl2")

gl.enable(gl.DEPTH_TEST)
gl.enable(gl.CULL_FACE)
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

const texture = twgl.createTexture(gl, { src: "minecraft15.png" })

const programInfo = twgl.createProgramInfo(gl, [
	// vertex shader
	`#version 300 es
    precision mediump float;

    uniform mat4 u_worldViewProjection;
    in vec4 a_position;
    in vec2 a_texcoord;
    out vec2 v_texcoord;

    void main() {
        gl_Position = u_worldViewProjection * a_position;
        v_texcoord = a_texcoord;
    }`,
	// fragment shader
	`#version 300 es
    precision mediump float;

    uniform sampler2D u_texture;
    in vec2 v_texcoord;
    out vec4 fragColor;

    void main() {
        fragColor = texture(u_texture, v_texcoord);
    }`
])

// sample cube
const bufferData = {
	a_position: [1,1,0,1,1,1,1,0,1,1,0,0,0,1,1,0,1,0,0,0,0,0,0,1,0,1,1,1,1,1,1,1,0,0,1,0,0,0,0,1,0,0,1,0,1,0,0,1,1,1,1,0,1,1,0,0,1,1,0,1,0,1,0,1,1,0,1,0,0,0,0,0],
	a_texcoord: [1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1],
	indices:    [0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23],
}

const bufferInfo = twgl.createBufferInfoFromArrays(gl, bufferData)

function render(time) {
	const uniforms = {
		u_texture: texture,
		u_time: time * 0.001,
		u_resolution: [gl.canvas.width, gl.canvas.height],
	}


	const fov = 30 * Math.PI / 180
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
	const zNear = 0.5
	const zFar = 10
	const projection = m4.perspective(fov, aspect, zNear, zFar)
	const eye = [1, 4, -6]
	const target = [0, 0, 0]
	const up = [0, 1, 0]

	const camera = m4.lookAt(eye, target, up)
	const view = m4.inverse(camera)
	const viewProjection = m4.multiply(projection, view)
	const world = m4.rotationY(time * 0.001)

	uniforms.u_viewInverse = camera
	uniforms.u_world = world
	uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world))
	uniforms.u_worldViewProjection = m4.multiply(viewProjection, world)





	twgl.resizeCanvasToDisplaySize(gl.canvas)
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

	gl.useProgram(programInfo.program)
	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
	twgl.setUniforms(programInfo, uniforms)
	twgl.drawBufferInfo(gl, bufferInfo)
}

module.exports = { render }