const geometrics = require("geometrics")
const Pool = require("Pool")

function createPool() {
	return new Pool(() => new Float32Array(geometrics.maxQuadsPerMesh * geometrics.quadVertexByteSize).buffer)
}

module.exports = {
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
