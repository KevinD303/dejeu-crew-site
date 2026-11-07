/**
 * The Darkroom: every scroll scene on the home page runs from one requestAnimationFrame loop.
 * Layout is measured on load and resize only; scenes off screen are skipped.
 */
import { createTray } from './tray.js'

const clamp = (t, a = 0, b = 1) => Math.max(a, Math.min(b, t))
const ease = (t) => {
  const c = clamp(t)
  return c * c * (3 - 2 * c)
}
const lerp = (a, b, t) => a + (b - a) * t
const SMOOTH = 0.14

/** Top of an element in page coordinates, ignoring transforms. */
function pageTop(el) {
  let y = 0
  for (let n = el; n; n = n.offsetParent) y += n.offsetTop
  return y
}

/** Offset of an element inside an ancestor, ignoring transforms. */
function offsetIn(el, ancestor) {
  let x = 0
  let y = 0
  for (let n = el; n && n !== ancestor; n = n.offsetParent) {
    x += n.offsetLeft
    y += n.offsetTop
  }
  return { x, y }
}

export function initDarkroom() {
  const hoverFine = matchMedia('(hover: hover) and (pointer: fine)').matches
  initHeaderInk()
  if (document.documentElement.classList.contains('rm')) return

  const scenes = [rollScene(), tableScene(), stillScene(), filmsScene(), servicesScene(), aboutScene(), ctaScene(), footerScene(), ...greaseScenes()].filter(Boolean)
  const counter = document.querySelector('.frame-counter')
  const contact = document.getElementById('contact')
  let vw = 0
  let vh = 0
  let docH = 0
  let contactTop = Infinity

  function measure() {
    vw = document.documentElement.clientWidth
    vh = window.innerHeight
    // The roll sets its own height, so it measures before anything below it.
    scenes.forEach((s) => s.measure(vw, vh))
    docH = document.documentElement.scrollHeight
    contactTop = contact ? pageTop(contact) : Infinity
  }

  let lastW = 0
  let lastH = 0
  function onResize() {
    const w = document.documentElement.clientWidth
    const h = window.innerHeight
    // Phone toolbars change the height while scrolling: not a real resize.
    if (w === lastW && Math.abs(h - lastH) < 120) return
    lastW = w
    lastH = h
    measure()
  }
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('load', measure, { once: true })
  document.fonts?.ready.then(measure)

  let scroll = window.scrollY
  let vel = 0
  let last = performance.now()
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    const target = window.scrollY
    const prev = scroll
    scroll = Math.abs(target - scroll) < 0.1 ? target : lerp(scroll, target, SMOOTH)
    vel = lerp(vel, scroll - prev, 0.2)

    for (const s of scenes) {
      if (scroll + vh * 1.2 > s.top && scroll - vh * 0.2 < s.bottom) s.update(scroll, dt, vel, now / 1000)
    }
    if (counter && docH > vh) {
      const i = Math.round(lerp(1, 38, clamp(scroll / (contactTop - vh))))
      const text = `Frame ${String(i).padStart(2, '0')} / 38`
      if (counter.textContent !== text) counter.textContent = text
      counter.classList.toggle('is-gone', scroll + vh > contactTop || scroll < vh * 0.4)
    }
    requestAnimationFrame(frame)
  }

  onResize()
  measure()
  requestAnimationFrame(frame)

  if (hoverFine) {
    initLoupe()
    initMagnetic()
    initFilmAutoplay()
  }
  initStripClicks()
}

