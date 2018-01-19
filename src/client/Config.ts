interface RecursiveDict {
	[key: string]: string | number | boolean | RecursiveDict
}

const config: RecursiveDict = {
	chunkGenWorkers: true,
	chunkRange: 5,
	foo: {
		bar: "baaz",
	},
}

const storageString = localStorage.getItem("config")
const storageObject = storageString ? JSON.parse(storageString) : {}

assignStorage(storageObject, config)
function assignStorage(source: RecursiveDict, target: RecursiveDict) {
	for (var key in target) {
		if (typeof target[key] === "object") {
			if (typeof source[key] === "object") {
				assignStorage(<RecursiveDict>source[key], <RecursiveDict>target[key])
			}
		}
		else {
			if (key in source && typeof source[key] !== "object") {
				target[key] = source[key]
			}
		}
	}
		
}

const setterConfig = {}

assignSetters(config, setterConfig)
function assignSetters(source: RecursiveDict, target: RecursiveDict) {
	for (var key in source) {
		if (typeof source[key] === "object") {
			target[key] = {}
			assignSetters(<RecursiveDict>source[key], <RecursiveDict>target[key])
		}
		else {
			(function(key) {
				Object.defineProperty(target, key, {
					get: function() {
						return source[key]
					},
					set: function(newValue) {
						source[key] = newValue
						localStorage.setItem("config", JSON.stringify(source))
					},
				})
			})(key)
		}
	}
}

global["config"] = setterConfig

Object.defineProperty(global, "reload", { get: () => {
	window.location.reload()
}})

Object.defineProperty(global, "configReset", { get: () => {
	localStorage.removeItem("config")
	window.location.reload()
}})

export default config
