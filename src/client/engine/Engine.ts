import * as  geometrics from "geometrics"
import EngineChunk from "./chunk/EngineChunk"
import EngineChunkRenderer from "./chunk/EngineChunkRenderer"
import EngineChunkBuilder from "./chunk/EngineChunkBuilder"
import Pool from "Pool"
import v3 from "v3"
import twgl from "twgl.js"
import PlayerInput from "./PlayerInput"

const m4 = twgl.m4

const quadIdsByBlockAndSidePool = new Pool(
	() => new Uint16Array(geometrics.CHUNK_SIZE_CUBED * geometrics.facesPerCube),
	item => item.fill(0)
)

const projectionMatrix = m4.identity() // set below
const fov = 60 * Math.PI / 180
const zNear = 0.05
const zFar = 5000

export default class Engine {
	constructor(authority) {
		this.authority = authority
		this.started = false
		this.playerPos = new v3(0, 0, 0)
		this.playerRot = new v3(0, 0, 0) // pitch, heading, _roll
		this.chunks = {}
		this.playerInput = new PlayerInput(this)

		gl.enable(gl.DEPTH_TEST)
		gl.enable(gl.CULL_FACE)
	}

	//
	onPlayerInputClick(event) {
		console.log(event.button)
	}


	// "auth" methods are called by authority
	authSetPlayerTransform(newPos, newRot) {
		this.playerPos.setFrom(newPos)
		this.playerRot.setFrom(newRot)
		this.playerInput.pitch = newRot.x
		this.playerInput.heading = newRot.y
	}
	authAddChunkData(chunkData) {
		// TODO: pass chunkData to webworker, when it's finished, get back chunkData, 0+ vertex buffers, and quadCount
		// ...but for now, just do what the webworker will do in this thread
		const quadIdsByBlockAndSide = quadIdsByBlockAndSidePool.acquire()
		const { quadCount, vertexArrays } = EngineChunkBuilder.drawInternalChunkQuads(chunkData.blocks, quadIdsByBlockAndSide)

		// create our chunk object
		const chunk = new EngineChunk(chunkData, quadCount, vertexArrays, quadIdsByBlockAndSide)
		this.chunks[chunkData.id] = chunk

		// attach chunk to neighbours, stitching meshes as required
		const neighbourChunkPos = new v3()
		geometrics.Sides.each(side => {
			neighbourChunkPos.setSum(chunkData.pos, side.deltaV3)
			const chunkTestId = neighbourChunkPos.toString()
			const neighbourChunk = this.chunks[chunkTestId]
			if (neighbourChunk) {
				chunk.attachNeighbour(side, neighbourChunk, true)
				neighbourChunk.attachNeighbour(side.opposite, chunk, false)
			}
		})
		EngineChunkBuilder.stitchChunks(chunk)
	}
	authRemoveChunkData(chunkData) {
		const chunk = this.chunks[chunkData.id]
		geometrics.Sides.each(side => {
			const neighbourChunk = chunk.neighboursBySideId[side.id]
			if (neighbourChunk) {
				EngineChunkBuilder.unstitchChunk(neighbourChunk, side.opposite)
				neighbourChunk.detatchNeighbour(side.opposite)
			}
		})
		quadIdsByBlockAndSidePool.release(chunk.quadIdsByBlockAndSide)
		chunk.destroy()
		delete this.chunks[chunkData.id]
	}
	authAddEntity() {
	}
	authRemoveEntity() {
	}
	authUpdateInventory() { // ?
	}
	authStart() {
		this.started = true
	}
	authOnFrame(_time) {
		// TODO: if started, do player controls including gravity, and send current position to this.authority.simUpdatePlayerPos()
		// TODO: also call any other this.authority.sim* methods depending on player input

		// TESTING
		this.playerRot.set(this.playerInput.pitch, this.playerInput.heading, 0)
		const playerRotationMatrix = m4.identity()
		m4.rotateY(playerRotationMatrix, this.playerRot.y, playerRotationMatrix) // heading
		m4.rotateX(playerRotationMatrix, this.playerRot.x, playerRotationMatrix) // pitch

		const forwardInput = (this.playerInput.keysDown.s ? 1 : 0) + (this.playerInput.keysDown.w ? -1 : 0)
		const rightInput = (this.playerInput.keysDown.d ? 1 : 0) + (this.playerInput.keysDown.a ? -1 : 0)
		const upInput = (this.playerInput.keysDown.space ? 1 : 0) + (this.playerInput.keysDown.shift ? -1 : 0)

		// const forward = new v3(
		// 	Math.sin(this.playerInput.heading) * Math.cos(this.playerInput.pitch),
		// 	Math.sin(this.playerInput.pitch),
		// 	-Math.cos(this.playerInput.heading) * Math.cos(this.playerInput.pitch)
		// )
		// forward.multiplyScalar(0.5)
		// this.playerPos.add(forward)

		const speed = 0.3

		// right
		this.playerPos.a[0] += rightInput * playerRotationMatrix[0] * speed
		this.playerPos.a[1] += rightInput * playerRotationMatrix[1] * speed
		this.playerPos.a[2] += rightInput * playerRotationMatrix[2] * speed

		// up
		this.playerPos.a[0] += upInput * playerRotationMatrix[4] * speed
		this.playerPos.a[1] += upInput * playerRotationMatrix[5] * speed
		this.playerPos.a[2] += upInput * playerRotationMatrix[6] * speed

		// forward
		this.playerPos.a[0] += forwardInput * playerRotationMatrix[8] * speed
		this.playerPos.a[1] += forwardInput * playerRotationMatrix[9] * speed
		this.playerPos.a[2] += forwardInput * playerRotationMatrix[10] * speed

		this.authority.engineUpdatePlayerPos(this.playerPos, this.playerRot)

		this.render(playerRotationMatrix)
	}
	render(playerRotationMatrix) {
		// handle resized browser window
		twgl.resizeCanvasToDisplaySize(gl.canvas)
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

		// clear to black
		gl.clearColor(0, 0, 0, 1)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		this.renderChunks(playerRotationMatrix)
	}
	renderChunks(playerRotationMatrix) {
		EngineChunkRenderer.initRenderProgram()

		const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
		m4.perspective(fov, aspect, zNear, zFar, projectionMatrix)

		const cameraMatrix = m4.identity()
		m4.translate(cameraMatrix, this.playerPos.a, cameraMatrix)
		//console.log(this.playerInput.pitch, this.playerInput.heading)
		//m4.rotateY(cameraMatrix, -this.playerInput.heading, cameraMatrix)
		//m4.rotateX(cameraMatrix, this.playerInput.pitch, cameraMatrix)
		m4.multiply(cameraMatrix, playerRotationMatrix, cameraMatrix)
		//m4.rotateY(cameraMatrix, _time * 0.00004, cameraMatrix)
		const viewMatrix = m4.inverse(cameraMatrix)

		const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

		const worldViewProjectionMatrix = m4.identity()

		let renderBudget = 1000 // TODO: this is a totally arbitrary number
		_.each(this.chunks, chunk => {
			m4.translation(chunk.worldPos.a, worldViewProjectionMatrix)
			m4.multiply(viewProjectionMatrix, worldViewProjectionMatrix, worldViewProjectionMatrix)
			EngineChunkRenderer.setWorldViewProjectionMatrix(worldViewProjectionMatrix)

			renderBudget = chunk.render(renderBudget)
		})
	}
}