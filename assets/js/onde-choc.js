/* Onde de choc WebGL sur la photo du héros (data-effet="onde-de-choc") : quand la barre se pose, un anneau
   déforme la photo depuis le point d'impact ; un clic ou un toucher sur le héros en relance un ; la vitesse
   du défilement fait onduler l'image. Le canvas n'est visible que pendant le mouvement : au repos, la vraie photo,
   nette. Calé sur l'image (object-fit: cover et object-position). Sans WebGL ou en mode calme : rien, la photo reste. */
import { etat, boucle } from './socle/index.js?v=4';

const VS = `attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;
const FS = `precision mediump float;
varying vec2 v;
uniform sampler2D img;
uniform vec2 taille;      // canvas en px
uniform vec4 cadre;       // décalage (x, y) et taille (w, h) de l'image affichée, en px
uniform vec4 chocs[4];    // x, y (0-1 du canvas), âge (s), force
uniform float vitesse;
uniform float temps;
void main(){
  vec2 px = vec2(v.x, 1. - v.y) * taille;
  vec2 dec = vec2(0.);
  float lueur = 0.;
  for (int i = 0; i < 4; i++) {
    vec4 c = chocs[i];
    if (c.w <= 0.) continue;
    vec2 d = px - c.xy * taille;
    float r = length(d);
    float rayon = c.z * 900.;
    float bord = exp(-pow((r - rayon) / 46., 2.)) * c.w * (1. - smoothstep(0., 1.4, c.z));
    dec += normalize(d + .001) * bord * 26.;
    lueur += bord;
  }
  dec.y += sin(px.x * .012 + temps * 3.) * vitesse * 10.;
  vec2 uv = (px - dec - cadre.xy) / cadre.zw;
  vec3 col = texture2D(img, clamp(uv, 0., 1.)).rgb;
  col += vec3(.24, 1., .54) * lueur * .18;
  gl_FragColor = vec4(col, 1.);
}`;

export function initOndeChoc(figure) {
  if (!figure || etat.calme) return null;
  const img = figure.querySelector('img');
  const canvas = document.createElement('canvas');
  canvas.className = 'onde-choc-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.effet = 'onde-de-choc';
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false, alpha: false });
  if (!gl) return null;
  const prog = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS]]) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('[onde-choc]', gl.getShaderInfoLog(s)); return null; }
    gl.attachShader(prog, s);
  }
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  const uTaille = U('taille'), uCadre = U('cadre'), uChocs = U('chocs'), uVitesse = U('vitesse'), uTemps = U('temps');
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const chocs = [];
  let vitesse = 0, dernierY = window.scrollY, pretTexture = false, w = 0, h = 0, cadre = [0, 0, 1, 1];
  /* Rendu à 60 % de la résolution : la photo n'est remplacée par le canvas que pendant l'onde, en mouvement ; le coût par image baisse de moitié. */
  const dpr = () => Math.min(window.devicePixelRatio || 1, window.innerWidth < 761 ? 1 : 1.25) * 0.6;
  figure.appendChild(canvas);

  function mesurer() {
    const r = figure.getBoundingClientRect();
    w = r.width; h = r.height;
    const k = dpr();
    canvas.width = Math.max(1, Math.round(w * k)); canvas.height = Math.max(1, Math.round(h * k));
    gl.viewport(0, 0, canvas.width, canvas.height);
    const iw = img.naturalWidth || 16, ih = img.naturalHeight || 9;
    const s = Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s;
    const pos = getComputedStyle(img).objectPosition.split(' ').map((x) => parseFloat(x) / 100);
    cadre = [(w - dw) * (pos[0] ?? 0.5), (h - dh) * (pos[1] ?? 0.5), dw, dh];
  }
  function chargerTexture() {
    try {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      pretTexture = true;
    } catch (err) { console.warn('[onde-choc] texture', err); }
  }
  const pret = (img.decode ? img.decode() : Promise.resolve()).then(() => { mesurer(); chargerTexture(); }).catch(() => {});
  new ResizeObserver(() => { mesurer(); }).observe(figure);
  img.addEventListener('load', () => { mesurer(); chargerTexture(); });

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) window.addEventListener('scroll', () => { const y = window.scrollY; vitesse = Math.min(1, vitesse + Math.abs(y - dernierY) / 900); dernierY = y; }, { passive: true });
  figure.closest('section')?.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    const r = figure.getBoundingClientRect();
    choc((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, 0.7);
  });

  function choc(x, y, force = 1) {
    chocs.push({ x, y, age: 0, force });
    if (chocs.length > 4) chocs.shift();
  }

  let t = 0;
  boucle(figure, (dt) => {
    t += dt;
    chocs.forEach((c) => { c.age += dt; });
    while (chocs.length && chocs[0].age > 1.5) chocs.shift();
    vitesse *= Math.pow(0.04, dt);
    const actif = pretTexture && (chocs.length > 0 || vitesse > 0.01);
    if (actif !== canvas.__actif) { canvas.__actif = actif; canvas.style.opacity = actif ? '1' : '0'; }
    if (!actif) return;
    gl.uniform2f(uTaille, w, h);
    gl.uniform4f(uCadre, cadre[0], cadre[1], cadre[2], cadre[3]);
    const data = new Float32Array(16);
    chocs.forEach((c, i) => data.set([c.x, c.y, c.age, c.force], i * 4));
    gl.uniform4fv(uChocs, data);
    gl.uniform1f(uVitesse, vitesse);
    gl.uniform1f(uTemps, t);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, { lourde: true });

  return { pret, choc };
}
