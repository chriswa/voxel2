module.exports = class Pool {
	constructor(createCallback) {
		this.createCallback = createCallback
		this.items = []
	}
	acquire() {
		if (this.items.length) {
			return this.items.pop()
		}
		return this.createCallback()
	}
	release(obj) {
		this.items.push(obj)
	}
}
