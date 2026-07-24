/**
 * app.js — Main Application Bootstrap
 * Wires up navigation, search, routing UI, and initialises the map.
 */

document.addEventListener('DOMContentLoaded', async () => {

  // ── View switching ─────────────────────────────────────
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // deactivate all nav buttons
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      // hide all views (remove active and enforce hidden)
      document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.classList.add('hidden'); });

      // activate clicked button and show its view
      btn.classList.add('active');
      const target = document.getElementById(`view-${btn.dataset.view}`);
      target.classList.remove('hidden');
      target.classList.add('active');

      if (btn.dataset.view === 'map') CampusMap.draw();
    });
  });

  // ── Init subsystems ────────────────────────────────────
  CampusMap.init();
  AdminPanel.init();

  // ── Load data from backend ─────────────────────────────
  let buildings = [];
  let paths     = [];

  try {
    [buildings, paths] = await Promise.all([Api.getBuildings(), Api.getPaths()]);
  } catch {
    // Backend not running — use sample data so the map still renders
    buildings = SAMPLE_BUILDINGS;
    paths     = SAMPLE_PATHS;
  }

  CampusMap.setData(buildings, paths);
  populateRouteSelects(buildings);

  // ── Search ─────────────────────────────────────────────
  const searchInput   = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  searchInput.addEventListener('input', async () => {
    const q = searchInput.value.trim();
    if (!q) { searchResults.classList.add('hidden'); return; }

    let results;
    try { results = await Api.searchBuildings(q); }
    catch { results = buildings.filter(b =>
      b.name.toLowerCase().includes(q.toLowerCase()) ||
      (b.code && b.code.toLowerCase().includes(q.toLowerCase()))
    ); }

    if (!results.length) { searchResults.classList.add('hidden'); return; }

    searchResults.innerHTML = results.slice(0, 8).map(b => `
      <div class="search-item" data-id="${b.id}">
        <span class="search-item__name">${b.name}</span>
        <span class="search-item__cat">${b.category?.name || ''} ${b.code ? '· ' + b.code : ''}</span>
      </div>
    `).join('');
    searchResults.classList.remove('hidden');
  });

  searchResults.addEventListener('click', e => {
    const item = e.target.closest('.search-item');
    if (!item) return;
    const b = buildings.find(x => x.id == item.dataset.id);
    if (b) {
      searchInput.value = b.name;
      searchResults.classList.add('hidden');
      // Pan map to building
      document.getElementById('building-detail') && showDetail(b);
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrap')) searchResults.classList.add('hidden');
  });

  // ── Route selects ──────────────────────────────────────
  function populateRouteSelects(list) {
    const fromSel = document.getElementById('route-from');
    const toSel   = document.getElementById('route-to');
    const opts    = list.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    fromSel.innerHTML = '<option value="">— From —</option>' + opts;
    toSel.innerHTML   = '<option value="">— To —</option>'   + opts;
  }

  document.getElementById('btn-route').addEventListener('click', async () => {
    const fromId = parseInt(document.getElementById('route-from').value);
    const toId   = parseInt(document.getElementById('route-to').value);
    if (!fromId || !toId) { alert('Please select both From and To buildings.'); return; }
    if (fromId === toId)  { alert('From and To buildings must be different.'); return; }

    let result;
    try { result = await Api.getRoute(fromId, toId); }
    catch { alert('Could not reach the backend. Make sure Spring Boot is running.'); return; }

    if (!result.found) {
      alert('No path found between these buildings.');
      CampusMap.setRoute([]);
      document.getElementById('route-result').classList.add('hidden');
      return;
    }

    // Highlight route on map
    CampusMap.setRoute(result.path.map(b => b.id));

    // Show route steps
    document.getElementById('route-distance').textContent =
      `${Math.round(result.totalDistance)} m`;

    const stepsList = document.getElementById('route-steps');
    stepsList.innerHTML = result.path.map((b, i) => `
      <li class="${i === 0 || i === result.path.length - 1 ? 'route-step--active' : ''}">
        ${b.name}
      </li>
    `).join('');

    document.getElementById('route-result').classList.remove('hidden');
  });

  // ── Sample offline data ────────────────────────────────
  // Used when backend is not running (for demo/testing purposes)
});

