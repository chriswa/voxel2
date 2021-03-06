// source: https://github.com/colorpump/twgl.js/blob/feature-typescript-support/src/twgl.d.ts
// chriswa: customized as per below

// chriswa: extended to support WebGL2
type WebGLXRenderingContext = WebGLRenderingContext | WebGL2RenderingContext;


declare module "twgl.js" {

    // chriswa: added missing method
    export function createVertexArrayInfo(gl: WebGLXRenderingContext, programInfo: ProgramInfo | Array<ProgramInfo>, bufferInfo: BufferInfo): void;


    export function addExtensionsToContext(gl: WebGLXRenderingContext): void;
    export function bindFramebufferInfo(gl: WebGLXRenderingContext, framewbufferInfo?: FramebufferInfo, target?: number): void;
    export function bindTransformFeedbackInfo(gl: WebGLXRenderingContext, transformFeedbackInfo: ProgramInfo | { [key: string]: TransformFeedbackInfo }, bufferInfo?: BufferInfo | { [key: string]: AttribInfo }): void;
    export function bindUniformBlock(gl: WebGLXRenderingContext, programInfo: ProgramInfo | UniformBlockSpec, uniformBlockInfo: UniformBlockInfo): boolean;
    export function createBufferInfoFromArrays(gl: WebGLXRenderingContext, arrays: Arrays): BufferInfo;
    export function createFramebufferInfo(gl: WebGLXRenderingContext, attachments?: AttachmentOptions[], width?: number, height?: number): FramebufferInfo;
    /**
     * Creates a ProgramInfo from 2 sources.
     * @param shaderSources Array of sources for the shaders or ids. The first is assumed to be the vertex shader, the second the fragment shader.
     * @param opt_attribs Options for the program or an array of attribs names. Locations will be assigned by index if not passed in
     * @param opt_locations The locations for the attributes. A parallel array to opt_attribs letting you assign locations.
     * @param opt_errorCallback callback for errors. By default it just prints an error to the console on error. If you want something else pass an callback. It's passed an error message.
     */
    export function createProgramInfo(gl: WebGLXRenderingContext, shaderSources: string[], opt_attribs?: ProgramOptions | string[], opt_locations?: number[], opt_errorCallback?: () => any): ProgramInfo;
    export function createTexture(gl: WebGLXRenderingContext, options?: TextureOptions, callback?: TextureReadyCallback): WebGLTexture;
    export function createTextures(gl: WebGLXRenderingContext, options: { [key: string]: TextureOptions }, callback?: TexturesReadyCallback): { [key: string]: WebGLTexture };
    export function createTransformFeedback(gl: WebGLXRenderingContext, programInfo: ProgramInfo, bufferInfo?: BufferInfo | { [key: string]: AttribInfo }): WebGLObject;
    export function createTransformFeedbackInfo(gl: WebGLXRenderingContext, program: WebGLProgram): { [key: string]: TransformFeedbackInfo };
    export function createUniformBlockInfo(gl: WebGLXRenderingContext, programInfo: ProgramInfo, blockName: string): UniformBlockInfo;
    export function drawBufferInfo(gl: WebGLXRenderingContext, bufferInfo: BufferInfo | VertexArrayInfo, type?: GLenum, count?: number, offset?: number): void;
    export function drawObjectList(objects: DrawObject[]): void;
    export function getContext(canvas: HTMLCanvasElement, attribs?: WebGLContextAttributes): WebGLXRenderingContext;
    export function getWebGLContext(canvas: HTMLCanvasElement, attribs?: WebGLContextAttributes): WebGLXRenderingContext;
    export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, multiplier?: number): boolean;
    export function resizeFramebufferInfo(gl: WebGLXRenderingContext, framebufferInfo: FramebufferInfo, attachments?: AttachmentOptions[], width?: number, height?: number): void;
    export function resizeTexture(gl: WebGLXRenderingContext, tex: WebGLTexture, options: TextureOptions, width?: number, height?: number): void;
    export function setAttribInfoBufferFromArray(gl: WebGLXRenderingContext, attribInfo: AttribInfo, array: ArraySpec, offset?: number): void;
    export function setBlockUniforms(uniformBlockInfo: UniformBlockInfo, values: { [key: string]: number[] | ArrayBuffer | number }): void;
    export function setBuffersAndAttributes(gl: WebGLXRenderingContext, setters: ProgramInfo | { [key: string]: (...params: any[]) => void }, buffers: BufferInfo | VertexArrayInfo): void;
    export function setDefaults(newDefaults: Defaults): void;
    export function setTextureFromArray(gl: WebGLXRenderingContext, tex: WebGLTexture, src: number[] | ArrayBuffer, options?: TextureOptions): void;
    export function setUniformBlock(gl: WebGLXRenderingContext, programInfo: ProgramInfo | UniformBlockSpec, uniformBlockInfo: UniformBlockInfo): void;
    export function setUniforms(setters: ProgramInfo | { [key: string]: (...params: any[]) => void }, values: { [key: string]: any }): void;

    export interface Arrays {
        [key: string]: number[] | ArrayBuffer |
        // like FullArraySpec besides tpye is optional here
        {
            data: number | number[] | ArrayBuffer;
            numComponents?: number;
            type?: new (...args: any[]) => ArrayBuffer;
            size?: number;
            normalize?: boolean;
            stride?: number;
            offset?: number;
            name?: string;
            attribName?: string;
        };
    }

    export type ArraySpec = number[] | ArrayBuffer | FullArraySpec;

    export interface AttachmentOptions extends TextureOptions {
        attach?: number;
        format?: number;
        type?: number;
        target?: number;
        level?: number;
        attachment?: WebGLObject;
    }

    export interface AttribInfo {
        numComponents?: number;
        size?: number;
        type?: number;
        normalize?: boolean;
        offset?: number;
        stride?: number;
        buffer?: WebGLBuffer;
        drawType?: number;
    }

    export interface BlockSpec {
        index: number;
        size: number;
        uniformIndices: number[];
        usedByVertexShader: boolean;
        usedByFragmentShader: boolean;
        used: boolean;
    }

    export interface BufferInfo {
        numElements: number;
        elementType?: number;
        indices: WebGLBuffer;
        attribs: { [key: string]: AttribInfo };
    }

    export type CubemapReadyCallback = (err: any, tex: WebGLTexture, imgs: HTMLImageElement[]) => void;

    export interface Defaults {
        attribPrefix?: string;
        textureColor?: number[];
        crossOrigin?: string;
        addExtensionsToContext?: boolean;
    }

    export interface DrawObject {
        active?: boolean;
        type?: number;
        programInfo: ProgramInfo;
        bufferInfo?: BufferInfo;
        vertexArrayInfo?: VertexArrayInfo;
        uniforms: { [key: string]: any };
        offset?: number;
        count?: number;
    }

    export type ErrorCallback = (msg: string, lineOffset?: number) => void;

    export interface FramebufferInfo {
        framebuffer: WebGLFramebuffer;
        attachments: WebGLObject[];
    }

    export interface FullArraySpec {
        data: number | number[] | ArrayBuffer;
        numComponents?: number;
        type: new (...args: any[]) => ArrayBuffer;
        size?: number;
        normalize?: boolean;
        stride?: number;
        offset?: number;
        name?: string;
        attribName?: string;
    }

    export interface ProgramInfo {
        program: WebGLProgram;
        uniformSetters: { [key: string]: (...para: any[]) => void },
        attribSetters: { [key: string]: (...para: any[]) => void },
        transformFeedbackInfo: { [key: string]: TransformFeedbackInfo }
    }

    export interface ProgramOptions {
        errorCallback?: (error: any) => void;
        attribLocations?: { [key: string]: number };
        transformFeedbackVaryings?: BufferInfo | { [key: string]: AttribInfo } | string[];
        transformFeedbackMode?: number;
    }

    export type FullTextureSrc = number[] | ArrayBuffer | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | string | string[] | TextureFunc;

    export type TextureFunc = (gl: WebGLXRenderingContext, options: TextureOptions) => FullTextureSrc;

    export interface TextureOptions {
        target?: number;
        level?: number;
        width?: number;
        height?: number;
        depth?: number;
        min?: number;
        mag?: number;
        minMag?: number;
        internalFormat?: number;
        format?: number;
        type?: number;
        wrap?: number;
        wrapS?: number;
        wrapT?: number;
        wrapR?: number;
        minLod?: number;
        maxLod?: number;
        baseLevel?: number;
        maxLevel?: number;
        unpackAlignment?: number;
        premultiplyAlpha?: number;
        flipY?: number;
        colorspaceConversion?: number;
        color?: number[] | ArrayBuffer;
        auto?: boolean;
        cubeFaceOrder?: number[];
        src?: FullTextureSrc;
        crossOrigin?: string;
    }

    export type TextureReadyCallback = (err: any, texture: WebGLTexture, source: TextureSrc) => void;

    export type TextureSrc = HTMLImageElement | HTMLImageElement[];

    export type TexturesReadyCallback = (err: any, textures: { [key: string]: WebGLTexture }, sources: { [key: string]: TextureSrc }) => void;

    export type ThreeDReadyCallback = (err: any, tex: WebGLTexture, imgs: HTMLImageElement[]) => void;

    export interface TransformFeedbackInfo {
        index: number;
        type: number;
        size: number;
    }

    export interface UniformBlockInfo {
        name: string;
        array: ArrayBuffer;
        asFloat: Float32Array;
        buffer: WebGLBuffer;
        offset?: number;
        uniforms: { [key: string]: ArrayBufferView }
    }

    export interface UniformBlockSpec {
        blockSpecs: { [key: string]: BlockSpec };
        uniformData: UniformData[];
    }

    export interface UniformData {
        type: number;
        size: number;
        blockNdx: number;
        offset: number;
    }

    export interface VertexArrayInfo {
        numElements: number;
        elementType: number;
        vertexArrayObject?: WebGLObject;
    }

    export function createBufferFromTypedArray(gl: WebGLXRenderingContext, typedArray: ArrayBuffer | ArrayBufferView | WebGLBuffer, type?: number, drawType?: number): WebGLBuffer;

    // attributes module
    export module attributes {
        export function createAttribsFromArrays(gl: WebGLXRenderingContext, arrays: Arrays): { [name: string]: AttribInfo };
        export function createBufferFromArray(gl: WebGLXRenderingContext, array: ArraySpec, arrayName: string): WebGLBuffer;
        export function createBufferFromTypedArray(gl: WebGLXRenderingContext, typedArray: ArrayBuffer | ArrayBufferView | WebGLBuffer, type?: number, drawType?: number): WebGLBuffer;
        export function createBufferInfoFromArrays(gl: WebGLXRenderingContext, arrays: Arrays): BufferInfo;
        export function createBuffersFromArrays(gl: WebGLXRenderingContext, arrays: Arrays): { [name: string]: WebGLBuffer };
        export function setAttribInfoBufferFromArray(gl: WebGLXRenderingContext, attribInfo: AttribInfo, array: ArraySpec, offset?: number): void;
        export function setAttrbutePrefix(prefix: string): void;
    }

    export function createAttribsFromArrays(gl: WebGLXRenderingContext, arrays: Arrays): { [name: string]: AttribInfo };
    export function createBufferFromArray(gl: WebGLXRenderingContext, array: ArraySpec, arrayName: string): WebGLBuffer;
    export function createBufferFromTypedArray(gl: WebGLXRenderingContext, typedArray: ArrayBuffer | ArrayBufferView | WebGLBuffer, type?: number, drawType?: number): WebGLBuffer;
    export function createBufferInfoFromArrays(gl: WebGLXRenderingContext, arrays: Arrays): BufferInfo;
    export function createBuffersFromArrays(gl: WebGLXRenderingContext, arrays: Arrays): { [name: string]: WebGLBuffer };
    export function setAttribInfoBufferFromArray(gl: WebGLXRenderingContext, attribInfo: AttribInfo, array: ArraySpec, offset?: number): void;
    /** added */
    export function setAttrbutePrefix(prefix: string): void;

    // draw module
    export module draw {
        export function drawBufferInfo(gl: WebGLXRenderingContext, bufferInfo: BufferInfo | VertexArrayInfo, type?: number, count?: number, offset?: number): void;
        export function drawObjectList(objectsToDraw: DrawObject[]): void;
    }

    export function drawBufferInfo(gl: WebGLXRenderingContext, bufferInfo: BufferInfo | VertexArrayInfo, type?: number, count?: number, offset?: number): void;
    export function drawObjectList(objectsToDraw: DrawObject[]): void;

    // framebuffers module
    export module framebuffers {
        export function bindFramebufferInfo(gl: WebGLXRenderingContext, framebufferInfo: FramebufferInfo, target?: number): void;
        export function createFramebufferInfo(gl: WebGLXRenderingContext, attachments?: AttachmentOptions[], widt?: number, height?: number): FramebufferInfo;
        export function resizeFramebufferInfo(gl: WebGLXRenderingContext, framebufferInfo: FramebufferInfo, attachments?: AttachmentOptions[], width?: number, height?: number): void;
    }

    export function bindFramebufferInfo(gl: WebGLXRenderingContext, framebufferInfo: FramebufferInfo, target?: number): void;
    export function createFramebufferInfo(gl: WebGLXRenderingContext, attachments?: AttachmentOptions[], widt?: number, height?: number): FramebufferInfo;
    export function resizeFramebufferInfo(gl: WebGLXRenderingContext, framebufferInfo: FramebufferInfo, attachments?: AttachmentOptions[], width?: number, height?: number): void;

    export type Mat4 = number[] | Float32Array;
    export type Vec3 = number[] | Float32Array;

    export module m4 {
        export function axisRotate(m: Mat4, axis: Vec3, angleInRadians: number, dst?: Mat4): Mat4;
        export function axisRotation(axis: Vec3, angleInRadians: number, dst?: Mat4): Mat4;
        export function copy(m: Mat4, dst?: Mat4): Mat4;
        export function frustum(left: number, right: number, bottom: number, top: number, near: number, far: number, dst?: Mat4): Mat4;
        export function getAxis(m: Mat4, axis: number): Vec3
        export function getTranslation(m: Mat4, dst?: Vec3): Vec3
        export function identity(dst?: Mat4): Mat4;
        export function inverse(m: Mat4, dst?: Mat4): Mat4;
        export function lookAt(eye: Vec3, target: Vec3, up: Vec3, dst?: Mat4): Mat4;
        export function multiply(a: Mat4, b: Mat4, dst?: Mat4): Mat4;
        export function negate(m: Mat4, dst?: Mat4): Mat4;
        export function ortho(left: number, right: number, top: number, bottom: number, near: number, far: number, dst?: Mat4): Mat4;
        export function perspective(fieldOfViewYInRadians: number, aspect: number, zNear: number, zFar: number, dst?: Mat4): Mat4;
        export function rotateX(m: Mat4, angleInRadians: number, dst?: Mat4): Mat4;
        export function rotateY(m: Mat4, angleInRadians: number, dst?: Mat4): Mat4;
        export function rotateZ(m: Mat4, angleInRadians: number, dst?: Mat4): Mat4;
        export function rotationX(angleInRadians: number, dst?: Mat4): Mat4;
        export function rotationY(angleInRadians: number, dst?: Mat4): Mat4;
        export function rotationZ(angleInRadians: number, dst?: Mat4): Mat4;
        export function scale(m: Mat4, v: number, dst?: Mat4): Mat4;
        export function scaling(v: number, dst?: Mat4): Mat4;
        export function setAxis(v: number, axis: number, dst?: Mat4): Mat4;
        export function setTranslation(a: Mat4, v: Vec3, dst?: Mat4): Mat4;
        export function transformDirection(m: Mat4, v: Vec3, dst?: Vec3): Vec3;
        export function transformNormal(m: Mat4, v: Vec3, dst?: Vec3): Vec3;
        export function transformPoint(m: Mat4, v: Vec3, dst?: Vec3): Vec3;
        export function translate(m: Mat4, v: Vec3, dst?: Mat4): Mat4;
        export function translation(v: Vec3, dst?: Mat4): Mat4;
        export function transpose(m: Mat4, dst?: Mat4): Mat4;
    }

    export type TypedArray = Uint16Array | Uint8Array | Uint32Array | Int32Array | Int16Array | Int8Array | Float32Array | Float64Array;

    export module primitives {
        export interface RandomVerticesOptions {
            rand: RandomColorFunc;
            vertsPerColor: number;
        }

        export interface AugmentedTypedArray extends ArrayLike<number> {
            push(value: number[] | number, ...values: number[]): void;
            buffer: ArrayBuffer;
        }

        export type RandomColorFunc = (ndx: number, channel: number) => number;

        export type TypedArrayConstructor = Uint8ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor | Int8ArrayConstructor | Int16ArrayConstructor | Int32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor;

        export function concatVertices(arrays: Arrays): Arrays;
        export function create3DFBufferInfo(gl: WebGLXRenderingContext): BufferInfo;
        export function create3DFBuffers(gl: WebGLXRenderingContext): { [key: string]: WebGLBuffer };
        export function create3DFVertices(): { [key: string]: TypedArray };
        export function createAugmentedTypedArray(numComponents: number, numElements: number, opt_type?: TypedArrayConstructor): AugmentedTypedArray;
        export function createCresentBufferInfo(gl: WebGLXRenderingContext, verticalRadius: number, outerRadius: number, innerRadius: number, thickness: number, subdivisionsDown: number, subdivisionsThick: number, startOffset?: number, endOffset?: number): BufferInfo;
        export function createCresentBufferInfo(gl: WebGLXRenderingContext, verticalRadius: number, outerRadius: number, innerRadius: number, thickness: number, subdivisionsDown: number, subdivisionsThick: number, startOffset?: number, endOffset?: number): { [key: string]: WebGLBuffer };
        export function createCresentVertices(verticalRadius: number, outerRadius: number, innerRadius: number, thickness: number, subdivisionsDown: number, subdivisionsThick: number, startOffset?: number, endOffset?: number): { [key: string]: TypedArray };
        export function createCubeBuffers(gl: WebGLXRenderingContext, size?: number): { [key: string]: WebGLBuffer };
        export function createCubeVertices(size?: number): { [key: string]: TypedArray };
        export function createCylinderBufferInfo(gl: WebGLXRenderingContext, radius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, topCap?: boolean, bottomCap?: boolean): { [key: string]: BufferInfo };
        export function createCylinderBuffers(gl: WebGLXRenderingContext, radius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, topCap?: boolean, bottomCap?: boolean): { [key: string]: WebGLBuffer };
        export function createCylinderVertices(radius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, topCap: boolean, bottomCap: boolean): { [key: string]: TypedArray };
        export function createDiscBufferInfo(gl: WebGLXRenderingContext, radius: number, divisions: number, stacks?: number, innerRadius?: number, stackPower?: number): BufferInfo;
        export function createDiscBuffers(gl: WebGLXRenderingContext, radius: number, divisions: number, stacks?: number, innerRadius?: number, stackPower?: number): { [key: string]: WebGLBuffer };
        export function createDiscVertices(radius: number, divisions: number, stacks?: number, innerRadius?: number, stackPower?: number): { [key: string]: TypedArray };
        export function createPlaneBufferInfo(gl: WebGLXRenderingContext, width?: number, depth?: number, subdivisionsWidth?: number, subdivisionsDepth?: number, matrix?: number): BufferInfo;
        export function createPlaneBuffers(gl: WebGLXRenderingContext, width?: number, depth?: number, subdivisionsWidth?: number, subdivisionsDepth?: number, matrix?: Mat4): { [key: string]: WebGLBuffer };
        export function createPlaneVertices(width?: number, depth?: number, subdivisionsWidth?: number, subdivisionsDepth?: number, matrix?: number): { [key: string]: TypedArray };
        export function createSphereBufferInfo(gl: WebGLXRenderingContext, radius: number, subdivisionsAxis: number, subdivisionsHeight: number, opt_startLatitudeInRadians?: number, opt_endLatitudeInRadians?: number, opt_startLongitudeInRadians?: number, opt_endLongitudeInRadians?: number): BufferInfo;
        export function createSphereBuffers(gl: WebGLXRenderingContext, radius: number, subdivisionsAxis: number, subdivisionsHeight: number, opt_startLatitudeInRadians?: number, opt_endLatitudeInRadians?: number, opt_startLongitudeInRadians?: number, opt_endLongitudeInRadians?: number): { [key: string]: WebGLBuffer };
        export function createSphereVertices(radius: number, subdivisionsAxis: number, subdivisionsHeight: number, opt_startLatitudeInRadians?: number, opt_endLatitudeInRadians?: number, opt_startLongitudeInRadians?: number, opt_endLongitudeInRadians?: number): { [key: string]: TypedArray };
        export function createTorusBufferInfo(gl: WebGLXRenderingContext, radius: number, thickness: number, radialSubdivisions: number, bodySubdivisions: number, startAngle?: number, endAngle?: number): BufferInfo;
        export function createTorusBuffers(gl: WebGLXRenderingContext, radius: number, thickness: number, radialSubdivisions: number, bodySubdivisions: number, startAngle?: number, endAngle?: number): { [key: string]: WebGLBuffer };
        export function createTorusVertices(radius: number, thickness: number, radialSubdivisions: number, bodySubdivisions: number, startAngle?: number, endAngle?: number): { [key: string]: TypedArray };
        export function createTruncatedConeBufferInfo(gl: WebGLXRenderingContext, bottomRadius: number, topRadius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, opt_topCapopt?: boolean, opt_bottomCap?: boolean): BufferInfo;
        export function createTruncatedConeBuffers(gl: WebGLXRenderingContext, bottomRadius: number, topRadius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, opt_topCap?: boolean, opt_bottomCap?: boolean): { [key: string]: WebGLBuffer };
        export function createTruncatedConeVertices(bottomRadius: number, topRadius: number, height: number, radialSubdivisions: number, verticalSubdivisions: number, opt_topCap?: boolean, opt_bottomCap?: boolean): { [key: string]: TypedArray };
        export function createXYQuadBufferInfo(gl: WebGLXRenderingContext, size?: number, xOffset?: number, yOffset?: number): { [key: string]: WebGLBuffer };
        export function createXYQuadBuffers(gl: WebGLXRenderingContext, size?: number, xOffset?: number, yOffset?: number): BufferInfo;
        export function createXYQuadVertices(size?: number, xOffset?: number, yOffset?: number): any;
        export function deindexVertices(vertices: { [key: string]: TypedArray }): { [key: string]: TypedArray };
        export function duplicateVertices(arrays: Arrays): Arrays;
        export function flattenNormals(vertices: { [key: string]: TypedArray }): { [key: string]: TypedArray };
        export function makeRandomVertexColors(vertices: { [key: string]: AugmentedTypedArray }, options?: AugmentedTypedArray): { [key: string]: AugmentedTypedArray };
        export function reorientDirections(array: number[] | TypedArray, matrix: Mat4): number[] | TypedArray;
        export function reorientNormals(array: number[] | TypedArray, matrix: Mat4): number[] | TypedArray;
        export function reorientPositions(array: number[] | TypedArray, matrix: Mat4): number[] | TypedArray;
        export function reorientVertices(arrays: { [key: string]: number[] | TypedArray }, matrix: Mat4): { [key: string]: number[] | TypedArray };
    }

    export module programs {
        export function bindUniformBlock(gl: WebGLXRenderingContext, programInfo: ProgramInfo | UniformBlockSpec, uniformBlockInfo: UniformBlockSpec): boolean;
        export function createAttributeSetters(program: WebGLProgram): { [key: string]: (attr: any) => void };
        export function createProgram(shaders: WebGLShader[] | string[], opt_attribs?: ProgramOptions | string[], opt_locations?: number[], opt_errorCallback?: ErrorCallback): WebGLProgram;
        export function createProgramFromScripts(gl: WebGLXRenderingContext, shaderScriptIds: string[], opt_attribs?: string[], opt_locations?: number[], opt_errorCallback?: ErrorCallback): WebGLProgram;
        export function createProgramFromSources(gl: WebGLXRenderingContext, shaderSources, opt_attribsopt, opt_locationsopt, opt_errorCallback): WebGLProgram;
        /**
         * Creates a ProgramInfo from 2 sources.
         * @param shaderSources Array of sources for the shaders or ids. The first is assumed to be the vertex shader, the second the fragment shader.
         * @param opt_attribs Options for the program or an array of attribs names. Locations will be assigned by index if not passed in
         * @param opt_locations The locations for the attributes. A parallel array to opt_attribs letting you assign locations.
         * @param opt_errorCallback callback for errors. By default it just prints an error to the console on error. If you want something else pass an callback. It's passed an error message.
         */
        export function createProgramInfo(gl: WebGLXRenderingContext, shaderSources: string[], opt_attribs?: ProgramOptions | string[], opt_locations?: number[], opt_errorCallback?: () => any): ProgramInfo;
        export function createProgramInfoFromProgram(gl: WebGLXRenderingContext, program): ProgramInfo;
        export function createUniformBlockInfo(gl: WebGLXRenderingContext, programInfo, blockName): UniformBlockInfo;
        export function createUniformBlockInfoFromProgram(gl: WebGLXRenderingContext, program, blockName): UniformBlockInfo;
        export function createUniformBlockSpecFromProgram(gl: WebGLXRenderingContext, program): UniformBlockSpec;
        export function createUniformSetters(program): { [key: string]: (attr: any) => void };
        /** @deprecated ... use module:twgl.setBuffersAndAttributes*/
        export function setAttributes(setters, buffers);
        export function setBlockUniforms(uniformBlockInfo, values)
        export function setBuffersAndAttributes(gl: WebGLXRenderingContext, setters, buffers)
        export function setUniformBlock(gl: WebGLXRenderingContext, programInfo, uniformBlockInfo)
        export function setUniforms(setters, values)
    }

    export module textures {
        /** todo */
        export function createTexture(...any): any;
        /** todo */
        export function createTextures(...any): any;
        /** todo */
        export function getBytesPerElementForInternalFormat(...any): any;
        /** todo */
        export function getNumComponentsForFormat(...any): any;
        /** todo */
        export function loadCubemapFromUrls(...any): any;
        /** todo */
        export function loadSlicesFromUrls(...any): any;
        /** todo */
        export function loadTextureFromUrl(...any): any;
        /** todo */
        export function resizeTexture(...any): any;
        /** todo */
        export function setDefaultTextureColor(...any): any;
        /** todo */
        export function setEmptyTexture(...any): any;
        /** todo */
        export function setSamplerParameters(...any): any;
        /** todo */
        export function setTextureFilteringForSize(...any): any;
        /** todo */
        export function setTextureFromArray(...any): any;
        /** todo */
        export function setTextureFromElement(...any): any;
        /** todo */
        export function setTextureParameters(...any): any;
        /** todo */
        export function setTextureTo1PixelColor(...any): any;
    }

    export module typedArray {
        /** todo */
        export function getGLTypeForTypedArray(...any): any;
        /** todo */
        export function getGLTypeForTypedArrayType(...any): any;
        /** todo */
        export function getTypedArrayTypeForGLType(...any): any;
    }

    export module v3 {
        /** todo */
        export function add(...any): any;
        /** todo */
        export function copy(...any): any;
        /** todo */
        export function create(...any): any;
        /** todo */
        export function cross(...any): any;
        /** todo */
        export function distance(...any): any;
        /** todo */
        export function distanceSq(...any): any;
        /** todo */
        export function divide(...any): any;
        /** todo */
        export function divScalar(...any): any;
        /** todo */
        export function dot(...any): any;
        /** todo */
        export function length(...any): any;
        /** todo */
        export function lengthSq(...any): any;
        /** todo */
        export function lerp(...any): any;
        /** todo */
        export function mulScalar(...any): any;
        /** todo */
        export function multiply(...any): any;
        /** todo */
        export function negate(...any): any;
        /** todo */
        export function normalize(...any): any;
        /** todo */
        export function subtract(...any): any;
    }

    export module v3 {
        /** todo */
        export function createVAOAndSetAttributes(...any): any;
        /** todo */
        export function createVAOFromBufferInfo(...any): any;
        /** todo */
        export function createVertexArrayInfo(...any): any;
    }
}