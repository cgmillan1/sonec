{
const S = SONEC, t = S.t, esc = S.esc, money = S.money, fdate = S.fdate, $ = q => document.querySelector(q), app = $('#app');
const tok = new URLSearchParams(location.search).get('p') || '';
let b = null, contact = {}, state = 'loading', tab = 'overview', mf = 'all', sending = false;
let myName = ''; try { myName = localStorage.getItem('sonec-name') || ''; } catch (_) {}
S.setLang(S.L);
const keepName = v => { myName = v; try { localStorage.setItem('sonec-name', v); } catch (_) {} };

function shell(inner) { return S.header() + inner; }
function message(txt, retry) { return shell(`<div class="center"><div class="box">${S.MARK('l')}<p class="sub" style="font-size:18px;margin-top:16px">${esc(txt)}</p>${retry ? `<button class="primary" data-reload>${t('retry')}</button>` : ''}</div></div>`); }

function page() {
  const p = b.project, c = S.calc(b), C = 2 * Math.PI * 80, pend = b.change_orders.filter(x => x.status === 'pending').length;
  const secs = { overview, estimate, pays, changes, materials, steps, updates, messages, ...(b.documents && b.documents.length ? { docs } : {}) };
  return shell(`<section class="hero"><div class="wrap"><div><div class="who">${esc(p.client_name)}</div><h1>${esc(p.title)}</h1>
  <div class="meta"><span>${esc(p.address)}</span>${p.start_date ? `<span>${t('start')}: ${fdate(p.start_date)}</span>` : ''}${p.end_date ? `<span>${t('end')}: ${fdate(p.end_date)}</span>` : ''}</div><span class="chip">${t('st_' + p.status)}</span></div>
  <div class="ring" role="img" aria-label="${c.pct}% ${t('done')}"><svg viewBox="0 0 190 190"><defs><linearGradient id="rg"><stop offset="0" stop-color="#c9682e"/><stop offset="1" stop-color="#f3a26a"/></linearGradient></defs><circle cx="95" cy="95" r="80" fill="none" stroke="#2a2a2e" stroke-width="14"/><circle cx="95" cy="95" r="80" fill="none" stroke="url(#rg)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - c.pct / 100)}"/></svg><div><b>${c.pct}%</b><small>${t('done')}</small></div></div></div></section>
  <nav class="tabs"><div class="wrap">${Object.keys(secs).map(k => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${t(k)}${k === 'changes' && pend ? `<span class="badge">${pend}</span>` : ''}</button>`).join('')}</div></nav>
  <main tabindex="-1"><div class="wrap">${secs[tab](c)}</div></main><footer><div>© ${esc(contact.company || 'Grupo Sonec')}</div><button data-reload>${t('refresh')}</button></footer>`);
}
function overview(c) {
  const nx = b.steps.find(s => !s.done), u = b.updates[0], pend = b.change_orders.filter(x => x.status === 'pending');
  return `${pend.length ? `<div class="card" style="border-color:var(--cu)"><h2>${t('co_pending')}</h2><p class="sub">${pend.map(x => esc(x.title) + ' · ' + money(x.amount)).join('<br>')}</p><button class="primary" data-tab="changes">${t('changes')}</button></div>` : ''}
  <div class="kpis"><div class="kpi"><small>${t('total')}</small><b>${money(c.tot)}</b></div><div class="kpi pos"><small>${t('paidSoFar')}</small><b>${money(c.paid)}</b></div><div class="kpi"><small>${t('remaining')}</small><b>${money(c.bal)}</b></div><div class="kpi"><small>${t('materials')}</small><b>${c.mb} / ${b.materials.length}</b></div></div>
  <div class="cols"><div class="card"><h2>${t('next')}</h2>${nx ? `<p class="sub">${esc(nx.title)}${nx.due_date ? ' · ' + fdate(nx.due_date) : ''}</p>` : `<p class="sub">${t('st_done')}</p>`}<div class="bar"><i style="width:${c.pct}%"></i></div><small class="sub">${c.sd} / ${b.steps.length} ${t('steps').toLowerCase()}</small></div>
  <div class="card"><h2>${t('updates')}</h2>${u ? `<div class="upd"><small>${fdate(u.created_at)}</small><p>${esc(u.body)}</p></div>${S.photos((u.photos || []).slice(0, 4))}` : `<p class="sub">${t('none')}</p>`}</div></div>${contactCard()}`;
}
function contactCard() { const k = contact; return `<div class="card"><h2>${t('contact')}</h2><div class="contact">${k.name ? `<b>${esc(k.name)}</b>` : ''}${k.phone ? `<a href="tel:${esc(k.phone)}">${esc(k.phone)}</a>` : ''}${k.email ? `<a href="mailto:${esc(k.email)}">${esc(k.email)}</a>` : ''}<button class="btn2" data-tab="messages">${t('messages')}</button></div></div>`; }
function estimate(c) {
  const grp = (k, lab, st) => { const rows = b.items.filter(i => (i.kind === 'lab') === (k === 'lab'));
    return `<h3 style="font-size:20px;margin:18px 0 6px">${lab}</h3><div class="scroll"><table class="stack"><thead><tr><th>${t('desc')}</th><th class="n">${t('qty')}</th><th class="n">${t('price')}</th><th class="n">${t('amount')}</th></tr></thead><tbody>${rows.map(i => `<tr><td>${esc(i.description)}</td><td class="n">${esc(i.qty)}</td><td class="n">${money(i.price)}</td><td class="n">${money(c.lt(i))}</td></tr>`).join('') || `<tr><td>${t('none')}</td></tr>`}</tbody></table></div>`; };
  return `<div class="kpis"><div class="kpi"><small>${t('materials')}</small><b>${money(c.subM)}</b></div><div class="kpi"><small>${t('labor')}</small><b>${money(c.subL)}</b></div><div class="kpi"><small>${t('total')}</small><b>${money(c.tot)}</b></div></div>
  <div class="card"><div class="secthead" style="margin:0"><h2 style="margin-inline-end:auto">${t('estimate')}</h2><button class="btn2" data-doc="estimate">${t('dlEstimate')}</button></div><p class="sub">${t('estSub')}</p>${grp('mat', t('materials'))}${grp('lab', t('labor'))}
  ${c.coOk.length ? `<h3 style="font-size:20px;margin:18px 0 6px">${t('changes')}</h3><table><tbody>${c.coOk.map(x => `<tr><td>${esc(x.title)} (${x.kind === 'lab' ? t('labor') : t('materials')})</td><td class="n">${money(x.amount)}</td></tr>`).join('')}</tbody></table>` : ''}
  <table style="margin-top:14px"><tfoot><tr><td>${t('materials')}</td><td class="n">${money(c.subM)}</td></tr><tr><td>${t('labor')}</td><td class="n">${money(c.subL)}</td></tr><tr><td>${t('taxMat')} (${esc(b.project.tax_rate)}%)</td><td class="n">${money(c.tax)}</td></tr><tr class="tot"><td>${t('total')}</td><td class="n">${money(c.tot)}</td></tr></tfoot></table></div>`;
}
function pays(c) {
  const pc = c.tot ? Math.min(100, c.paid / c.tot * 100) : 0;
  return `<div class="card"><h2>${t('pays')}</h2><p class="sub">${t('paySub')}</p>
  <div class="kpis" style="margin:0"><div class="kpi pos"><small>${t('paidSoFar')}</small><b>${money(c.paid)}</b></div><div class="kpi"><small>${t('remaining')}</small><b>${money(c.bal)}</b></div><div class="kpi"><small>${t('total')}</small><b>${money(c.tot)}</b></div></div>
  <div class="bar" style="height:16px;margin-top:16px"><i style="width:${pc}%;background:var(--ok)"></i></div><p class="sub">${Math.round(pc)}% ${t('paidPct')}</p></div>
  ${c.ms.length ? `<div class="card"><h2>${t('schedule')}</h2>${c.ms.map(m => `<div class="ms"><span class="dot ${m.st === 'paid' ? 'y' : ''}">✓</span><div><b>${esc(m.label)}</b><small>${m.st === 'next' && m.covered ? money(m.covered) + ' ' + t('coveredOf') + ' ' + money(m.amount) : ''}</small><span class="pill ${m.st}" style="margin-top:4px">${t('ms_' + m.st)}</span></div><span class="n">${money(m.amount)}</span></div>`).join('')}</div>` : ''}
  <div class="card"><h2>${t('history')}</h2>${b.payments.length ? `<table><thead><tr><th>${t('date')}</th><th>${t('note')}</th><th class="n">${t('amt')}</th></tr></thead><tbody>${b.payments.map(x => `<tr><td style="white-space:nowrap">${fdate(x.paid_on)}</td><td>${esc(x.note)}</td><td class="n">${money(x.amount)}</td></tr>`).join('')}</tbody><tfoot><tr class="tot"><td colspan="2">${t('paidSoFar')}</td><td class="n">${money(c.paid)}</td></tr><tr><td colspan="2"><b>${t('remaining')}</b></td><td class="n"><b>${money(c.bal)}</b></td></tr></tfoot></table>` : `<p class="sub">${t('none')}</p>`}</div>`;
}
function changes() {
  return `<div class="card"><h2>${t('changes')}</h2><p class="sub">${t('changesSub')}</p>${b.change_orders.map(x => `<div class="co"><div class="top2"><b>${esc(x.title)}</b><b class="amt">${money(x.amount)}</b></div>
  <small class="sub">${x.kind === 'lab' ? t('labor') : t('materials')} · ${fdate(x.created_at)}</small>${x.details ? `<p style="margin:6px 0 0">${esc(x.details)}</p>` : ''}
  <div class="acts">${x.status === 'pending' ? `<input data-namefor="${x.id}" value="${esc(myName)}" placeholder="${t('yourName')}" aria-label="${t('yourName')}"><button class="primary" data-decide="${x.id}" data-ok="1">${t('approve')}</button><button class="no" data-decide="${x.id}" data-ok="0">${t('decline')}</button>` : `<span class="pill ${x.status}">${t('co_' + x.status)}</span>${x.decided_by ? `<small class="sub" style="margin:0">${t('by')} ${esc(x.decided_by)} · ${fdate(x.decided_at)}</small>` : ''}`}</div></div>`).join('') || `<p class="sub">${t('none')}</p>`}</div>`;
}
function materials(c) {
  const list = b.materials.filter(m => mf === 'all' || (mf === 'b') === !!m.purchased);
  return `<div class="card"><h2>${t('materials')}</h2><p class="sub">${t('matSub')}</p><div class="bar"><i style="width:${b.materials.length ? c.mb / b.materials.length * 100 : 0}%"></i></div><p class="sub">${c.mb} / ${b.materials.length} ${t('purchased').toLowerCase()}</p>
  <div class="filters">${[['all', 'all'], ['p', 'pending'], ['b', 'purchased']].map(([k, l]) => `<button data-mf="${k}" class="${mf === k ? 'on' : ''}">${t(l)}</button>`).join('')}</div>
  ${list.map(m => `<div class="mat"><span class="dot ${m.purchased ? 'y' : ''}">✓</span><div><b>${esc(m.name)}</b><small>${esc(m.qty)} ${esc(m.unit)}</small></div><small class="n" style="color:${m.purchased ? 'var(--ok)' : 'var(--mute)'};font-weight:600">${m.purchased ? t('purchased') + (m.purchased_on ? ' · ' + fdate(m.purchased_on) : '') : t('pending')}</small></div>`).join('') || `<p class="sub">${t('none')}</p>`}</div>`;
}
function steps() {
  const d = b.steps.filter(s => s.done), n = b.steps.filter(s => !s.done);
  const li = (s, i) => `<li><span class="dot ${s.done ? 'y' : ''}">${s.done ? '✓' : i}</span><b>${esc(s.title)}</b><small>${fdate(s.due_date)}</small></li>`;
  return `<div class="cols"><div class="card"><h2>${t('taken')}</h2><p class="sub">${d.length}</p><ol class="tl">${d.map(li).join('') || `<p class="sub">${t('none')}</p>`}</ol></div>
  <div class="card"><h2>${t('next')}</h2><p class="sub">${n.length}</p><ol class="tl todo">${n.map((s, i) => li(s, i + 1)).join('') || `<p class="sub">${t('none')}</p>`}</ol></div></div>`;
}
function docs() { return `<div class="card"><h2>${t('docs')}</h2><p class="sub">${t('docsClient')}</p>${b.documents.map(x => `<div class="co"><div class="top2"><b>${t('doc_' + x.kind)}</b><b class="amt">${money(x.total)}</b></div><small class="sub">${fdate(x.created_at)} · ${t('ds_' + x.status)}${x.signed_by ? ' · ' + esc(x.signed_by) : ''}</small><div class="acts"><button class="btn2" data-dl="${x.id}">${t('download')}</button></div></div>`).join('')}</div>`; }
function updates() { return `<div class="card"><h2>${t('updates')}</h2><p class="sub">${t('updSub')}</p>${b.updates.map(u => `<div class="upd" style="margin-bottom:22px"><small>${fdate(u.created_at)}</small>${u.body ? `<p>${esc(u.body)}</p>` : ''}${S.photos(u.photos)}</div>`).join('') || `<p class="sub">${t('none')}</p>`}</div>`; }
function messages() {
  const who = contact.name || 'Sonec';
  return `<div class="card"><h2>${t('messages')}</h2><p class="sub">${t('msgSub')}</p><div class="chat" id="chat">${b.comments.map(m => `<div class="bub ${m.author === 'client' ? 'me' : ''}"><small>${esc(m.author === 'client' ? (m.name || t('you')) : (m.name || who))} · ${fdate(m.created_at)}</small><p>${esc(m.body)}</p></div>`).join('')}</div>
  <form class="sendrow" id="msgf"><input id="mn" value="${esc(myName)}" placeholder="${t('yourName')}" aria-label="${t('yourName')}" style="flex:1 1 100%"><textarea id="mb" rows="2" placeholder="${t('writeMsg')}" aria-label="${t('writeMsg')}"></textarea><button class="primary" type="submit"${sending ? ' disabled' : ''}>${t('send')}</button></form></div>`;
}

function render() {
  document.title = 'Sonec · ' + (b ? b.project.title : (S.L === 'es' ? 'Mi Proyecto' : 'My Project'));
  const y = scrollY;
  app.innerHTML = state === 'ok' ? page() : state === 'nolink' ? message(t('noLink')) : state === 'missing' ? message(t('notFound')) : state === 'error' ? message(t('error'), true) : message(t('loading'));
  scrollTo(0, y); const ch = $('#chat'); if (ch) ch.scrollTop = ch.scrollHeight;
}
async function load() {
  if (!tok) { state = 'nolink'; return render(); }
  if (!API.ready) { state = 'error'; return render(); }
  try {
    const d = await API.clientProject(tok);
    if (!d) { state = 'missing'; return render(); }
    contact = d.contact || {}; b = { project: d.project, items: d.items, materials: d.materials, steps: d.steps, updates: d.updates, payments: d.payments, milestones: d.milestones, change_orders: d.change_orders, comments: d.comments, documents: d.documents || [] };
    state = 'ok';
  } catch (e) { console.error(e); if (state !== 'ok') state = 'error'; }
  render();
}

app.addEventListener('click', async e => {
  const x = e.target.closest('button'); if (!x || (x.type === 'submit' && x.form)) return; const d = x.dataset;
  if (d.lang) { S.setLang(d.lang); render(); }
  else if (d.tab) { tab = d.tab; render(); $('.tabs')?.scrollIntoView({ block: 'start' }); }
  else if (d.mf) { mf = d.mf; render(); }
  else if ('reload' in d) { state = b ? 'ok' : 'loading'; render(); load(); }
  else if ('print' in d) S.printEstimate(b, contact);
  else if (d.doc === 'estimate') { try { await S.docs.download('estimate', S.docs.snapshot(b, contact, S.L)); } catch (er) { console.error(er); S.toast(t('error')); } }
  else if (d.dl) { const x = b.documents.find(y => y.id === d.dl); try { await S.docs.download(x.kind, x.snapshot); } catch (er) { console.error(er); S.toast(t('error')); } }
  else if (d.photo) S.lightbox(d.photo);
  else if (d.decide) {
    const inp = document.querySelector(`[data-namefor="${d.decide}"]`), who = inp.value.trim();
    if (!who) { S.toast(t('nameNeeded')); return inp.focus(); }
    keepName(who); x.disabled = true;
    try { await API.clientDecide(tok, d.decide, d.ok === '1', who); await load(); S.toast(d.ok === '1' ? t('co_approved') : t('co_declined')); }
    catch (er) { console.error(er); x.disabled = false; S.toast(t('error')); }
  }
});
app.addEventListener('submit', async e => {
  e.preventDefault(); if (e.target.id !== 'msgf') return;
  const who = $('#mn').value.trim(), msg = $('#mb').value.trim();
  if (!who) { S.toast(t('nameNeeded')); return $('#mn').focus(); }
  if (!msg) return $('#mb').focus();
  if (sending) return; keepName(who); sending = true; render();
  let failed = false;
  try { await API.clientComment(tok, who, msg); await load(); } catch (er) { console.error(er); failed = true; S.toast(/too many/i.test(er.message || '') ? t('tooMany') : t('error')); }
  sending = false; render(); if (failed && $('#mb')) $('#mb').value = msg;
});
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && state === 'ok' && !document.activeElement?.matches('input,textarea')) load(); });

render(); load(); if (tok) S.splash();
}
