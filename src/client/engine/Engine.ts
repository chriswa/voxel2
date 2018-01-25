import * as _ from "lodash"
import * as geometrics from "geometrics"
import EngineChunk from "./chunk/EngineChunk"
import EngineChunkRenderer from "./chunk/EngineChunkRenderer"
import EngineChunkBuilder from "./chunk/EngineChunkBuilder"
import Pool from "Pool"
import v3 from "v3"
import * as twgl from "twgl.js"
import PlayerInput from "./PlayerInput"
import LocalAuthority from "client/LocalAuthority"
import ChunkData from "client/ChunkData"
import DebugHud from "./DebugHud"
import Config from "../Config"
import * as WorkerManager from "../WorkerManager"

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

	authority: LocalAuthority // TODO: AuthorityInterface (to support RemoteAuthority)
	started: boolean
	playerPos: v3
	playerRot: v3
	chunks: { [key: string]: EngineChunk }
	cancelledChunks: { [key: string]: boolean }
	playerInput: PlayerInput
	debugHud: DebugHud

	constructor(authority: LocalAuthority) {
		this.authority = authority
		this.started = false
		this.playerPos = new v3(0, 0, 0)
		this.playerRot = new v3(0, 0, 0) // pitch, heading, _roll
		this.chunks = {}
		this.cancelledChunks = {}
		this.playerInput = new PlayerInput(event => { this.onPlayerInputClick(event) })

		this.debugHud = new DebugHud()

		gl.enable(gl.DEPTH_TEST)
		gl.enable(gl.CULL_FACE)
	}

	//
	onPlayerInputClick(event: MouseEvent) {
		console.log(`mouse button clicked: ${event.button}`)
	}


	// "auth" methods are called by authority
	authSetPlayerTransform(newPos: v3, newRot: v3) {
		this.playerPos.setFrom(newPos)
		this.playerRot.setFrom(newRot)
		this.playerInput.pitch = newRot.x
		this.playerInput.heading = newRot.y
	}
	authAddChunkData(chunkData: ChunkData) {
		delete this.cancelledChunks[chunkData.id]

		// TODO: pass chunkData to webworker, when it's finished, get back chunkData, 0+ vertex buffers, and quadCount
		// ...but for now, just do what the webworker will do in this thread
		const quadIdsByBlockAndSide = quadIdsByBlockAndSidePool.acquire()
		if (<boolean>Config.chunkInternalWorkers) {

			const vertexArrays = [] ;;; // TODO: if the main pool has an item in it, pass it along to the worker to use (to avoid unnecessary allocations)

			const workerTaskId = WorkerManager.queueTask(
				"w_chunkPreBuild",
				() => {  // onStart
					const requestPayload = {
						blockData: chunkData.blocks.buffer,
						quadIdsByBlockAndSide: quadIdsByBlockAndSide.buffer,
						vertexArrays,
					}
					const transferableObjects = [
						chunkData.blocks.buffer,
						quadIdsByBlockAndSide.buffer,
						...(vertexArrays.map(a => a.buffer))
					]
					return { requestPayload, transferableObjects }
				},
				(responsePayload: WorkerManager.WorkerPayload) => {

					// was it cancelled in the meantime?
					if (this.cancelledChunks[chunkData.id]) {
						delete this.cancelledChunks[chunkData.id]
					}
					else {

						chunkData.blocks = new Uint8Array(responsePayload.blockData) // transfered back!
						this.addPartiallyPrebuiltChunk(
							chunkData,
							<number>responsePayload.quadCount,
							responsePayload.vertexArrays.map(buffer => new Float32Array(buffer)),
							new Uint16Array(responsePayload.quadIdsByBlockAndSide)
						)
					}
				}
			)

		}
		else {
			const { quadCount, vertexArrays } = EngineChunkBuilder.drawInternalChunkQuads(chunkData.blocks, quadIdsByBlockAndSide)
			this.addPartiallyPrebuiltChunk(chunkData, quadCount, vertexArrays, quadIdsByBlockAndSide)
		}
	}
	addPartiallyPrebuiltChunk(chunkData: ChunkData, quadCount: number, initialVertexArrays: Array<Float32Array>, quadIdsByBlockAndSide: Uint16Array) {
		// create our chunk object
		const chunk = new EngineChunk(chunkData, quadCount, initialVertexArrays, quadIdsByBlockAndSide)
		this.chunks[chunkData.id] = chunk

		// attach chunk to neighbours, stitching meshes as required
		const neighbourChunkPos = new v3()
		geometrics.Sides.each(side => {
			neighbourChunkPos.setSum(chunkData.pos, side.deltaV3)
			const chunkTestId = neighbourChunkPos.toString()
			const neighbourChunk = this.chunks[chunkTestId]
			if (neighbourChunk) {
				chunk.attachNeighbour(side, neighbourChunk)
				neighbourChunk.attachNeighbour(side.opposite, chunk)
			}
		})
		EngineChunkBuilder.stitchChunks(chunk)
	}
	authRemoveChunkData(chunkData: ChunkData) {
		const chunk = this.chunks[chunkData.id]
		if (chunk) {
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
		else {
			this.cancelledChunks[chunkData.id] = true
		}
	}
	authAddEntity() {
	}
	authRemoveEntity() {
	}
	authStart() {
		this.started = true
	}
	authOnFrame(_time: number) {
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

		const speed = 0.6

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

		this.debugHud.updatePlayer(this.playerPos, this.playerRot)
	}
	render(playerRotationMatrix: Array<number>) {
		// handle resized browser window
		twgl.resizeCanvasToDisplaySize(gl.canvas)
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

		// clear to black
		gl.clearColor(0, 0, 0, 1)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		this.renderChunks(playerRotationMatrix)
	}
	renderChunks(playerRotationMatrix: Array<number>) {
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
			//m4.translation(chunk.worldPos.clone().multiplyScalar(1.001).a, worldViewProjectionMatrix) // VISIBLE GAP (and accumulated errors)
			m4.multiply(viewProjectionMatrix, worldViewProjectionMatrix, worldViewProjectionMatrix)
			EngineChunkRenderer.setWorldViewProjectionMatrix(worldViewProjectionMatrix)

			renderBudget = chunk.renderStep(renderBudget)
		})
	}
}