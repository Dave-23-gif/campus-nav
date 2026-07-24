/**
 * admin.js — Admin Panel Logic
 * Handles login, building CRUD, and path management.
 */

const AdminPanel = (() => {
  let allBuildings = [];

  // ── Login ────────────────────────────────────────────────
  function initLogin() {
    document.getElementById('btn-login').addEventListener('click', async () => {
      const username = document.getElementById('admin-user').value.trim();
      const password = document.getElementById('admin-pass').value;
      const errEl    = document.getElementById('login-error');
      errEl.classList.add('hidden');

      try {
        await Api.login(username, password);
        showDashboard();
      } catch {
        errEl.textContent = 'Invalid credentials. Please try again.';
        errEl.classList.remove('hidden');
      }
    });
  }

  function showDashboard() {
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    loadBuildings();
    loadPaths();
  }

  // ── Tabs ─────────────────────────────────────────────────
  function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
      });
    });
  }

  // ── Buildings ────────────────────────────────────────────
  async function loadBuildings() {
    try {
      allBuildings = await Api.getBuildings();
      renderBuildingsTable(allBuildings);
    } catch { /* backend not running: show empty table */ }
  }

  function renderBuildingsTable(buildings) {
    const tbody = document.getElementById('buildings-tbody');
    tbody.innerHTML = buildings.map(b => `
      <tr>
        <td>${b.id}</td>
        <td><span class="mono">${b.code || '—'}</span></td>
        <td>${b.name}</td>
        <td>${b.category?.name || '—'}</td>
        <td>
          <button class="action-btn" onclick="AdminPanel.editBuilding(${b.id})">Edit</button>
          <button class="action-btn del" onclick="AdminPanel.deleteBuilding(${b.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  async function deleteBuilding(id) {
    if (!confirm('Delete this building? This will also remove connected paths.')) return;
    try {
      await Api.deleteBuilding(id);
      loadBuildings();
    } catch (e) { alert('Error deleting building: ' + e.message); }
  }

  function editBuilding(id) {
    const b = allBuildings.find(x => x.id === id);
    if (!b) return;
    openModal('Edit building', buildingForm(b), async () => {
      const updated = collectBuildingForm();
      await Api.updateBuilding(id, updated);
      loadBuildings();
    });
  }

  function openAddBuilding() {
    openModal('Add building', buildingForm(), async () => {
      const data = collectBuildingForm();
      await Api.createBuilding(data);
      loadBuildings();
    });
  }

  function buildingForm(b = {}) {
    return `
      <label>Name<input id="f-name"  type="text" class="field" value="${b.name||''}"/></label>
      <label>Code (short)<input id="f-code" type="text" class="field" value="${b.code||''}"/></label>
      <label>Description<input id="f-desc" type="text" class="field" value="${b.description||''}"/></label>
      <label>Map X<input id="f-x" type="number" class="field" value="${b.mapX||0}"/></label>
      <label>Map Y<input id="f-y" type="number" class="field" value="${b.mapY||0}"/></label>
    `;
  }

  function collectBuildingForm() {
    return {
      name:        document.getElementById('f-name').value,
      code:        document.getElementById('f-code').value,
      description: document.getElementById('f-desc').value,
      mapX:        parseFloat(document.getElementById('f-x').value),
      mapY:        parseFloat(document.getElementById('f-y').value),
    };
  }

  // ── Paths ────────────────────────────────────────────────
  async function loadPaths() {
    let paths = [];
    try {
      paths = await Api.getPaths();
    } catch (e) {
      // Backend not running — use sample paths if available (offline/demo mode)
      console.warn('Could not load paths from API, using sample data if present.', e);
      if (typeof SAMPLE_PATHS !== 'undefined') paths = SAMPLE_PATHS;
    }

    // Resolve building names from allBuildings when API returns only ids
    const resolved = (paths || []).map(p => {
      const fromId = p.from && (p.from.id || p.from) ? (p.from.id || p.from) : null;
      const toId   = p.to   && (p.to.id   || p.to)   ? (p.to.id   || p.to)   : null;
      const fromB = fromId ? allBuildings.find(b => b.id === fromId) : (p.from || null);
      const toB   = toId   ? allBuildings.find(b => b.id === toId)   : (p.to   || null);
      return Object.assign({}, p, { from: fromB || p.from, to: toB || p.to });
    });

    const tbody = document.getElementById('paths-tbody');
    tbody.innerHTML = resolved.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.from?.name || p.from?.id || '—'}</td>
        <td>${p.to?.name || p.to?.id || '—'}</td>
        <td><span class="mono">${p.distance}</span></td>
        <td>${p.pathName || '—'}</td>
        <td>
          <button class="action-btn del" onclick="AdminPanel.deletePath(${p.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  async function deletePath(id) {
    if (!confirm('Delete this path?')) return;
    try {
      await Api.deletePath(id);
      loadPaths();
    } catch (e) { alert('Error: ' + e.message); }
  }

  function openAddPath() {
    const opts = allBuildings.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    openModal('Add path', `
      <label>From building<select id="f-from" class="field">${opts}</select></label>
      <label>To building<select id="f-to" class="field">${opts}</select></label>
      <label>Distance (metres)<input id="f-dist" type="number" class="field" value="100"/></label>
      <label>Path name<input id="f-pname" type="text" class="field" placeholder="e.g. Main Boulevard"/></label>
    `, async () => {
      await Api.createPath({
        from:     { id: parseInt(document.getElementById('f-from').value) },
        to:       { id: parseInt(document.getElementById('f-to').value) },
        distance: parseFloat(document.getElementById('f-dist').value),
        pathName: document.getElementById('f-pname').value,
      });
      loadPaths();
    });
  }

  // ── Modal ────────────────────────────────────────────────
  let modalSaveCallback = null;

  function openModal(title, bodyHtml, onSave) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML    = bodyHtml;
    document.getElementById('modal-overlay').classList.remove('hidden');
    modalSaveCallback = onSave;
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    modalSaveCallback = null;
  }

  // ── Bootstrap ────────────────────────────────────────────
  function init() {
    initLogin();
    initTabs();

    document.getElementById('btn-add-building').addEventListener('click', openAddBuilding);
    document.getElementById('btn-add-path')    .addEventListener('click', openAddPath);
    document.getElementById('btn-modal-close') .addEventListener('click', closeModal);
    document.getElementById('btn-modal-cancel').addEventListener('click', closeModal);
    document.getElementById('btn-modal-save')  .addEventListener('click', async () => {
      if (modalSaveCallback) {
        try { await modalSaveCallback(); closeModal(); }
        catch (e) { alert('Error saving: ' + e.message); }
      }
    });
    console.log('Admin init running');
    console.log('Login element:', document.getElementById('admin-login'));

    if (Api.isLoggedIn()) showDashboard();
  }

  return { init, editBuilding, deleteBuilding, deletePath };
})();
