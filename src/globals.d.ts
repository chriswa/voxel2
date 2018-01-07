declare var global: any;

interface WebGL2RenderingContext extends WebGLRenderingContext {
	bufferSubData(target: number, dstByteOffset: number, srcData: ArrayBufferView, srcOffset: number, length: number): void;
}
declare var gl: WebGL2RenderingContext;

// declare module vec2 {
// 	import vec2 from "gl-matrix/src/gl-matrix/vec2";
// 	export = vec2;
// }

//declare module vec3 {
//	import vec3 from "gl-matrix/src/gl-matrix/vec3";
//	export = vec3;
//}

// declare module mat4 {
// 	import mat4 from "gl-matrix/src/gl-matrix/mat4";
// 	export = mat4;
// }
