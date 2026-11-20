// Leonida Platinum — the GTA 6 trophy guide & tracker.
// Plain ES module, no build step, no network: it reads data/trophies.json from its own
// folder, saves progress in this browser's localStorage, and nothing leaves the machine.

const DATA_URL = 'data/trophies.json';
const LS_EARNED = 'leonida-platinum-earned-v1';
const LS_SPOILERS = 'leonida-platinum-spoilers-v1';
const EXOPHASE_URL = 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/';
const PSN_URL = 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi';

const KIND_LABELS = {
  story: 'Story',
  side: 'Side characters',
  activities: 'Activities',
  collectibles: 'Collectibles',
  combat: 'Combat & heists',
  misc: 'Odd jobs',
  meta: 'Meta',
};

const STAGES = [
  {
    n: 1,
    title: 'Play the story',
    note: 'Chapters 1 to 4, the opening mission and the final mission, plus the named story missions. Story trophies cannot be missed — they unlock as you play, so just finish the chapters in order.',
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    n: 2,
    title: 'Side characters & strangers',
    note: 'Each side character has a mission strand — play it to its final mission. Strangers & Freaks wants eight stranger strands finished across Leonida.',
    ids: [22, 23, 24, 25, 26, 27],
  },
  {
    n: 3,
    title: 'Activities & challenges',
    note: 'Try every activity once, then work the counters: 250 stunts, 42 shooting-range golds, 14 drone race wins, 20 race wins, 18 meditation spots and 50 challenges.',
    ids: [15, 16, 17, 18, 19, 20, 21, 28, 29, 32, 46],
  },
  {
    n: 4,
    title: 'Collectibles & exploration',
    note: 'Three card sets, 100 WAiNK It tags, 100 vehicles, all 52 areas of Leonida, eight garages and ten Scooter Bros registrations. Nothing here is missable — collectibles stay where they are.',
    ids: [30, 31, 35, 42, 54, 55],
  },
  {
    n: 5,
    title: 'Combat & heists',
    note: 'The partner trophies and the robberies. Do the possibly-missable ones when the chance comes — the partner trophies need your partner beside you — then grind the vaults, the armored truck and the nine gangs.',
    ids: [33, 34, 36, 37, 38, 39, 40, 41, 43],
  },
  {
    n: 6,
    title: 'Cleanup & the platinum',
    note: 'The odd jobs — spending, laundering, the strange ones — then 100% completion for the gold, and the platinum follows on its own.',
    ids: [44, 45, 47, 48, 49, 50, 51, 52, 53, 14, 1],
  },
];

const $ = (id) => document.getElementById(id);
const byId = new Map();
let trophies = [];
let earned = new Set();
let spoilers = false;

function loadSaved() {
  try { earned = new Set(JSON.parse(localStorage.getItem(LS_EARNED) ?? '[]')); } catch { earned = new Set(); }
  spoilers = localStorage.getItem(LS_SPOILERS) === '1';
}
function saveEarned() { localStorage.setItem(LS_EARNED, JSON.stringify([...earned].sort((a, b) => a - b))); }
function saveSpoilers() { localStorage.setItem(LS_SPOILERS, spoilers ? '1' : '0'); }