const SAMPLE_BUILDINGS = [
  { id:1,  name:'School of Business',         code:'SB',     mapX:320, mapY:210, category:{name:'Lecture Hall'},    description:'Main business school building.' },
  { id:2,  name:'Science Block',              code:'SC',     mapX:480, mapY:160, category:{name:'Laboratory'},      description:'Physics, Chemistry and Biology labs.' },
  { id:3,  name:'University Library',         code:'LIB',    mapX:220, mapY:310, category:{name:'Library'},         description:'Main library with reading rooms.' },
  { id:4,  name:'Administration Block',       code:'ADM',    mapX:150, mapY:180, category:{name:'Administrative'},  description:'Vice Chancellor office and student affairs.' },
  { id:5,  name:'Student Centre / Cafeteria', code:'CAF',    mapX:390, mapY:360, category:{name:'Cafeteria'},       description:'Food court and student common area.' },
  { id:6,  name:'Male Dormitory A',           code:'DORM-A', mapX:560, mapY:380, category:{name:'Dormitory'},       description:'Student residence — male students.' },
  { id:7,  name:'Female Dormitory B',         code:'DORM-B', mapX:130, mapY:410, category:{name:'Dormitory'},       description:'Student residence — female students.' },
  { id:8,  name:'Sports Complex',             code:'SPT',    mapX:500, mapY:460, category:{name:'Sports Facility'}, description:'Football field, basketball courts and gym.' },
  { id:9,  name:'University Chapel',          code:'CHP',    mapX:280, mapY:140, category:{name:'Chapel/Worship'},  description:'Interdenominational worship centre.' },
  { id:10, name:'Health Centre',              code:'HC',     mapX:160, mapY:330, category:{name:'Medical'},         description:'Campus clinic and pharmacy.' },
  { id:11, name:'Engineering Block',          code:'ENG',    mapX:450, mapY:260, category:{name:'Laboratory'},      description:'Electrical and civil engineering labs.' },
  { id:12, name:'Parking Lot A',              code:'PKA',    mapX:80,  mapY:200, category:{name:'Parking'},         description:'Main visitor and staff parking.' },
];

const SAMPLE_PATHS = [
  { id:1,  from:{id:1},  to:{id:2},  distance:180 }, { id:2,  from:{id:2},  to:{id:1},  distance:180 },
  { id:3,  from:{id:1},  to:{id:3},  distance:120 }, { id:4,  from:{id:3},  to:{id:1},  distance:120 },
  { id:5,  from:{id:1},  to:{id:5},  distance:90  }, { id:6,  from:{id:5},  to:{id:1},  distance:90  },
  { id:7,  from:{id:2},  to:{id:11}, distance:100 }, { id:8,  from:{id:11}, to:{id:2},  distance:100 },
  { id:9,  from:{id:3},  to:{id:4},  distance:140 }, { id:10, from:{id:4},  to:{id:3},  distance:140 },
  { id:11, from:{id:4},  to:{id:10}, distance:80  }, { id:12, from:{id:10}, to:{id:4},  distance:80  },
  { id:13, from:{id:5},  to:{id:6},  distance:160 }, { id:14, from:{id:6},  to:{id:5},  distance:160 },
  { id:15, from:{id:5},  to:{id:7},  distance:170 }, { id:16, from:{id:7},  to:{id:5},  distance:170 },
  { id:17, from:{id:5},  to:{id:8},  distance:200 }, { id:18, from:{id:8},  to:{id:5},  distance:200 },
  { id:19, from:{id:1},  to:{id:9},  distance:110 }, { id:20, from:{id:9},  to:{id:1},  distance:110 },
  { id:21, from:{id:11}, to:{id:5},  distance:140 }, { id:22, from:{id:5},  to:{id:11}, distance:140 },
];
