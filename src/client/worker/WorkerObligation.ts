export type WorkerPayload = { taskId?: number, taskType?: string, [key: string]: any }
export type ResponseCallback = (responsePayload: WorkerPayload, transferableObjects: Array<any>) => void
export interface TaskHandler { id: string, work: (requestPayload: WorkerPayload, responseCallback: ResponseCallback) => void }

export function registerTaskHandlers(taskHandlersArray: Array<TaskHandler>) {
	const ctx: Worker = self as any
	let activeTaskId: number
	let activeTaskType: string

	const taskHandlersByType: { [key: string]: TaskHandler } = {}
	taskHandlersArray.forEach(taskHandler => { taskHandlersByType[taskHandler.id] = taskHandler })

	ctx.addEventListener("message", (event) => {
		const requestPayload: WorkerPayload = event.data

		if (requestPayload.cancelTask) {
			//console.log("worker task cancelled (but unable to stop non-incremental task)")
		}
		else if (activeTaskId) {
			console.error(`Worker was messaged to start a new task before finishing the previous task!?`)
		}
		else {
			// start a new task!
			activeTaskId = requestPayload.taskId
			activeTaskType = requestPayload.taskType

			const taskHandler = taskHandlersByType[activeTaskType]
			taskHandler.work(requestPayload, (responsePayload, transferableObjects) => {
				responsePayload.taskId = activeTaskId
				activeTaskId = undefined
				activeTaskType = undefined
				ctx.postMessage(responsePayload, transferableObjects)
			})
		}

	})
}