/* ---------- 1. Tray, then strip, as one pinned shot ---------- */
function rollScene() {
  const roll = document.getElementById('roll')
  if (!roll) return null
  const stage = roll.querySelector('.roll__stage')
  const canvas = roll.querySelector('.tray')
  const picture = roll.querySelector('.tray__photo')
  const img = picture.querySelector('img')
  const copy = roll.querySelector('.tray__copy')
  const strip = roll.querySelector('.strip')
  const inner = roll.querySelector('.strip__inner')
  const head = roll.querySelector('.roll__head')
  const tail = roll.querySelector('.roll__tail')
  const heroPic = roll.querySelector('.frame--hero .frame__pic')
  const frames = [...roll.querySelectorAll('.frame[data-frame]')].map((el) => ({ el, img: el.querySelector('img'), x: 0, w: 0, d: -1, age: 0, armed: false }))

  let t0 = 0
  let fallback = false
  const useFallback = () => {
    fallback = true
    stage.classList.add('no-gl')
  }
  let started = false
  let tray = null
  try {
    tray = createTray(canvas, img, () => {
      started = true
      stage.classList.add('gl-ready')
    })
  } catch {
    tray = null
  }
  if (tray) tray.onFail(useFallback)
  else useFallback()

  let W = 0
  let H = 0
  let A = 0
  let B = 0
  let C = 0
  let rect = { x: 0, y: 0, w: 1, h: 1 }
  const scene = {
    top: 0,
    bottom: 0,
    measure(vw, vh) {
      W = stage.clientWidth
      H = stage.clientHeight
      // Strip transforms don't affect offsetLeft, so frames can be cached once here.
      const end = vw * 0.08
      C = Math.max(0, inner.scrollWidth - vw + end)
      A = 0.8 * vh
      B = 0.9 * vh
      roll.style.height = `${vh + A + B + C}px`
      scene.top = pageTop(roll)
      scene.bottom = scene.top + vh + A + B + C
      const at = offsetIn(heroPic, stage)
      rect = { x: at.x, y: at.y, w: heroPic.offsetWidth, h: heroPic.offsetHeight }
      for (const f of frames) {
        f.x = offsetIn(f.el, stage).x
        f.w = f.el.offsetWidth
      }
      // The headline sits inset on the photo, away from the screen edge.
      stage.style.setProperty('--px', `${W * 0.15}px`)
      stage.style.setProperty('--py', `${H * 0.15}px`)
      if (tray) tray.resize(W, H)
      scene.vw = vw
    },
    update(scroll, dt, vel, time) {
      const vw = scene.vw
      const s = clamp(scroll - scene.top, 0, A + B + C)
      const a = clamp(s / A)
      const b = clamp((s - A) / B)
      const c = C ? clamp((s - A - B) / C) : 0

      // The print comes up on the clock if the visitor never scrolls, and sooner if they do:
      // image by 2.2 s and colour by 2.6 s, or colour within a third of a screen of scrolling.
      if ((started || fallback) && !t0) t0 = time
      const clock = t0 ? time - t0 : 0
      const dev = Math.max(ease(clock / 2.2), ease(a / 0.26))
      let lights = Math.max(ease((clock - 1.2) / 1.4), ease(a / 0.36))
      // The lights stutter on under the visitor's scroll, until they are fully on.
      if (a > 0 && lights < 1) lights *= 0.84 + 0.16 * Math.sin(a * 63)

      // Words leave before the picture starts to shrink.
      copy.style.setProperty('--out', ease(a / 0.49).toFixed(3))
      copy.style.setProperty('--ui', ease(a / 0.29).toFixed(3))
      copy.style.visibility = a > 0.5 ? 'hidden' : 'visible'

      const e = ease(b)
      const stripX = lerp(0.5 * vw, 0, e) - c * C
      const S = Math.max(rect.w / W, rect.h / H)
      const cx = rect.x + rect.w / 2
      const cy = rect.y + rect.h / 2
      const sc = lerp(1, S, e)
      const tx = lerp(0, cx - (S * W) / 2, e) + (b >= 1 ? -c * C : 0)
      const ty = lerp(0, cy - (S * H) / 2, e)
      const ix = ((W - rect.w / S) / 2) * e
      const iy = ((H - rect.h / S) / 2) * e
      const live = tx + sc * W - ix * sc > 0
      const target = fallback ? picture : canvas
      target.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${sc.toFixed(4)})`
      target.style.clipPath = `inset(${iy.toFixed(1)}px ${ix.toFixed(1)}px)`
      target.style.visibility = live ? 'visible' : 'hidden'

      if (fallback) {
        picture.style.setProperty('--d', (1 - dev).toFixed(3))
        picture.style.setProperty('--amber', (1 - lights).toFixed(3))
      } else if (tray && live && !document.hidden) {
        tray.draw(dev, lights, time, dt)
        autoDrop(time, a)
      }

      // The film pulls when scrolled fast, but only once the live photo has left the frame.
      const skew = live ? 0 : clamp(vel * 0.05, -4, 4)
      strip.style.opacity = ease((b - 0.3) / 0.45).toFixed(3)
      // Parked out of lazy-loading range until the visitor scrolls, so a phone doesn't pay for the strip on arrival.
      strip.style.transform = a < 0.2 ? '' : `translate3d(${stripX.toFixed(1)}px,0,0) skewX(${skew.toFixed(2)}deg)`
      head.style.opacity = ease((b - 0.5) / 0.4).toFixed(3)
      // Drifts against the strip, inward, so the heading is never cut by the screen edge.
      head.style.transform = `translate3d(${(c * vw * 0.06).toFixed(1)}px,0,0)`
      tail.style.opacity = ease((c - 0.82) / 0.14).toFixed(3)

      // Frames arrive as amber sheets; their darkest tones appear first as they travel in.
      for (const f of frames) {
        // The page opens on the tray, so a frame only loads once it is about two screens from view.
        // Native lazy loading alone would wait until it is on screen, because the stage clips it.
        if (!f.armed && a > 0.25 && f.x + stripX < vw * 2) {
          f.armed = true
          f.img.loading = 'eager'
        }
        const centre = f.x + f.w / 2 + stripX
        if (centre < -f.w || centre > vw + f.w) continue
        // Done by the time the frame is most of the way in, and within half a second if the visitor stops.
        if (b > 0.3 && centre - f.w / 2 < vw) f.age += dt
        const d = Math.min(clamp((centre - 0.92 * vw) / (0.16 * vw)), clamp(1 - f.age / 0.5))
        if (Math.abs(d - f.d) > 0.004) {
          f.d = d
          f.el.style.setProperty('--d', d.toFixed(3))
        }
      }
    },
  }

  // Drops land by themselves while the photo fills the screen, and under the visitor's cursor or finger.
  let nextDrop = 2
  function autoDrop(time, a) {
    if (a < 1 && time > nextDrop) {
      nextDrop = time + 3.2
      tray.drop(0.15 + Math.random() * 0.7, 0.15 + Math.random() * 0.7)
    }
  }
  let lastPointer = 0
  let px = 0
  let py = 0
  const onPointer = (e) => {
    if (!tray || !scene.vw || window.scrollY > scene.top + A * 0.8) return
    const t = performance.now()
    const x = e.clientX / W
    const y = e.clientY / H
    if (t - lastPointer < 140 || Math.hypot(x - px, y - py) < 0.01) return
    lastPointer = t
    px = x
    py = y
    tray.drop(x, y)
  }
  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('pointerdown', onPointer, { passive: true })
  return scene
}

/* ---------- 2. Light table ---------- */
function tableScene() {
  const work = document.getElementById('work')
  if (!work) return null
  const glow = work.querySelector('.table__glow')
  let vh = 0
  const scene = {
    top: 0,
    bottom: 0,
    measure(_, h) {
      vh = h
      scene.top = pageTop(work) - h
      scene.bottom = pageTop(work) + work.offsetHeight
    },
    update(scroll) {
      const top = scene.top + vh - scroll
      const p = clamp((vh * 0.85 - top) / (vh * 0.6))
      const on = p < 0.25 ? 0 : p < 0.32 ? 0.7 : p < 0.4 ? 0.08 : p < 0.5 ? 0.85 : p < 0.58 ? 0.35 : Math.min(1, 0.6 + (p - 0.58) * 1.2)
      glow.style.opacity = on.toFixed(3)
      work.classList.toggle('is-on', on > 0.5)
    },
  }
  return scene
}

function greaseScenes() {
  return [...document.querySelectorAll('[data-grease]')].map((cell) => {
    const path = cell.querySelector('.grease path')
    let vh = 0
    const scene = {
      top: 0,
      bottom: 0,
      measure(_, h) {
        vh = h
        scene.top = pageTop(cell) - h
        scene.bottom = pageTop(cell) + cell.offsetHeight
      },
      update(scroll) {
        const p = clamp((scroll + vh * 0.82 - (scene.top + vh)) / (vh * 0.3))
        path.style.strokeDashoffset = (1 - ease(p)).toFixed(3)
      },
    }
    return scene
  })
}

function initLoupe() {
  const sheet = document.getElementById('portfolio')
  if (!sheet) return
  const loupe = document.createElement('div')
  loupe.className = 'loupe'
  loupe.setAttribute('aria-hidden', 'true')
  loupe.innerHTML = '<span class="loupe__view"></span><span class="loupe__label"></span>'
  document.body.appendChild(loupe)
  const view = loupe.firstChild
  const label = loupe.lastChild
  const R = 130
  const MAG = 2.4
  let x = 0
  let y = 0
  let tx = 0
  let ty = 0
  let current = null
  let running = false
  sheet.classList.add('has-loupe')

  function paint() {
    if (!current) return
    const img = current.querySelector('.portfolio__img')
    if (!img.naturalWidth) return
    // The picture is object-fit: contain, so work out its real rect inside the box.
    const box = img.getBoundingClientRect()
    const ia = img.naturalWidth / img.naturalHeight
    const pw = Math.min(box.width, box.height * ia)
    const ph = pw / ia
    const px = box.left + (box.width - pw) / 2
    const py = box.top + (box.height - ph) / 2
    view.style.backgroundImage = `url("${img.src.replace(/"/g, '%22')}")`
    view.style.backgroundSize = `${pw * MAG}px ${ph * MAG}px`
    view.style.backgroundPosition = `${R - (tx - px) * MAG}px ${R - (ty - py) * MAG}px`
    label.textContent = current.querySelector('.portfolio__caption h3')?.textContent || ''
  }

  function tick() {
    x = lerp(x, tx, 0.22)
    y = lerp(y, ty, 0.22)
    loupe.style.transform = `translate3d(${(x - R).toFixed(1)}px,${(y - R).toFixed(1)}px,0)`
    paint()
    if (running) requestAnimationFrame(tick)
  }
  sheet.addEventListener('pointermove', (e) => {
    tx = e.clientX
    ty = e.clientY
    current = e.target.closest?.('.portfolio__item') || null
    if (!running) {
      running = true
      x = tx
      y = ty
      loupe.classList.add('is-on')
      requestAnimationFrame(tick)
    }
    // The lens shows the sheet itself when it's between frames.
    view.classList.toggle('is-empty', !current)
  })
  sheet.addEventListener('pointerleave', () => {
    running = false
    current = null
    loupe.classList.remove('is-on')
  })
  // The page can scroll under a still cursor; lens contents follow from the next paint.
  window.addEventListener('scroll', () => {
    if (!running) return
    const el = document.elementFromPoint(tx, ty)
    current = el?.closest?.('.portfolio__item') || null
  }, { passive: true })
}

