import * as _ from "lodash"
import Worker from "worker-loader!./Worker"

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

const estimatedLogicalCoresAvailable = (navigator.hardwareConcurrency || 4) - 2

export type WorkerPayload = { taskId?: number, taskType?: string, [key: string]: any }
export type WorkerOnStart = () => { requestPayload: WorkerPayload, transferableObjects: Array<any> }
export type WorkerOnComplete = (responsePayload: WorkerPayload) => void

class WorkerController {

	worker: Worker = new Worker() // spawn WebWorker!
	activeTaskId: number
	activeTaskType: string
	onResponse: WorkerOnComplete

	constructor(public workerId: number) {
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
		// this may be ignored, but we're safe either way; we won't accept another task until we receive a message (e.g. "OK cancelled")
		this.worker.postMessage({ cancelTask: this.activeTaskId })
	}
}



// WorkerManager
// =============

type Task = {
	taskId: number,
	taskType: string,
	assignedWorkerId?: number,
	onStart: WorkerOnStart,
	onComplete: WorkerOnComplete,
}

let taskIdCounter: number = 0
const workerCount: number = estimatedLogicalCoresAvailable
const activeTasksByWorkerId: { [key: number]: Task } = {}
const workerControllers: Array<WorkerController> = []
const inactiveWorkerControllers: Array<WorkerController> = []
const queuedTasks: Array<Task> = []

// initialize workers
export function init() {
	for (let workerId = 0; workerId < workerCount; workerId += 1) {
		const workerController: WorkerController = new WorkerController(workerId)
		workerControllers[workerId] = workerController
		inactiveWorkerControllers.push(workerController)
	}
}

export function queueTask(taskType: string, onStart: WorkerOnStart, onComplete: WorkerOnComplete) {
	taskIdCounter += 1
	const taskId = taskIdCounter // unique taskId
	const task: Task = { taskId, taskType, onStart, onComplete }
	queuedTasks.push(task)
	processQueue()
	return taskId
}

function processQueue() {
	while (inactiveWorkerControllers.length > 0 && queuedTasks.length > 0) {
		const task = queuedTasks.shift()
		const worker = inactiveWorkerControllers.pop()
		task.assignedWorkerId = worker.workerId
		activeTasksByWorkerId[task.taskId] = task
		startWorker(worker, task)
	}
}

function startWorker(worker: WorkerController, task: Task) {
	const { requestPayload, transferableObjects } = task.onStart()

	worker.start(task.taskId, task.taskType, requestPayload, transferableObjects, (responsePayload: WorkerPayload) => {
		delete activeTasksByWorkerId[task.taskId]
		inactiveWorkerControllers.push(worker)
		processQueue() // now that this worker's free, assign another task to it if one is available!
		task.onComplete(responsePayload)
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
		workerController.cancel() // fire off the cancel message and continue waiting for a reply...
	}
	else {
		debugger
	}
	return false
}
