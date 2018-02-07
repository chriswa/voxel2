import * as geometrics from "geometrics"
import Pool from "Pool"

function createPool(): Pool<geometrics.VertexArrayType> {
	return new Pool(() => {
		return new Int32Array(geometrics.maxQuadsPerMesh * geometrics.quadVertexByteSize)
	})
}

export default {
	mainPool: createPool(),
	acquire(): geometrics.VertexArrayType {
		return this.mainPool.acquire()
	},
	release(vertexArray: geometrics.VertexArrayType) {
		this.mainPool.release(vertexArray)
	},
	createPrefilledPool(existingItems: Array<geometrics.VertexArrayType>): Pool<geometrics.VertexArrayType> {
		const pool = createPool()
		pool.items = existingItems
		return pool
	},
}
