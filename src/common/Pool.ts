export default class Pool<T> {

	items: Array<T>

	constructor(private createCallback: () => T, private releaseCallback?: (T: T) => void) {
		this.items = []
	}
	acquire(): T {
		if (this.items.length) {
			return this.items.pop()
		}
		return this.createCallback()
	}
	release(item: T): void {
		if (this.releaseCallback) {
			this.releaseCallback(item)
		}
		this.items.push(item)
	}
}
