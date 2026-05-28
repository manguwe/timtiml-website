
// ─── MOBILE NAV ───

// ─── FAQ ───
function toggleFaq(qEl) {
  const item = qEl.closest('.faq-item');
  const icon = qEl.querySelector('.faq-q-icon');
  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item.open').forEach(i => {
    i.classList.remove('open');
    const ic = i.querySelector('.faq-q-icon');
    if (ic) ic.textContent = '+';
  });

  // Open clicked if it was closed
  if (!isOpen) {
    item.classList.add('open');
    if (icon) icon.textContent = '−';
  }
}

function filterFaq(cat, btn) {
  // Update active button
  document.querySelectorAll('.faq-cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Show/hide items
  document.querySelectorAll('.faq-item').forEach(item => {
    if (cat === 'all' || item.getAttribute('data-cat') === cat) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// ─── SECTION SWITCHER ───
const VIEW_LABELS = {
  home:     'Home',
  design:   '🎨 Graphic Design',
  explore:  '📚 Learn Programming',
  webdev:   '🌐 Web Development',
  projects: '🚀 Projects & Testimonials',
  blog:     '📝 Blog & Tips',
  gallery:  '🖼️ Gallery',
  pricing:  '💰 Pricing & Services',
  faq:      '❓ Frequently Asked Questions',
  contact:  '📬 Contact'
};

function showSection(view, clickedLink) {
  // 1. Show/hide sections
  document.querySelectorAll('[data-view]').forEach(sec => {
    const secView = sec.getAttribute('data-view');
    if (secView === view) {
      sec.classList.add('view-active');
      sec.classList.remove('view-hidden');
    } else {
      sec.classList.remove('view-active');
      // Hide home sections that are visible by CSS default
      if (secView === 'home' && view !== 'home') {
        sec.classList.add('view-hidden');
      } else if (view === 'home') {
        sec.classList.remove('view-hidden');
      }
    }
  });

  // 2. Update nav active state
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('nav-active'));
  if (clickedLink) clickedLink.classList.add('nav-active');

  // 3. Show/hide crumb bar
  const crumb  = document.getElementById('view-crumb');
  const label  = document.getElementById('crumb-label');
  if (view === 'home') {
    crumb.classList.add('hidden');
    document.body.classList.remove('has-crumb');
  } else {
    label.textContent = VIEW_LABELS[view] || view;
    crumb.classList.remove('hidden');
    document.body.classList.add('has-crumb');
  }

  // 4. Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 5. Close mobile nav
  document.getElementById('navLinks').classList.remove('open');

  // 6. Save current view
  sessionStorage.setItem('timtiml-view', view);
}

// ─── RESTORE VIEW ON PAGE LOAD ───
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('timtiml-view') || 'home';
  // Find the matching nav link
  const link = document.querySelector(`.nav-links a[onclick*="'${saved}'"]`);
  showSection(saved, link);
});

// ─── HAMBURGER TOGGLE ───
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.onclick = () => {
  navLinks.classList.toggle('open');
};

// Auto-close nav when any nav link is clicked (mobile)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// Close nav when clicking outside
document.addEventListener('click', (e) => {
  if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
    navLinks.classList.remove('open');
  }
});

// ─── SCROLL ANIMATIONS ───
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ─── SKILL BARS ───
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('#skills').forEach(s => skillObs.observe(s));
skillObs.observe(document.getElementById('skills'));

// ─── ADD SKILL / CERT ───
function addSkill() {
  const name = prompt('Skill name:'); if (!name) return;
  const pct = prompt('Proficiency % (e.g. 80):') || '70';
  const col = document.getElementById('skills-col-2');
  const div = document.createElement('div'); div.className = 'skill-item';
  div.innerHTML = `<div class="skill-header"><span class="skill-name">${name}</span><span class="skill-pct">${pct}%</span></div><div class="skill-bar"><div class="skill-fill" data-w="${pct}" style="width:${pct}%"></div></div>`;
  col.appendChild(div);
}
function addCert() {
  const name = prompt('Certification name:'); if (!name) return;
  const tag = document.createElement('div'); tag.className = 'cert-tag'; tag.textContent = name;
  document.getElementById('certGrid').appendChild(tag);
}

// ─── JS LESSON TOGGLE ───
function toggleLesson(id) {
  const body = document.getElementById(id);
  const icon = document.getElementById(id + '-icon');
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  icon.classList.toggle('open', !isOpen);
}

