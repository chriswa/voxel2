import v3 from "v3"
import VoxelsInSphere from "./VoxelsInSphere"
import * as _ from "lodash"

export default class VoxelsInMovingSphere {

	centerPos: v3
	radius: number
	sortedRelativePositions: Array< Array<number> >
	loadedAbsolutePositions: { [key:string]: number }
	newTag: number
	added: Array<v3>
	removed: Array<v3>

	constructor(radius: number) {
		this.centerPos = new v3(NaN, NaN, NaN)
		this.radius = radius
		this.sortedRelativePositions = VoxelsInSphere.getSortedList(radius)
		this.loadedAbsolutePositions = {}
		this.newTag = 1
	}
	update(newCenterPos: v3) {
		this.added = []
		this.removed = []
		
		// no change? short circuit
		if (this.centerPos.exactEquals(newCenterPos)) {
			return
		}
		
		this.newTag = this.newTag === 1 ? 2 : 1 // toggle between 1 and 2

		const cursorPos = new v3()
		
		this.sortedRelativePositions.forEach((deltaPos) => {
			cursorPos.set(deltaPos[0], deltaPos[1], deltaPos[2]).add(newCenterPos)
			const cursorHash = cursorPos.toString()
			// check if this position is new
			if (!this.loadedAbsolutePositions[cursorHash]) {
				this.added.push(cursorPos.clone())
			}
			// update the tag on this position
			this.loadedAbsolutePositions[cursorHash] = this.newTag
		})
		// any positions with the old tag are to be removed
		_.each(this.loadedAbsolutePositions, (tag, cursorId) => {
			if (tag !== this.newTag) {
				const [x, y, z] = cursorId.split(",").map(n => parseInt(n))
				const oldPos = new v3(x, y, z)
				this.removed.push(oldPos)
			}
		})
		// remove old entries (done as a separate pass just in case deletes may affect _.each above)
		_.each(this.removed, (pos) => {
			delete this.loadedAbsolutePositions[pos.toString()]
		})
		// remember new position for next time
		this.centerPos.setFrom(newCenterPos)
	}
}
