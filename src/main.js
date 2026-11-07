/**
 * Dejeu Crew — site interactions
 */

import './style.css'

/* ---------- Mobile nav ---------- */
const toggle = document.querySelector('.nav__toggle')
const mobileNav = document.querySelector('.nav-mobile')
const header = document.querySelector('.site-header')

if (toggle && mobileNav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true'
    toggle.setAttribute('aria-expanded', String(!open))
    mobileNav.classList.toggle('is-open', !open)
    document.body.style.overflow = open ? '' : 'hidden'
  })

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false')
      mobileNav.classList.remove('is-open')
      document.body.style.overflow = ''
    })
  })
}

/* ---------- Header scroll state ---------- */
const onScroll = () => {
  if (!header) return
  header.classList.toggle('is-scrolled', window.scrollY > 40)
}
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

/* ---------- Portfolio filters + "View more" ---------- */
const filterBtns = document.querySelectorAll('.filter-btn')
const items = document.querySelectorAll('.portfolio__item')
const portfolio = document.querySelector('.portfolio')
const moreBtn = document.querySelector('.portfolio-more__btn')
const moreCount = portfolio ? portfolio.querySelectorAll('.portfolio__item--more').length : 0
let expanded = false
let activeFilter = 'all'

// All images stay in the HTML (crawlable); JS collapses the extras on load.
function syncMore() {
  if (!portfolio || !moreBtn || !moreCount) return
  const collapse = activeFilter === 'all' && !expanded
  portfolio.classList.toggle('is-collapsed', collapse)
  moreBtn.hidden = activeFilter !== 'all'
  moreBtn.setAttribute('aria-expanded', String(!collapse))
  moreBtn.innerHTML = collapse
    ? `View more work <span class="portfolio-more__count">(${moreCount})</span>`
    : 'Show less'
}

if (moreBtn) {
  moreBtn.addEventListener('click', () => {
    expanded = !expanded
    syncMore()
    if (!expanded) document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })
  })
}
syncMore()

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.filter
    activeFilter = cat
    filterBtns.forEach((b) => {
      b.classList.toggle('is-active', b === btn)
      b.setAttribute('aria-pressed', String(b === btn))
    })
    items.forEach((item) => {
      const match = cat === 'all' || item.dataset.category === cat
      item.classList.toggle('is-hidden', !match)
    })
    syncMore()
  })
})

/* ---------- Reveal on scroll ---------- */
const reveals = document.querySelectorAll('.reveal')
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-inview')
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  )
  reveals.forEach((el) => io.observe(el))
} else {
  reveals.forEach((el) => el.classList.add('is-inview'))
}

/* ---------- Booking form ---------- */
const form = document.getElementById('inquiry-form')
const success = document.getElementById('form-success')
const depositPanel = document.getElementById('deposit-panel')
const depositDisplay = document.getElementById('deposit-display')
const depositAmountInput = document.getElementById('depositAmount')
const startingPriceInput = document.getElementById('startingPrice')
const submitBtn = document.getElementById('submit-btn')
const formNote = document.getElementById('form-note')
const packageError = document.getElementById('package-error')

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

function setError(field, msg) {
  if (!field) return
  const wrap = field.closest('.field')
  const err = wrap?.querySelector('.field__error')
  if (wrap) wrap.classList.toggle('is-invalid', Boolean(msg))
  if (err) err.textContent = msg || ''
  field.setAttribute('aria-invalid', msg ? 'true' : 'false')
}

function selectedPackage() {
  return form?.querySelector('input[name="package"]:checked') || null
}

function bookingPath() {
  return form?.querySelector('input[name="bookingPath"]:checked')?.value || 'inquiry'
}

