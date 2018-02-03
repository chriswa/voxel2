import * as _ from "lodash"
import v3 from "v3"
import * as geometrics from "geometrics"

export default new class DebugHud {
	
	div: HTMLElement
	textNode: Text

	playerPos: v3 = new v3()
	playerRot: v3 = new v3()

	frameTimes: Array<number> = []
	frameElapsed: Array<number> = []
	fps: number = 0
	slowestFrame: number = 0
	
	init() {
		this.div = document.createElement("div")
		this.div.style.position = "absolute"
		this.div.style.top = "0"
		this.div.style.left = "0"
		this.div.style.color = "white"
		this.div.style.padding = "2px"
		this.div.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
		this.div.style.fontFamily = "monospace"
		this.div.style.whiteSpace = "pre"

		this.textNode = document.createTextNode("")
		this.div.appendChild(this.textNode)

		document.body.appendChild(this.div)

		this.update()
	}

	frameTick(currentTime: number) {
		const elapsedTime = this.frameTimes.length ? currentTime - this.frameTimes[this.frameTimes.length - 1] : 0

		while (this.frameTimes.length > 0 && this.frameTimes[0] <= currentTime - 1000) {
			this.frameTimes.shift()
			this.frameElapsed.shift()
		}

		this.frameTimes.push(currentTime)
		this.frameElapsed.push(elapsedTime)

		this.fps = this.frameTimes.length
		this.slowestFrame = _.max(this.frameElapsed)
		this.slowestFrame = this.slowestFrame ? Math.round(1000 / this.slowestFrame) : 0
	}

	updatePlayer(playerPos: v3, playerRot: v3) {
		this.playerPos.setFrom(playerPos)
		this.playerRot.setFrom(playerRot)
		this.update()
	}

	update() {
		let text = ""
		text += `FPS: ${this.fps} .. ${this.slowestFrame}\n`
		text += `${Math.floor(this.playerPos.x)},${Math.floor(this.playerPos.y)},${Math.floor(this.playerPos.z)} `
		const quadrant = Math.round(this.playerRot.y / Math.PI * 2) % 4
		text += `facing ${["NORTH","WEST","SOUTH","EAST"][quadrant]}\n` // why is this backwards?! is my camera backwards?
		text += `in chunk ${geometrics.worldPosToChunkPos(this.playerPos).toString()}\n`
		this.textNode.data = text
	}
}
