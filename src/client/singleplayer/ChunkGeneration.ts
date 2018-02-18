import { CHUNK_SIZE } from "geometrics"
import v3 from "v3"
import BlockTypes from "BlockTypes"
//import * as noise from "noise"
import { libnoise } from "libnoise" // https://github.com/DropechoStudios/libnoise/tree/master/Sources/libnoise/generator

const quality = libnoise.QualityMode.MEDIUM
// Perlin(frequency : Float, lacunarity : Float, persistence : Float, octaves : Int, seed : Int, quality : QualityMode)
const perlin0 = new libnoise.generator.Perlin(.01, 2.0, 0.5, 8, 123, quality)
// RidgedMultifractal(frequency : Float, lacunarity : Float, octaves : Int, seed : Int, quality : QualityMode)
const ridged0 = new libnoise.generator.RidgedMultifractal(.01, 2.0, 8, 123, quality)

const sampleVector = new v3()

export function generateChunk(chunkPos: v3, chunkBlocks: Uint8Array) {
	var chunkBlockIndex = 0
	for (var x = 0; x < CHUNK_SIZE; x += 1) {
		for (var z = 0; z < CHUNK_SIZE; z += 1) {
			sampleVector.y = 0
			sampleVector.x = x + chunkPos.x * CHUNK_SIZE
			sampleVector.z = z + chunkPos.z * CHUNK_SIZE

			const scale = 3
			const groundHeight = Math.floor(ridged0.getValue(-10 + sampleVector.x / scale, -10 + sampleVector.y / scale, sampleVector.z / scale) * 50 - 50)

			for (var y = 0; y < CHUNK_SIZE; y += 1) {
				sampleVector.y = y + chunkPos.y * CHUNK_SIZE

				const depth = groundHeight - sampleVector.y

				let blockData

				if (depth < 0) {
					blockData = BlockTypes.byName.air.id
				}
				else if (depth < 1) {
					if (sampleVector.y > 0) {
						blockData = BlockTypes.byName.snow.id
					}
					else if (sampleVector.y > -40) {
						blockData = BlockTypes.byName.stone.id
					}
					else if (sampleVector.y > -60) {
						blockData = BlockTypes.byName.dirt.id
					}
					else {
						blockData = BlockTypes.byName.grass.id
					}
				}
				else if (depth < 2) {
					if (sampleVector.y > 0) {
						blockData = BlockTypes.byName.snow.id
					}
					else if (sampleVector.y > -40) {
						blockData = BlockTypes.byName.stone.id
					}
					else if (sampleVector.y > -60) {
						blockData = BlockTypes.byName.dirt.id
					}
					else {
						blockData = BlockTypes.byName.dirt.id
					}
				}
				else {
					blockData = BlockTypes.byName.stone.id
				}

				chunkBlocks[chunkBlockIndex] = blockData
				chunkBlockIndex += 1
			}
		}
	}
	
}

/*
const fbm1 = new noise.FBM3(250).setFractal(2, 0.5, 1.1)
const fbm2 = new noise.FBM3(80)
const fbm3 = new noise.FBM3(250)
const warp1 = new noise.NoiseWarp3d(1, fbm1)
const warp2 = new noise.NoiseWarp3d(100, fbm1)
const cell1 = new noise.CellNoise(0.02)

const biomeSizeFactor = 5

const sampleVector = new v3()
const biomeVector = new v3()
const workVector = new v3()

export default {
	generateChunk(chunkPos: v3, chunkBlocks: Uint8Array) {

		var chunkBlockIndex = 0
		for (var x = 0; x < CHUNK_SIZE; x += 1) {
			for (var z = 0; z < CHUNK_SIZE; z += 1) {
				sampleVector.y = 0
				sampleVector.x = x + chunkPos.x * CHUNK_SIZE
				sampleVector.z = z + chunkPos.z * CHUNK_SIZE

				biomeVector.setFrom(sampleVector)

				warp2.warp3(biomeVector)


				var cellNoise = cell1.sample2sqr(biomeVector.x / biomeSizeFactor, biomeVector.z / biomeSizeFactor)
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

		warp1.warp3(workVector)

		var sample1 = fbm1.sample2(workVector)
		sample1 += fbm2.sample3(workVector) * 0.5
		sample1 += fbm3.sample3(workVector) * 0.25

		//sample1 *= 1 - v_dist

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
*/