function formatMoney(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function updateDepositUI() {
  const pkg = selectedPackage()
  const path = bookingPath()
  const isDeposit = path === 'deposit'

  if (depositPanel) depositPanel.hidden = !isDeposit

  if (submitBtn) {
    submitBtn.textContent = isDeposit
      ? 'Request Deposit Reservation'
      : 'Send Inquiry'
  }

  if (formNote) {
    formNote.innerHTML = isDeposit
      ? 'No payment is taken on this site — this sends a <strong>deposit reservation request</strong>, and we’ll reply with payment details. Questions? <a href="mailto:dejeu.crew@gmail.com">dejeu.crew@gmail.com</a> · <a href="tel:+12096816284">209-681-6284</a>'
      : 'By submitting, you agree we may reply by email. No spam — ever. Questions? <a href="mailto:dejeu.crew@gmail.com">dejeu.crew@gmail.com</a> · <a href="tel:+12096816284">209-681-6284</a>'
  }

  if (!pkg) {
    if (depositDisplay) depositDisplay.textContent = '$0'
    if (depositAmountInput) depositAmountInput.value = ''
    if (startingPriceInput) startingPriceInput.value = ''
    return
  }

  const price = Number(pkg.dataset.price) || 0
  const deposit = Math.round(price * 0.25)
  if (depositDisplay) depositDisplay.textContent = formatMoney(deposit)
  if (depositAmountInput) depositAmountInput.value = String(deposit)
  if (startingPriceInput) startingPriceInput.value = String(price)
}

function validate(formEl) {
  let ok = true
  const name = formEl.elements.namedItem('name')
  const email = formEl.elements.namedItem('email')
  const preferredDate = formEl.elements.namedItem('preferredDate')
  const message = formEl.elements.namedItem('message')
  const pkg = selectedPackage()

  ;[name, email, preferredDate, message].forEach((f) => setError(f, ''))
  if (packageError) {
    packageError.textContent = ''
    formEl.querySelector('.package-picker')?.classList.remove('is-invalid')
  }

  if (!pkg) {
    if (packageError) packageError.textContent = 'Please select a package.'
    formEl.querySelector('.package-picker')?.classList.add('is-invalid')
    ok = false
  }

  if (!preferredDate?.value) {
    setError(preferredDate, 'Please choose a preferred date.')
    ok = false
  }

  if (!name.value.trim() || name.value.trim().length < 2) {
    setError(name, 'Please enter your name.')
    ok = false
  }
  if (!email.value.trim() || !emailOk(email.value.trim())) {
    setError(email, 'Please enter a valid email.')
    ok = false
  }
  if (!message.value.trim() || message.value.trim().length < 10) {
    setError(message, 'Please share a few details (at least 10 characters).')
    ok = false
  }

  const phone = formEl.elements.namedItem('phone')
  if (phone?.value.trim()) {
    const digits = phone.value.replace(/\D/g, '')
    if (digits.length < 7) {
      setError(phone, 'Please enter a valid phone number.')
      ok = false
    } else {
      setError(phone, '')
    }
  }

  return ok
}

function collectPayload(formEl) {
  const fd = new FormData(formEl)
  const pkg = selectedPackage()
  const path = bookingPath()
  const startingPrice = Number(fd.get('startingPrice') || pkg?.dataset.price || 0)
  const depositAmount = Number(fd.get('depositAmount') || Math.round(startingPrice * 0.25))

  const base = {
    name: String(fd.get('name') || '').trim(),
    email: String(fd.get('email') || '').trim(),
    phone: String(fd.get('phone') || '').trim(),
    package: String(fd.get('package') || '').trim(),
    packageLabel: pkg?.dataset.label || '',
    preferredDate: String(fd.get('preferredDate') || '').trim(),
    location: String(fd.get('location') || '').trim(),
    message: String(fd.get('message') || '').trim(),
    startingPrice,
    bookingPath: path,
    submittedAt: new Date().toISOString(),
  }

  if (path === 'deposit') {
    return {
      ...base,
      type: 'deposit_intent',
      depositAmount,
      depositNote: 'Suggested 25% — amount confirmed after reply.',
    }
  }

  return {
    ...base,
    type: 'inquiry',
  }
}

/* ---------- Delivery ----------
 * Production (dejeucrew.com): FormSubmit AJAX → emails dejeu.crew@gmail.com.
 *   FormSubmit needs a one-time activation: the FIRST live submission sends a
 *   confirmation email to dejeu.crew@gmail.com; click "Activate Form" there.
 * Local (vite dev / preview on localhost): logs to data/inquiries.jsonl via the
 *   Vite plugin — nothing is emailed from the box.
 * Fallback: if delivery fails, open a pre-filled mailto: so nothing is lost.
 */
const INQUIRY_EMAIL = 'dejeu.crew@gmail.com'
const FORMSUBMIT_AJAX = `https://formsubmit.co/ajax/${INQUIRY_EMAIL}`
const IS_LOCAL = ['localhost', '127.0.0.1', '::1', '[::1]', ''].includes(
  window.location.hostname
)

async function postJson(url, payload, headers = {}) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
      body: JSON.stringify(payload),
    })
    let data = {}
    try {
      data = await res.json()
    } catch {
      /* non-JSON */
    }
    return { ok: res.ok, data }
  } catch {
    return { ok: false, data: {} }
  }
}

