const Engine = require("./engine/Engine")


module.exports = class LocalAuthority {
	constructor() {
		this.engine = new Engine(this)
		this.engine.playerPos = vec3.create()

		// TODO: generate some chunks surrounding the player, call engine.authAddChunk() to send the data when they're ready
		// TODO: when all (or just closest) chunks have been sent to engine, call engine.authStart()
	}
	render(time) {
		this.engine.authRender(time)
	}

	// "engine" functions are called by Engine to provide user interaction information
	engineUpdatePlayerPos(_newPlayerPos) {
	}
	enginePlaceBlockCreative(_blockType, _targetBlockPos, _targetBlockSide) { // e.g. for testing
	}
	engineDestroyBlockCreative(_targetBlockPos) { // e.g. for testing
	}
	engineUseItem(_itemInventorySlot, _buttonAndModifiers, _targetBlockPos, _targetBlockSide) { // e.g. place dirt block, open chest (right click with most items, including no-item)
	}
	engineBreakBlock(_blockPos, _percentBroken) { // should be called with 0 first, then finally 1 when the block is broken
	}
}
