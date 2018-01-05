import v3 from "v3"
import VoxelsInSphere from "./VoxelsInSphere"

export default class VoxelsInMovingSphere {

	centerPos: v3
	radius: number
	sortedVoxelList: Array< Array<number> >
	loadedAbsolutePositions: { [key:string]: number }
	newTag: number

	constructor(radius: number) {
		this.centerPos = new v3(NaN, NaN, NaN)
		this.radius = radius
		this.sortedVoxelList = VoxelsInSphere.getSortedList(radius)
		this.loadedAbsolutePositions = {}
		this.newTag = 1
	}
	update(newCenterPos: v3): { added: Array<v3>, removed: Array<v3> } {
		const addedPositions: Array<v3> = []
		const removedPositions: Array<v3> = []
		// position changed?
		if (!this.centerPos.exactEquals(newCenterPos)) {
			this.newTag = this.newTag === 1 ? 2 : 1 // toggle between 1 and 2
			const cursorPos = new v3()
			this.sortedVoxelList.forEach((deltaPos) => {
				cursorPos.set(deltaPos[0], deltaPos[1], deltaPos[2]).add(newCenterPos)
				const cursorHash = cursorPos.toString()
				// check if this position is new
				if (!this.loadedAbsolutePositions[cursorHash]) {
					addedPositions.push(cursorPos.clone())
				}
				// update the tag on this position regardless of whether it's new
				this.loadedAbsolutePositions[cursorHash] = this.newTag
			})
			// check for old (untagged) positions
			_.each(this.loadedAbsolutePositions, (tag, cursorId) => {
				if (tag !== this.newTag) {
					const [x, y, z] = cursorId.split(",").map(parseInt)
					const oldPos = new v3(x, y, z)
					removedPositions.push(oldPos)
					delete this.loadedAbsolutePositions[cursorId]
				}
			})
			// remember new position for next time
			this.centerPos.setFrom(newCenterPos)
		}
		return {
			added: addedPositions,
			removed: removedPositions,
		}
	}
}
