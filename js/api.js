// API Configuration
const API_BASE = '/api';

// ══════════════════════════════════════════════
// 1. USERS API
// ══════════════════════════════════════════════

async function registerUser(name, email) {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', name, email })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('userEmail', email);
      console.log('✅ User registered:', data.user);
      return data.user;
    } else {
      console.error('❌ Registration failed:', data.error);
      return null;
    }
  } catch (err) {
    console.error('❌ Network error:', err);
    return null;
  }
}

async function getUser(email) {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get', email })
    });
    return res.ok ? (await res.json()).user : null;
  } catch (err) {
    console.error('❌ Error fetching user:', err);
    return null;
  }
}

// ══════════════════════════════════════════════
// 2. PROGRESS API
// ══════════════════════════════════════════════

async function saveLessonProgress(email, course, lesson) {
  try {
    const res = await fetch(`${API_BASE}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        email: email,
        course: course,
        lesson: lesson
      })
    });
    if (res.ok) {
      console.log(`✅ Saved progress: ${course} lesson ${lesson}`);
      return true;
    } else {
      console.error('❌ Failed to save progress');
      return false;
    }
  } catch (err) {
    console.error('❌ Error saving progress:', err);
    return false;
  }
}

async function getUserProgress(email, course = null) {
  try {
    const res = await fetch(`${API_BASE}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get',
        email: email,
        course: course
      })
    });
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Progress fetched:', data.progress);
      return data.progress;
    }
    return {};
  } catch (err) {
    console.error('❌ Error fetching progress:', err);
    return {};
  }
}

async function getLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'leaderboard' })
    });
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Leaderboard:', data.leaderboard);
      return data.leaderboard;
    }
    return [];
  } catch (err) {
    console.error('❌ Error fetching leaderboard:', err);
    return [];
  }
}

// ══════════════════════════════════════════════
// 3. TESTIMONIALS API
// ══════════════════════════════��═══════════════

async function submitTestimonial(name, email, service, text, stars, code) {
  try {
    const res = await fetch(`${API_BASE}/testimonials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'submit',
        name, email, service, text, stars, code
      })
    });
    if (res.ok) {
      console.log('✅ Testimonial submitted');
      return true;
    }
    const data = await res.json();
    console.error('❌ Failed:', data.error);
    return false;
  } catch (err) {
    console.error('❌ Error submitting:', err);
    return false;
  }
}

async function getApprovedTestimonials() {
  try {
    const res = await fetch(`${API_BASE}/testimonials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_approved' })
    });
    if (res.ok) {
      const data = await res.json();
      return data.testimonials || [];
    }
    return [];
  } catch (err) {
    console.error('❌ Error fetching testimonials:', err);
    return [];
  }
}

async function verifyTestimonialCode(email, code) {
  try {
    const res = await fetch(`${API_BASE}/testimonials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify_code',
        email, code
      })
    });
    if (res.ok) {
      const data = await res.json();
      return data.testimonial;
    }
    return null;
  } catch (err) {
    console.error('❌ Error verifying:', err);
    return null;
  }
}

// ══════════════════════════════════════════════
// 4. PAYMENTS API
// ══════════════════════════════════════════════

async function savePayment(name, email, phone, currency, amount, refCode) {
  try {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        name, email, phone, currency, amount,
        ref_code: refCode
      })
    });
    if (res.ok) {
      console.log('✅ Payment saved');
      return true;
    }
    const data = await res.json();
    console.error('❌ Failed:', data.error);
    return false;
  } catch (err) {
    console.error('❌ Error saving payment:', err);
    return false;
  }
}

async function verifyPayment(email, refCode) {
  try {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify',
        email,
        ref_code: refCode
      })
    });
    if (res.ok) {
      const data = await res.json();
      return data.payment;
    }
    const data = await res.json();
    console.error('❌ Verification failed:', data.error);
    return null;
  } catch (err) {
    console.error('❌ Error verifying:', err);
    return null;
  }
}

async function checkUserPaymentStatus(email) {
  try {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check', email })
    });
    if (res.ok) {
      const data = await res.json();
      return data.paid;
    }
    return false;
  } catch (err) {
    console.error('❌ Error checking status:', err);
    return false;
  }
}

// ══════════════════════════════════════════════
// 5. CHATBOT API
// ══════════════════════���═══════════════════════

async function sendChatMessage(message) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (res.ok) {
      const data = await res.json();
      return data.response;
    }
    const data = await res.json();
    console.error('❌ Chat error:', data.error);
    return null;
  } catch (err) {
    console.error('❌ Error sending message:', err);
    return null;
  }
}

// ══════════════════════════════════════════════
// HELPER: Get Current User Email
// ══════════════════════════════════════════════

function getCurrentUserEmail() {
  return localStorage.getItem('userEmail') || null;
}

function setCurrentUserEmail(email) {
  localStorage.setItem('userEmail', email);
}

function clearUserSession() {
  localStorage.removeItem('userEmail');
}
