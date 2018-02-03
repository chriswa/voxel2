const canvas = <HTMLCanvasElement>document.getElementById("mainCanvas")
const gl = <WebGL2RenderingContext>canvas.getContext("webgl2", {
	antialias: false,
})

export default gl

global.gl = gl
