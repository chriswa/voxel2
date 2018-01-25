interface RecursiveDict {
	[key: string]: string | number | boolean | RecursiveDict
}

// default configuration
const Config: RecursiveDict = {
	chunkGenWorkers: true,
	chunkInternalWorkers: true,
	chunkRange: 5,
	chunkLoading: true,
	rememberPlayerTransform: true,
	foo: {
		bar: "baaz",
	},
}

// load user-specific overrides from localStorage
const storageString = localStorage.getItem("config")
const storageObject = storageString ? JSON.parse(storageString) : {}
copyFromStorageToConfig(storageObject, Config)
function copyFromStorageToConfig(source: RecursiveDict, target: RecursiveDict) {
	for (var key in target) {
		if (typeof target[key] === "object") {
			if (typeof source[key] === "object") {
				copyFromStorageToConfig(<RecursiveDict>source[key], <RecursiveDict>target[key])
			}
		}
		else {
			if (key in source && typeof source[key] !== "object") {
				target[key] = source[key]
			}
		}
	}
}
export default Config

// expose global object to user for inspecting and modifying config values
const exposedConfigWithSetters = {}
createSettersForConfig(Config, exposedConfigWithSetters)
function createSettersForConfig(source: RecursiveDict, target: RecursiveDict) {
	for (var key in source) {
		if (typeof source[key] === "object") {
			target[key] = {}
			createSettersForConfig(<RecursiveDict>source[key], <RecursiveDict>target[key])
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
global["config"] = exposedConfigWithSetters

// extra user functionality (getters aid typing: e.g. `reload` instead of `reload()`)

Object.defineProperty(global, "reload", { get: () => {
	window.location.reload()
}})

Object.defineProperty(global, "configReset", { get: () => {
	localStorage.removeItem("config")
	window.location.reload()
}})