function initStripClicks() {
  const items = [...document.querySelectorAll('.portfolio__item')]
  document.querySelectorAll('.frame[data-frame]').forEach((frame) => {
    frame.addEventListener('click', () => {
      const name = `/${frame.dataset.frame}.jpg`
      const item = items.find((it) => it.querySelector('.portfolio__img')?.getAttribute('src').endsWith(name))
      item?.querySelector('.portfolio__img')?.click()
    })
  })
}

/* ---------- 3. Lights off: the word that opens onto a photo ---------- */
function stillScene() {
  const still = document.getElementById('still')
  if (!still) return null
  const mask = still.querySelector('.still__mask')
  const word = mask.querySelector('span')
  const cap = still.querySelector('.still__caption')
  let travel = 1
  const scene = {
    top: 0,
    bottom: 0,
    measure(_, vh) {
      scene.top = pageTop(still)
      travel = Math.max(1, still.offsetHeight - vh)
      scene.bottom = scene.top + still.offsetHeight
      // Zoom through the stem of the middle l, so the frame never goes solid black.
      const text = word.firstChild
      const range = document.createRange()
      range.setStart(text, 4)
      range.setEnd(text, 5)
      word.style.transform = 'none'
      const r = range.getBoundingClientRect()
      const w = word.getBoundingClientRect()
      word.style.transformOrigin = `${r.left + r.width / 2 - w.left}px 56%`
    },
    update(scroll) {
      const p = clamp((scroll - scene.top) / travel)
      const t = clamp(p / 0.78)
      word.style.transform = `scale(${(1 + t * t * t * 90).toFixed(3)})`
      const m = 1 - ease((p - 0.6) / 0.2)
      mask.style.opacity = m.toFixed(3)
      // The photo is lifted while it only shows through letters, so the word reads on dark tones.
      still.style.setProperty('--lift', m.toFixed(3))
      cap.style.opacity = ease((p - 0.82) / 0.12).toFixed(3)
    },
  }
  return scene
}

