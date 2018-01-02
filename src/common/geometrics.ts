import v3 from "v3"

export const CHUNK_SIZE         = 32
export const CHUNK_SIZE_SQUARED = CHUNK_SIZE * CHUNK_SIZE
export const CHUNK_SIZE_CUBED   = CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE
	
export const facesPerCube     = 6
export const uniqVertsPerFace = 4
export const indicesPerFace   = 6

export const maxVerts         = 64 * 1024 // this should be 64k
export const maxQuadsPerChunk = maxVerts / uniqVertsPerFace
export const maxQuadsPerMesh  = 1200

export const vertexByteSize = 8
export const quadVertexByteSize = vertexByteSize * 4

export function createIndexBufferTypedArray() {
	const array = new Uint32Array(maxQuadsPerChunk * indicesPerFace)
	let arrayIndex = 0
	let vertIndex = 0
	for (let quadIndex = 0; quadIndex < maxQuadsPerChunk; quadIndex += 1) {
		array[arrayIndex + 0] = vertIndex + 0
		array[arrayIndex + 1] = vertIndex + 1
		array[arrayIndex + 2] = vertIndex + 2
		array[arrayIndex + 3] = vertIndex + 0
		array[arrayIndex + 4] = vertIndex + 2
		array[arrayIndex + 5] = vertIndex + 3
		arrayIndex += 6
		vertIndex += 4
	}
	return array
}

export function worldPosToChunkPos(worldPos) {
	return worldPos.clone().divideScalar(CHUNK_SIZE).floor()
}

export function vectorToBlockIndex(v) {
	return v.x * CHUNK_SIZE_SQUARED + v.z * CHUNK_SIZE + v.y
}
// Sides

const T = { name: "TOP", id: 0, axis: 1, axisDelta: 1, verts: [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0,], dx: 0, dy: 1, dz: 0, size: CHUNK_SIZE, deltaIndex: 1, }
const B = { name: "BOTTOM", id: 1, axis: 1, axisDelta: -1, verts: [0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1,], dx: 0, dy: -1, dz: 0, size: CHUNK_SIZE, deltaIndex: -1, }
const N = { name: "NORTH", id: 2, axis: 2, axisDelta: 1, verts: [1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1,], dx: 0, dy: 0, dz: 1, size: CHUNK_SIZE, deltaIndex: CHUNK_SIZE, }
const S = { name: "SOUTH", id: 3, axis: 2, axisDelta: -1, verts: [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0,], dx: 0, dy: 0, dz: -1, size: CHUNK_SIZE, deltaIndex: -CHUNK_SIZE, }
const E = { name: "EAST", id: 4, axis: 0, axisDelta: 1, verts: [1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1,], dx: 1, dy: 0, dz: 0, size: CHUNK_SIZE, deltaIndex: CHUNK_SIZE_SQUARED, }
const W = { name: "WEST", id: 5, axis: 0, axisDelta: -1, verts: [0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0,], dx: -1, dy: 0, dz: 0, size: CHUNK_SIZE, deltaIndex: -CHUNK_SIZE_SQUARED, }

export const Sides = {
	TOP: T,
	BOTTOM: B,
	NORTH: N,
	SOUTH: S,
	EAST: E,
	WEST: W,
}

_.each(Sides, side => {
	side.deltaV3 = new v3(side.dx, side.dy, side.dz)
})

T.tangents = [{ side: N, tangents: [E, W] }, { side: E, tangents: [S, N] }, { side: S, tangents: [W, E] }, { side: W, tangents: [N, S] }]
B.tangents = [{ side: S, tangents: [W, E] }, { side: E, tangents: [S, N] }, { side: N, tangents: [E, W] }, { side: W, tangents: [N, S] }]
N.tangents = [{ side: E, tangents: [T, B] }, { side: T, tangents: [E, W] }, { side: W, tangents: [B, T] }, { side: B, tangents: [W, E] }]
S.tangents = [{ side: W, tangents: [B, T] }, { side: T, tangents: [E, W] }, { side: E, tangents: [T, B] }, { side: B, tangents: [W, E] }]
E.tangents = [{ side: S, tangents: [T, B] }, { side: T, tangents: [N, S] }, { side: N, tangents: [B, T] }, { side: B, tangents: [S, N] }]
W.tangents = [{ side: N, tangents: [B, T] }, { side: T, tangents: [N, S] }, { side: S, tangents: [T, B] }, { side: B, tangents: [S, N] }]

T.opposite = B
B.opposite = T
N.opposite = S
S.opposite = N
E.opposite = W
W.opposite = E

Sides.byId = [T, B, N, S, E, W]

Sides.byAxis = [ [E, W], [T, B], [N, S] ]

Sides.each = callback => {
	for (var sideId = 0; sideId < 6; sideId += 1) {
		callback(Sides.byId[sideId])
	}
}

Sides.findFromNormal = normal => {
	return _.minBy(Sides.byId, side => {
		return Math.abs(side.dx - normal.x) + Math.abs(side.dy - normal.y) + Math.abs(side.dz - normal.z)
	})
}

