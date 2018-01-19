import { CHUNK_SIZE } from "geometrics"
import v3 from "v3"
import BlockTypes from "BlockTypes"
import noise from "noise"

const fbm1 = new noise.Noise3d(250).setFractal(2, 0.5, 1.1)
const fbm2 = new noise.Noise3d(80)
const fbm3 = new noise.Noise3d(250)
const warp1 = new noise.NoiseWarp3d(1, fbm1)
const cell1 = new noise.CellNoise(0.02)

export default {
	generateChunk(chunkPos: v3, chunkBlocks: Uint8Array) {

		var sampleVector = new v3()
		var chunkBlockIndex = 0
		var borderedTransparencyLookupIndex = 0
		for (var x = 0; x < CHUNK_SIZE; x += 1) {
			sampleVector.x = x + chunkPos.x * CHUNK_SIZE
			for (var z = 0; z < CHUNK_SIZE; z += 1) {
				sampleVector.z = z + chunkPos.z * CHUNK_SIZE


				var cellNoise = cell1.sample2sqr(sampleVector.x / 2, sampleVector.z / 2)
				var v_dist = cellNoise[0]
				var v_closest = cellNoise[1]


				for (var y = 0; y < CHUNK_SIZE; y += 1) {
					sampleVector.y = y + chunkPos.y * CHUNK_SIZE + 30


					var blockData = BlockTypes.byName.air.id

					if (sampleVector.y < -10) {
						blockData = BlockTypes.byName.obsidian.id
					}
					else if (sampleVector.y < 50) {
						blockData = this.terrainGen(sampleVector, v_dist, v_closest)
					}

					chunkBlocks[chunkBlockIndex] = blockData
					chunkBlockIndex += 1

				}
			}
		}
	},
	terrainGen(pos: v3, v_dist: number, v_closest: number) {

		const normalized_v_closest = (v_closest + 1.5) % 1

		var workVector = new v3()
		var biomeBlockTypes = [
			BlockTypes.byName.stone.id,
			BlockTypes.byName.dirt.id,
			BlockTypes.byName.sand.id,
			BlockTypes.byName.gravel.id,
			BlockTypes.byName.snow.id,
			BlockTypes.byName.ice.id,
			BlockTypes.byName.sandstone.id,
			BlockTypes.byName.grass.id,
		]

		var biomeSolidBlock = biomeBlockTypes[Math.floor(normalized_v_closest * biomeBlockTypes.length)]

		workVector.setFrom(pos)

		workVector = warp1.warp3(workVector)

		var sample1 = fbm1.sample2(workVector)
		sample1 += fbm2.sample3(workVector) * 0.5

		sample1 = Math.pow(sample1, 2)

		//var sample2 = fbm2.sample(workVector)
		//var sample3 = fbm3.sample(workVector)

		//var lerped = sample1 * (sample3) + sample2 * (1 - sample3)

		if (sample1 > pos.y / 25) {
			return biomeSolidBlock
		}

		return BlockTypes.byName.air.id
	},
}
