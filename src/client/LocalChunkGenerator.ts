import { CHUNK_SIZE } from "geometrics"
import ChunkData from "./ChunkData"
import BlockTypes from "BlockTypes"
import v3 from "v3"
import noise from "noise"

const fbm1 = new noise.Noise3d(250).setFractal(2, 0.5, 1.1)
const fbm2 = new noise.Noise3d(80)
const fbm3 = new noise.Noise3d(250)
const warp1 = new noise.NoiseWarp3d(1, fbm1)
const cell1 = new noise.CellNoise(0.02)

export default class LocalChunkGenerator {

	chunksToGenerate: { [key: string]: v3 }

	constructor(private onChunkDataGenerated: (chunkData: ChunkData) => void) {
		this.chunksToGenerate = {}
	}
	queueChunkGeneration(chunkPos: v3) {
		const chunkId = chunkPos.toString()
		this.chunksToGenerate[chunkId] = chunkPos
	}
	cancelChunkGeneration(chunkPos: v3) {
		const chunkId = chunkPos.toString()
		delete this.chunksToGenerate[chunkId]
	}
	work() {
		let firstChunkId
		for (let chunkId in this.chunksToGenerate) {
			firstChunkId = chunkId
			break
		}
		if (firstChunkId) {
			const chunkPos = this.chunksToGenerate[firstChunkId]
			delete this.chunksToGenerate[firstChunkId]
			this.generateChunk(chunkPos)
		}
	}
	generateChunk(chunkPos: v3) {

		const chunkData = ChunkData.pool.acquire() // n.b. chunkData may contain old data, so make sure to set everything!
		chunkData.setChunkPos(chunkPos)


		var sampleVector = new v3()
		var chunkBlockIndex = 0
		var borderedTransparencyLookupIndex = 0
		for (var x = 0; x < CHUNK_SIZE; x += 1) {
			sampleVector.x = x + chunkPos.x * CHUNK_SIZE
			for (var z = 0; z < CHUNK_SIZE; z += 1) {
				sampleVector.z = z + chunkPos.z * CHUNK_SIZE


				var cellNoise = cell1.sample2sqr(sampleVector.x, sampleVector.z)
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

					chunkData.blocks[chunkBlockIndex] = blockData
					chunkBlockIndex += 1

					// write to borderedTransparencyLookup
					//var byteIndex = borderedTransparencyLookupIndex >> 3
					//var bitIndex = borderedTransparencyLookupIndex & 0x7
					//if (blockData === BlockTypes.byName.air.id) {
					//	this.borderedTransparencyLookup[byteIndex] |= 1 << bitIndex // set bit
					//}
					//else {
					//	this.borderedTransparencyLookup[byteIndex] &= ~(1 << bitIndex) // unset bit
					//}

					//borderedTransparencyLookupIndex += 1

				}
			}
		}


		/*
		// SAMPLE TERRAIN GENERATION

		let targetBlockData = _.sample(BlockTypes.byId).id
		let randomizedChunkHeight = Math.floor(Math.random() * 8)

		//const radius = (chunkPos.toString() === '0,0,0') ? 15 : Math.random() * 5

		let blockIndex = 0
		for (let x = 0; x < CHUNK_SIZE; x += 1) {
			for (let z = 0; z < CHUNK_SIZE; z += 1) {
				const terrainHeight = Math.floor(CHUNK_SIZE / 2 + Math.random() * 3 - 1) - 30
				for (let y = 0; y < CHUNK_SIZE; y += 1) {
					const blockData = (y + chunkPos.y * CHUNK_SIZE < terrainHeight + randomizedChunkHeight) ? targetBlockData : 0
					//const blockData = Math.abs(16 - x) + Math.abs(16 - y) + Math.abs(16 - z) < radius ? targetBlockData : 0
					chunkData.blocks[blockIndex] = blockData
					blockIndex += 1
				}
			}
		}
		*/

		this.onChunkDataGenerated(chunkData)
	}
	terrainGen(pos: v3, v_dist: number, v_closest: number) {
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

		var biomeSolidBlock = biomeBlockTypes[Math.floor((v_closest + 0.5) * biomeBlockTypes.length)]
		
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
	}
}
