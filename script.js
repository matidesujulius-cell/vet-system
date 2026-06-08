let currentUser = null;
let showRequestPanel = false;

const API_BASE = '/vet-system/api/';

// Helper function to call API
function apiCall(endpoint, options = {}) {
    return fetch(API_BASE + endpoint, {
        ...options,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers }
    }).then(res => res.json().then(data => {
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    }));
}

// ----- AUTH -----
function login(username, password) {
    apiCall('auth.php?action=login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    }).then(data => {
        if (data.success) {
            currentUser = data.user;
            renderApp();
        }
    }).catch(err => alert(err.message));
}

function register(username, password, fullName) {
    apiCall('auth.php?action=register', {
        method: 'POST',
        body: JSON.stringify({ username, password, fullName })
    }).then(data => {
        alert(data.message);
        if (data.success) renderApp();
    }).catch(err => alert(err.message));
}

// ----- SERVICES -----
function fetchServices() {
    return apiCall('services.php');
}

function addService(name) {
    return apiCall('services.php', { method: 'POST', body: JSON.stringify({ name }) }).then(() => renderApp());
}

function updateService(id, name) {
    return apiCall('services.php', { method: 'PUT', body: JSON.stringify({ id, name }) }).then(() => renderApp());
}

function deleteService(id) {
    return apiCall(`services.php?id=${id}`, { method: 'DELETE' }).then(() => renderApp());
}

// ----- REQUESTS -----
function fetchRequests() {
    return apiCall('requests.php');
}

function createRequest(serviceId, animalType, notes) {
    return apiCall('requests.php', {
        method: 'POST',
        body: JSON.stringify({ serviceId, animalType, notes })
    }).then(() => {
        showRequestPanel = false;
        renderApp();
    });
}

function updateRequestStatus(reqId, status) {
    return apiCall('requests.php', { method: 'PUT', body: JSON.stringify({ id: reqId, status }) }).then(() => renderApp());
}

function deleteRequest(reqId) {
    return apiCall(`requests.php?id=${reqId}`, { method: 'DELETE' }).then(() => renderApp());
}

// ----- RENDER AUTH PAGE -----
function renderAuth() {
    return `
    <div class="app-container">
      <div class="vet-header">
        <div class="logo"><h1>Really Veterinary</h1><p>Huduma bora kwa mifugo yako</p></div>
      </div>
      <div style="display: flex; gap: 2rem; justify-content: center; padding: 2rem; flex-wrap: wrap;">
        <div class="card" style="width: 320px;">
          <h2>Ingia</h2>
          <input type="text" id="loginUser" placeholder="Jina la mtumiaji" class="form-group" style="margin-bottom:1rem">
          <input type="password" id="loginPass" placeholder="Nenosiri" class="form-group" style="margin-bottom:1rem">
          <button class="btn-primary" id="doLoginBtn">Ingia</button>
        </div>
        <div class="card" style="width: 320px;">
          <h2>Jisajili</h2>
          <input type="text" id="regUser" placeholder="Jina la mtumiaji" class="form-group" style="margin-bottom:1rem">
          <input type="password" id="regPass" placeholder="Nenosiri" class="form-group" style="margin-bottom:1rem">
          <input type="text" id="regFullname" placeholder="Jina kamili" class="form-group" style="margin-bottom:1rem">
          <button class="btn-primary" id="doRegBtn">Jisajili kama Mteja</button>
        </div>
      </div>
      <footer>Dk. Really – Huduma za mifugo kitaalamu</footer>
    </div>
  `;
}

