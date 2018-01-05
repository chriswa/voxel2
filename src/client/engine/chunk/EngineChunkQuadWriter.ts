import * as  geometrics from "geometrics"
import BlockPos from "BlockPos";

export default {
	drawQuad(vertexArray: Float32Array, quadId: number, blockPos: BlockPos, side: geometrics.SideType, uvs: Array<number>, brightnesses: Array<Number>) {
		var vertexOrder = [0, 1, 2, 3] // or [ 1, 2, 3, 0 ], depending on AO ( this was getVertexOrderAfterQuadFlipping(brightnesses) )
		var cursor = quadId * geometrics.quadVertexByteSize
		for (var i = 0; i < 4; i += 1) {
			var vertexIndex = vertexOrder[i]
			vertexArray[cursor++] = blockPos.pos.a[0] + side.verts[vertexIndex * 3 + 0] // x is 0..33, could be 6 bits
			vertexArray[cursor++] = blockPos.pos.a[1] + side.verts[vertexIndex * 3 + 1] // y is 0..33, could be 6 bits
			vertexArray[cursor++] = blockPos.pos.a[2] + side.verts[vertexIndex * 3 + 2] // z is 0..33, could be 6 bits
			vertexArray[cursor++] = uvs[vertexIndex * 2 + 0]                      // uv could be compressed into a single integer per vertex, describing the corner to use
			vertexArray[cursor++] = uvs[vertexIndex * 2 + 1]                      // ... 32 bits = 31*31 = 961
			vertexArray[cursor++] = 1 * brightnesses[vertexIndex]									// these 3 floats could be 2 bits, since there are only 4 possible brightnesses with AO
			vertexArray[cursor++] = 1 * brightnesses[vertexIndex]									// ...
			vertexArray[cursor++] = 1 * brightnesses[vertexIndex]									// ... SUBTOTAL (without uvs): 6+6+6+2 = only 20 bits! (+32 for uvs, this is roughly 1/4 of the size!)
		}
	},
	clearQuad(vertexArray: Float32Array, quadId: number) {
		var cursor = quadId * geometrics.quadVertexByteSize
		for (var i = 0; i < 4; i += 1) {
			// make the triangles degenerate by setting their positions to the same point
			vertexArray[cursor + 0] = 0
			vertexArray[cursor + 1] = 0
			vertexArray[cursor + 2] = 0
			cursor += geometrics.quadVertexByteSize
		}
	},
}