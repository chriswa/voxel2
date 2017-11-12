const geometrics = require("geometrics")
const Pool = require("Pool")

const EngineChunkVertexArrayPool = new Pool(() => new Float32Array(geometrics.maxQuadsPerMesh * geometrics.quadVertexByteSize).buffer)

module.exports = EngineChunkVertexArrayPool