// ─── EXPLORE TABS ───
function switchTab(id, btn) {
  document.querySelectorAll('.explore-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.explore-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  btn.classList.add('active');
}

// ─── TIMTIML AI CHAT (Groq via /api/chat) ───
const CHAT_API = '/api/chat';
const WA_NUM   = '260768648291';
let chatOpen    = false;
// ── Toggle chat window ──
function toggleChat() {
  chatOpen = !chatOpen;
  const w   = document.getElementById('chat-window');
  const btn = document.getElementById('chat-toggle');
  w.classList.toggle('open', chatOpen);
  btn.textContent = chatOpen ? '✕' : '🤖';
  if (chatOpen && document.getElementById('chatMessages').children.length === 0) initChat();
}

// ── Add a message bubble ──
function addMsg(html, who) {
  const div = document.createElement('div');
  div.className = 'msg ' + who;
  div.innerHTML = html;
  const msgs = document.getElementById('chatMessages');
  msgs.appendChild(div);
  msgs.scrollTop = 9999;
  return div;
}

// ── Quick reply chips ──
function setChips(chips) {
  const c = document.getElementById('chatChips');
  c.innerHTML = '';
  (chips || []).forEach(chip => {
    const btn = document.createElement('button');
    btn.className = 'chat-chip';
    btn.textContent = chip;
    btn.onclick = () => handleUserMsg(chip);
    c.appendChild(btn);
  });
}

// ── Typing indicator ──
function showTyping() {
  const div = document.createElement('div');
  div.className = 'msg bot typing-indicator';
  div.id = 'typing-bubble';
  div.innerHTML = '<span></span><span></span><span></span>';
  document.getElementById('chatMessages').appendChild(div);
  document.getElementById('chatMessages').scrollTop = 9999;
}
function hideTyping() {
  const t = document.getElementById('typing-bubble');
  if (t) t.remove();
}

// ── Send message to Gemini ──
async function handleUserMsg(msg) {
  const input = document.getElementById('chat-input');
  input.value = '';
  setChips([]);
  addMsg(msg, 'user');
  showTyping();

  try {
    const res  = await fetch(CHAT_API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message: msg })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'API error');

    const reply = data.response || "I didn't get a response. Please try again!";

    hideTyping();

    // Format reply: convert **bold**, line breaks
    const formatted = reply
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,     '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/\r/g, '');

    addMsg(formatted, 'bot');

    // Show contextual quick chips
    const lower = reply.toLowerCase();
    let chips = [];
    if (lower.includes('whatsapp') || lower.includes('contact'))
      chips = ['Order a Design', 'Book Tutoring', 'Website Quote'];
    else if (lower.includes('lesson') || lower.includes('learn'))
      chips = ['View Lessons', 'Pricing', 'Contact Anotida'];
    else if (lower.includes('design') || lower.includes('poster'))
      chips = ['Pricing', 'Order Now', 'Contact Anotida'];
    setChips(chips);

  } catch(err) {
    hideTyping();
    addMsg(`⚠️ Couldn't reach AI right now. <a href="https://wa.me/${WA_NUM}?text=Hi%20Anotida!" target="_blank" style="color:var(--green)">Message Anotida directly on WhatsApp →</a>`, 'bot');
    console.error('Gemini error:', err);
  }
}

// ── Send on button click ──
function sendChat() {
  const inp = document.getElementById('chat-input');
  const msg = inp.value.trim();
  if (!msg) return;
  handleUserMsg(msg);
}

// ── Initial greeting ──
function initChat() {
  setTimeout(() => {
    addMsg(`Hey there! 👋 I'm <strong>TimtimlBot</strong> — powered by Gemini AI.<br><br>I know everything about <strong>Anotida Manguwe</strong> and TIMTIML — services, lessons, pricing, and more.<br><br>What would you like to know? 🚀`, 'bot');
    setChips(['About Anotida', 'Graphic Design Prices', 'Free Lessons', 'Book Tutoring']);
  }, 400);
}


// ─── GALLERY MODAL ───
function openGalleryModal(src, title) {
  const modal = document.getElementById('gallery-modal');
  document.getElementById('gallery-modal-img').src = src;
  document.getElementById('gallery-modal-title').textContent = title;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeGalleryModal() {
  document.getElementById('gallery-modal').style.display = 'none';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeGalleryModal(); });

// ─── LOADING SCREEN ───
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 1800);
});

// ─── DARK / LIGHT TOGGLE ───
function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById('theme-toggle');
  body.classList.toggle('light');
  const isLight = body.classList.contains('light');
  btn.textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('timtiml-theme', isLight ? 'light' : 'dark');
}
// Restore saved theme
(function() {
  const saved = localStorage.getItem('timtiml-theme');
  if (saved === 'light') {
    document.body.classList.add('light');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = '☀️';
  }
})();

// ─── WHATSAPP ORDER FORM ───
function submitWaForm() {
  const type     = document.getElementById('wf-type').value;
  const budget   = document.getElementById('wf-budget').value || 'Not specified';
  const colours  = document.getElementById('wf-colours').value || 'Not specified';
  const occasion = document.getElementById('wf-occasion').value || 'Not specified';
  const details  = document.getElementById('wf-details').value || 'None';
  const msg = `Hi Anotida! I'd like to order a design from TIMTIML.%0A%0A` +
    `🎨 Type: ${encodeURIComponent(type)}%0A` +
    `💰 Budget: ${encodeURIComponent(budget)}%0A` +
    `🎨 Colours: ${encodeURIComponent(colours)}%0A` +
    `🎉 Occasion: ${encodeURIComponent(occasion)}%0A` +
    `📝 Details: ${encodeURIComponent(details)}`;
  window.open(`https://wa.me/260768648291?text=${msg}`, '_blank');
}

// ─── VISITOR COUNTER ───
(function() {
  const el = document.getElementById('visit-count');
  if (!el) return;
  try {
    let count = parseInt(localStorage.getItem('timtiml-visits') || '0', 10);
    count += 1;
    localStorage.setItem('timtiml-visits', count);
    // Display with random boost for social proof feel (starts at 1000+)
    const base = 1000;
    const stored = parseInt(localStorage.getItem('timtiml-global-visits') || String(base + Math.floor(Math.random() * 200)), 10);
    localStorage.setItem('timtiml-global-visits', stored + 1);
    el.textContent = (stored + count).toLocaleString();
  } catch(e) { el.textContent = '1,000+'; }
})();

