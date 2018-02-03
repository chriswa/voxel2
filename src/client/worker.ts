import * as WorkerObligation from "./worker/WorkerObligation"
import TaskGenerateChunk from "./worker/TaskGenerateChunk"
import TaskDrawInternalVerts from "./worker/TaskDrawInternalVerts"

importScripts('//unpkg.com/lodash@4.17.4/lodash.js')

WorkerObligation.registerTaskHandlers([
	TaskGenerateChunk,
	TaskDrawInternalVerts,
])