function isHidden(t) { return spoilers && t.kind === 'story' && !earned.has(t.id); }
function medalLetter(grade) { return { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' }[grade] ?? '?'; }
function gradeLabel(grade) { return grade[0].toUpperCase() + grade.slice(1); }

function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/');
  const view = ['checklist', 'roadmap', 'missables', 'about'].includes(parts[0]) ? parts[0] : 'checklist';
  const selected = parts[0] === 'trophy' && byId.has(Number(parts[1])) ? Number(parts[1]) : null;
  return { view, selected };
}
function go(view, selected = null) {
  location.hash = selected ? `#/trophy/${selected}` : `#/${view}`;
}

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  $('earnedCount').textContent = n;
  $('progressBar').style.width = total ? `${(n / total) * 100}%` : '0';
  $('progressText').textContent = n === total
    ? 'All 55 earned — Leonida Legend.'
    : `${n} earned — the platinum is ${total - n} away.`;
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const of = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    return `${gradeLabel(g)} ${got}/${of}`;
  });
  $('gradeBreakdown').textContent = parts.join(' · ');
  const next = STAGES.flatMap((s) => s.ids).map((id) => byId.get(id)).find((t) => t && !earned.has(t.id));
  $('nextUp').innerHTML = next
    ? `Next up: <b>${escapeHtml(next.name)}</b> — ${escapeHtml(next.description)}`
    : 'Nothing left — the platinum is yours.';
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function trophyRow(t, selectedId) {
  const hidden = isHidden(t);
  const row = document.createElement('article');
  row.className = 'trophy-row' + (earned.has(t.id) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Earned: ${hidden ? 'hidden story trophy' : t.name}`);
  box.addEventListener('click', (e) => e.stopPropagation());
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    saveEarned();
    render();
  });
  const medal = document.createElement('span');
  medal.className = `medal ${t.grade}`;
  medal.textContent = hidden ? '?' : medalLetter(t.grade);
  const body = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'trophy-name';
  name.innerHTML = hidden
    ? `Hidden story trophy <span class="hidden-note">(earn it, or turn spoilers off, to see it)</span>`
    : escapeHtml(t.name);
  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  desc.textContent = hidden ? 'A story trophy — its name and description stay hidden until earned.' : t.description;
  body.append(name, desc);
  if (!hidden) {
    const tags = document.createElement('div');
    tags.className = 'trophy-tags';
    const g = document.createElement('span');
    g.className = `tag grade-${t.grade}`;
    g.textContent = gradeLabel(t.grade);
    tags.append(g);
    const k = document.createElement('span');
    k.className = 'tag';
    k.textContent = KIND_LABELS[t.kind] ?? t.kind;
    tags.append(k);
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'tag missable';
      m.textContent = 'Possibly missable';
      tags.append(m);
    }
    if (earned.has(t.id)) {
      const e = document.createElement('span');
      e.className = 'tag earned-tag';
      e.textContent = 'Earned';
      tags.append(e);
    }
    body.append(tags);
  }
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'row-guide-btn';
  btn.textContent = 'Guide';
  btn.addEventListener('click', (e) => { e.stopPropagation(); go('checklist', t.id); });
  row.append(box, medal, body, btn);
  row.addEventListener('click', () => go('checklist', t.id));
  return row;
}

function renderKindRow() {
  const row = $('kindRow');
  row.replaceChildren();
  const kinds = [['all', 'All'], ...Object.entries(KIND_LABELS), ['missable', 'Missable']];
  for (const [key, label] of kinds) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.kind = key;
    b.className = state.kind === key ? 'active' : '';
    const count = key === 'all' ? trophies.length
      : key === 'missable' ? trophies.filter((t) => t.missable).length
      : trophies.filter((t) => t.kind === key).length;
    b.innerHTML = `${escapeHtml(label)} <span class="n">${count}</span>`;
    b.addEventListener('click', () => { state.kind = key; render(); });
    row.append(b);
  }
}

const state = { kind: 'all', grade: 'all', search: '', hideEarned: false };

function renderChecklist(selectedId) {
  renderKindRow();
  $('gradeFilter').value = state.grade;
  $('search').value = state.search;
  $('spoilerToggle').checked = spoilers;
  $('hideEarned').checked = state.hideEarned;
  const q = state.search.trim().toLowerCase();
  const list = $('list');
  list.replaceChildren();
  const shown = trophies.filter((t) => {
    if (state.kind === 'missable') { if (!t.missable) return false; }
    else if (state.kind !== 'all' && t.kind !== state.kind) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.hideEarned && earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
  if (!shown.length) {
    const p = document.createElement('p');
    p.className = 'list-empty';
    p.textContent = 'Nothing matches those filters — try clearing the search or a filter.';
    list.append(p);
  }
  for (const t of shown) list.append(trophyRow(t, selectedId));
  renderDetail(selectedId);
}

function renderDetail(selectedId) {
  const pane = $('detail');
  pane.replaceChildren();
  const t = selectedId ? byId.get(selectedId) : null;
  if (!t) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Select a trophy to see its guide — what to do, where, and whether it can be missed, with its sources.';
    pane.append(p);
    return;
  }
  const hidden = isHidden(t);
  const h = document.createElement('h2');
  h.textContent = hidden ? 'Hidden story trophy' : t.name;
  pane.append(h);
  const desc = document.createElement('p');
  desc.className = 'official-desc';
  desc.textContent = hidden ? 'Hidden until earned.' : `“${t.description}” — ${gradeLabel(t.grade)}`;
  pane.append(desc);
  if (hidden) {
    const p = document.createElement('p');
    p.textContent = 'This is a story trophy, so its name and description stay hidden while spoilers are on. Earn it in the game, or turn “Hide story spoilers” off, to read its guide.';
    pane.append(p);
  } else {
    if (t.missable) {
      const box = document.createElement('p');
      box.className = 'missable-box';
      box.innerHTML = `<b>Possibly missable.</b> ${escapeHtml(t.missable_note ?? '')}`;
      pane.append(box);
    }
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = t.guide;
    pane.append(guide);
    const h3 = document.createElement('h3');
    h3.textContent = 'Sources';
    const ul = document.createElement('ul');
    ul.className = 'sources';
    const li1 = document.createElement('li');
    li1.innerHTML = `Official name, description and grade — the official list on <a href="${EXOPHASE_URL}" target="_blank" rel="noopener">Exophase</a>.`;
    ul.append(li1);
    if (t.psn_count != null) {
      const li2 = document.createElement('li');
      const target = typeof t.psn_count === 'number' && t.psn_count >= 1000
        ? `$${t.psn_count.toLocaleString('en-US')}`
        : String(t.psn_count);
      li2.innerHTML = `PlayStation's target (${escapeHtml(target)}) — <a href="${PSN_URL}" target="_blank" rel="noopener">PSNProfiles</a>.`;
      ul.append(li2);
    }
    const li3 = document.createElement('li');
    li3.textContent = 'Guide — our own advice from the official description, not yet checked in the game.';
    ul.append(li3);
    pane.append(h3, ul);
    if (t.steps && t.steps.length) {
      const h3s = document.createElement('h3');
      h3s.textContent = 'Steps';
      const ol = document.createElement('ol');
      for (const s of t.steps) {
        const li = document.createElement('li');
        li.textContent = s;
        ol.append(li);
      }
      pane.append(h3s, ol);
    }
  }
  const earnRow = document.createElement('label');
  earnRow.className = 'earn-row';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    saveEarned();
    render();
  });
  earnRow.append(box, document.createTextNode(earned.has(t.id) ? 'Earned — ticked off.' : 'Mark as earned'));
  pane.append(earnRow);
  const pager = document.createElement('div');
  pager.className = 'pager';
  const idx = trophies.findIndex((x) => x.id === t.id);
  const prev = trophies[idx - 1];
  const next = trophies[idx + 1];
  const prevA = document.createElement('a');
  prevA.href = prev ? `#/trophy/${prev.id}` : '#/checklist';
  prevA.textContent = prev ? `← ${prev.name}` : '← Checklist';
  const nextA = document.createElement('a');
  nextA.href = next ? `#/trophy/${next.id}` : '#/checklist';
  nextA.textContent = next ? `${next.name} →` : 'Checklist →';
  pager.append(prevA, nextA);
  pane.append(pager);
}

