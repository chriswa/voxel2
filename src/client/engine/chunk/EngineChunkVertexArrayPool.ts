import * as  geometrics from "geometrics"
import Pool from "Pool"

function createPool() {
	return new Pool(() => new Float32Array(geometrics.maxQuadsPerMesh * geometrics.quadVertexByteSize).buffer)
}

export default {
	mainPool: createPool(),
	acquire() {
		return this.mainPool.acquire()
	},
	release() {
		this.mainPool.release()
	},
	createPrefilledPool(existingItems) {
		const pool = createPool()
		pool.items = existingItems
		return pool
	},
}
