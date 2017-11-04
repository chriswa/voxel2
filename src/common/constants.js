const CHUNK_SIZE         = 32
const CHUNK_SIZE_SQUARED = CHUNK_SIZE * CHUNK_SIZE
const CHUNK_SIZE_CUBED   = CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE
	
const facesPerCube     = 6
const uniqVertsPerFace = 4
const indicesPerFace   = 6

const maxVerts         = 64 * 1024 // this should be 64k
const maxQuadsPerChunk = maxVerts / uniqVertsPerFace
const maxQuadsPerMesh  = 1200

module.exports = {
	CHUNK_SIZE,
	CHUNK_SIZE_SQUARED,
	CHUNK_SIZE_CUBED,

	facesPerCube,
	uniqVertsPerFace,
	indicesPerFace,
	maxVerts,
	maxQuadsPerChunk,
	maxQuadsPerMesh,
}