function renderRoadmap() {
  const wrap = $('roadmap');
  wrap.replaceChildren();
  for (const stage of STAGES) {
    const card = document.createElement('section');
    card.className = 'stage';
    const head = document.createElement('div');
    head.className = 'stage-head';
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = stage.n;
    const h = document.createElement('h2');
    h.textContent = stage.title;
    const count = document.createElement('span');
    count.className = 'stage-count';
    const got = stage.ids.filter((id) => earned.has(id)).length;
    count.textContent = `${got} / ${stage.ids.length} earned`;
    head.append(num, h, count);
    const note = document.createElement('p');
    note.className = 'note';
    note.textContent = stage.note;
    const ul = document.createElement('ul');
    for (const id of stage.ids) {
      const t = byId.get(id);
      if (!t) continue;
      const li = document.createElement('li');
      if (earned.has(id)) li.className = 'done';
      const tick = document.createElement('span');
      tick.className = 'tick';
      tick.textContent = earned.has(id) ? '✓' : '○';
      const label = document.createElement('a');
      label.href = `#/trophy/${id}`;
      label.textContent = isHidden(t) ? 'Hidden story trophy' : `${t.name} (${gradeLabel(t.grade)})`;
      if (t.missable && !isHidden(t)) {
        const m = document.createElement('span');
        m.className = 'tag missable';
        m.textContent = 'Possibly missable';
        li.append(tick, label, m);
      } else {
        li.append(tick, label);
      }
      ul.append(li);
    }
    card.append(head, note, ul);
    wrap.append(card);
  }
}

