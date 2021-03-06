import * as geometrics from "geometrics"
import EngineChunkVertexArrayPool from "./EngineChunkVertexArrayPool"
import EngineChunkMesh from "./EngineChunkMesh"
import ChunkData from "../../ChunkData"
import v3 from "v3"
import BlockPos from "BlockPos"


export default class EngineChunk {

	chunkData: ChunkData
	quadCount: number
	meshes: Array<EngineChunkMesh>
	quadIdsByBlockAndSide: Uint16Array
	worldPos: v3
	neighboursBySideId: Array<EngineChunk>
	quadDirtyList: Array<number>
	quadHoleList: Array<number>

	constructor(chunkData: ChunkData, quadCount: number, initialVertexArrays: Array<geometrics.VertexArrayType>, quadIdsByBlockAndSide: Uint16Array) {
		this.chunkData = chunkData
		//console.log(`new EngineChunk ${this.id}`)
		this.quadCount = quadCount
		this.meshes = []
		//console.log(`initialVertexArrays: quadCount = ${quadCount}`)
		initialVertexArrays.forEach((initialVertexArray, i) => {
			//if (i > 0) { return }
			const initialWriteCount = Math.min(geometrics.maxQuadsPerMesh, quadCount - (i * geometrics.maxQuadsPerMesh))
			//console.log(`initialVertexArray: initialWriteCount = ${initialWriteCount}`)
			this.meshes.push(new EngineChunkMesh(undefined, initialVertexArray, initialWriteCount))
		})
		//console.log(this.meshes)
		this.quadIdsByBlockAndSide = quadIdsByBlockAndSide

		this.worldPos = chunkData.pos.clone().multiplyScalar(geometrics.CHUNK_SIZE)
		this.neighboursBySideId = []
		this.quadDirtyList = [] // quads which have been removed this frame and have not been written to (candidates for intra-frame reuse)
		this.quadHoleList = [] // quads which may be reused, but have already been zero'd out (dirty quads that did not get used)
	}
	addNewMesh() {
		const newVertexArray: geometrics.VertexArrayType = new Uint32Array(EngineChunkVertexArrayPool.acquire())
		this.meshes.push(new EngineChunkMesh(undefined, newVertexArray, 0))
	}
	destroy() {
		//console.log(`EngineChunk.destroy ${this.id}`)
		this.meshes.forEach(mesh => {
			EngineChunkVertexArrayPool.release(mesh.vertexArray)
			mesh.vao.destroy()
		})
	}
	get id() {
		return this.chunkData.pos.toString()
	}

	attachNeighbour(side: geometrics.SideType, neighbourChunk: EngineChunk) {
		this.neighboursBySideId[side.id] = neighbourChunk
	}
	detatchNeighbour(side: geometrics.SideType) {
		this.neighboursBySideId[side.id] = undefined
	}

