/* Independent aurora shader: no build step, network request or animation library. */
(() => {
  'use strict';
  const section = document.getElementById('home');
  const art = section.querySelector('.home-aurora');
  const canvas = art.querySelector('canvas');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let gl;
  try { gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false }); }
  catch { return; }
  if (!gl) return; // The CSS light curtain remains visible.

  const vertexSource = `
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = position * .5 + .5;
      gl_Position = vec4(position, 0., 1.);
    }
  `;
  const fragmentSource = `
    precision highp float;
    varying vec2 uv;
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * .1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3. - 2. * f);
      return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
                 mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
    }
    void main() {
      float x = uv.x, y = 1. - uv.y;
      float t = time * .19;
      float broad = noise(vec2(x * 3.6 + t * .25, t * .32));
      float folds = noise(vec2(x * 8. - t * .42, t * .48));
      float height = .19 + .23 * broad + .14 * folds;
      float curtain = exp(-pow(y / height, 2.)) * .86;
      float veil = exp(-pow((y - height * .7) / (height * .55), 2.)) * .22;
      float fibres = .83 + .17 * noise(vec2(x * 24. + t, y * 2. - t * .6));
      float alpha = clamp((curtain + veil) * fibres, 0., .94);
      alpha *= 1. - smoothstep(.62, .94, y);
      float drift = clamp(x + .065 * sin(t + x * 5.), 0., 1.);
      vec3 color = mix(color1, color2, smoothstep(.08, .5, drift));
      color = mix(color, color3, smoothstep(.5, .95, drift));
      gl_FragColor = vec4(color, alpha);
    }
  `;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
  }
  const vertex = compile(gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return;
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const timeUniform = gl.getUniformLocation(program, 'time');
  // Transparency blends the exact requested colours with the silver base.
  ['#5299ff', '#3427ff', '#F43F5E'].forEach((hex, index) => {
    const rgb = hex.match(/[\da-f]{2}/gi).map(value => parseInt(value, 16) / 255);
    gl.uniform3fv(gl.getUniformLocation(program, `color${index + 1}`), rgb);
  });

  let frame = null;
  let visible = section.getBoundingClientRect().bottom > 0;
  let lost = false;
  let elapsed = 7;
  let last = null;
  function draw() {
    gl.uniform1f(timeUniform, elapsed);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function resize() {
    if (lost) return;
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(art.clientWidth * scale));
    canvas.height = Math.max(1, Math.round(art.clientHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw();
  }
  function animate(now) {
    frame = null;
    if (last !== null) elapsed += Math.min((now - last) / 1000, .05);
    last = now;
    draw();
    frame = requestAnimationFrame(animate);
  }
  function sync() {
    const running = visible && !document.hidden && !motion.matches && !lost;
    if (running && frame === null) { last = null; frame = requestAnimationFrame(animate); }
    if (!running && frame !== null) { cancelAnimationFrame(frame); frame = null; last = null; }
  }
  resize();
  art.classList.add('is-ready');
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(art);
  else window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }).observe(section);
  }
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    lost = true;
    art.classList.remove('is-ready');
    sync();
  });
  sync();
})();