/* ---------- 4. Projector room ---------- */
function filmsScene() {
  const list = [...document.querySelectorAll('.film')]
  if (!list.length) return null
  const tops = []
  let stick = 0
  let vh = 0
  const scene = {
    top: 0,
    bottom: 0,
    measure(_, h) {
      vh = h
      // A stuck film reports the screen position, not its place in the page, so measure unstuck.
      list.forEach((f) => {
        f.style.transform = 'none'
        f.style.position = 'static'
      })
      list.forEach((f, i) => (tops[i] = pageTop(f)))
      list.forEach((f) => (f.style.position = ''))
      stick = parseFloat(getComputedStyle(list[0]).top) || 0
      scene.top = tops[0] - vh
      scene.bottom = tops[list.length - 1] + list[list.length - 1].offsetHeight + vh
    },
    update(scroll) {
      list.forEach((f, i) => {
        const next = tops[i + 1]
        if (!next) return
        // 0 when the next film is a screen away, 1 when it has fully covered this one.
        const q = clamp((scroll + vh - next) / (vh - stick))
        f.style.transform = `scale(${(1 - q * 0.06).toFixed(4)})`
        f.style.filter = q > 0.01 ? `brightness(${(1 - q * 0.55).toFixed(3)})` : ''
      })
    },
  }
  return scene
}

