import * as geometrics from "geometrics"
import BlockPos from "BlockPos";

export default {
	drawQuad(vertexArray: Float32Array, quadId: number, blockPos: BlockPos, side: geometrics.SideType, uvs: Array<number>, brightnesses: Array<number>) {
		const vertexOrder = this.getVertexOrderAfterQuadFlipping(brightnesses)
		let cursor = quadId * geometrics.quadVertexByteSize
		for (let i = 0; i < 4; i += 1) {
			const vertexIndex = vertexOrder[i]
			vertexArray[cursor + 0] = blockPos.pos.a[0] + side.verts[vertexIndex * 3 + 0] // x is 0..33, could be 6 bits
			vertexArray[cursor + 1] = blockPos.pos.a[1] + side.verts[vertexIndex * 3 + 1] // y is 0..33, could be 6 bits
			vertexArray[cursor + 2] = blockPos.pos.a[2] + side.verts[vertexIndex * 3 + 2] // z is 0..33, could be 6 bits
			vertexArray[cursor + 3] = uvs[vertexIndex * 2 + 0]                      // uv could be compressed into a single integer per vertex, describing the corner to use
			vertexArray[cursor + 4] = uvs[vertexIndex * 2 + 1]                      // ... 32 bits = 31*31 = 961
			vertexArray[cursor + 5] = 1 * brightnesses[vertexIndex]									// these 3 floats could be 2 bits, since there are only 4 possible brightnesses with AO
			vertexArray[cursor + 6] = 1 * brightnesses[vertexIndex]									// ...
			vertexArray[cursor + 7] = 1 * brightnesses[vertexIndex]									// ... SUBTOTAL (without uvs): 6+6+6+2 = only 20 bits! (+32 for uvs, this is roughly 1/4 of the size!)
			cursor += 8
		}
	},
	clearQuad(vertexArray: Float32Array, quadId: number) {
		let cursor = quadId * geometrics.quadVertexByteSize
		for (let i = 0; i < 4; i += 1) {
			// make the triangles degenerate by setting their positions to the same point
			vertexArray[cursor + 0] = 0
			vertexArray[cursor + 1] = 0
			vertexArray[cursor + 2] = 0
			cursor += 8
		}
	},
	updateQuadAO(vertexArray: Float32Array, quadId: number, blockPos: BlockPos, side: geometrics.SideType, uvs: Array<number>, brightnesses: Array<number>): boolean {
		let changed = false
		// TODO: optimize?
		changed = true
		this.drawQuad(vertexArray, quadId, blockPos, side, uvs, brightnesses)
		return changed
	},

	getVertexOrderAfterQuadFlipping(brightnesses: Array<number>) {
		if (brightnesses[0] + brightnesses[2] < brightnesses[1] + brightnesses[3]) {
			return [1, 2, 3, 0]
		}
		else {
			return [0, 1, 2, 3]
		}
	}
}