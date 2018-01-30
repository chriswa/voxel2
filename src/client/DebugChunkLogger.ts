import v3 from "v3"

const dcl: { [key: string]: Array<string> } = {}
window["dcl"] = dcl

// USAGE: dclFar(authority.engine.chunks, 2)

window["dclFar"] = function (chunkList: any, minDist = 0) {
	const authority = <any>window["authority"]
	var q = authority.playerPos.clone().divideScalar(32).floor()
	Object.keys(chunkList).forEach(key => {
		const [x, y, z] = key.split(',').map(v => parseInt(v))
		const dist = (new v3(x, y, z)).subtract(q).length()
		if (dist > minDist) {
			console.log(key, dist, dcl[key])
		}
	})
}

export default function(chunkPos: v3, message: string) {
	const chunkId = chunkPos.toString()
	if (!dcl[chunkId]) {
		dcl[chunkId] = []
	}
	dcl[chunkId].push(message)
}