// ─── CONTACT FORM ───
async function handleContactSubmit(e) {
  e.preventDefault();
  const form   = document.getElementById('contact-form');
  const btn    = document.getElementById('cf-submit-btn');
  const btnTxt = document.getElementById('cf-btn-text');
  const errEl  = document.getElementById('cf-error');

  errEl.style.display = 'none';
  btn.disabled = true;
  btnTxt.textContent = 'Sending…';

  try {
    const data = new FormData(form);
    const res  = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      form.style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
    } else {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || 'Something went wrong. Please try WhatsApp instead.');
    }
  } catch (err) {
    errEl.textContent = '⚠️ ' + (err.message || 'Send failed. Please try WhatsApp.');
    errEl.style.display = 'block';
    btn.disabled = false;
    btnTxt.textContent = 'Send Message →';
  }
}

function resetContactForm() {
  document.getElementById('contact-form').reset();
  document.getElementById('contact-form').style.display = 'block';
  document.getElementById('form-success').style.display = 'none';
}


// ══════════════════════════════════════════════════════════════════
//  TIMTIML TESTIMONIAL SYSTEM v3 — Professional Email-Based Approval
// ══════════════════════════════════════════════════════════════════

// ▼▼▼ ANOTIDA — ADD APPROVED TESTIMONIALS HERE ▼▼▼
// When you receive an email notification, copy the JS line provided
// and paste it below, then push to GitHub.
const APPROVED_TESTIS = [
  // { name:"Tatenda M.", role:"🎨 Graphic Design", text:"Amazing poster! Exactly what I needed.", stars:5, location:"Harare, Zimbabwe" },
];
// ▲▲▲ END OF EDITABLE SECTION ▲▲▲

const TESTI_EMAILJS_SERVICE  = 'service_jrw3pfu';
const TESTI_EMAILJS_TEMPLATE = 'template_6x6m7nk';
const ANOTIDA_EMAIL          = 'anotida30manguwe12@gmail.com';
const FORMSPREE_URL          = 'https://formspree.io/f/mdablpde';
const PENDING_KEY            = 'ttml-testi-pending';
const APPROVED_LOCAL_KEY     = 'ttml-testi-approved';

let currentRating = 0;
let testiCarouselIdx = 0;
let testiCarouselTimer = null;

// ── Generate a secure random 8-char alphanumeric code ──
function genTestiCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TM';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── Escape HTML ──
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Build star string ──
function starStr(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

// ── Get initials ──
function initials(name) {
  return (name || 'V').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Get all approved (global + local) ──
function getAllApproved() {
  let local = [];
  try { local = JSON.parse(localStorage.getItem(APPROVED_LOCAL_KEY) || '[]'); } catch(e) {}
  return [...APPROVED_TESTIS, ...local];
}

// ── Render a testimonial card ──
function buildCard(t, badge) {
  const div = document.createElement('div');
  div.className = 'testi-card-v3' + (badge === 'verified' ? ' testi-v-verified' : badge === 'pending' ? ' testi-v-pending' : '');

  const badgeHtml = badge === 'verified'
    ? '<div class="tv3-badge tv3-badge-verified">✓ Verified</div>'
    : badge === 'pending'
    ? '<div class="tv3-badge tv3-badge-pending">⏳ Awaiting Approval</div>'
    : '';

  const locationHtml = t.location ? `<span class="tv3-location">📍 ${esc(t.location)}</span>` : '';

  div.innerHTML = `
    ${badgeHtml}
    <div class="tv3-stars">${starStr(t.stars || 5)}</div>
    <div class="tv3-quote">"${esc(t.text)}"</div>
    <div class="tv3-author">
      <div class="tv3-avatar">${initials(t.name)}</div>
      <div class="tv3-author-info">
        <div class="tv3-name">${esc(t.name)}</div>
        <div class="tv3-role">${esc(t.role || t.service || '')} ${locationHtml}</div>
      </div>
    </div>`;
  return div;
}

// ── Render all testimonials ──
function renderAllTestimonials() {
  const grid = document.getElementById('dynamic-testis');
  const pendingWrap = document.getElementById('testi-pending-wrap');
  if (!grid) return;
  grid.innerHTML = '';
  if (pendingWrap) pendingWrap.innerHTML = '';

  const approved = getAllApproved();

  // Render approved cards
  if (approved.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted);font-size:0.88rem;text-align:center;padding:2rem;grid-column:1/-1;">No testimonials yet — be the first to leave a review! ✨</p>';
  } else {
    approved.forEach(t => grid.appendChild(buildCard(t, 'verified')));
  }

  // Render pending card (only to submitter on this device)
  let pending = null;
  try { pending = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null'); } catch(e) {}
  const localApproved = (() => { try { return JSON.parse(localStorage.getItem(APPROVED_LOCAL_KEY)||'[]'); } catch(e) { return []; } })();
  if (pending && !localApproved.find(t => t._code === pending._code)) {
    if (pendingWrap) pendingWrap.appendChild(buildCard(pending, 'pending'));
  }

  // Update rating summary
  updateRatingSummary(approved);

  // Featured carousel
  setupFeaturedCarousel(approved);
}

// ── Rating summary bar ──
function updateRatingSummary(approved) {
  const scoreEl = document.getElementById('testi-avg-score');
  const labelEl = document.getElementById('testi-avg-label');
  const barsEl  = document.getElementById('testi-rating-bars');
  if (!scoreEl) return;

  if (approved.length === 0) {
    scoreEl.textContent = '★ —'; return;
  }
  const avg = (approved.reduce((s, t) => s + (t.stars || 5), 0) / approved.length).toFixed(1);
  scoreEl.textContent = '★ ' + avg;
  labelEl.textContent = approved.length + ' review' + (approved.length !== 1 ? 's' : '');

  if (barsEl) {
    barsEl.innerHTML = '';
    for (let r = 5; r >= 1; r--) {
      const count = approved.filter(t => (t.stars || 5) === r).length;
      const pct   = Math.round(count / approved.length * 100);
      const row   = document.createElement('div');
      row.className = 'tv3-bar-row';
      row.innerHTML = `<span class="tv3-bar-label">${r}★</span><div class="tv3-bar-track"><div class="tv3-bar-fill" style="width:${pct}%"></div></div><span class="tv3-bar-count">${count}</span>`;
      barsEl.appendChild(row);
    }
  }
}

// ── Featured rotating carousel ──
function setupFeaturedCarousel(approved) {
  const wrap = document.getElementById('testi-featured-wrap');
  if (!wrap || approved.length === 0) { if(wrap) wrap.style.display='none'; return; }
  wrap.style.display = 'block';

  clearInterval(testiCarouselTimer);
  testiCarouselIdx = 0;
  showFeatured(approved, 0);

  // Build dots
  const dots = document.getElementById('testi-dots');
  if (dots) {
    dots.innerHTML = '';
    approved.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'tv3-dot' + (i === 0 ? ' active' : '');
      d.onclick = () => { clearInterval(testiCarouselTimer); showFeatured(approved, i); startCarousel(approved); };
      dots.appendChild(d);
    });
  }

  if (approved.length > 1) startCarousel(approved);
}