function initFilmAutoplay() {
  if (navigator.connection?.saveData) return
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target
        if (e.isIntersecting && e.intersectionRatio >= 0.6) {
          if (v.dataset.touched) continue
          v.muted = true
          v.loop = true
          v.play().catch(() => {})
        } else if (!v.paused) {
          v.pause()
        }
      }
    },
    { threshold: [0, 0.6] }
  )
  document.querySelectorAll('.film__video').forEach((v) => {
    io.observe(v)
    // Once someone uses the controls, leave the player to them until it leaves the screen.
    v.addEventListener('pointerdown', () => (v.dataset.touched = '1'))
  })
}

/* ---------- 5. Print order sheet ---------- */
function servicesScene() {
  const section = document.getElementById('services')
  const sheet = section?.querySelector('.services__sheet')
  if (!sheet) return null
  let vh = 0
  const scene = {
    top: 0,
    bottom: 0,
    measure(_, h) {
      vh = h
      scene.top = pageTop(section) - h
      scene.bottom = pageTop(section) + h
    },
    update(scroll) {
      const t = 1 - ease((scroll + vh - (scene.top + vh)) / (vh * 0.9))
      sheet.style.transform = `rotate(${(t * -2.2).toFixed(3)}deg) translate3d(0,${(t * 6).toFixed(2)}vh,0)`
    },
  }
  return scene
}

