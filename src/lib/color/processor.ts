import { recipeFor } from "./filters";
import { buildLut, LUT_SIZE } from "./lut";
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
uniform sampler2D u_lut;
uniform vec2 u_size;
uniform float u_lutAmount, u_lutMono, u_bloom, u_halation;
uniform float u_exposure, u_brightness, u_contrast, u_highlights, u_shadows;
uniform float u_saturation, u_vibrance, u_temperature, u_tint, u_hue;
uniform float u_grain, u_fade, u_mono, u_split, u_blur, u_sharpen;
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

// Filter v2: the recipe's 3D table, laid out as blue slices side by side (lut.ts).
const float N = ${LUT_SIZE}.0;
vec3 lut(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  float b = c.b * (N - 1.0);
  float b0 = floor(b);
  float b1 = min(b0 + 1.0, N - 1.0);
  float y = (c.g * (N - 1.0) + 0.5) / N;
  float x = c.r * (N - 1.0) + 0.5;
  vec3 s0 = texture2D(u_lut, vec2((b0 * N + x) / (N * N), y)).rgb;
  vec3 s1 = texture2D(u_lut, vec2((b1 * N + x) / (N * N), y)).rgb;
  return mix(s0, s1, b - b0);
}

// Film grain: smooth noise a few pixels wide (sized to the picture, so preview and export match).
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(rand(i), rand(i + vec2(1.0, 0.0)), f.x), mix(rand(i + vec2(0.0, 1.0)), rand(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  vec4 src = texture2D(u_image, v_uv);
  vec3 c = src.rgb;

  // Blur: 5 × 5 samples spread with the amount; sharpen: unsharp mask on the 4 neighbours (M19).
  vec2 px = 1.0 / u_size;
  if (u_blur > 0.0) {
    float r = 1.0 + u_blur * min(u_size.x, u_size.y) * 0.006;
    vec3 sum = vec3(0.0);
    for (int i = -2; i <= 2; i++)
      for (int j = -2; j <= 2; j++) sum += texture2D(u_image, v_uv + vec2(float(i), float(j)) * px * r).rgb;
    c = mix(c, sum / 25.0, clamp(u_blur * 1.5, 0.0, 1.0));
  }
  if (u_sharpen > 0.0) {
    vec3 n = texture2D(u_image, v_uv + vec2(px.x, 0.0)).rgb + texture2D(u_image, v_uv - vec2(px.x, 0.0)).rgb
           + texture2D(u_image, v_uv + vec2(0.0, px.y)).rgb + texture2D(u_image, v_uv - vec2(0.0, px.y)).rgb;
    c += (c - n * 0.25) * u_sharpen * 2.0;
  }

  if (u_lutAmount > 0.0) {
    vec3 base = mix(c, vec3(luma(c)), u_lutMono);
    c = mix(base, lut(c), u_lutAmount);
  }
  // Glow: bright parts of the photo spread over a small disc (golden-angle spiral).
  if (u_bloom + u_halation > 0.0) {
    float r = min(u_size.x, u_size.y) * 0.018;
    vec3 glow = vec3(0.0);
    for (int i = 0; i < 24; i++) {
      float a = float(i) * 2.39996;
      vec2 o = vec2(cos(a), sin(a)) * sqrt((float(i) + 0.5) / 24.0) * r * px;
      vec3 s = texture2D(u_image, v_uv + o).rgb;
      glow += s * smoothstep(0.6, 0.95, luma(s));
    }
    glow /= 24.0;
    c = 1.0 - (1.0 - c) * (1.0 - glow * u_bloom);
    // Halation only spills past the edge of a light onto what is darker around it.
    float here = smoothstep(0.6, 0.95, luma(src.rgb));
    float spill = max(0.0, luma(glow) - here * 0.9);
    c += vec3(1.0, 0.28, 0.1) * spill * u_halation * 2.5;
  }

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
  if (u_grain > 0.0) {
    vec2 gp = v_uv * u_size / max(1.0, min(u_size.x, u_size.y) / 800.0);
    float g = noise(gp) * 0.65 + noise(gp * 2.3 + 17.0) * 0.35 - 0.5;
    float gl = luma(clamp(c, 0.0, 1.0));
    c += g * u_grain * 0.3 * (0.35 + 2.2 * gl * (1.0 - gl));
  }

  gl_FragColor = vec4(clamp(c, 0.0, 1.0), src.a);
}`;

type Uniforms = Record<string, WebGLUniformLocation | null>;

interface GL {
  gl: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
  uniforms: Uniforms;
  texture: WebGLTexture;
  lutTexture: WebGLTexture;
  /** Recipe currently in lutTexture. */
  lutId: string;
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

  const lutTexture = gl.createTexture()!;
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, lutTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  gl.activeTexture(gl.TEXTURE0);
  gl.uniform1i(gl.getUniformLocation(program, "u_image"), 0);
  gl.uniform1i(gl.getUniformLocation(program, "u_lut"), 1);

  const names = [
    "size", "exposure", "brightness", "contrast", "highlights", "shadows", "saturation", "vibrance",
    "temperature", "tint", "hue", "grain", "fade", "mono", "split", "blur", "sharpen", "monoTint", "splitShadows", "splitHighlights",
    "lutAmount", "lutMono", "bloom", "halation",
  ];
  const uniforms = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(program, `u_${n}`)]));
  return { gl, canvas, uniforms, texture, lutTexture, lutId: "", maxSize: gl.getParameter(gl.MAX_TEXTURE_SIZE), uploaded: null };
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

// Baked tables (≈ 140 KB each), kept for the filters used this session.
const luts = new Map<string, Uint8Array>();
function lutBytes(id: string, recipe: NonNullable<ReturnType<typeof recipeFor>>) {
  let bytes = luts.get(id);
  if (!bytes) luts.set(id, (bytes = buildLut(recipe)));
  return bytes;
}

function render(
  source: HTMLImageElement | HTMLCanvasElement,
  p: ShaderParams,
  maxSize: number,
  /** Video frames (M13.3): always upload (the picture changed), draw into this canvas. */
  frame?: { out: HTMLCanvasElement },
): HTMLCanvasElement | null {
  const g = context();
  if (!g) return null;
  const { gl, uniforms: u } = g;
  const { image, width, height } = fit(source, Math.min(maxSize, g.maxSize));
  if (frame) g.uploaded = null;

  g.canvas.width = width;
  g.canvas.height = height;
  gl.viewport(0, 0, width, height);
  gl.bindTexture(gl.TEXTURE_2D, g.texture);
  if (g.uploaded?.source !== image || g.uploaded.width !== width) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image as TexImageSource);
    g.uploaded = { source: image, width, height };
  }
  gl.uniform2f(u.size, width, height);
  const recipe = p.lut ? recipeFor(p.lut) : undefined;
  if (recipe && g.lutId !== p.lut) {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, g.lutTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, LUT_SIZE * LUT_SIZE, LUT_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, lutBytes(p.lut, recipe));
    gl.activeTexture(gl.TEXTURE0);
    g.lutId = p.lut;
  }
  gl.uniform1f(u.lutAmount, recipe ? p.lutAmount : 0);
  gl.uniform1f(u.lutMono, recipe ? p.lutMono : 0);
  gl.uniform1f(u.bloom, p.bloom);
  gl.uniform1f(u.halation, p.halation);
  for (const key of ["exposure", "brightness", "contrast", "highlights", "shadows", "saturation", "vibrance", "temperature", "tint", "hue", "grain", "fade", "mono", "split", "blur", "sharpen"] as const) {
    gl.uniform1f(u[key], p[key]);
  }
  gl.uniform3fv(u.monoTint, p.monoTint);
  gl.uniform3fv(u.splitShadows, p.splitShadows);
  gl.uniform3fv(u.splitHighlights, p.splitHighlights);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  const out = frame?.out ?? document.createElement("canvas");
  if (out.width !== width || out.height !== height) {
    out.width = width;
    out.height = height;
  }
  out.getContext("2d")!.drawImage(g.canvas, 0, 0);
  return out;
}

/**
 * One video frame with colour applied (M13.3), drawn into `out` (reused every frame,
 * no cache). `source` must have width / height (canvas, or a <video> wrapped by the caller).
 */
export function processFrame(source: HTMLCanvasElement, params: ShaderParams, maxSize: number, out: HTMLCanvasElement) {
  return render(source, params, maxSize, { out });
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
