import v3 from "v3"
import VoxelsInSphere from "./VoxelsInSphere"
import * as _ from "lodash"

export default class VoxelsInMovingSphere {

	centerPos: v3
	radius: number
	sortedRelativePositions: Array< Array<number> >
	loadedAbsolutePositions: { [key:string]: [ number, v3 ] }
	newTag: number

	constructor(radius: number) {
		this.centerPos = new v3(NaN, NaN, NaN)
		this.radius = radius
		this.sortedRelativePositions = VoxelsInSphere.getSortedList(radius)
		this.loadedAbsolutePositions = {}
		this.newTag = 1
	}
	update(newCenterPos: v3, onAdd: (chunkPos: v3) => void, onRemove: (chunkPos: v3) => void) {
		
		// no change? short circuit
		if (this.centerPos.exactEquals(newCenterPos)) {
			return
		}

		console.log(`%cVoxelsInMovingSphere: new chunk center is ${newCenterPos.id}`, 'color: teal;')
		
		this.newTag = this.newTag === 1 ? 2 : 1 // toggle between 1 and 2

		const cursorPos = new v3()
		
		this.sortedRelativePositions.forEach((deltaPos) => {
			cursorPos.set(deltaPos[0], deltaPos[1], deltaPos[2]).add(newCenterPos)
			const cursorHash = cursorPos.toString()
			// check if this position is new
			if (!this.loadedAbsolutePositions[cursorHash]) {
				onAdd(cursorPos)
				this.loadedAbsolutePositions[cursorHash] = [this.newTag, cursorPos.clone()]
			}
			// update the tag on this position
			else {
				this.loadedAbsolutePositions[cursorHash][0] = this.newTag
			}
		})
		// any positions with the old tag are to be removed
		_.each(this.loadedAbsolutePositions, ([tag, cursorPos], cursorId) => {
			if (tag !== this.newTag) {
				onRemove(cursorPos)
				delete this.loadedAbsolutePositions[cursorId]
			}
		})
		// remember new position for next time
		this.centerPos.setFrom(newCenterPos)
	}
}
