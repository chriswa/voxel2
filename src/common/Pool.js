module.exports = class Pool {
	constructor(createCallback, releaseCallback) {
		this.createCallback = createCallback
		this.releaseCallback = releaseCallback
		this.items = []
	}
	acquire() {
		if (this.items.length) {
			return this.items.pop()
		}
		return this.createCallback()
	}
	release(item) {
		if (this.releaseCallback) {
			this.releaseCallback(item)
		}
		this.items.push(item)
	}
}
