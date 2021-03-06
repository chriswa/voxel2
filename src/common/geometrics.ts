import v3 from "v3"

export const CHUNK_SIZE         = 32
export const CHUNK_SIZE_SQUARED = CHUNK_SIZE * CHUNK_SIZE
export const CHUNK_SIZE_CUBED   = CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE
	
export const facesPerCube     = 6
export const uniqVertsPerFace = 4
export const indicesPerFace   = 6

export const maxVerts         = 64 * 1024 // this should be 64k
export const maxQuadsPerChunk = maxVerts / uniqVertsPerFace
export const maxQuadsPerMesh  = 2400

export const quadVertexElementSize = 2
export const quadVertexByteSize = Uint32Array.BYTES_PER_ELEMENT * quadVertexElementSize
export const quadByteStride = /*geometrics.VertexArrayType*/Uint32Array.BYTES_PER_ELEMENT * 2
export const bufferByteSize = maxQuadsPerMesh * quadByteStride

export type VertexArrayType = Uint32Array


export function worldPosToChunkPos(worldPos: v3) {
	return worldPos.clone().divideScalar(CHUNK_SIZE).floor()
}


// Sides

export interface SideType {
	name: string,
	id: number,
	axis: number,
	axisDelta: number,
	verts: Array<number>,
	dx: number,
	dy: number,
	dz: number,
	size: number,
	deltaIndex: number,
	deltaV3?: v3,
	tangents?: Array<{ side: SideType, tangents: Array<SideType> }>,
	opposite?: SideType,
}

const s: { [key: string]: SideType } = {
	T: { name: "TOP", id: 0, axis: 1, axisDelta: 1, verts: [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0,], dx: 0, dy: 1, dz: 0, size: CHUNK_SIZE, deltaIndex: 1, },
	B: { name: "BOTTOM", id: 1, axis: 1, axisDelta: -1, verts: [0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1,], dx: 0, dy: -1, dz: 0, size: CHUNK_SIZE, deltaIndex: -1, },
	N: { name: "NORTH", id: 2, axis: 2, axisDelta: 1, verts: [1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1,], dx: 0, dy: 0, dz: 1, size: CHUNK_SIZE, deltaIndex: CHUNK_SIZE, },
	S: { name: "SOUTH", id: 3, axis: 2, axisDelta: -1, verts: [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0,], dx: 0, dy: 0, dz: -1, size: CHUNK_SIZE, deltaIndex: -CHUNK_SIZE, },
	E: { name: "EAST", id: 4, axis: 0, axisDelta: 1, verts: [1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1,], dx: 1, dy: 0, dz: 0, size: CHUNK_SIZE, deltaIndex: CHUNK_SIZE_SQUARED, },
	W: { name: "WEST", id: 5, axis: 0, axisDelta: -1, verts: [0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0,], dx: -1, dy: 0, dz: 0, size: CHUNK_SIZE, deltaIndex: -CHUNK_SIZE_SQUARED, },
}

for (let key in s) {
	const side = s[key]
	side.deltaV3 = new v3(side.dx, side.dy, side.dz)
}

s.T.tangents = [{ side: s.N, tangents: [s.E, s.W] }, { side: s.E, tangents: [s.S, s.N] }, { side: s.S, tangents: [s.W, s.E] }, { side: s.W, tangents: [s.N, s.S] }]
s.B.tangents = [{ side: s.S, tangents: [s.W, s.E] }, { side: s.E, tangents: [s.S, s.N] }, { side: s.N, tangents: [s.E, s.W] }, { side: s.W, tangents: [s.N, s.S] }]
s.N.tangents = [{ side: s.E, tangents: [s.T, s.B] }, { side: s.T, tangents: [s.E, s.W] }, { side: s.W, tangents: [s.B, s.T] }, { side: s.B, tangents: [s.W, s.E] }]
s.S.tangents = [{ side: s.W, tangents: [s.B, s.T] }, { side: s.T, tangents: [s.E, s.W] }, { side: s.E, tangents: [s.T, s.B] }, { side: s.B, tangents: [s.W, s.E] }]
s.E.tangents = [{ side: s.S, tangents: [s.T, s.B] }, { side: s.T, tangents: [s.N, s.S] }, { side: s.N, tangents: [s.B, s.T] }, { side: s.B, tangents: [s.S, s.N] }]
s.W.tangents = [{ side: s.N, tangents: [s.B, s.T] }, { side: s.T, tangents: [s.N, s.S] }, { side: s.S, tangents: [s.T, s.B] }, { side: s.B, tangents: [s.S, s.N] }]

s.T.opposite = s.B
s.B.opposite = s.T
s.N.opposite = s.S
s.S.opposite = s.N
s.E.opposite = s.W
s.W.opposite = s.E

export const Sides = {
	byName: { TOP: s.T, BOTTOM: s.B, NORTH: s.N, SOUTH: s.S, EAST: s.E, WEST: s.W },
	byId: [s.T, s.B, s.N, s.S, s.E, s.W],
	byAxis: [[s.E, s.W], [s.T, s.B], [s.N, s.S]],
	each(callback: (side: SideType) => void) {
		for (var sideId = 0; sideId < 6; sideId += 1) {
			callback(Sides.byId[sideId])
		}
	},
	//findFromNormal(normal: v3) {
	//	return _.minBy(Sides.byId, side => {   // TODO: rewrite without lodash for worker?
	//		return Math.abs(side.dx - normal.x) + Math.abs(side.dy - normal.y) + Math.abs(side.dz - normal.z)
	//	})
	//},
}


