import { paramsKey, type ShaderParams } from "./params";

// One WebGL pass applies every colour adjustment (docs/architecture/editor-model.md, mục 7).
// Results are copied to 2D canvases (usable by Konva and toBlob) and cached.

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2((a_pos.x + 1.0) * 0.5, 1.0 - (a_pos.y + 1.0) * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_image;
uniform vec2 u_size;
uniform float u_exposure, u_brightness, u_contrast, u_highlights, u_shadows;
uniform float u_saturation, u_vibrance, u_temperature, u_tint, u_hue;
uniform float u_grain, u_fade, u_mono, u_split;
uniform vec3 u_monoTint, u_splitShadows, u_splitHighlights;

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

vec3 hueRotate(vec3 c, float turns) {
  // Rotate chroma in YIQ space, keep luma.
  const mat3 toYIQ = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);
  const mat3 toRGB = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);
  vec3 yiq = toYIQ * c;
  float h = atan(yiq.z, yiq.y) + turns * 6.2831853;
  float chroma = length(yiq.yz);
  yiq.yz = vec2(cos(h), sin(h)) * chroma;
  return toRGB * yiq;
}

float rand(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec4 src = texture2D(u_image, v_uv);
  vec3 c = src.rgb;

  c *= pow(2.0, u_exposure);
  c += u_brightness * 0.2;
  c = (c - 0.5) * (1.0 + u_contrast) + 0.5;

  float l = luma(c);
  c += u_shadows * 0.35 * (1.0 - smoothstep(0.0, 0.55, l));
  c += u_highlights * 0.35 * smoothstep(0.45, 1.0, l);

  c.r += u_temperature * 0.12;
  c.b -= u_temperature * 0.12;
  c.g += u_tint * 0.1;

  l = luma(c);
  c = mix(vec3(l), c, 1.0 + u_saturation);
  float sat = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
  c = mix(vec3(l), c, 1.0 + u_vibrance * (1.0 - clamp(sat, 0.0, 1.0)));

  if (u_hue != 0.0) c = hueRotate(c, u_hue);

  l = luma(clamp(c, 0.0, 1.0));
  c = mix(c, vec3(l) * u_monoTint, u_mono);
  c += (u_splitShadows - 0.5) * (1.0 - l) * u_split + (u_splitHighlights - 0.5) * l * u_split;

  c = c * (1.0 - u_fade * 0.22) + u_fade * 0.1;
  c += (rand(v_uv * u_size) - 0.5) * u_grain * 0.18;

  gl_FragColor = vec4(clamp(c, 0.0, 1.0), src.a);
}`;

type Uniforms = Record<string, WebGLUniformLocation | null>;

interface GL {
  gl: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
  uniforms: Uniforms;
  texture: WebGLTexture;
  maxSize: number;
  /** Last uploaded source, to skip re-uploading while dragging a slider. */
  uploaded: { source: CanvasImageSource; width: number; height: number } | null;
}

let state: GL | null | undefined;

function init(): GL | null {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { premultipliedAlpha: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const names = [
    "size", "exposure", "brightness", "contrast", "highlights", "shadows", "saturation", "vibrance",
    "temperature", "tint", "hue", "grain", "fade", "mono", "split", "monoTint", "splitShadows", "splitHighlights",
  ];
  const uniforms = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(program, `u_${n}`)]));
  return { gl, canvas, uniforms, texture, maxSize: gl.getParameter(gl.MAX_TEXTURE_SIZE), uploaded: null };
}

function context() {
  if (state === undefined) {
    try {
      state = init();
    } catch (err) {
      console.warn("WebGL colour processing unavailable", err);
      state = null;
    }
  }
  return state;
}

export function webglAvailable() {
  return context() !== null;
}

/** Downscales `source` so its long edge is ≤ max (returns source when already small). */
function fit(source: CanvasImageSource & { width: number; height: number }, max: number) {
  const scale = Math.min(1, max / Math.max(source.width, source.height));
  if (scale === 1) return { image: source, width: source.width, height: source.height };
  const c = document.createElement("canvas");
  c.width = Math.round(source.width * scale);
  c.height = Math.round(source.height * scale);
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, c.width, c.height);
  return { image: c as CanvasImageSource, width: c.width, height: c.height };
}

function render(source: HTMLImageElement | HTMLCanvasElement, p: ShaderParams, maxSize: number): HTMLCanvasElement | null {
  const g = context();
  if (!g) return null;
  const { gl, uniforms: u } = g;
  const { image, width, height } = fit(source, Math.min(maxSize, g.maxSize));

  g.canvas.width = width;
  g.canvas.height = height;
  gl.viewport(0, 0, width, height);
  gl.bindTexture(gl.TEXTURE_2D, g.texture);
  if (g.uploaded?.source !== image || g.uploaded.width !== width) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image as TexImageSource);
    g.uploaded = { source: image, width, height };
  }
  gl.uniform2f(u.size, width, height);
  for (const key of ["exposure", "brightness", "contrast", "highlights", "shadows", "saturation", "vibrance", "temperature", "tint", "hue", "grain", "fade", "mono", "split"] as const) {
    gl.uniform1f(u[key], p[key]);
  }
  gl.uniform3fv(u.monoTint, p.monoTint);
  gl.uniform3fv(u.splitShadows, p.splitShadows);
  gl.uniform3fv(u.splitHighlights, p.splitHighlights);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  out.getContext("2d")!.drawImage(g.canvas, 0, 0);
  return out;
}

// Small LRU cache: slider drags produce many short-lived results.
const CACHE_SIZE = 24;
const cache = new Map<string, HTMLCanvasElement>();
const sourceIds = new WeakMap<object, number>();
let nextSourceId = 1;

/**
 * Processed copy of `source` (long edge ≤ maxSize), or null when WebGL is
 * unavailable (callers then draw the original).
 */
export function processImage(source: HTMLImageElement | HTMLCanvasElement, params: ShaderParams, maxSize: number) {
  let id = sourceIds.get(source);
  if (!id) sourceIds.set(source, (id = nextSourceId++));
  const key = `${id}|${maxSize}|${paramsKey(params)}`;
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const result = render(source, params, maxSize);
  if (!result) return null;
  cache.set(key, result);
  while (cache.size > CACHE_SIZE) {
    // Not cleared explicitly: an element may still be showing it; GC frees it.
    cache.delete(cache.keys().next().value!);
  }
  return result;
}
