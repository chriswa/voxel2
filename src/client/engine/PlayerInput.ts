import * as keycode from "keycode"

const keynames = {
	[keycode('up')] : "up",
	[keycode('down')] : "down",
	[keycode('left')] : "left",
	[keycode('right')] : "right",
	[keycode('w')] : "w",
	[keycode('s')] : "s",
	[keycode('a')] : "a",
	[keycode('d')] : "d",
	[keycode('shift')] : "shift",
	[keycode('space')] : "space",
}

export default class PlayerInput {

	domElement: HTMLElement
	mouseSpeed: number
	pointerLocked: boolean
	heading: number
	pitch: number
	keysDown: { [key: string]: boolean }
	keysPressed: { [key: string]: boolean }

	constructor(private onClick: (event: MouseEvent) => void) {
		this.domElement = gl.canvas
		this.mouseSpeed = 0.002
		this.pointerLocked = false
		this.heading = 0
		this.pitch = 0
		this.keysDown = {}
		this.keysPressed = {}
		this.initMouse()
		this.initKeys()
	}

	update() {
		this.keysPressed = {}
	}

	initMouse() {
		// on click, request pointer lock (or if already locked, fire a click event in Engine)
		this.domElement.addEventListener('click', event => {
			if (!this.pointerLocked) {
				this.domElement.requestPointerLock = this.domElement.requestPointerLock // || this.domElement.mozRequestPointerLock || this.domElement.webkitRequestPointerLock
				this.domElement.requestPointerLock()
			}
			else {
				this.onClick(event)
			}
		}, false)

		// listen for pointer lock event
		document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this), false)
		document.addEventListener('mozpointerlockchange', this.onPointerLockChange.bind(this), false)
		document.addEventListener('webkitpointerlockchange', this.onPointerLockChange.bind(this), false)

		// update player camera rotation during pointer lock
		document.addEventListener('mousemove', event => {
			if (this.pointerLocked) {
				this.heading -= this.mouseSpeed * (event.movementX ) // || event.mozMovementX || event.webkitMovementX || 0)
				this.pitch -= this.mouseSpeed * (event.movementY ) // || event.mozMovementY || event.webkitMovementY || 0)
				while (this.heading > Math.PI) { this.heading -= 2 * Math.PI }
				while (this.heading < Math.PI) { this.heading += 2 * Math.PI }
				this.pitch = Math.min(Math.max(-Math.PI / 2, this.pitch), Math.PI / 2) // clamp to up and down
			}
		}, false)
	}
	onPointerLockChange(_event: Event) {
		if (document.pointerLockElement === this.domElement ) { // || document.mozPointerLockElement === this.domElement || document.webkitPointerLockElement === this.domElement) {
			this.pointerLocked = true
		}
		else {
			this.pointerLocked = false
		}
	}
	initKeys() {
		document.addEventListener('keydown', event => {
			const keyname = keynames[event.which]
			if (keyname) {
				this.keysDown[keyname] = true
				this.keysPressed[keyname] = true
			}
		}, false)
		document.addEventListener('keyup', event => {
			const keyname = keynames[event.which]
			if (keyname) {
				this.keysDown[keyname] = false
			}
		}, false)
	}
}