function startCarousel(approved) {
  testiCarouselTimer = setInterval(() => {
    testiCarouselIdx = (testiCarouselIdx + 1) % approved.length;
    showFeatured(approved, testiCarouselIdx);
  }, 5000);
}

function showFeatured(approved, idx) {
  testiCarouselIdx = idx;
  const t = approved[idx];
  const feat = document.getElementById('testi-featured');
  if (feat) {
    feat.style.opacity = '0';
    feat.style.transform = 'translateY(8px)';
    setTimeout(() => {
      document.getElementById('tf-quote').textContent = '"' + (t.text || '') + '"';
      document.getElementById('tf-stars').textContent = starStr(t.stars || 5);
      document.getElementById('tf-avatar').textContent = initials(t.name);
      document.getElementById('tf-name').textContent = t.name || '';
      document.getElementById('tf-role').textContent = (t.role || t.service || '') + (t.location ? ' · ' + t.location : '');
      feat.style.opacity = '1';
      feat.style.transform = 'translateY(0)';
    }, 200);
  }
  // Update dots
  document.querySelectorAll('.tv3-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

// ══ FEEDBACK MODAL ══════════════════════════════════
function openFeedbackModal() {
  currentRating = 0;
  updateStarUI(0);
  document.getElementById('fb-rating-label').textContent = 'Tap to rate';
  ['fb-name','fb-email','fb-location'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  const fbText = document.getElementById('fb-text');
  if(fbText) fbText.value = '';
  document.getElementById('fb-char-count').textContent = '0';
  document.getElementById('fb-error').style.display = 'none';
  showFbStep(1);
  document.getElementById('feedback-overlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeFeedbackModal() {
  document.getElementById('feedback-overlay').style.display = 'none';
  document.body.style.overflow = '';
}

function setRating(val) {
  currentRating = val;
  const labels = ['','Poor 😕','Fair 😐','Good 🙂','Great 😊','Excellent! 🤩'];
  document.getElementById('fb-rating-label').textContent = labels[val];
  updateStarUI(val);
}

function updateStarUI(val) {
  document.querySelectorAll('.fb-star').forEach(s => {
    const v = parseInt(s.dataset.val);
    s.classList.toggle('active', v <= val);
  });
}

function showFbStep(n) {
  [1, 2, 3].forEach(i => {
    const el = document.getElementById('fb-step-' + i);
    if (el) el.style.display = (i === n ? 'block' : 'none');
  });
}

// ── Submit feedback ──
async function submitFeedback() {
  const name     = document.getElementById('fb-name').value.trim();
  const email    = document.getElementById('fb-email').value.trim().toLowerCase();
  const text     = document.getElementById('fb-text').value.trim();
  const service  = document.getElementById('fb-service').value;
  const location = document.getElementById('fb-location').value.trim();
  const errEl    = document.getElementById('fb-error');
  errEl.style.display = 'none';

  // Validate
  if (!name)               { errEl.textContent = '⚠️ Please enter your name.';                 errEl.style.display='block'; return; }
  if (!email || !email.includes('@')) { errEl.textContent = '⚠️ Please enter a valid email address.'; errEl.style.display='block'; return; }
  if (!currentRating)      { errEl.textContent = '⚠️ Please select a star rating.';            errEl.style.display='block'; return; }
  if (text.length < 20)    { errEl.textContent = '⚠️ Please write at least 20 characters.';   errEl.style.display='block'; return; }

  const btn = document.getElementById('fb-submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="sending-spinner"></span> Submitting...';

  // Generate unique approval code
  const code = genTestiCode();
  const ts   = new Date().toLocaleString('en-GB', { dateStyle:'medium', timeStyle:'short' });

  const roleMap = {
    'Graphic Design':      '🎨 Graphic Design Client',
    'Website Development': '🌐 Website Development Client',
    'CS Tutoring':         '📚 CS Tutoring Student',
    'Programming Help':    '💻 Programming Student',
    'Cybersecurity':       '🔐 Cybersecurity Student',
    'General':             '💬 TIMTIML Community',
  };
  const role = roleMap[service] || service;
  const stars = starStr(currentRating);

  // ── Email 1: Notify Anotida via Formspree ──
  const jsLine = `  { name:"${name}", role:"${role}", text:"${text.replace(/"/g,"'")}", stars:${currentRating}${location ? ', location:"'+location+'"' : ''} },`;

  try {
    await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _subject:      '⭐ New TIMTIML Testimonial — ' + name,
        name:          name,
        email:         email,
        rating:        stars + ' (' + currentRating + '/5)',
        service:       service,
        location:      location || 'Not specified',
        testimonial:   text,
        submitted:     ts,
        approval_code: code,
        instructions:  'To approve: (1) Copy the JS line below, (2) Paste into APPROVED_TESTIS array in index.html, (3) Push to GitHub. Then email the approval code to the client.',
        js_line:       jsLine,
      })
    });

    // ── Email 2: Confirm to visitor via EmailJS ──
    await emailjs.send(TESTI_EMAILJS_SERVICE, TESTI_EMAILJS_TEMPLATE, {
      to_name:  name,
      to_email: email,
      otp_code: `Your testimonial has been submitted and is awaiting review by Anotida.\n\nYour Reference Code: ${code}\n\nOnce Anotida approves your testimonial, he will email you this code. Enter it on the website to see your review appear live immediately.\n\nThank you for your feedback — it means a lot! 🙏\n\n— TIMTIML | timtiml-website.vercel.app`,
    });

    // Save pending locally
    const testiObj = { name, text, service, role, location, stars: currentRating, _code: code };
    localStorage.setItem(PENDING_KEY, JSON.stringify(testiObj));

    // Show step 2 — pending approval
    document.getElementById('fb-submitted-name').textContent = name;
    document.getElementById('fb-submitted-email').textContent = email;
    document.getElementById('fb-submitted-code').textContent = code;
    showFbStep(2);
    renderAllTestimonials();

  } catch(err) {
    errEl.textContent = '⚠️ Submission failed. Please check your connection and try again.';
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = 'Submit Review →';
    console.error(err);
  }
}

// ── Enter approval code ──
function enterApprovalCode() {
  const entered = document.getElementById('fb-approval-code').value.trim().toUpperCase();
  const codeErr = document.getElementById('fb-code-error');
  codeErr.style.display = 'none';

  if (entered.length < 6) {
    codeErr.textContent = '⚠️ Please enter the approval code from Anotida's email.';
    codeErr.style.display = 'block'; return;
  }

  let pending = null;
  try { pending = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null'); } catch(e) {}

  if (!pending || entered !== pending._code) {
    codeErr.textContent = '❌ Code does not match. Please check the email from Anotida.';
    codeErr.style.display = 'block'; return;
  }

  // Move to locally approved
  let localApproved = [];
  try { localApproved = JSON.parse(localStorage.getItem(APPROVED_LOCAL_KEY) || '[]'); } catch(e) {}
  localApproved.unshift(pending);
  localStorage.setItem(APPROVED_LOCAL_KEY, JSON.stringify(localApproved));
  localStorage.removeItem(PENDING_KEY);

  showFbStep(3);
  renderAllTestimonials();
}

// ── Init on load ──
document.addEventListener('DOMContentLoaded', () => {
  // Star hover
  document.querySelectorAll('.fb-star').forEach(s => {
    s.addEventListener('mouseenter', () => updateStarUI(parseInt(s.dataset.val)));
    s.addEventListener('mouseleave', () => updateStarUI(currentRating));
  });

  // Char counter
  const fbText = document.getElementById('fb-text');
  if (fbText) fbText.addEventListener('input', () => {
    document.getElementById('fb-char-count').textContent = fbText.value.length;
  });

  renderAllTestimonials();
});

<div id="feedback-overlay" style="display:none;" onclick="if(event.target.id==='feedback-overlay')closeFeedbackModal()">
  <div class="fb-modal" onclick="event.stopPropagation()">

    <!-- Step 1: form -->
    <div id="fb-step-1">
      <div class="fb-modal-header">
        <div class="fb-modal-icon">✍️</div>
        <h3 class="fb-modal-title">Leave a Review</h3>
        <p class="fb-modal-sub">Share your experience with Anotida's services. Reviews are approved before going live.</p>
      </div>

      <div class="fb-form-grid">
        <div class="fb-field">
          <label class="fb-label">Full Name</label>
          <input class="fb-input" id="fb-name" type="text" placeholder="e.g. Tatenda Moyo">
        </div>
        <div class="fb-field">
          <label class="fb-label">Email Address</label>
          <input class="fb-input" id="fb-email" type="email" placeholder="your@email.com">
        </div>
      </div>

      <div class="fb-field">
        <label class="fb-label">Service Used</label>
        <select class="fb-input fb-select" id="fb-service">
          <option value="Graphic Design">🎨 Graphic Design</option>
          <option value="Website Development">🌐 Website Development</option>
          <option value="CS Tutoring">📗 O / A Level CS Tutoring</option>
          <option value="Programming Help">💻 Programming Help</option>
          <option value="Cybersecurity">🔐 Cybersecurity Tutoring</option>
          <option value="General">💬 General</option>
        </select>
      </div>

      <div class="fb-field">
        <label class="fb-label">Your Rating</label>
        <div class="fb-stars-wrap">
          <div class="fb-stars">
            <span class="fb-star" data-val="1">★</span>
            <span class="fb-star" data-val="2">★</span>
            <span class="fb-star" data-val="3">★</span>
            <span class="fb-star" data-val="4">★</span>
            <span class="fb-star" data-val="5">★</span>
          </div>
          <span class="fb-rating-label" id="fb-rating-label" onclick="setRating(parseInt(event.target.dataset.val||0))">Tap to rate</span>
        </div>
      </div>

      <div class="fb-field">
        <label class="fb-label">Your Review <span id="fb-char-count" style="color:var(--muted);font-weight:400;">0</span>/500</label>
        <textarea class="fb-input" id="fb-text" rows="4" maxlength="500"
          placeholder="Tell others about your experience — what did Anotida help you with? What was the result?"></textarea>
      </div>

      <div class="fb-field">
        <label class="fb-label">Location <span style="color:var(--muted);font-weight:400;">(optional)</span></label>
        <input class="fb-input" id="fb-location" type="text" placeholder="e.g. Harare, Zimbabwe">
      </div>

      <div class="gate-error" id="fb-error" style="display:none;"></div>
      <button class="fb-submit-btn" id="fb-submit-btn" onclick="submitFeedback()">Submit Review →</button>
      <p style="font-size:0.73rem;color:var(--muted);text-align:center;margin-top:0.8rem;">
        Your review goes to Anotida for approval. You'll receive a confirmation email.
      </p>
    </div>

    <!-- Step 2: submitted — awaiting approval -->
    <div id="fb-step-2" style="display:none;">
      <div style="text-align:center;padding:1rem 0;">
        <div style="font-size:3rem;margin-bottom:0.8rem;">📬</div>
        <h3 style="color:#fff;font-weight:800;margin-bottom:0.5rem;">Review Submitted!</h3>
        <p style="color:var(--muted);font-size:0.88rem;line-height:1.7;margin-bottom:1.5rem;">
          Thank you <strong id="fb-submitted-name" style="color:#fff;"></strong>! Your review has been sent to Anotida for approval.<br>
          A confirmation email has been sent to <strong id="fb-submitted-email" style="color:var(--cyan);"></strong>.
        </p>

        <div style="background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.2);border-radius:10px;padding:1.2rem;margin-bottom:1.5rem;">
          <div style="font-size:0.7rem;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:0.5rem;">Your Reference Code</div>
          <div id="fb-submitted-code" style="font-size:2rem;font-weight:900;color:var(--cyan);letter-spacing:6px;font-family:'Courier New',monospace;"></div>
          <p style="font-size:0.75rem;color:var(--muted);margin-top:0.5rem;">Anotida will email this code to you once your review is approved.</p>
        </div>

        <div style="background:#0f1628;border:1px solid rgba(0,255,157,0.15);border-radius:10px;padding:1.2rem;">
          <div style="font-weight:700;color:#fff;font-size:0.88rem;margin-bottom:0.4rem;">🔑 Already have your approval code?</div>
          <p style="color:var(--muted);font-size:0.8rem;margin-bottom:0.8rem;">Enter the code Anotida emailed you to make your review appear live immediately.</p>
          <input type="text" id="fb-approval-code" maxlength="8"
            placeholder="e.g. TMAB3K7P"
            style="width:100%;background:#141c35;border:1px solid rgba(0,212,255,0.2);border-radius:7px;padding:12px;color:#fff;font-size:1.2rem;letter-spacing:5px;text-align:center;font-family:'Courier New',monospace;font-weight:800;outline:none;text-transform:uppercase;"
            oninput="this.value=this.value.toUpperCase()"
            onkeydown="if(event.key==='Enter')enterApprovalCode()">
          <div class="gate-error" id="fb-code-error" style="display:none;margin-top:0.5rem;"></div>
          <button onclick="enterApprovalCode()"
            style="width:100%;margin-top:0.8rem;padding:11px;border-radius:7px;border:none;background:linear-gradient(90deg,var(--cyan),var(--green));color:#000;font-weight:800;font-size:0.88rem;cursor:pointer;">
            Verify Code & Publish Review →
          </button>
        </div>

        <button onclick="closeFeedbackModal()"
          style="margin-top:1rem;background:none;border:1px solid var(--border);padding:8px 20px;border-radius:6px;color:var(--muted);cursor:pointer;font-size:0.8rem;">
          Close
        </button>
      </div>
    </div>

    <!-- Step 3: approved & live -->
    <div id="fb-step-3" style="display:none;">
      <div style="text-align:center;padding:1.5rem 0;">
        <div style="font-size:3.5rem;margin-bottom:1rem;">🎉</div>
        <h3 style="color:#fff;font-weight:800;margin-bottom:0.5rem;">Review Published!</h3>
        <p style="color:var(--muted);font-size:0.88rem;line-height:1.7;margin-bottom:1.5rem;">
          Your review is now live on the TIMTIML website. Thank you so much — it really helps Anotida grow! 🙏
        </p>
        <button class="fb-submit-btn" onclick="closeFeedbackModal()">Close ✕</button>
      </div>
    </div>

  </div>
</div>


<!-- ══ CERTIFICATE MODAL ══ -->>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TIMTIML – Anotida Manguwe | Web Developer & Graphic Designer in Zambia & Zimbabwe</title>
<meta name="description" content="Anotida Manguwe — BSc IT student, web developer, graphic designer and CS tutor based in Zambia & Zimbabwe. Specialising in posters, flyers, logos, websites and programming tutoring. Contact via WhatsApp +260768648291.">
<meta name="keywords" content="web developer Zambia, graphic designer Zimbabwe, poster designer Zambia, flyer design Zambia, programming tutor, CS lessons Zimbabwe, TIMTIML, Anotida Manguwe, website developer Zimbabwe">
<meta name="author" content="Anotida Manguwe">
<meta name="robots" content="index, follow">
<meta property="og:title" content="TIMTIML – Anotida Manguwe | Web Developer & Graphic Designer">
<meta property="og:description" content="Web developer, graphic designer and CS tutor from Zambia & Zimbabwe. Turning ideas into visual impact.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://timtiml.vercel.app">
<meta name="twitter:card" content="summary_large_image">
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-GZ0V0S0DWT">


  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-GZ0V0S0DWT');

// ══════════════════════════════════════════════════════════════
//  TIMTIML BACKEND API WIRING
//  Connects frontend to Supabase via /api/* endpoints
// ══════════════════════════════════════════════════════════════

const API = {
  users:        '/api/users',
  progress:     '/api/progress',
  testimonials: '/api/testimonials',
  payments:     '/api/payments',
};

// ── Generic API call helper ──
async function apiCall(endpoint, data) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch(e) {
    console.warn('API call failed:', endpoint, e);
    return { error: e.message };
  }
}

// ══ 1. WIRE EMAIL GATE → register user in Supabase ══════════
// After OTP verified, register user
const _origVerifyEmailOTP = window.verifyEmailOTP;
window.verifyEmailOTP = async function() {
  // Run original OTP check first
  const entered = document.getElementById('email-otp-input').value.trim();
  if (!entered || entered.length !== 6) {
    const err = document.getElementById('email-otp-error');
    err.textContent = '⚠️ Please enter the 6-digit code.';
    err.style.display = 'block'; return;
  }
  // emailOTP is set in the gate script
  if (typeof emailOTP !== 'undefined' && entered !== emailOTP) {
    const err = document.getElementById('email-otp-error');
    err.textContent = '❌ Incorrect code. Check your email and try again.';
    err.style.display = 'block'; return;
  }

  // OTP correct — register in Supabase
  let pending = {};
  try { pending = JSON.parse(localStorage.getItem('ttml-gate-email-v2-pending') || '{}'); } catch(e) {}

  // Register user (non-blocking — don't fail gate if API is down)
  apiCall(API.users, {
    action: 'register',
    name:   pending.name  || '',
    email:  pending.email || '',
  }).then(res => {
    if (res.user) {
      localStorage.setItem('ttml-db-user', JSON.stringify(res.user));
      console.log('User registered in Supabase ✅');
    }
  });

  // Continue original flow
  clearInterval(typeof otpTimerInterval !== 'undefined' ? otpTimerInterval : null);
  localStorage.setItem('ttml-gate-email-v2', JSON.stringify({ ...pending, verified: new Date().toISOString() }));
  const welcomeEl = document.getElementById('email-welcome-name');
  if (welcomeEl) welcomeEl.textContent = 'Welcome, ' + (pending.name || 'Student') + '! 👋';
  const step2 = document.getElementById('email-step-2');
  const step3 = document.getElementById('email-step-3');
  if (step2) step2.style.display = 'none';
  if (step3) step3.style.display = 'block';
  if (typeof emailOTP !== 'undefined') emailOTP = null;
};

// ══ 2. WIRE PAYMENT GATE → save to Supabase ══════════════════
const _origProceedToProof = window.proceedToProof;
window.proceedToProof = async function() {
  const name  = document.getElementById('pay-name').value.trim();
  const email = document.getElementById('pay-email').value.trim().toLowerCase();
  const phone = document.getElementById('pay-phone').value.trim();
  const cc    = document.getElementById('pay-country-code').value;
  const err   = document.getElementById('pay-error-1');

  if (!name)  { err.textContent='⚠️ Please enter your full name.';   err.style.display='block'; return; }
  if (!email||!email.includes('@')) { err.textContent='⚠️ Please enter a valid email.'; err.style.display='block'; return; }
  if (!phone) { err.textContent='⚠️ Please enter your phone number.'; err.style.display='block'; return; }
  err.style.display='none';

  const idx = parseInt(document.getElementById('pay-currency').value)||0;
  const GATE_CURRENCIES = typeof GATE_CONFIG !== 'undefined' ? GATE_CONFIG.currencies : [];
  const cur = GATE_CURRENCIES[idx] || { symbol:'K', amount:50, code:'ZMW' };
  const amtStr = cur.symbol + (Number.isInteger(cur.amount)?cur.amount:cur.amount.toFixed(2)) + ' ' + cur.code;
  const ref = Math.floor(100000 + Math.random()*900000).toString();

  // Save payment record to Supabase
  apiCall(API.payments, {
    action:   'save',
    name, email,
    phone:    cc + phone,
    currency: cur.code,
    amount:   amtStr,
    ref_code: ref,
  }).then(res => {
    if (!res.error) console.log('Payment saved to Supabase ✅');
  });

  // Build WhatsApp message
  const waNum = typeof GATE_CONFIG !== 'undefined' ? GATE_CONFIG.whatsapp : '260768648291';
  const msg = encodeURIComponent(
    '💰 TIMTIML PAYMENT\n══════════════════\n' +
    '👤 Name: ' + name + '\n📧 Email: ' + email + '\n' +
    '📱 Phone: ' + cc + phone + '\n💵 Amount: ' + amtStr + '\n' +
    '🔑 Ref: ' + ref + '\n══════════════════\nScreenshot below 👇\n\n' +
    'To unlock: email this 6-digit ref to the student.'
  );

  localStorage.setItem('ttml-pay-pending', JSON.stringify({ name, email, phone: cc+phone, ref }));
  const waLink = document.getElementById('pay-wa-link');
  const refDisplay = document.getElementById('pay-ref-display');
  if (waLink) waLink.href = 'https://wa.me/' + waNum + '?text=' + msg;
  if (refDisplay) refDisplay.textContent = ref;

  // Show step 2
  ['pay-step-1','pay-step-2','pay-step-3'].forEach(id => {
    const el = document.getElementById(id); if(el) el.style.display='none';
  });
  const s2 = document.getElementById('pay-step-2'); if(s2) s2.style.display='block';
};

// Verify payment code → check Supabase instead of localStorage only
const _origVerifyPaymentCode = window.verifyPaymentCode;
window.verifyPaymentCode = async function() {
  const entered = document.getElementById('pay-code-input').value.trim();
  const err = document.getElementById('pay-error-2');
  err.style.display = 'none';
  if (!entered || entered.length !== 6) {
    err.textContent = '⚠️ Please enter the 6-digit code.'; err.style.display='block'; return;
  }

  let pending = {};
  try { pending = JSON.parse(localStorage.getItem('ttml-pay-pending')||'{}'); } catch(e) {}

  // Show checking state
  const btn = event?.target;
  if (btn) { btn.disabled = true; btn.textContent = 'Verifying...'; }

  // Check localStorage first (for offline fallback)
  if (pending.ref && entered === pending.ref) {
    localStorage.setItem('ttml-gate-paid-v2', JSON.stringify({ ...pending, verified: new Date().toISOString() }));
    ['pay-step-1','pay-step-2'].forEach(id => { const el=document.getElementById(id); if(el)el.style.display='none'; });
    const s3 = document.getElementById('pay-step-3'); if(s3) s3.style.display='block';
    if (btn) { btn.disabled=false; btn.textContent='Verify & Unlock →'; }
    return;
  }

  // Also check Supabase (if Anotida manually marked it verified)
  const res = await apiCall(API.payments, {
    action:   'verify',
    email:    pending.email || '',
    ref_code: entered,
  });

  if (btn) { btn.disabled=false; btn.textContent='Verify & Unlock →'; }

  if (res.success) {
    localStorage.setItem('ttml-gate-paid-v2', JSON.stringify({ ...pending, verified: new Date().toISOString() }));
    ['pay-step-1','pay-step-2'].forEach(id => { const el=document.getElementById(id); if(el)el.style.display='none'; });
    const s3 = document.getElementById('pay-step-3'); if(s3) s3.style.display='block';
  } else {
    err.textContent = '❌ Code incorrect or not yet verified by Anotida.';
    err.style.display = 'block';
  }
};

// ══ 3. WIRE LESSON PROGRESS → save to Supabase ══════════════
// This wraps the markDone function on lesson pages (called from lesson files)
// On index.html we patch the gate system to load progress on login
document.addEventListener('DOMContentLoaded', () => {
  // If user is logged in, load their progress from Supabase
  const userStr = localStorage.getItem('ttml-db-user');
  if (!userStr) return;
  try {
    const user = JSON.parse(userStr);
    if (!user.email) return;
    // Pre-fetch progress (non-blocking)
    apiCall(API.progress, { action:'get', email: user.email }).then(res => {
      if (res.progress) {
        localStorage.setItem('ttml-db-progress', JSON.stringify(res.progress));
        console.log('Progress loaded from Supabase ✅', res.progress);
      }
    });
  } catch(e) {}
});

// ══ 4. WIRE TESTIMONIALS → load from Supabase ═══════════════
// Override APPROVED_TESTIS with live data from database
async function loadApprovedTestimonialsFromDB() {
  const res = await apiCall(API.testimonials, { action: 'get_approved' });
  if (res.testimonials && res.testimonials.length > 0) {
    // Merge with hardcoded ones
    const combined = [...(typeof APPROVED_TESTIS !== 'undefined' ? APPROVED_TESTIS : []), ...res.testimonials];
    // Re-render
    if (typeof renderAllTestimonials === 'function') {
      // Temporarily override APPROVED_TESTIS
      window._dbTestis = res.testimonials;
      renderAllTestimonials();
    }
  }
}

// Patch getAllApproved to include DB testimonials
const _origGetAllApproved = window.getAllApproved;
window.getAllApproved = function() {
  const hardcoded = typeof APPROVED_TESTIS !== 'undefined' ? APPROVED_TESTIS : [];
  let local = [];
  try { local = JSON.parse(localStorage.getItem('ttml-testi-approved')||'[]'); } catch(e) {}
  const dbTestis = window._dbTestis || [];
  return [...hardcoded, ...dbTestis, ...local];
};

// Override submitFeedback to also save to Supabase
const _origSubmitFeedback = window.submitFeedback;
window.submitFeedback = async function() {
  // Let original handle validation + EmailJS + UI
  if (_origSubmitFeedback) await _origSubmitFeedback();
  // Then also save to Supabase
  const pending = (() => { try { return JSON.parse(localStorage.getItem('ttml-testi-pending')||'null'); } catch(e) { return null; } })();
  if (pending) {
    apiCall(API.testimonials, {
      action:   'submit',
      name:     pending.name,
      email:    pending.email || '',
      service:  pending.service,
      text:     pending.text,
      stars:    pending.stars,
      location: pending.location || '',
      code:     pending._code,
    }).then(res => {
      if (!res.error) console.log('Testimonial saved to Supabase ✅');
    });
  }
};

// Load DB testimonials on page load
document.addEventListener('DOMContentLoaded', () => {
  loadApprovedTestimonialsFromDB();
});