function emailFields(payload) {
  const kind = payload.type === 'deposit_intent' ? 'Deposit reservation request' : 'Inquiry'
  const fields = {
    _subject: `Dejeu Crew — ${kind}: ${payload.packageLabel || payload.package} · ${payload.preferredDate}`,
    _replyto: payload.email,
    _template: 'table',
    Type: kind,
    Name: payload.name,
    Email: payload.email,
    Phone: payload.phone || '—',
    Package: payload.packageLabel || payload.package,
    'Starting price': payload.startingPrice ? formatMoney(payload.startingPrice) : '—',
    'Preferred date': payload.preferredDate,
    Location: payload.location || '—',
    Message: payload.message,
  }
  if (payload.type === 'deposit_intent') {
    fields['Suggested deposit'] = `${formatMoney(payload.depositAmount || 0)} (25% suggested — confirm on reply)`
  }
  return fields
}

function mailtoHref(payload) {
  const f = emailFields(payload)
  const lines = Object.entries(f)
    .filter(([k]) => !k.startsWith('_'))
    .map(([k, v]) => `${k}: ${v}`)
  return (
    `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent(f._subject)}` +
    `&body=${encodeURIComponent(lines.join('\n'))}`
  )
}

async function submitBooking(payload) {
  if (IS_LOCAL) {
    const endpoint =
      payload.type === 'deposit_intent' ? '/api/deposit-intent' : '/api/inquiry'
    const r = await postJson(endpoint, payload)
    return { ok: r.ok, via: r.ok ? 'local-log' : 'none' }
  }

  const r = await postJson(FORMSUBMIT_AJAX, emailFields(payload))
  const success = r.data && (r.data.success === true || r.data.success === 'true')
  return { ok: r.ok && success, via: r.ok && success ? 'formsubmit' : 'none' }
}

function showSuccess(payload, result) {
  const eyebrow = document.getElementById('success-eyebrow')
  const heading = document.getElementById('success-heading')
  const message = document.getElementById('success-message')
  const fallback = document.getElementById('success-fallback')

  if (!result.ok) {
    const href = mailtoHref(payload)
    if (eyebrow) eyebrow.textContent = 'One more step'
    if (heading) heading.textContent = 'Send it by email'
    if (message) {
      message.textContent =
        'We couldn’t send your request automatically, so your email app should open with everything filled in — just press send.'
    }
    if (fallback) {
      fallback.hidden = false
      fallback.innerHTML =
        `Didn’t open? <a href="${href}">Open the pre-filled email</a>, ` +
        `write to <a href="mailto:${INQUIRY_EMAIL}">${INQUIRY_EMAIL}</a>, ` +
        'or call <a href="tel:+12096816284">209-681-6284</a>.'
    }
    window.location.href = href
  } else if (payload.type === 'deposit_intent') {
    if (eyebrow) eyebrow.textContent = 'Deposit request sent'
    if (heading) heading.textContent = 'We’ll follow up'
    if (message) {
      message.textContent =
        `Your deposit reservation request for ${payload.packageLabel || 'your package'} ` +
        `(suggested ${formatMoney(payload.depositAmount || 0)}) was sent. ` +
        'We’ll confirm availability and the final deposit, then reply with how to pay.'
    }
  } else {
    if (eyebrow) eyebrow.textContent = 'Received'
    if (heading) heading.textContent = 'Thank you'
    if (message) {
      message.textContent =
        'Your inquiry was sent. We’ll be in touch by email soon. Until then, feel free to browse more of the work.'
    }
  }

  form?.classList.add('is-hidden')
  if (success) {
    success.classList.add('is-visible')
    success.setAttribute('tabindex', '-1')
    success.focus()
  }
}

