import * as geometrics from "geometrics"
import BlockPos from "BlockPos"


export function drawQuad(vertexArray: geometrics.VertexArrayType, quadId: number, blockPos: BlockPos, side: geometrics.SideType, uvs: Array<number>, brightnesses: Array<number>) {
	const vertexOrder = getVertexOrderAfterQuadFlipping(brightnesses)
	let cursor = quadId * geometrics.quadVertexByteSize
	for (let i = 0; i < 4; i += 1) {
		const vertexIndex = vertexOrder[i]
		
		const x: number = blockPos.pos.a[0] + side.verts[vertexIndex * 3 + 0] // 6 (!) bits, because 0..32, not 0..31
		const y: number = blockPos.pos.a[1] + side.verts[vertexIndex * 3 + 1] // 6 (!) bits, because 0..32, not 0..31
		const z: number = blockPos.pos.a[2] + side.verts[vertexIndex * 3 + 2] // 6 (!) bits, because 0..32, not 0..31
		const packedPos: number = (x) | (y << 6) | (z << 12) // 18 bits

		const brightIndex: number = Math.round(brightnesses[vertexIndex] * 16) // 4 bits
		const packedInt0: number = (packedPos) | (brightIndex << 18) // 22 bits

		const u: number = uvs[vertexIndex * 2 + 0]
		const v: number = uvs[vertexIndex * 2 + 1]
		const uIndex: number = Math.round(u * 16) // 5 (!) bits, because 0..16, not 0..15
		const vIndex: number = Math.round(v * 16) // 5 (!) bits, because 0..16, not 0..15
		const packedInt1: number = (uIndex) | (vIndex << 5) // 10 bits

		
		vertexArray[cursor + 0] = packedInt0
		vertexArray[cursor + 1] = packedInt1

		//vertexArray[cursor + 0] = x // x is 0..33, could be 6 bits
		//vertexArray[cursor + 1] = y // y is 0..33, could be 6 bits
		//vertexArray[cursor + 2] = z // z is 0..33, could be 6 bits
		//vertexArray[cursor + 3] = u                      // uv could be compressed into a single integer per vertex, describing the corner to use
		//vertexArray[cursor + 4] = v                      // ... 32 bits = 31*31 = 961
		//vertexArray[cursor + 5] = 1 * brightnesses[vertexIndex]									// these 3 floats could be 2 bits, since there are only 4 possible brightnesses with AO
		////////////////vertexArray[cursor + 6] = 1 * brightnesses[vertexIndex]									// ...
		////////////////vertexArray[cursor + 7] = 1 * brightnesses[vertexIndex]									// ... SUBTOTAL (without uvs): 6+6+6+2 = only 20 bits! (+32 for uvs, this is roughly 1/4 of the size!)
		cursor += geometrics.vertexByteSize
	}
}

export function clearQuad(vertexArray: geometrics.VertexArrayType, quadId: number) {
	let cursor = quadId * geometrics.quadVertexByteSize
	for (let i = 0; i < 4; i += 1) {
		// make the triangles degenerate by setting their positions to the same point
		vertexArray[cursor + 0] = 0
		vertexArray[cursor + 1] = 0
		vertexArray[cursor + 2] = 0
		cursor += geometrics.vertexByteSize
	}
}

export function updateQuadAO(vertexArray: geometrics.VertexArrayType, quadId: number, blockPos: BlockPos, side: geometrics.SideType, uvs: Array<number>, brightnesses: Array<number>): boolean {
	let changed = false
	// TODO: optimize?
	changed = true
	drawQuad(vertexArray, quadId, blockPos, side, uvs, brightnesses)
	return changed
}

export function getVertexOrderAfterQuadFlipping(brightnesses: Array<number>) {
	if (brightnesses[0] + brightnesses[2] < brightnesses[1] + brightnesses[3]) {
		return [1, 2, 3, 0]
	}
	else {
		return [0, 1, 2, 3]
	}
}