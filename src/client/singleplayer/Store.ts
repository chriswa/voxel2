/**
 * console commands for reference:
 *   indexedDB.deleteDatabase("MyTestDatabase")
 * 
 * to persist data, https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
*/

let db = undefined

if (!window.indexedDB) {
	alert("Sorry!\n\nYour browser doesn't support IndexedDB.\n\nTry Chrome or Firefox?")
}

function createSchema(db) {
	const objectStore = db.createObjectStore("test", {})
}

export function init(onComplete) {
	const request = indexedDB.open("MyTestDatabase")
	request.onupgradeneeded = (event: any) => { 
		db = event.target.result
		createSchema(db)
	}
	request.onerror = (event: any) => {
		console.error("IndexedDB error on init: " + event.target.errorCode)
	}
	request.onsuccess = (event: any) => {
		db = event.target.result
		onComplete()
	}
}

export function get(key, callback) {
	db.transaction("test").objectStore("test").get(key).onsuccess = (event) => {
		callback(event.target.result)
	}
}

export function put(key, value) {
	db.transaction(["test"], "readwrite").objectStore("test").add(value, key) // .onsuccess = (event) => {}
}

export function remove(key) {
	db.transaction(["test"], "readwrite").objectStore("test").delete(key) // .onsuccess = (event) => {}
}

export function clear() {
	db.transaction(["test"], "readwrite").objectStore("test").clear()
}
