/**
 * map.js — Campus Map Canvas Renderer
 * Draws buildings as nodes and paths as edges on an HTML5 canvas.
 * Supports pan, zoom, hover tooltips, click-to-detail, and route highlighting.
 */

const CampusMap = (() => {
  let canvas, ctx;
  let buildings = [];
  let paths     = [];
  let scale     = 1;
  let offsetX   = 0, offsetY = 0;
  let isDragging = false, dragStartX, dragStartY;
  let hoveredBuilding = null;
  let routeIds = [];   // building IDs in current route

  // Category colours (matched to CSS accent palette)
  const CAT_COLORS = {
    'Lecture Hall':    '#2ea043',
    'Laboratory':      '#1f6feb',
    'Administrative':  '#d29922',
    'Library':         '#8957e5',
    'Cafeteria':       '#e36209',
    'Dormitory':       '#388bfd',
    'Sports Facility': '#3fb950',
    'Chapel/Worship':  '#f0883e',
    'Medical':         '#da3633',
    'Parking':         '#6e7681',
  };

  function catColor(building) {
    const cat = building.category?.name || '';
    return CAT_COLORS[cat] || '#8b949e';
  }

  // ── Init ────────────────────────────────────────────────
  function init() {
    canvas = document.getElementById('campus-map');
    ctx    = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);

    // Pan
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup',   onMouseUp);
    canvas.addEventListener('mouseleave',() => { isDragging = false; });

    // Zoom
    canvas.addEventListener('wheel', onWheel, { passive: true });

    // Click
    canvas.addEventListener('click', onClick);

    // Toolbar buttons
    document.getElementById('btn-zoom-in') .addEventListener('click', () => zoom(1.2));
    document.getElementById('btn-zoom-out').addEventListener('click', () => zoom(0.8));
    document.getElementById('btn-reset')   .addEventListener('click', resetView);
  }

  function resize() {
    const area = canvas.parentElement;
    canvas.width  = area.clientWidth;
    canvas.height = area.clientHeight;
    draw();
  }

  // ── Data ────────────────────────────────────────────────
  function setData(b, p) {
    buildings = b;
    paths     = p;
    resetView();
  }

  function setRoute(ids) {
    routeIds = ids || [];
    draw();
  }

  // ── Coordinate mapping ──────────────────────────────────
  function worldToCanvas(wx, wy) {
    return {
      x: wx * scale + offsetX,
      y: wy * scale + offsetY,
    };
  }
  function canvasToWorld(cx, cy) {
    return {
      x: (cx - offsetX) / scale,
      y: (cy - offsetY) / scale,
    };
  }

  // ── Draw ────────────────────────────────────────────────
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background grid (subtle)
    drawGrid();

    // Paths
    drawPaths();

    // Route highlight
    drawRoute();

    // Buildings
    buildings.forEach(b => drawBuilding(b, routeIds.includes(b.id)));
  }

  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(48,54,61,0.5)';
    ctx.lineWidth   = 0.5;
    const step = 80 * scale;
    const startX = offsetX % step;
    const startY = offsetY % step;
    for (let x = startX; x < canvas.width;  x += step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = startY; y < canvas.height; y += step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    ctx.restore();
  }

  function drawPaths() {
    paths.forEach(path => {
      const from = buildings.find(b => b.id === path.from?.id);
      const to   = buildings.find(b => b.id === path.to?.id);
      if (!from || !to) return;

      const a = worldToCanvas(from.mapX, from.mapY);
      const b = worldToCanvas(to.mapX,   to.mapY);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = 'rgba(48,54,61,0.9)';
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawRoute() {
    if (routeIds.length < 2) return;
    for (let i = 0; i < routeIds.length - 1; i++) {
      const from = buildings.find(b => b.id === routeIds[i]);
      const to   = buildings.find(b => b.id === routeIds[i + 1]);
      if (!from || !to) continue;

      const a = worldToCanvas(from.mapX, from.mapY);
      const b = worldToCanvas(to.mapX,   to.mapY);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = '#2ea043';
      ctx.lineWidth   = 3 * scale;
      ctx.shadowBlur  = 8;
      ctx.shadowColor = '#2ea043';
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawBuilding(b, isOnRoute) {
    const { x, y } = worldToCanvas(b.mapX, b.mapY);
    const r = (isOnRoute ? 10 : 8) * Math.sqrt(scale);
    const color = catColor(b);
    const isHovered = hoveredBuilding?.id === b.id;

    ctx.save();

    // Glow for route nodes
    if (isOnRoute) {
      ctx.shadowBlur  = 14;
      ctx.shadowColor = color;
    }

    // Circle
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? '#fff' : color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = isHovered ? color : 'rgba(255,255,255,0.2)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    ctx.restore();

    // Label (only visible above a zoom threshold)
    if (scale > 0.7) {
      ctx.save();
      ctx.font         = `${Math.max(10, 11 * scale)}px 'Sora', sans-serif`;
      ctx.fillStyle    = 'rgba(230,237,243,0.85)';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'top';
      ctx.shadowBlur   = 4;
      ctx.shadowColor  = 'rgba(0,0,0,0.8)';
      ctx.fillText(b.code || b.name, x, y + r + 3);
      ctx.restore();
    }
  }

  // ── Interaction ─────────────────────────────────────────
  function onMouseDown(e) {
    isDragging = true;
    dragStartX = e.clientX - offsetX;
    dragStartY = e.clientY - offsetY;
    canvas.style.cursor = 'grabbing';
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    if (isDragging) {
      offsetX = e.clientX - dragStartX;
      offsetY = e.clientY - dragStartY;
      draw();
      return;
    }

    // Hover detection
    const world = canvasToWorld(cx, cy);
    const hit = buildings.find(b => {
      const dx = b.mapX - world.x;
      const dy = b.mapY - world.y;
      return Math.sqrt(dx*dx + dy*dy) < 14 / scale;
    });

    if (hit !== hoveredBuilding) {
      hoveredBuilding = hit || null;
      draw();
    }

    const tooltip = document.getElementById('tooltip');
    if (hit) {
      tooltip.textContent = hit.name;
      tooltip.style.left  = (cx + 12) + 'px';
      tooltip.style.top   = (cy - 8)  + 'px';
      tooltip.classList.remove('hidden');
      canvas.style.cursor = 'pointer';
    } else {
      tooltip.classList.add('hidden');
      canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
    }
  }

  function onMouseUp(e) {
    isDragging = false;
    canvas.style.cursor = 'grab';
  }

  function onClick(e) {
    if (!hoveredBuilding) return;
    showBuildingDetail(hoveredBuilding);
  }

  function onWheel(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 0.9;
    zoom(factor, cx, cy);
  }

  function zoom(factor, cx, cy) {
    cx = cx ?? canvas.width  / 2;
    cy = cy ?? canvas.height / 2;
    const worldX = (cx - offsetX) / scale;
    const worldY = (cy - offsetY) / scale;
    scale = Math.min(4, Math.max(0.3, scale * factor));
    offsetX = cx - worldX * scale;
    offsetY = cy - worldY * scale;
    draw();
  }

  function resetView() {
    scale   = 1;
    offsetX = canvas ? (canvas.width  - 640) / 2 : 0;
    offsetY = canvas ? (canvas.height - 520) / 2 : 0;
    draw();
  }

  // ── Building detail panel ────────────────────────────────
  function showBuildingDetail(b) {
    document.getElementById('detail-name').textContent = b.name;
    document.getElementById('detail-desc').textContent = b.description || 'No description available.';
    document.getElementById('detail-code').textContent = b.code ? `Code: ${b.code}` : '';
    document.getElementById('detail-category').textContent = b.category?.name || '';
    document.getElementById('building-detail').classList.remove('hidden');
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-close-detail')?.addEventListener('click', () => {
      document.getElementById('building-detail').classList.add('hidden');
    });
  });

  return { init, setData, setRoute, draw };
})();
