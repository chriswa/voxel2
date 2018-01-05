const EPSILON = 0.000001

export default class v3 {

	a: Float32Array

	constructor(x = 0, y = 0, z = 0) {
		this.a = new Float32Array([ x, y, z ])
	}
	get x() { return this.a[0] }
	get y() { return this.a[1] }
	get z() { return this.a[2] }
	set x(v: number) { this.a[0] = v }
	set y(v: number) { this.a[1] = v }
	set z(v: number) { this.a[2] = v }
	clone() {
		return new v3(this.a[0], this.a[1], this.a[2])
	}
	set(x: number, y: number, z: number) {
		this.a[0] = x
		this.a[1] = y
		this.a[2] = z
		return this
	}
	setFrom(b: v3) {
		this.a[0] = b.a[0]
		this.a[1] = b.a[1]
		this.a[2] = b.a[2]
		return this
	}
	setSum(b: v3, c: v3) {
		this.a[0] = b.a[0] + c.a[0]
		this.a[1] = b.a[1] + c.a[1]
		this.a[2] = b.a[2] + c.a[2]
		return this
	}
	toString() {
		return this.a.join(",")
	}
	get id() {
		return this.a.join(",")
	}

	// operations involving no arguments
	lengthSqr() {
		const ax = this.a[0], ay = this.a[1], az = this.a[2]
		return ax * ax + ay * ay + az * az
	}
	length() {
		return Math.sqrt(this.lengthSqr())
	}
	ceil() {
		this.a[0] = Math.ceil(this.a[0])
		this.a[1] = Math.ceil(this.a[1])
		this.a[2] = Math.ceil(this.a[2])
		return this
	}
	floor() {
		this.a[0] = Math.floor(this.a[0])
		this.a[1] = Math.floor(this.a[1])
		this.a[2] = Math.floor(this.a[2])
		return this
	}
	negate() {
		this.a[0] = -(this.a[0])
		this.a[1] = -(this.a[1])
		this.a[2] = -(this.a[2])
		return this
	}
	invert() {
		this.a[0] = 1 / this.a[0]
		this.a[1] = 1 / this.a[1]
		this.a[2] = 1 / this.a[2]
		return this
	}
	normalize() {
		const lenSqr = this.lengthSqr()
		if (lenSqr > 0) {
			this.multiplyScalar(1 / Math.sqrt(lenSqr))
		}
		return this
	}

	// operations involving a scalar argument
	multiplyScalar(scalar: number) {
		this.a[0] *= scalar
		this.a[1] *= scalar
		this.a[2] *= scalar
		return this
	}
	divideScalar(scalar: number) {
		this.a[0] /= scalar
		this.a[1] /= scalar
		this.a[2] /= scalar
		return this
	}

	// operations involving a second vector
	add(that: v3) {
		this.a[0] += that.a[0]
		this.a[1] += that.a[1]
		this.a[2] += that.a[2]
		return this
	}
	subtract(that: v3) {
		this.a[0] -= that.a[0]
		this.a[1] -= that.a[1]
		this.a[2] -= that.a[2]
		return this
	}
	multiply(that: v3) {
		this.a[0] *= that.a[0]
		this.a[1] *= that.a[1]
		this.a[2] *= that.a[2]
		return this
	}
	divide(that: v3) {
		this.a[0] /= that.a[0]
		this.a[1] /= that.a[1]
		this.a[2] /= that.a[2]
		return this
	}
	dot(that: v3) {
		return this.a[0] * that.a[0] + this.a[1] * that.a[1] + this.a[2] * that.a[2]
	}
	cross(that: v3) {
		const ax = this.a[0], ay = this.a[1], az = this.a[2]
		const bx = that.a[0], by = that.a[1], bz = that.a[2]
		this.a[0] = ay * bz - az * by
		this.a[1] = az * bx - ax * bz
		this.a[2] = ax * by - ay * bx
		return this
	}
	lerp(that: v3, t: number) {
		const ax = this.a[0], ay = this.a[1], az = this.a[2]
		this.a[0] = ay + t * (that.a[0] - ax)
		this.a[1] = az + t * (that.a[1] - ay)
		this.a[2] = ax + t * (that.a[2] - az)
		return this
	}
	exactEquals(that: v3) {
		return this.a[0] === that.a[0] && this.a[1] === that.a[1] && this.a[2] === that.a[2]
	}
	equals(that: v3) {
		const ax = this.a[0], ay = this.a[1], az = this.a[2]
		const bx = that.a[0], by = that.a[1], bz = that.a[2]
		return (Math.abs(ax - bx) <= EPSILON * Math.max(1.0, Math.abs(ax), Math.abs(bx)) &&
			Math.abs(ay - by) <= EPSILON * Math.max(1.0, Math.abs(ay), Math.abs(by)) &&
			Math.abs(az - bz) <= EPSILON * Math.max(1.0, Math.abs(az), Math.abs(bz)))
	}
}