/* ---------- 6. About ---------- */
function aboutScene() {
  const about = document.getElementById('about')
  if (!about) return null
  const photo = about.querySelector('.about__visual')
  const words = [...about.querySelectorAll('.about__word')]
  const n = words.length || 1
  let vh = 0
  let age = 0
  const scene = {
    top: 0,
    bottom: 0,
    measure(_, h) {
      vh = h
      scene.top = pageTop(about) - h
      scene.bottom = pageTop(about) + about.offsetHeight
    },
    update(scroll, dt) {
      const p = clamp((scroll + vh - (scene.top + vh) - vh * 0.1) / (vh * 0.75))
      if (p > 0) age += dt
      photo.style.setProperty('--d', Math.min(1 - ease(p / 0.3), clamp(1 - age / 0.5)).toFixed(3))
      words.forEach((w, i) => {
        w.style.opacity = lerp(0.15, 1, ease(p * 1.6 - (i / n) * 0.8)).toFixed(3)
      })
    },
  }
  return scene
}

/* ---------- 8. Safelight returns ---------- */
function ctaScene() {
  const cta = document.querySelector('.cta-band')
  if (!cta) return null
  let vh = 0
  const scene = {
    top: 0,
    bottom: 0,
    measure(_, h) {
      vh = h
      scene.top = pageTop(cta) - h
      scene.bottom = pageTop(cta) + cta.offsetHeight
    },
    update(scroll) {
      cta.style.setProperty('--glow', ease((scroll + vh - (scene.top + vh)) / (vh * 0.85)).toFixed(3))
    },
  }
  return scene
}

function footerScene() {
  const script = document.querySelector('.footer__script')
  if (!script) return null
  const footer = script.closest('footer')
  let vh = 0
  let maxScroll = 0
  const scene = {
    top: 0,
    bottom: 0,
    measure(_, h) {
      vh = h
      scene.top = pageTop(script) - h
      scene.bottom = pageTop(footer) + footer.offsetHeight + h
      maxScroll = document.documentElement.scrollHeight - h
    },
    update(scroll) {
      // Finish by the very bottom of the page however short the footer is.
      const start = scene.top + vh * 0.05
      const end = Math.min(maxScroll, start + vh * 0.55)
      const p = clamp((scroll - start) / Math.max(1, end - start))
      script.style.clipPath = `inset(-10% ${((1 - ease(p)) * 100).toFixed(1)}% -10% 0)`
    },
  }
  return scene
}

function initMagnetic() {
  const btn = document.querySelector('.btn--magnetic')
  if (!btn) return
  const zone = btn.parentElement
  zone.addEventListener('pointermove', (e) => {
    const r = btn.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    const d = Math.hypot(dx, dy) || 1
    const pull = d < 220 ? 14 * (1 - d / 220) : 0
    btn.style.transform = `translate(${((dx / d) * pull).toFixed(1)}px,${((dy / d) * pull).toFixed(1)}px)`
  })
  zone.addEventListener('pointerleave', () => (btn.style.transform = ''))
}

/* ---------- Header colour: one switch for the whole page ---------- */
function initHeaderInk() {
  const header = document.querySelector('.site-header')
  if (!header) return
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) header.dataset.ink = e.target.dataset.ink
    },
    { rootMargin: '-36px 0px -95% 0px' }
  )
  document.querySelectorAll('[data-ink]').forEach((s) => io.observe(s))
}
