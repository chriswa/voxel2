import * as WorkerObligation from "./worker/WorkerObligation"
import TaskDrawInternalVerts from "./worker/TaskDrawInternalVerts"
import TaskGenerateAndMeshChunk from "./worker/TaskGenerateAndMeshChunk"

importScripts('//unpkg.com/lodash@4.17.4/lodash.js')

WorkerObligation.registerTaskHandlers([
	TaskDrawInternalVerts,
	TaskGenerateAndMeshChunk,
])