// ----- RENDER CLIENT DASHBOARD -----
async function renderClientDashboard() {
    const services = await fetchServices();
    const allRequests = await fetchRequests();
    const myRequests = allRequests.filter(r => r.userId === currentUser.id);
    return `
    <div class="app-container">
      <div class="vet-header">
        <div class="logo"><h1>Really Veterinary</h1><p>Karibu ${currentUser.fullName}</p></div>
        <button class="logout-btn" id="logoutBtn">Toka</button>
      </div>
      <div class="main-dashboard">
        <div class="left-panel">
          <div class="dr-center">
            <img class="dr-large-img" src="ChahaPicture.jpeg" alt="Dr. Mathias">
            <h2>Dr. Mathias</h2>
            <p>Daktari Mkuu & Mwanzilishi</p>
          </div>
          <div class="services-menu">
            <h3><i class="fas fa-list"></i> Huduma Zetu</h3>
            <ul class="service-list">
              ${services.map(s => `<li><strong>${s.name}</strong></li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="right-panel">
          <div class="omba-link" id="toggleRequestPanel">
            <i class="fas fa-hand-pointer"></i> Omba Huduma
          </div>
          <div id="requestPanelContainer" style="margin-top:1rem;">
            ${showRequestPanel ? renderServiceRequestForm(services) : `<div class="card"><p class="text-center">Bonyeza "Omba Huduma" kuwasilisha ombi.</p></div>`}
          </div>
          <div class="card" style="margin-top:1rem;">
            <h3>Maombi yangu</h3>
            ${myRequests.length === 0 ? '<p>Hakuna maombi bado.</p>' : myRequests.map(req => `
              <div style="border-left:4px solid #f4b942; margin-bottom:0.8rem; padding:0.5rem;">
                <strong>${req.serviceName}</strong><br>
                ${req.animalType ? `<span>Mnyama: ${req.animalType}</span><br>` : ''}
                <small>${req.notes || ''}</small><br>
                <span class="${req.status === 'completed' ? 'status-completed' : 'status-pending'}">${req.status === 'completed' ? 'Imekamilika' : 'Inasubiri'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <footer>Wasiliana: +255 712 345 678 | Dk. Mathias</footer>
    </div>
  `;
}

function renderServiceRequestForm(services) {
    return `
    <div class="request-panel">
      <h3>Chagua huduma</h3>
      <div class="service-buttons">
        ${services.map(s => `
          <button class="service-request-btn" data-service-id="${s.id}" data-service-name="${s.name}">
            <i class="fas fa-stethoscope"></i> ${s.name}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

async function renderAdminDashboard() {
    const services = await fetchServices();
    const allRequests = await fetchRequests();
    return `
    <div class="app-container">
      <div class="vet-header">
        <div class="logo"><h1>Admin Panel - Dr. Mathias</h1></div>
        <button class="logout-btn" id="logoutBtn">Toka</button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem;">
        <div class="card">
          <div class="flex-between"><h3>Huduma (Services)</h3><button id="addServiceBtn" class="btn-primary" style="width:auto; padding:0.3rem 1rem;">+ Ongeza</button></div>
          <div id="servicesList">
            ${services.map(s => `
              <div class="service-admin-row">
                <span><strong>${s.name}</strong></span>
                <div class="admin-actions">
                  <button class="edit-service" data-id="${s.id}"><i class="fas fa-edit"></i></button>
                  <button class="delete-service" data-id="${s.id}"><i class="fas fa-trash"></i></button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="card">
          <h3>Maombi ya Wateja</h3>
          <div id="adminRequestsList">
            ${allRequests.map(req => `
              <div class="request-admin-row" data-req-id="${req.id}">
                <div><strong>${req.clientName || req.userId}</strong><br><small>${req.serviceName}</small><br>${req.animalType ? `Mnyama: ${req.animalType}` : ''}<br><span class="${req.status === 'completed' ? 'status-completed' : 'status-pending'}">${req.status}</span></div>
                <div>
                  <button class="complete-req" data-id="${req.id}" ${req.status === 'completed' ? 'disabled' : ''}><i class="fas fa-check-circle"></i></button>
                  <button class="delete-req" data-id="${req.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <footer>Meneja anaweza kuongeza, kuhariri au kufuta huduma.</footer>
    </div>
  `;
}

// ----- MODAL for new request -----
function showRequestModal(serviceId, serviceName) {
    const animalTypes = ["Ng'ombe", "Mbuzi", "Kondoo", "Kuku", "Mbwa", "Paka"];
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal';
    modalDiv.innerHTML = `
      <div class="modal-content">
        <span class="close-modal" onclick="this.closest('.modal').remove()">&times;</span>
        <h3>Omba: ${serviceName}</h3>
        ${serviceName.toLowerCase().includes("chanjo") ? `
          <div class="form-group">
            <label>Aina ya mnyama</label>
            <select id="modalAnimalType">${animalTypes.map(a => `<option>${a}</option>`).join('')}</select>
          </div>
        ` : ''}
        <div class="form-group">
          <label>Maelezo (dalili, mahitaji)</label>
          <textarea id="modalNotes" rows="2"></textarea>
        </div>
        <button class="btn-primary" id="submitRequestBtn">Tuma Ombi</button>
      </div>
    `;
    document.body.appendChild(modalDiv);
    document.getElementById('submitRequestBtn').onclick = () => {
        const animal = document.getElementById('modalAnimalType')?.value || null;
        const notes = document.getElementById('modalNotes').value;
        createRequest(serviceId, animal, notes).then(() => modalDiv.remove());
    };
    modalDiv.querySelector('.close-modal').onclick = () => modalDiv.remove();
}

// ----- ATTACH EVENT LISTENERS (after rendering)-----
function attachClientEvents() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => { currentUser = null; renderApp(); });
    document.getElementById('toggleRequestPanel')?.addEventListener('click', () => {
        showRequestPanel = !showRequestPanel;
        renderApp();
    });
    document.querySelectorAll('.service-request-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sid = btn.getAttribute('data-service-id');
            const sname = btn.getAttribute('data-service-name');
            showRequestModal(sid, sname);
        });
    });
}

