import * as geometrics from "geometrics"
import ChunkData from "../ChunkData"
import v3 from "v3"
import ChunkGeneration from "./ChunkGeneration"
import * as WorkerManager from "../worker/WorkerManager"
import TaskGenerateAndMeshChunk from "../worker/TaskGenerateAndMeshChunk"
import DebugChunkLogger from "../DebugChunkLogger"
import DebugFrameLogger from "../DebugFrameLogger"
import LocalAuthority from "./LocalAuthority"
import VoxelsInSphere from "VoxelsInSphere"
import DebugHud from "../engine/DebugHud"

const cursorPos = new v3()

export default class ChunkLoader {

	centerPos: v3
	addQueue: Array<v3>
	removeQueue: Array<string>
	tasks: { [key: string]: { taskId: number, tag: number } }
	sortedRelativePositions: Array<Array<number>>
	newTag: number

	constructor(private localAuthority: LocalAuthority, private radius: number) {
		this.centerPos = new v3(NaN, NaN, NaN)
		this.addQueue = []
		this.removeQueue = []
		this.tasks = {}
		this.sortedRelativePositions = VoxelsInSphere.getSortedList(radius)
		this.newTag = 1
	}
	updatePlayerPos(playerPos: v3) {
		const newCenterPos = geometrics.worldPosToChunkPos(playerPos)
		
		// no change? short circuit
		if (this.centerPos.exactEquals(newCenterPos)) {
			return
		}
		this.centerPos = newCenterPos
		console.log(`%cChunkLoader: new chunk center is ${newCenterPos.id}`, 'color: teal;')

		this.newTag = this.newTag === 1 ? 2 : 1 // toggle between 1 and 2
		this.addQueue = []
		this.removeQueue = []

		const positionCount = this.sortedRelativePositions.length
		for (let i = 0; i < positionCount; i += 1) {
			const deltaPos = this.sortedRelativePositions[i]
			const x = deltaPos[0] + newCenterPos.a[0]
			const y = deltaPos[1] + newCenterPos.a[1]
			const z = deltaPos[2] + newCenterPos.a[2]
			cursorPos.set(x, y, z)
			const cursorHash = x + ',' + y + ',' + z

			const loadedChunk = this.localAuthority.chunks[cursorHash]
			if (loadedChunk) {
				loadedChunk.chunkLoaderTag = this.newTag
			}
			else {
				const task = this.tasks[cursorHash]
				if (task) {
					task.tag = this.newTag
				}
				else {
					this.addQueue.push(cursorPos.clone())
				}
			}
		}

		for (let chunkId in this.localAuthority.chunks) {
			const chunk = this.localAuthority.chunks[chunkId]
			if (chunk.chunkLoaderTag !== this.newTag) {
				this.removeQueue.push(chunkId)
				chunk.chunkLoaderTag = this.newTag
				chunk.chunkLoaderUnloading = true
			}
			else {
				chunk.chunkLoaderUnloading = false
			}
		}

		for (let chunkId in this.tasks) {
			const task = this.tasks[chunkId]
			if (task.tag !== this.newTag) {
				TaskGenerateAndMeshChunk.cancel(task.taskId)
				delete this.tasks[chunkId]
			}
		}

	}
	onFrame() {
		if (this.removeQueue.length) {
			const removeChunkId = this.removeQueue.shift()
			this.localAuthority.onChunkUnloaded(this.localAuthority.chunks[removeChunkId])
		}
		if (this.addQueue.length) {
			const chunkPos = this.addQueue.shift()
			const chunkId = chunkPos.id
			const taskId = TaskGenerateAndMeshChunk.queue(
				chunkPos,
				(chunkData, quadCount, vertexArrays, quadIdsByBlockAndSide) => {
					chunkData.chunkLoaderTag = this.newTag
					chunkData.chunkLoaderUnloading = false
					this.localAuthority.onChunkLoaded(chunkData, quadCount, vertexArrays, quadIdsByBlockAndSide)
					delete this.tasks[chunkId]
				}
			)
			this.tasks[chunkId] = { taskId, tag: this.newTag }
		}
		DebugHud.updateChunks(Object.keys(this.localAuthority.chunks).length, this.addQueue.length, this.removeQueue.length)

	}
}