if (form) {
  // Prefill package from ?package=
  const params = new URLSearchParams(window.location.search)
  const prefill = params.get('package')
  if (prefill) {
    const radio = form.querySelector(`input[name="package"][value="${CSS.escape(prefill)}"]`)
    if (radio) radio.checked = true
  }

  // Min date = today
  const dateInput = form.elements.namedItem('preferredDate')
  if (dateInput && dateInput.type === 'date') {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    dateInput.min = `${yyyy}-${mm}-${dd}`
  }

  updateDepositUI()

  form.querySelectorAll('input[name="package"], input[name="bookingPath"]').forEach((el) => {
    el.addEventListener('change', updateDepositUI)
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    updateDepositUI()

    if (!validate(form)) {
      const firstBad =
        form.querySelector('.package-picker.is-invalid') ||
        form.querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea')
      if (firstBad?.focus) firstBad.focus()
      else firstBad?.querySelector('input')?.focus()
      return
    }

    const btn = form.querySelector('[type="submit"]')
    const prevLabel = btn?.textContent
    if (btn) {
      btn.disabled = true
      btn.textContent = 'Sending…'
    }

    // Honeypot: bots fill hidden fields — pretend success, send nothing
    const honey = form.elements.namedItem('_honey')
    if (honey && honey.value) {
      showSuccess({ type: 'inquiry' }, { ok: true })
      return
    }

    const payload = collectPayload(form)
    const result = await submitBooking(payload)
    showSuccess(payload, result)

    if (btn) {
      btn.disabled = false
      btn.textContent = prevLabel
    }
  })

  form.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('input', () => setError(el, ''))
    el.addEventListener('change', () => {
      setError(el, '')
      if (el.name === 'package' && packageError) {
        packageError.textContent = ''
        form.querySelector('.package-picker')?.classList.remove('is-invalid')
      }
    })
  })
}

/* ---------- Gallery lightbox ----------
 * Click / Enter / Space on any Work photo opens it full-size (1800px).
 * Arrows (buttons, ←/→ keys, swipe) step through the photos currently
 * shown by the filter (incl. collapsed "View more" ones) and wrap around.
 * Esc, the X, or tapping the backdrop closes and restores focus.
 */
const galleryItems = Array.from(document.querySelectorAll('.portfolio__item')).filter((item) =>
  item.querySelector('.portfolio__img')
)