	addQuad(blockPos: BlockPos, side: geometrics.SideType, uvs: Array<number>, brightnesses: Array<number>) {
		let quadId
		// prefer to draw over dirty quads, which will need to be updated anyway
		if (this.quadDirtyList.length) {
			quadId = this.quadDirtyList.shift()
		}
		// second preference is to fill up holes left by previously cleaned up quads, to avoid expanding our draw range and ultimately running out of space
		else if (this.quadHoleList.length) {
			quadId = this.quadHoleList.shift()
		}
		// if there are no dirty quads or holes to fill, append quads to the end
		else {
			quadId = this.quadCount
			this.quadCount += 1
		}

		const meshIndex = Math.floor(quadId / geometrics.maxQuadsPerMesh)

		// do we need to add a new mesh?
		if (meshIndex > this.meshes.length - 1) {
			this.addNewMesh()
		}

		const mesh = this.meshes[meshIndex]
		const meshQuadId = quadId % geometrics.maxQuadsPerMesh

		const blockAndSideId = blockPos.i * 6 + side.id
		// DEBUG (disabled along with unstitching, for now)
		//if (this.quadIdsByBlockAndSide[blockAndSideId] !== 0) {
		//	console.log(`EngineChunk.addQuad: already a quad at ${blockPos.toString()}->${side.name}`)
		//	const buggyQuadId = this.quadIdsByBlockAndSide[blockAndSideId]
		//	const buggyMeshIndex = Math.floor(buggyQuadId / geometrics.maxQuadsPerMesh)
		//	const buggyMesh = this.meshes[buggyMeshIndex]
		//	const buggyMeshQuadId = buggyQuadId % geometrics.maxQuadsPerMesh
		//	const buggyCursor = buggyMeshQuadId * geometrics.quadVertexByteSize
		//	for (let i = 0; i < 4; i += 1) {
		//		console.log(buggyMesh.vertexArray.subarray(buggyCursor + i*8, (buggyCursor + i * 8) + 7).join(', '))
		//	}
		//}

		mesh.drawQuad(meshQuadId, blockPos, side, uvs, brightnesses)

		// DEBUG (disabled along with unstitching, for now)
		//if (this.quadIdsByBlockAndSide[blockAndSideId] !== 0) {
		//	console.log(`new quad:`)
		//	const newCursor = meshQuadId * geometrics.quadVertexByteSize
		//	for (let i = 0; i < 4; i += 1) {
		//		console.log(mesh.vertexArray.subarray(newCursor + i * 8, (newCursor + i * 8) + 7).join(', '))
		//	}
		//}

		this.quadIdsByBlockAndSide[blockAndSideId] = quadId + 1
		
		return quadId
	}
	removeQuad(blockPos: BlockPos, side: geometrics.SideType) {
		const blockAndSideId = blockPos.i * 6 + side.id
		const quadId = this.quadIdsByBlockAndSide[blockAndSideId] - 1
		if (quadId > -1) {
			//console.log(`chunk ${this.id} removeQuad ${quadId}`)
			this.quadIdsByBlockAndSide[blockAndSideId] = 0
			this.quadDirtyList.push(quadId) // leave it in the vertexArray for now, in case another quad needs to be drawn this frame!
		}
	}
	updateQuadAO(blockPos: BlockPos, side: geometrics.SideType, uvs: Array<number>, brightnesses: Array<number>) {
		const quadId = blockPos.getQuadId(side)
		const meshIndex = Math.floor(quadId / geometrics.maxQuadsPerMesh)
		const mesh = this.meshes[meshIndex]
		const meshQuadId = quadId % geometrics.maxQuadsPerMesh

		const blockAndSideId = blockPos.i * 6 + side.id
		if (this.quadIdsByBlockAndSide[blockAndSideId] === 0) { debugger }

		mesh.updateQuadAO(meshQuadId, blockPos, side, uvs, brightnesses)
	}

	renderStep(renderBudget: number) {
		this.cleanupRemovedQuads()
		this.meshes.forEach((mesh, meshId) => {
			let meshQuadCount = geometrics.maxQuadsPerMesh // all meshes except the last one should render maxQuadsPerMesh
			if (meshId === this.meshes.length - 1) { // the last mesh...
				meshQuadCount = ((this.quadCount - 1) % geometrics.maxQuadsPerMesh) + 1 // should render the remaining quads (but beware if quadCount === maxQuadsPerMesh!)
			}
			renderBudget = mesh.render(renderBudget, meshQuadCount)
		})
		return renderBudget
	}
	cleanupRemovedQuads() {
		if (this.quadDirtyList.length) {
			this.quadDirtyList.forEach(quadId => {
				const meshIndex = Math.floor(quadId / geometrics.maxQuadsPerMesh)
				const mesh = this.meshes[meshIndex]
				const meshQuadId = quadId % geometrics.maxQuadsPerMesh

				mesh.clearQuad(meshQuadId)

				this.quadHoleList.push(quadId)
			})
			this.quadDirtyList = []
		}
	}

}
