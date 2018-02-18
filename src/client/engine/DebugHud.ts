import v3 from "v3"
import * as geometrics from "geometrics"

export default new class DebugHud {
	
	div: HTMLElement
	textNode: Text

	posString: string
	chunkString: string

	init() {
		this.div = document.createElement("div")
		this.div.style.position = "absolute"
		this.div.style.top = "0"
		this.div.style.left = "80px"
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

	updatePlayer(playerPos: v3, playerRot: v3) {
		this.posString = ""
		const quadrant = Math.round(playerRot.y / Math.PI * 2) % 4
		this.posString += `in chunk ${geometrics.worldPosToChunkPos(playerPos).toString()} `
		this.posString += `facing ${["NORTH", "WEST", "SOUTH", "EAST"][quadrant]}\n` // why is this backwards?! is my camera backwards?
		this.posString += `pos = ${Math.floor(playerPos.x)},${Math.floor(playerPos.y)},${Math.floor(playerPos.z)}`
		this.update()
	}

	updateChunks(loadedChunkCount: number, addQueueLength: number, removeQueueLength: number) {
		this.chunkString = `loaded chunks: ${loadedChunkCount}, +${addQueueLength}, -${removeQueueLength}`
		this.update()
	}

	update() {
		let text = ""
		text += this.posString + "\n"
		text += this.chunkString
		this.textNode.data = text
	}
}
