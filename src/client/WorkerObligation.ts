export type WorkerPayload = { taskId?: number, taskType?: string, [key: string]: any }
export type ResponseCallback = (responsePayload: WorkerPayload, transferableObjects: Array<any>) => void
export type TaskHandler = (requestPayload: WorkerPayload, responseCallback: ResponseCallback) => void

export function registerTaskHandlers(taskHandlers: { [key: string]: TaskHandler }) {
	const ctx: Worker = self as any
	let activeTaskId: number
	let activeTaskType: string

	ctx.addEventListener("message", (event) => {
		const requestPayload: WorkerPayload = event.data

		if (requestPayload.cancel) {
			console.error(`TODO: worker task cancellation`)
		}
		else if (activeTaskId) {
			console.error(`Worker was messaged to start a new task before finishing the previous task!?`)
		}
		else {
			// start a new task!
			activeTaskId = requestPayload.taskId
			activeTaskType = requestPayload.taskType

			const taskHandler = taskHandlers[activeTaskType]
			taskHandler(requestPayload, (responsePayload, transferableObjects) => {
				responsePayload.taskId = activeTaskId
				activeTaskId = undefined
				activeTaskType = undefined
				ctx.postMessage(responsePayload, transferableObjects)
			})
		}

	})
}
