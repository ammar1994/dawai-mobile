/* =====================================================
   DAWAI Admin — Shared Utilities
   ===================================================== */

const API = 'https://pharmacy-saas-backend.onrender.com/api';

// ─── Auth ──────────────────────────────────────────────────────────────────────
const Auth = {
  getToken: () => localStorage.getItem('dawai_admin_token'),
  setToken: (t) => localStorage.setItem('dawai_admin_token', t),
  clear: () => { localStorage.removeItem('dawai_admin_token'); localStorage.removeItem('dawai_admin_user'); },
  getUser: () => { try { return JSON.parse(localStorage.getItem('dawai_admin_user') || 'null'); } catch { return null; } },
  setUser: (u) => localStorage.setItem('dawai_admin_user', JSON.stringify(u)),
  check: () => {
    if (!Auth.getToken()) { window.location.href = 'login.html'; return false; }
    return true;
  }
};

// ─── API Client ────────────────────────────────────────────────────────────────
async function apiCall(path, options = {}) {
  const token = Auth.getToken();
  const res = await fetch(API + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    Auth.clear();
    window.location.href = 'login.html';
    return null;
  }

  const data = await res.json();
  return data;
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function toast(message, type = 'info', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, duration);
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('show'); }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('show'); }
}

// ─── Format ────────────────────────────────────────────────────────────────────
function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
}
function formatPrice(n) {
  return (n || 0).toLocaleString('ar-SY') + ' ل.س';
}

// ─── Sidebar toggle ────────────────────────────────────────────────────────────
function initSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
  // mark active link
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) link.classList.add('active');
  });
}

// ─── Order Status ──────────────────────────────────────────────────────────────
const ORDER_STATUSES = {
  PENDING: { label: 'في الانتظار', badge: 'badge-pending', icon: '⏳' },
  RECEIVED: { label: 'تم الاستلام', badge: 'badge-received', icon: '📥' },
  PREPARING: { label: 'جاري التحضير', badge: 'badge-preparing', icon: '⚗️' },
  READY: { label: 'جاهز للتسليم', badge: 'badge-ready', icon: '✅' },
  OUT_FOR_DELIVERY: { label: 'في الطريق', badge: 'badge-delivery', icon: '🚚' },
  DELIVERED: { label: 'تم التسليم', badge: 'badge-delivered', icon: '🎉' },
  CANCELLED: { label: 'ملغي', badge: 'badge-cancelled', icon: '❌' },
};

function statusBadge(status) {
  const s = ORDER_STATUSES[status] || { label: status, badge: 'badge-pending', icon: '?' };
  return `<span class="badge ${s.badge}">${s.icon} ${s.label}</span>`;
}

// ─── Confim dialog ─────────────────────────────────────────────────────────────
function confirmAction(message, onConfirm) {
  if (window.confirm(message)) onConfirm();
}

// Init on load
document.addEventListener('DOMContentLoaded', initSidebar);
