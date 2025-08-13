// Preventi Flow - Auth & Org logic for dashboard-index.html
// Requiere supabase-js CDN

const SUPABASE_URL = window.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Init Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// UI Elements
let authModal, orgModal, mainContent, orgForm, orgNameInput, logoutBtn;
// SE ELIMINÓ LA INYECCIÓN DEL userOrgBar

function showAuthModal() {
  authModal.style.display = 'flex';
  mainContent.style.filter = 'blur(3px)';
}
function hideAuthModal() {
  authModal.style.display = 'none';
  mainContent.style.filter = '';
}
function showOrgModal() {
  orgModal.style.display = 'flex';
  mainContent.style.filter = 'blur(3px)';
}
function hideOrgModal() {
  orgModal.style.display = 'none';
  mainContent.style.filter = '';
}

async function checkAuthAndOrg() {
  // 1. Always refresh session from Supabase (no cache)
  const { data: { session } } = await supabase.auth.getSession();
  let userName = '...';
  let userEmail = '...';
  if (!session) {
    showAuthModal();
    updateUserOrgBar(userName, userEmail, null);
    return;
  }
  hideAuthModal();
  // 2. Check organization (simple: busca si user_id tiene organización)
  const userId = session.user.id;
  userName = session.user.user_metadata?.name || session.user.email || 'Usuario';
  userEmail = session.user.email || '';
  const { data: orgs, error } = await supabase.from('organizaciones').select('*').eq('user_id', userId).limit(1);
  let orgName = null;
  if (!orgs || orgs.length === 0) {
    showOrgModal();
    updateUserOrgBar(userName, userEmail, null);
    return;
  } else {
    orgName = orgs[0].nombre || orgs[0].razon_social || '(Sin nombre)';
  }
  hideOrgModal();
  updateUserOrgBar(userName, userEmail, orgName);
}

function updateUserOrgBar(userName, userEmail, orgName) {
  const userSpan = document.getElementById('userNameDisplay');
  const orgSpan = document.getElementById('orgNameDisplay');
  if (userSpan) userSpan.textContent = `Usuario: ${userName || userEmail || '...'}`;
  if (orgSpan) orgSpan.textContent = `Organización: ${orgName || 'Sin organización'}`;
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value.trim();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    document.getElementById('authError').textContent = error.message;
  } else {
    hideAuthModal();
    checkAuthAndOrg();
  }
}

async function handleLogout() {
  await supabase.auth.signOut();
  showAuthModal();
  hideOrgModal();
  mainContent.style.filter = 'blur(3px)';
  // Refrescar la página para forzar estado limpio
  setTimeout(() => window.location.reload(), 300);
}

async function handleOrgCreate(e) {
  e.preventDefault();
  const orgName = orgNameInput.value.trim();
  if (!orgName) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const userId = session.user.id;
  const { error } = await supabase.from('organizaciones').insert([{ user_id: userId, nombre: orgName }]);
  if (error) {
    document.getElementById('orgError').textContent = error.message;
  } else {
    hideOrgModal();
    mainContent.style.filter = '';
  }
}

function setupAuthUI() {
  authModal = document.getElementById('authModal');
  orgModal = document.getElementById('orgModal');
  mainContent = document.getElementById('mainContent');
  orgForm = document.getElementById('orgForm');
  orgNameInput = document.getElementById('orgName');
  // Agregar botón de logout visible arriba a la derecha
  let logoutBtnEl = document.getElementById('logoutBtn');
  if (!logoutBtnEl) {
    logoutBtnEl = document.createElement('button');
    logoutBtnEl.id = 'logoutBtn';
    logoutBtnEl.textContent = 'Cerrar sesión';
    logoutBtnEl.style = 'position:fixed;top:22px;right:32px;z-index:19999;background:#23263a;color:#fff;padding:8px 18px;border-radius:8px;font-weight:600;border:none;box-shadow:0 2px 8px #0002;cursor:pointer;';
    document.body.appendChild(logoutBtnEl);
  }
  logoutBtn = logoutBtnEl;
  logoutBtn.addEventListener('click', handleLogout);
  document.getElementById('authForm').addEventListener('submit', handleLogin);
  orgForm.addEventListener('submit', handleOrgCreate);
}

document.addEventListener('DOMContentLoaded', function() {
  setupAuthUI();
  checkAuthAndOrg();
});