function renderMissables() {
  const wrap = $('missables');
  wrap.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    const card = document.createElement('article');
    card.className = 'missable-card';
    const h = document.createElement('h2');
    const a = document.createElement('a');
    a.href = `#/trophy/${t.id}`;
    a.textContent = t.name;
    h.append(a);
    const why = document.createElement('p');
    why.className = 'why';
    why.innerHTML = `<b>Why it may be missed:</b> ${escapeHtml(t.missable_note ?? '')}`;
    const desc = document.createElement('p');
    desc.textContent = `Official description: “${t.description}”`;
    const guide = document.createElement('p');
    guide.textContent = t.guide;
    card.append(h, why, desc, guide);
    wrap.append(card);
  }
}

function exportProgress() {
  const payload = {
    app: 'leonida-platinum',
    version: 1,
    exported_at: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-platinum-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function importProgress(file) {
  if (!file) return;
  let data;
  try { data = JSON.parse(await file.text()); } catch { alert('That file is not valid JSON.'); return; }
  let ids = [];
  if (Array.isArray(data)) {
    // A plain list of trophy names (the starter's format) or ids.
    ids = data.map((x) => typeof x === 'number' ? x : trophies.find((t) => t.name === x)?.id).filter((x) => x != null);
  } else if (Array.isArray(data.earned)) {
    ids = data.earned.map((x) => typeof x === 'number' ? x : trophies.find((t) => t.name === x)?.id).filter((x) => x != null);
  }
  if (!ids.length) { alert('No trophies in that file matched this guide.'); return; }
  earned = new Set(ids.filter((id) => byId.has(id)));
  saveEarned();
  render();
}

function render() {
  const { view, selected } = route();
  for (const v of ['checklist', 'roadmap', 'missables', 'about']) {
    $(`view-${v}`).hidden = v !== view;
    document.querySelector(`#tabs a[data-view="${v}"]`).classList.toggle('active', v === view);
  }
  renderProgress();
  if (view === 'checklist') renderChecklist(selected);
  if (view === 'roadmap') renderRoadmap();
  if (view === 'missables') renderMissables();
}

async function boot() {
  loadSaved();
  const res = await fetch(DATA_URL);
  const doc = await res.json();
  trophies = doc.trophies;
  for (const t of trophies) byId.set(t.id, t);
  $('gradeFilter').addEventListener('change', (e) => { state.grade = e.target.value; render(); });
  $('search').addEventListener('input', (e) => { state.search = e.target.value; renderChecklist(route().selected); renderProgress(); });
  $('spoilerToggle').addEventListener('change', (e) => { spoilers = e.target.checked; saveSpoilers(); render(); });
  $('hideEarned').addEventListener('change', (e) => { state.hideEarned = e.target.checked; render(); });
  $('exportBtn').addEventListener('click', exportProgress);
  $('exportBtn2').addEventListener('click', exportProgress);
  $('importFile').addEventListener('change', (e) => { importProgress(e.target.files[0]); e.target.value = ''; });
  $('importFile2').addEventListener('change', (e) => { importProgress(e.target.files[0]); e.target.value = ''; });
  $('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies? This cannot be undone.')) {
      earned = new Set();
      saveEarned();
      render();
    }
  });
  window.addEventListener('hashchange', render);
  render();
}

boot();
