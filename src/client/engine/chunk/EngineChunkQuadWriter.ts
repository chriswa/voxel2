import * as geometrics from "geometrics"
import BlockPos from "BlockPos"


export function drawQuad(vertexArray: geometrics.VertexArrayType, quadId: number, blockPos: BlockPos, side: geometrics.SideType, uvs: Array<number>, brightnesses: Array<number>) {
	let cursor = quadId * geometrics.quadVertexElementSize

	// TODO: store quad flipping?
	//const vertexOrder = getVertexOrderAfterQuadFlipping(brightnesses)

	const flipQuad: number = (brightnesses[0] + brightnesses[2] < brightnesses[1] + brightnesses[3]) ? 1 : 0 // 1 bit

	const s: number = side.id // 3 bits because 0..5

	const x: number = blockPos.pos.a[0] // 5 bits because 0..31
	const y: number = blockPos.pos.a[1] // 5 bits because 0..31
	const z: number = blockPos.pos.a[2] // 5 bits because 0..31
	const packedPos: number = (x) | (y << 5) | (z << 10) // 15 bits
	const packedTransform: number = packedPos | (s << 15) | (flipQuad << 18) // 19 bits

	const packedInt0: number = packedTransform

	const brightCorner0: number = Math.floor(brightnesses[0] * 15) // 4 bits
	const brightCorner1: number = Math.floor(brightnesses[1] * 15) // 4 bits
	const brightCorner2: number = Math.floor(brightnesses[2] * 15) // 4 bits
	const brightCorner3: number = Math.floor(brightnesses[3] * 15) // 4 bits
	const brightCorners: number = (brightCorner0) | (brightCorner1 << 4) | (brightCorner2 << 8) | (brightCorner3 << 12)
	const u: number = uvs[0]
	const v: number = uvs[1]
	const uIndex: number = Math.floor(u * 15) // 4 bits because 0..15
	const vIndex: number = Math.floor(v * 15) // 4 bits because 0..15
	const packedInt1: number = (brightCorners) | (uIndex << 16) | (vIndex << 20) // 24 bits

	vertexArray[cursor + 0] = packedInt0
	vertexArray[cursor + 1] = packedInt1
}

export function clearQuad(vertexArray: geometrics.VertexArrayType, quadId: number) {
	let cursor = quadId * geometrics.quadVertexElementSize

	// TODO: make the quad degenerate
	vertexArray[cursor + 0] = 0
	vertexArray[cursor + 1] = 0
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