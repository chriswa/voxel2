import * as geometrics from "geometrics"
import Pool from "Pool"

function createPool(): Pool<Float32Array> {
	//return new Pool(() => new Float32Array(geometrics.maxQuadsPerMesh * geometrics.quadVertexByteSize).buffer)
	return new Pool(() => new Float32Array(geometrics.maxQuadsPerMesh * geometrics.quadVertexByteSize))
}

export default {
	mainPool: createPool(),
	acquire(): Float32Array {
		return this.mainPool.acquire()
	},
	release(vertexArray: Float32Array) {
		this.mainPool.release(vertexArray)
	},
	createPrefilledPool(existingItems: Array<Float32Array>): Pool<Float32Array> {
		const pool = createPool()
		pool.items = existingItems
		return pool
	},
}