if (galleryItems.length) {
  const chevron = (dir) =>
    `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false"><path d="${
      dir === 'prev' ? 'M15 4 7 12l8 8' : 'M9 4l8 8-8 8'
    }" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`

  const lb = document.createElement('div')
  lb.className = 'lightbox'
  lb.setAttribute('role', 'dialog')
  lb.setAttribute('aria-modal', 'true')
  lb.setAttribute('aria-label', 'Photo viewer')
  lb.hidden = true
  lb.innerHTML = `
    <figure class="lightbox__figure">
      <img class="lightbox__img" alt="" decoding="async" />
      <figcaption class="lightbox__caption"></figcaption>
    </figure>
    <p class="lightbox__counter" aria-live="polite"></p>
    <button class="lightbox__btn lightbox__close" type="button" aria-label="Close photo viewer">
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M5 5l14 14M19 5 5 19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </button>
    <button class="lightbox__btn lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous photo">${chevron('prev')}</button>
    <button class="lightbox__btn lightbox__nav lightbox__nav--next" type="button" aria-label="Next photo">${chevron('next')}</button>
  `
  document.body.appendChild(lb)

  const lbImg = lb.querySelector('.lightbox__img')
  const lbCaption = lb.querySelector('.lightbox__caption')
  const lbCounter = lb.querySelector('.lightbox__counter')
  const lbClose = lb.querySelector('.lightbox__close')
  const lbPrev = lb.querySelector('.lightbox__nav--prev')
  const lbNext = lb.querySelector('.lightbox__nav--next')

  let set = []
  let index = 0
  let opener = null
  let swapTimer = 0
  let closeTimer = 0
  const preloaded = new Set()

  const fullSrc = (item) => item.querySelector('.portfolio__img').getAttribute('src')

  function preload(item) {
    const src = fullSrc(item)
    if (preloaded.has(src)) return
    preloaded.add(src)
    const im = new Image()
    im.decoding = 'async'
    im.src = src
  }

  function render(animate) {
    const item = set[index]
    const thumb = item.querySelector('.portfolio__img')
    const src = fullSrc(item)
    const title = item.querySelector('.portfolio__caption h3')?.textContent.trim() || ''
    const sub = item.querySelector('.portfolio__caption p')?.textContent.trim() || ''

    const apply = () => {
      lbImg.classList.add('is-loading')
      lbImg.onload = lbImg.onerror = () => lbImg.classList.remove('is-loading')
      lbImg.src = src
      lbImg.alt = thumb.alt || ''
      if (lbImg.complete && lbImg.naturalWidth) lbImg.classList.remove('is-loading')
      lbCaption.innerHTML = title
        ? `<span class="lightbox__title"></span>${sub ? '<span class="lightbox__sub"></span>' : ''}`
        : ''
      if (title) lbCaption.querySelector('.lightbox__title').textContent = title
      if (sub) lbCaption.querySelector('.lightbox__sub').textContent = sub
    }

    clearTimeout(swapTimer)
    if (animate) {
      lbImg.classList.add('is-loading')
      swapTimer = setTimeout(apply, 160)
    } else {
      apply()
    }

    lbCounter.textContent = `${index + 1} / ${set.length}`
    const single = set.length < 2
    lbPrev.hidden = single
    lbNext.hidden = single
    if (!single) {
      preload(set[(index + 1) % set.length])
      preload(set[(index - 1 + set.length) % set.length])
    }
  }

  function step(delta) {
    if (lb.hidden || set.length < 2) return
    index = (index + delta + set.length) % set.length
    render(true)
  }

  function open(item) {
    set = galleryItems.filter((el) => !el.classList.contains('is-hidden'))
    index = Math.max(0, set.indexOf(item))
    if (!set.length) return
    opener = item.querySelector('.portfolio__img')
    clearTimeout(closeTimer)

    const sbw = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (sbw > 0) document.body.style.paddingRight = `${sbw}px`
    document.documentElement.classList.add('lightbox-open')

    render(false)
    lb.hidden = false
    requestAnimationFrame(() => {
      requestAnimationFrame(() => lb.classList.add('is-open'))
    })
    lbClose.focus({ preventScroll: true })
  }

  function close() {
    if (lb.hidden) return
    lb.classList.remove('is-open')
    clearTimeout(swapTimer)
    closeTimer = setTimeout(() => {
      lb.hidden = true
      lbImg.removeAttribute('src')
    }, 260)
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    document.documentElement.classList.remove('lightbox-open')
    opener?.focus({ preventScroll: true })
  }

  galleryItems.forEach((item) => {
    const img = item.querySelector('.portfolio__img')
    img.setAttribute('tabindex', '0')
    img.setAttribute('role', 'button')
    img.setAttribute('aria-haspopup', 'dialog')
    img.setAttribute('aria-label', `View larger: ${img.alt || 'photo'}`)
    item.classList.add('is-zoomable')
    item.addEventListener('click', () => open(item))
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        open(item)
      }
    })
  })

  lbClose.addEventListener('click', close)
  lbPrev.addEventListener('click', (e) => {
    e.stopPropagation()
    step(-1)
  })
  lbNext.addEventListener('click', (e) => {
    e.stopPropagation()
    step(1)
  })

  // Tap/click the dark backdrop (not the photo or controls) to close
  const isBackdrop = (el) => el === lb || el.classList?.contains('lightbox__figure')
  let swiped = false
  lb.addEventListener('click', (e) => {
    if (swiped) {
      swiped = false
      return
    }
    if (isBackdrop(e.target)) close()
  })

  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      step(1)
    } else if (e.key === 'Tab') {
      // Keep focus inside the dialog
      const focusables = [lbClose, lbPrev, lbNext].filter((b) => !b.hidden)
      const i = focusables.indexOf(document.activeElement)
      e.preventDefault()
      const n = e.shiftKey
        ? (i <= 0 ? focusables.length - 1 : i - 1)
        : (i + 1) % focusables.length
      focusables[n].focus()
    }
  })

  // Swipe left/right on touch devices
  let tx = 0
  let ty = 0
  let tracking = false
  lb.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length !== 1) {
        tracking = false
        return
      }
      tracking = true
      tx = e.touches[0].clientX
      ty = e.touches[0].clientY
    },
    { passive: true }
  )
  lb.addEventListener(
    'touchend',
    (e) => {
      if (!tracking) return
      tracking = false
      const t = e.changedTouches[0]
      const dx = t.clientX - tx
      const dy = t.clientY - ty
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        swiped = true
        setTimeout(() => (swiped = false), 400)
        if (e.cancelable) e.preventDefault()
        step(dx < 0 ? 1 : -1)
      } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && isBackdrop(e.target)) {
        // Close on tap directly (don't wait for a synthesized click, which
        // browsers can skip right after a swipe/fling)
        if (e.cancelable) e.preventDefault()
        close()
      }
    },
    { passive: false }
  )
}

/* ---------- Year ---------- */
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear())
})