function attachAdminEvents() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => { currentUser = null; renderApp(); });
    document.getElementById('addServiceBtn')?.addEventListener('click', async () => {
        const name = prompt('Jina la huduma mpya:');
        if (name) await addService(name);
    });
    document.querySelectorAll('.edit-service').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            const newName = prompt('Hariri jina:');
            if (newName) await updateService(id, newName);
        });
    });
    document.querySelectorAll('.delete-service').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Futa huduma hii?')) await deleteService(btn.getAttribute('data-id'));
        });
    });
    document.querySelectorAll('.complete-req').forEach(btn => {
        btn.addEventListener('click', async () => {
            const reqId = btn.getAttribute('data-id');
            await updateRequestStatus(reqId, 'completed');
        });
    });
    document.querySelectorAll('.delete-req').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Futa ombi hili?')) await deleteRequest(btn.getAttribute('data-id'));
        });
    });
}

// ----- MAIN RENDER -----
async function renderApp() {
    const root = document.getElementById('appRoot');
    if (!currentUser) {
        root.innerHTML = renderAuth();
        // attach login/register events after DOM is ready
        document.getElementById('doLoginBtn')?.addEventListener('click', () => {
            const user = document.getElementById('loginUser').value;
            const pass = document.getElementById('loginPass').value;
            login(user, pass);
        });
        document.getElementById('doRegBtn')?.addEventListener('click', () => {
            const user = document.getElementById('regUser').value;
            const pass = document.getElementById('regPass').value;
            const full = document.getElementById('regFullname').value;
            if (!user || !pass) return alert('Jaza sehemu zote.');
            register(user, pass, full);
        });
    } else {
        if (currentUser.role === 'admin') {
            root.innerHTML = await renderAdminDashboard();
            attachAdminEvents();
        } else {
            root.innerHTML = await renderClientDashboard();
            attachClientEvents();
        }
    }
}

// Check if user already has a session
function checkSession() {
    fetch(API_BASE + 'auth.php?action=session', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.user) currentUser = data.user;
            renderApp();
        })
        .catch(() => renderApp());
}

checkSession();