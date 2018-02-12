import * as _ from "lodash"
import DebugFrameLogger from "../DebugFrameLogger"


/*
	USAGE
	=====

	// main script

	const taskId = WorkerManager.queueTask(
		"taskType1",
		() => { // onStart
			const payload: WorkerPayload = { "foo": "bar", "array": myUInt8Array }
			const transferableObjects: Array<any> = [ myUInt8Array ]
			return { payload, transferableObjects }
		},
		(payload: WorkerPayload) => {
			console.log(payload)
		}
	)

	// worker script

	WorkerObligation({
		"taskType1": (requestPayload, responseCallback) => {
			const responsePayload: WorkerPayload = { "foo": "bar", "array": myUInt8Array }
			const transferableObjects: Array<any> = [ myUInt8Array ]
			responseCallback(responsePayload, transferableObjects)
		},
		"taskType1.cancel": () => {}, // unimplemented
	})

*/

export type WorkerPayload = { taskId?: number, taskType?: string, [key: string]: any }
export type WorkerOnStart = () => { requestPayload: WorkerPayload, transferableObjects: Array<any> } | undefined
export type WorkerOnComplete = (responsePayload: WorkerPayload) => void

export class WorkerController {

	activeTaskId: number
	activeTaskType: string
	onResponse: WorkerOnComplete

	constructor(public worker: Worker, public workerId: number) {
		this.worker.addEventListener('message', (e: MessageEvent) => {
			const responsePayload: WorkerPayload = e.data
			if (responsePayload.taskId !== this.activeTaskId) { return } // old job? ignore response
			if (!this.onResponse) { return } // already called onResponse once? ignore response

			// clear this.onResponse before calling it, since it may start this worker again
			const onResponse = this.onResponse
			this.onResponse = undefined
			onResponse(responsePayload)
		})
	}
	start(taskId: number, taskType: string, requestPayload: WorkerPayload, transferableObjects: Array<any>, onResponse: WorkerOnComplete) {
		this.onResponse = onResponse
		this.activeTaskId = taskId
		this.activeTaskType = taskType
		requestPayload.taskId = taskId
		requestPayload.taskType = taskType
		this.worker.postMessage(requestPayload, transferableObjects) // transfer with "Transferable Objects"
	}
	cancel() {
		// this may safely be ignored by the worker
		this.worker.postMessage({ cancelTask: this.activeTaskId })
	}
}



// WorkerManager
// =============

type Task = {
	taskId: number,
	taskType: string,
	assignedWorkerId?: number,
	cancelled?: boolean,
	onStart: WorkerOnStart,
	onComplete: WorkerOnComplete,
	onCancelled: WorkerOnComplete,
}

let taskIdCounter: number = 0
const activeTasksByWorkerId: { [key: number]: Task } = {}
let workerControllers: Array<WorkerController> = []
const inactiveWorkerControllers: Array<WorkerController> = []
const queuedTasks: Array<Task> = []

// initialize workers
export function init(workerControllers_: Array<WorkerController>) {
	workerControllers = workerControllers_
	workerControllers.forEach(workerController => {
		inactiveWorkerControllers.push(workerController)
	})
}

export function queueTask(taskType: string, onStart: WorkerOnStart, onComplete: WorkerOnComplete, onCancelled: WorkerOnComplete) {
	taskIdCounter += 1
	const taskId = taskIdCounter // unique taskId
	const task: Task = { taskId, taskType, onStart, onComplete, onCancelled }
	queuedTasks.push(task)
	processQueue()
	return taskId
}

function processQueue() {
	while (inactiveWorkerControllers.length > 0 && queuedTasks.length > 0) {
		const task = queuedTasks.shift()
		const worker = inactiveWorkerControllers.pop()
		task.assignedWorkerId = worker.workerId
		startWorker(worker, task)
	}
}

function startWorker(worker: WorkerController, task: Task) {
	DebugFrameLogger("WorkerManager.startWorker")

	const startResponse = task.onStart()
	if (!startResponse) { return } // task was cancelled by onStart
	const { requestPayload, transferableObjects } = startResponse

	activeTasksByWorkerId[task.taskId] = task

	worker.start(task.taskId, task.taskType, requestPayload, transferableObjects, (responsePayload: WorkerPayload) => {
		DebugFrameLogger("WorkerManager worker response")
		delete activeTasksByWorkerId[task.taskId]
		inactiveWorkerControllers.push(worker)
		processQueue() // now that this worker's free, assign another task to it if one is available!
		if (task.cancelled) {
			task.onCancelled(responsePayload)
		}
		else {
			task.onComplete(responsePayload)
		}
	})
}

export function cancelTask(taskId: number): boolean {
	// if the task is still in the queue, simply remove it (we never called onStart, so according to our contract, we don't need to call onComplete)
	const taskFromQueue = _.remove(queuedTasks, (task: Task) => task.taskId === taskId)
	if (taskFromQueue.length) {
		return true
	}
	// otherwise, we need to stop an active worker...
	const task = activeTasksByWorkerId[taskId]
	if (task) {
		const workerController: WorkerController = workerControllers[task.assignedWorkerId]
		workerController.cancel() // fire off the cancel message and continue waiting for a reply... (since we don't want to overload a worker that's still working)
		task.cancelled = true // we will ignore the reply
	}
	else {
		debugger
	}
	return false
}
