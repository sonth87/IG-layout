import type { Mat3 } from "../project/cropView";

// Perspective drawing (D-111 part 2): renders a picture through a homography with WebGL —
// each output pixel looks up its source pixel — into a 2D canvas Konva can draw. Pixels
// that fall outside the picture stay transparent. One shared context; the texture is
// re-uploaded only when the source changes.

const VERT = `
attribute vec2 a_pos;
varying vec2 v_out;
uniform vec2 u_out;
void main() {
  v_out = vec2((a_pos.x + 1.0) * 0.5, 1.0 - (a_pos.y + 1.0) * 0.5) * u_out;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 v_out;
uniform sampler2D u_image;
uniform mat3 u_map;
uniform vec2 u_src;
void main() {
  vec3 p = u_map * vec3(v_out, 1.0);
  vec2 uv = p.xy / p.z / u_src;
  if (p.z <= 0.0 || uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0); return; }
  gl_FragColor = texture2D(u_image, uv);
}`;

type Source = TexImageSource;

let ctx: { gl: WebGLRenderingContext; canvas: HTMLCanvasElement; prog: WebGLProgram; tex: WebGLTexture; source: Source | null; stamp: number } | null = null;

function setup() {
  if (ctx) return ctx;
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { premultipliedAlpha: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  ctx = { gl, canvas, prog, tex, source: null, stamp: -1 };
  return ctx;
}

/**
 * Draws `source` (whose pixels are `srcSize`) into `out` (w × h px) through `map`
 * (out px → source px). `stamp` changes when a canvas / video source has new pixels.
 * Returns false when WebGL is not available.
 */
export function warpInto(out: HTMLCanvasElement, source: Source, srcSize: { width: number; height: number }, map: Mat3, stamp = 0) {
  const c = setup();
  if (!c) return false;
  const { gl, canvas, prog } = c;
  const w = out.width;
  const h = out.height;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  gl.viewport(0, 0, w, h);
  if (c.source !== source || c.stamp !== stamp) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    c.source = source;
    c.stamp = stamp;
  }
  // GLSL mat3 is column-major.
  const m = map;
  gl.uniformMatrix3fv(gl.getUniformLocation(prog, "u_map"), false, [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]);
  gl.uniform2f(gl.getUniformLocation(prog, "u_src"), srcSize.width, srcSize.height);
  gl.uniform2f(gl.getUniformLocation(prog, "u_out"), w, h);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  const o = out.getContext("2d")!;
  o.clearRect(0, 0, w, h);
  o.drawImage(canvas, 0, 0);
  return true;
}
