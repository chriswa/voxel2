import * as WorkerManager from "./WorkerManager"
import Worker from 'worker-loader?{"name":"worker.js"}!../worker'

const estimatedLogicalCoresAvailable = (navigator.hardwareConcurrency || 4) - 2

export default {
	init() {
		const workerControllers = []
		for (let workerId = 0; workerId < estimatedLogicalCoresAvailable; workerId += 1) {
			const worker: Worker = new Worker() // MAGIC!
			const workerController: WorkerManager.WorkerController = new WorkerManager.WorkerController(worker, workerId)
			workerControllers[workerId] = workerController
		}
		WorkerManager.init(workerControllers)
	}
}
