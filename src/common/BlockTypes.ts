import * as geometrics from "geometrics"

const Sides = geometrics.Sides

class BlockType {

	id: number
	name: string
	textureSides: Array<Array<number>>

	constructor(id: number, name: string, tileIndex: number) {
		this.id = id
		this.name = name
		this.textureSides = []
		Sides.each(side => {
			this.textureSides[side.id] = this.makeTextureSide(tileIndex)
		})
	}
	setSideTile(side: geometrics.SideType, tileIndex: number) {
		this.textureSides[side.id] = this.makeTextureSide(tileIndex)
		return this
	}
	makeTextureSide(tileIndex: number) {
		var tu = tileIndex % 16
		var tv = Math.floor(tileIndex / 16)
		var u0 = tu / 16
		var u1 = (tu + 1) / 16
		var v0 = (tv + 1) / 16
		var v1 = tv / 16
		return [ u1, v0, u1, v1, u0, v1, u0, v0 ]
	}
}

interface BlockTypesType {
	byId: Array<BlockType>,
	byName: { [key: string]: BlockType },
}

const BlockTypes: BlockTypesType = {
	byId: [],
	byName: {},
}
export default BlockTypes

function addBlockType(name: string, tileIndex: number) {
	var id = BlockTypes.byId.length
	var blockType = new BlockType(id, name, tileIndex)
	BlockTypes.byId[id] = blockType
	BlockTypes.byName[name] = blockType
	return blockType
}

addBlockType("air", 0)
addBlockType("stone", 1)
addBlockType("dirt", 2)
addBlockType("grass", 3).setSideTile(Sides.byName.TOP, 0).setSideTile(Sides.byName.BOTTOM, 2)
addBlockType("planks", 4)
addBlockType("brick", 7)
addBlockType("cobble", 16)
addBlockType("bedrock", 17)
addBlockType("sand", 18)
addBlockType("gravel", 19)
addBlockType("wood", 20).setSideTile(Sides.byName.TOP, 21).setSideTile(Sides.byName.BOTTOM, 21)
addBlockType("gold_ore", 32)
addBlockType("iron_ore", 33)
addBlockType("coal_ore", 34)
addBlockType("mossy_cobble", 36)
addBlockType("obsidian", 37)
addBlockType("diamond_ore", 50)
addBlockType("redstone_ore", 51)
addBlockType("stone_brick", 54)
addBlockType("snow", 66)
addBlockType("ice", 67)
addBlockType("snowy_grass", 68).setSideTile(Sides.byName.TOP, 66).setSideTile(Sides.byName.BOTTOM, 2)
addBlockType("fungus", 77).setSideTile(Sides.byName.TOP, 78).setSideTile(Sides.byName.BOTTOM, 2)
addBlockType("mossy_stone_brick", 100)
addBlockType("cracked_stone_brick", 101)
addBlockType("sandstone", 176).setSideTile(Sides.byName.TOP, 192).setSideTile(Sides.byName.BOTTOM, 192)
