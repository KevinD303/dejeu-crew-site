/**
 * The developer tray: the hero photo under safelight, emerging darkest tones first
 * under a rippling liquid surface. WebGL1; on any failure the page falls back to CSS (see .no-gl).
 */

const VS = `attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}`

const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v;
uniform sampler2D tex;
uniform vec2 cover;
uniform float aspect, dev, lights, time;
uniform vec3 drops[4];
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){return .55*n(p)+.3*n(p*2.03)+.15*n(p*4.01);}
void main(){
  vec2 q=vec2(v.x*aspect,v.y);
  vec2 bend=vec2(0.); float crest=0.;
  for(int i=0;i<4;i++){
    if(drops[i].z<0.) continue;
    vec2 d=q-vec2(drops[i].x*aspect,drops[i].y);
    float r=length(d)+.0001, a=drops[i].z, f=r-a*.32;
    float w=sin(f*70.)*exp(-abs(f)*16.)*exp(-a*1.1);
    bend+=d/r*w; crest+=w;
  }
  float wet=1.-lights;
  vec2 swell=vec2(fbm(q*2.2+time*.05),fbm(q*2.2+9.-time*.04))-.5;
  vec2 uv=v+bend*.014+swell*.016*wet;
  vec3 c=texture2D(tex,(uv-.5)*cover+.5).rgb;
  float l=dot(c,vec3(.299,.587,.114));
  float mott=fbm(q*3.6+3.);
  float th=dev*1.75-.4;
  float a2=1.-smoothstep(th-.1,th+.2,l+(mott-.5)*.3);
  vec3 print=mix(vec3(.94,.90,.83),c,a2);
  float g=dot(print,vec3(.3,.6,.1));
  float vig=1.-smoothstep(.25,1.25,length((v-.5)*vec2(1.,1.1))*2.);
  vec3 safe=vec3(1.,.42,.13)*pow(g,1.35)*(.35+.65*vig);
  vec3 col=mix(safe,print,lights);
  col+=vec3(1.,.72,.45)*max(crest,0.)*.22*(1.-.55*lights);
  gl_FragColor=vec4(col,1.);
}`

/** Returns null if WebGL or the image upload fails, so the caller can use the CSS fallback. */
export function createTray(canvas, img, onReady) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
  if (!gl) return null

  const compile = (type, src) => {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  }
  const vs = compile(gl.VERTEX_SHADER, VS)
  const fs = compile(gl.FRAGMENT_SHADER, FS)
  if (!vs || !fs) return null
  const prog = gl.createProgram()
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'a')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const u = (name) => gl.getUniformLocation(prog, name)
  const U = { cover: u('cover'), aspect: u('aspect'), dev: u('dev'), lights: u('lights'), time: u('time'), drops: u('drops') }

  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  let ready = false
  let lost = false
  let onFail = () => {}
  const drops = new Float32Array([0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1])
  let head = 0

  const setCover = () => {
    if (!img.naturalWidth) return
    const ca = canvas.width / canvas.height
    const ia = img.naturalWidth / img.naturalHeight
    gl.uniform2f(U.cover, ca > ia ? 1 : ca / ia, ca > ia ? ia / ca : 1)
  }

  const upload = () => {
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    } catch {
      lost = true
      onFail()
      return
    }
    setCover()
    ready = true
    onReady()
  }
  img.decode().catch(() => {}).then(() => {
    if (img.complete && img.naturalWidth) upload()
    else img.addEventListener('load', upload, { once: true })
  })

  canvas.addEventListener('webglcontextlost', () => {
    lost = true
    onFail()
  })

  return {
    onFail(fn) {
      onFail = fn
    },
    /** CSS size of the stage; the canvas is measured from here because its own rect is transformed. */
    resize(w, h) {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const k = Math.min(1, 1600 / (Math.max(w, h) * dpr))
      canvas.width = Math.round(w * dpr * k)
      canvas.height = Math.round(h * dpr * k)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform1f(U.aspect, w / h)
      setCover()
    },
    /** x and y in 0..1 from the top left of the screen. */
    drop(x, y) {
      const i = head++ % 4
      drops[i * 3] = x
      drops[i * 3 + 1] = 1 - y
      drops[i * 3 + 2] = 0
    },
    /** Draws one frame. Returns false once there is nothing left to animate. */
    draw(dev, lights, time, dt) {
      if (!ready || lost) return true
      let alive = false
      for (let i = 2; i < 12; i += 3) {
        if (drops[i] < 0) continue
        drops[i] += dt
        if (drops[i] > 4) drops[i] = -1
        else alive = true
      }
      gl.uniform1f(U.dev, dev)
      gl.uniform1f(U.lights, lights)
      gl.uniform1f(U.time, time)
      gl.uniform3fv(U.drops, drops)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      return alive || lights < 0.99 || dev < 1
    },
    get ready() {
      return ready
    },
  }
}
