import v3 from "v3"
import Config from "./Config"

const frameLog = []

let lastTime = performance.now()

export default function(message: string) {
	const now = performance.now()
	frameLog.push({ message, now })
}

export function onFrame(frameStartTime: number) {
	const now = performance.now()
	const elapsed = now - lastTime
	
	const slowFrameThreshold = <number>Config.slowFrame
	if (elapsed > slowFrameThreshold) {
		console.log(`DebugFrameLogger: %c${elapsed.toFixed(3)}%c ms > ${slowFrameThreshold} ms`, 'color: red;', 'color: auto;')
		frameLog.forEach(frameLogEntry => console.log(`  ${frameLogEntry.message} @ ${(frameLogEntry.now - now).toFixed(3)}`))
	}

	// clear frameLog
	frameLog.length = 0
	lastTime = now
}
