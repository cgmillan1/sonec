{
const S = SONEC, t = S.t, esc = S.esc, money = S.money, fdate = S.fdate, $ = q => document.querySelector(q), app = $('#app');
const STATUSES = ['estimate_sent', 'estimate_accepted', 'progress', 'done'];
const stOf = p => STATUSES.includes(p.status) ? p.status : (p.status === 'paused' ? 'progress' : 'estimate_sent');
let pfilter = 'all', creating = false, leads = [], lastEmail = '', view = 'boot', B = [], cur = null, ctab = 'dash', settings = {}, busy = false, err = '';
S.setLang(S.L);

/* ---------- small builders ---------- */
const fld = (tb, r, f, type = 'text', cls = '') => `<input class="${cls}" type="${type}" data-t="${tb}" data-id="${r.id ?? ''}" data-f="${f}" value="${esc(r[f] ?? '')}"${type === 'number' ? ' step="any" inputmode="decimal" min="0"' : ''} aria-label="${esc(t('f_' + f))}">`;
const sel = (tb, r, f, opts, cls = '') => `<select class="${cls}" data-t="${tb}" data-id="${r.id}" data-f="${f}" aria-label="${esc(t('f_' + f))}">${opts.map(([v, l]) => `<option value="${esc(v)}"${String(r[f]) === String(v) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
const chk = (tb, r, f, label) => `<input type="checkbox" class="chk" data-t="${tb}" data-id="${r.id}" data-f="${f}"${r[f] ? ' checked' : ''} aria-label="${esc(label)}">`;
const del = (tb, id) => `<button class="ico x" data-del="${tb}:${id}" aria-label="${t('delete')}" title="${t('delete')}">✕</button>`;
const budOpts = () => [['', t('noCat')], ...cur.budget.map(b => [b.id, b.category || '·'])];
const catName = id => cur.budget.find(b => b.id === id)?.category || t('noCat');
const pct = () => { const v = +settings.share_pct; return isFinite(v) && settings.share_pct !== null && settings.share_pct !== undefined && settings.share_pct !== '' ? v : 10; };
const shareOf = c => { const s = c.sub * pct() / 100, r = c.tot > 0 ? Math.min(1, Math.max(0, c.paid / c.tot)) : 0; return { s, earned: s * r, pending: s - s * r, after: (c.profit || 0) - s }; };
const kinds = () => [['mat', t('materials')], ['lab', t('labor')]];
const kpi = (l, v, cls = '', e = '') => `<div class="kpi ${cls}"><small>${l}</small><b>${money(v)}</b>${e ? `<em>${e}</em>` : ''}</div>`;
const showInstall = () => { try { if (localStorage.getItem('sonec-noinstall')) return false; } catch (_) {} return /iPhone|iPad|iPod/.test(navigator.userAgent) && !(navigator.standalone || matchMedia('(display-mode: standalone)').matches); };
const unseen = b => b.comments.filter(c => c.author === 'client' && !c.seen).length;
const setDot = s => { const d = $('#savedot'); if (d) d.textContent = s; };
const fail = e => { console.error(e); S.toast(/fetch|network/i.test(e.message || '') ? t('saveFail') : t('error') + ': ' + (e.message || e)); };

/* ---------- screens ---------- */
function setup() { return `<div class="lock"><div class="box">${S.MARK('l')}<h1>${t('setupT')}</h1><p>${t('setupS')}</p></div></div>`; }
function login() {
  return `<div class="lock"><form class="box" id="loginf">${S.MARK('l')}<h1>${t('loginT')}</h1><p>${t('loginS')}</p>
  <input id="em" type="email" value="${esc(lastEmail)}" autocomplete="username" placeholder="${t('email')}" aria-label="${t('email')}" style="letter-spacing:0;font-size:17px;text-align:start">
  <input id="pw" type="password" autocomplete="current-password" placeholder="${t('password')}" aria-label="${t('password')}" style="letter-spacing:0;font-size:17px;text-align:start">
  <div class="err" role="alert">${esc(err)}</div><button class="primary" type="submit"${busy ? ' disabled' : ''}>${busy ? t('loading') : t('login')}</button>
  <div style="margin-top:16px">${S.langSeg()}</div></form></div>`;
}
const topbar = () => S.header(`<span id="savedot" class="savedot" aria-live="polite"></span><button class="ghost" data-logout style="min-height:40px;padding:6px 12px">${t('logout')}</button>`, `<span class="role">${t('contractor')}</span>`);

function home() {
  const shown = B.filter(b => pfilter === 'all' || stOf(b.project) === pfilter);
  const cs = shown.map(b => S.calc(b)), sum = k => cs.reduce((a, c) => a + (c[k] || 0), 0);
  const count = s => B.filter(b => stOf(b.project) === s).length;
  const today = S.today(), lim = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
  const up = B.flatMap(b => b.steps.filter(s => !s.done && s.due_date && s.due_date <= lim).map(s => ({ ...s, pt: b.project.title, late: s.due_date < today }))).sort((a, b) => a.due_date.localeCompare(b.due_date));
  return topbar() + `<main><div class="wrap">
  <div class="secthead"><h1>${t('projects')}</h1>${creating ? '' : `<button class="primary" data-newp>${t('newProject')}</button>`}</div>
  ${creating ? `<div class="card"><h2>${t('newProjectT')}</h2><form class="form" id="newpf" style="margin-top:12px"><label class="wide">${t('ptitle')} *<input id="np-title" required maxlength="200" placeholder="${t('ptitleEx')}"></label><label>${t('clientName')}<input id="np-client" maxlength="200"></label><label>${t('status')}<select id="np-status">${STATUSES.map(s => `<option value="${s}">${t('st_' + s)}</option>`).join('')}</select></label><div class="wide" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px"><button class="primary" type="submit">${t('create')}</button><button class="btn2" type="button" data-cancelnew>${t('cancel')}</button></div></form></div>` : ''}
  ${B.length ? `<div class="filters" role="group" aria-label="${t('status')}">${['all', ...STATUSES].map(s => `<button data-pf="${s}" class="${pfilter === s ? 'on' : ''}" aria-pressed="${pfilter === s}">${s === 'all' ? t('all') : t('st_' + s)} <span class="cnt">${s === 'all' ? B.length : count(s)}</span></button>`).join('')}</div>` : ''}
  ${showInstall() ? `<div class="card" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><img src="icon-180.png" alt="" width="48" height="48" style="border-radius:11px"><div style="flex:1 1 220px"><b>${t('installT')}</b><p class="sub" style="margin:2px 0 0">${t('installS')}</p></div><button class="btn2" data-hideinstall>${t('hide')}</button></div>` : ''}
  ${B.length ? `<div class="kpis">${kpi(t('contracts'), sum('tot'))}${kpi(t('collected'), sum('paid'))}${kpi(t('receivable'), sum('bal'))}${kpi(t('spent'), sum('spent'))}${kpi(t('profit'), sum('profit'), sum('profit') < 0 ? 'neg' : 'pos', t('profitSub'))}</div>
  <div class="kpis">${(() => { const sh = cs.map(shareOf), tot = k => sh.reduce((x, y) => x + y[k], 0); return kpi(`${t('share')} ${pct()}%`, tot('s'), '', t('shareOf')) + kpi(t('shareEarned'), tot('earned'), 'pos', t('shareEarnedSub')) + kpi(t('sharePending'), tot('pending')) + kpi(t('profitAfter'), tot('after'), tot('after') < 0 ? 'neg' : ''); })()}</div>` : ''}
  ${leadsCard()}
  <div class="plist">${shown.length ? '' : (B.length ? `<p class="sub">${t('noneInStatus')}</p>` : '')}${shown.map((b, i) => { const c = cs[i], u = unseen(b); return `<button class="pcard" data-open="${b.project.id}">${u ? `<span class="badge" title="${t('unread')}">${u}</span>` : ''}
    <span class="who2">${esc(b.project.client_name || '·')}</span><h3>${esc(b.project.title || t('project'))}</h3><span class="pill st-${stOf(b.project)}">${t('st_' + stOf(b.project))}</span>
    <div class="bar"><i style="width:${c.pct}%"></i></div><small class="sub">${c.pct}% ${t('done')}</small>
    <dl><dt>${t('contract')}</dt><dd>${money(c.tot)}</dd><dt>${t('collected')}</dt><dd>${money(c.paid)}</dd><dt>${t('spent')}</dt><dd>${money(c.spent)} ${t('of')} ${money(c.bud)}</dd><dt>${t('profit')}</dt><dd style="color:${c.profit < 0 ? '#b23a26' : 'var(--ok)'}">${money(c.profit)}</dd><dt>${t('share')} ${pct()}%</dt><dd><b>${money(shareOf(c).s)}</b></dd><dt>${t('shareEarned')}</dt><dd>${money(shareOf(c).earned)}</dd></dl></button>`; }).join('')}</div>
  ${B.length ? '' : `<div class="card" style="text-align:center"><p class="sub">${t('none')}</p><button class="btn2" data-sample>${t('sampleProject')}</button></div>`}
  <div class="cols" style="margin-top:18px"><div class="card week"><h2>${t('thisWeek')}</h2>${up.length ? `<ul>${up.map(s => `<li><time style="${s.late ? 'color:#d0503a' : ''}">${fdate(s.due_date)}</time><div><b>${esc(s.title)}</b><small>${esc(s.pt)}</small></div></li>`).join('')}</ul>` : `<p class="sub">${t('noUpcoming')}</p>`}</div>
  <div class="card ed"><h2>${t('settings')}</h2><div class="grid2" style="margin-top:12px"><label>${t('company')}${fld('settings', settings, 'company')}</label><label>${t('cname')}${fld('settings', settings, 'contact_name')}</label><label>${t('phone')}${fld('settings', settings, 'phone', 'tel')}</label><label>${t('email')}${fld('settings', settings, 'email', 'email')}</label><label>${t('sharePct')}${fld('settings', { ...settings, share_pct: pct() }, 'share_pct', 'number')}</label></div><p class="hint">${t('shareHint')}</p></div></div>
  ${B.length ? `<p style="text-align:center"><button class="btn2" data-sample>${t('sampleProject')}</button></p>` : ''}
  </div></main>`;
}

function leadsCard() {
  const open = leads.filter(l => l.status === 'new' || l.status === 'contacted');
  if (!open.length) return '';
  return `<div class="card"><h2>${t('leads')} <span class="badge">${open.filter(l => l.status === 'new').length || ''}</span></h2><p class="sub">${t('leadsSub')}</p>
  ${open.map(l => { const tel = (l.phone || '').replace(/[^\d+]/g, ''), wa = tel.replace(/\D/g, '');
    return `<div class="co"><div class="top2"><b>${esc(l.name)}</b><span class="pill ${l.status === 'new' ? 'pending' : 'paid'}">${t('lead_' + l.status)}</span></div>
    <small class="sub">${fdate(l.created_at)}${l.service ? ' · ' + esc(l.service) : ''}${l.city ? ' · ' + esc(l.city) : ''} · ${l.lang === 'en' ? 'English' : 'Español'}</small>
    ${l.message ? `<p style="margin:6px 0 0;white-space:pre-wrap">${esc(l.message)}</p>` : ''}
    <div class="acts">${l.phone ? `<a class="btn2" href="tel:${esc(tel)}">${esc(l.phone)}</a><a class="btn2" href="https://wa.me/${wa.length === 10 ? '1' + wa : wa}" target="_blank" rel="noopener">WhatsApp</a>` : ''}${l.email ? `<a class="btn2" href="mailto:${esc(l.email)}">${esc(l.email)}</a>` : ''}
    <button class="primary" data-leadp="${l.id}">${t('leadToProject')}</button>${l.status === 'new' ? `<button class="btn2" data-leadst="${l.id}:contacted">${t('lead_contacted')}</button>` : ''}<button class="btn2" data-leadst="${l.id}:archived">${t('archive')}</button></div></div>`; }).join('')}</div>`;
}
function project() {
  const u = unseen(cur), p = cur.project;
  const tabs = { dash: cDash, money: cMoney, pays: cPays, changes: cChanges, progress: cProgress, materials: cMats, estimate: cEst, docs: cDocs, messages: cMsgs, project: cProj };
  return topbar() + `<nav class="cbar"><div class="wrap"><button data-home>${t('back')}</button>${Object.keys(tabs).map(k => `<button data-ctab="${k}" class="${ctab === k ? 'on' : ''}">${t(k)}${k === 'messages' && u ? `<span class="badge">${u}</span>` : ''}</button>`).join('')}</div></nav>
  <main class="ed"><div class="wrap"><div class="phead"><label class="sr" for="ptitle-top">${t('ptitle')}</label><input id="ptitle-top" class="titleinp" data-t="projects" data-id="${p.id}" data-f="title" value="${esc(p.title)}" placeholder="${t('ptitleEx')}" maxlength="200">
  <label class="stlab"><span class="sr">${t('status')}</span><select class="stsel2 st-${stOf(p)}" data-t="projects" data-id="${p.id}" data-f="status">${STATUSES.map(s => `<option value="${s}"${stOf(p) === s ? ' selected' : ''}>${t('st_' + s)}</option>`).join('')}</select></label></div>
  <p class="sub" style="margin:-4px 0 14px">${esc(p.client_name)}${p.client_name && p.address ? ' · ' : ''}${esc(p.address || '')}</p>
  ${shareBar(p)}${tabs[ctab]()}</div></main>`;
}
function buyForm() {
  return `<div class="card"><h2>${t('logBuy')}</h2><form class="form" id="buyf" style="margin-top:12px">
  <label class="wide">${t('desc')}<input id="xe-desc" type="text"></label><label>${t('amt')}<input id="xe-amt" type="number" step="any" inputmode="decimal"></label><label>${t('date')}<input id="xe-date" type="date" value="${S.today()}"></label>
  <label>${t('cat')}<select id="xe-cat">${budOpts().map(([v, l], i) => `<option value="${esc(v)}"${i === 1 ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></label><label>${t('store')}<input id="xe-store" type="text"></label>
  <label class="wide">${t('linkMat')}<select id="xe-mat"><option value="">${t('noMat')}</option>${cur.materials.filter(m => !m.purchased).map(m => `<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select></label>
  <label class="wide">${t('receipt')}<input id="xe-file" type="file" accept="image/*,application/pdf"></label>
  <button class="primary" type="submit">${t('register')}</button></form></div>`;
}
function payForm() {
  return `<div class="card"><h2>${t('logPay')}</h2><form class="form" id="payf" style="margin-top:12px"><label>${t('amt')}<input id="xp-amt" type="number" step="any" inputmode="decimal"></label><label>${t('date')}<input id="xp-date" type="date" value="${S.today()}"></label><label>${t('note')}<input id="xp-note" type="text"></label><button class="primary" type="submit">${t('register')}</button></form></div>`;
}
function catBars(c) {
  return cur.budget.map(b => { const s = c.byCat(b.id), ov = s > b.amount, pc = b.amount ? Math.min(100, s / b.amount * 100) : 0;
    return `<div class="cat"><div class="top2"><b>${esc(b.category)}</b><span>${money(s)} ${t('of')} ${money(b.amount)}</span></div><div class="bar"><i class="${ov ? 'over' : ''}" style="width:${ov ? 100 : pc}%"></i></div>${ov ? `<small style="color:#d0503a;font-weight:600">${t('over')}: ${money(s - b.amount)}</small>` : ''}</div>`; }).join('') || `<p class="sub">${t('none')}</p>`;
}
function cDash() {
  const c = S.calc(cur);
  const banner = stOf(cur.project) === 'estimate_accepted' && !cur.documents.some(x => x.kind === 'contract' && x.status !== 'void') ? `<div class="card" style="border-color:var(--cu);display:flex;gap:12px;align-items:center;flex-wrap:wrap"><b style="flex:1 1 260px">${t('contractBanner')}</b><button class="primary" data-ctab="docs">${t('goDocs')}</button></div>` : '';
  return banner + `<div class="kpis">${kpi(t('contract'), c.tot)}${kpi(t('collected'), c.paid)}${kpi(t('receivable'), c.bal)}${kpi(t('budget'), c.bud)}${kpi(t('spent'), c.spent, '', (c.bud ? Math.round(c.spent / c.bud * 100) : 0) + '% ' + t('of') + ' ' + t('budget').toLowerCase())}${kpi(t('left'), c.left, c.left < 0 ? 'neg' : '')}${kpi(t('profit'), c.profit, c.profit < 0 ? 'neg' : 'pos', t('profitSub'))}</div>
  <div class="kpis">${(() => { const sh = shareOf(c); return kpi(`${t('share')} ${pct()}%`, sh.s, '', t('shareOf')) + kpi(t('shareEarned'), sh.earned, 'pos', t('shareEarnedSub')) + kpi(t('sharePending'), sh.pending) + kpi(t('profitAfter'), sh.after, sh.after < 0 ? 'neg' : ''); })()}</div>
  <div class="cols">${buyForm()}${payForm()}</div>
  <div class="cols"><div class="card"><h2>${t('byCat')}</h2>${catBars(c)}</div><div class="card"><h2>${t('recent')}</h2>${expSorted().slice(0, 6).map(e => `<div class="mat"><div><b>${esc(e.description)}</b><small>${fdate(e.spent_on)} · ${esc(e.vendor)} · ${esc(catName(e.budget_id))}</small></div><span class="n">${money(e.amount)}</span></div>`).join('') || `<p class="sub">${t('none')}</p>`}</div></div>`;
}
const expSorted = () => cur.expenses.slice().sort((a, b) => String(b.spent_on).localeCompare(String(a.spent_on)));
function cMoney() {
  const c = S.calc(cur);
  return buyForm() + `<div class="card"><h2>${t('budget')}</h2><p class="sub">${money(c.spent)} ${t('of')} ${money(c.bud)} · ${t('left')}: <b>${money(c.left)}</b></p>
  ${sorted('budget').map(b => `<div class="row r-bud">${fld('budget', b, 'category', 'text', 'ct')}${fld('budget', b, 'amount', 'number', 'am')}<span class="spent">${money(c.byCat(b.id))}</span>${del('budget', b.id)}</div>`).join('')}<button class="add" data-add="budget">${t('addCat')}</button></div>
  <div class="card"><h2>${t('expLog')}</h2><p class="sub">${cur.expenses.length} · ${money(c.spent)}</p>
  ${expSorted().map(e => `<div class="row r-exp2">${fld('expenses', e, 'spent_on', 'date', 'dt')}${fld('expenses', e, 'description', 'text', 'ds')}${sel('expenses', e, 'budget_id', budOpts(), 'cs')}${fld('expenses', e, 'vendor', 'text', 'st')}${fld('expenses', e, 'amount', 'number', 'am')}${e.receipt ? `<button class="btn2 rc" data-rcv="${esc(e.receipt)}">${t('viewReceipt')}</button>` : `<button class="btn2 rc" data-rc="${e.id}">${t('addReceipt')}</button>`}${del('expenses', e.id)}</div>`).join('') || `<p class="sub">${t('none')}</p>`}</div>`;
}
const sorted = tb => cur[tb].slice().sort((a, b) => (a.sort || 0) - (b.sort || 0));
function cPays() {
  const c = S.calc(cur);
  return `<div class="kpis">${kpi(t('contract'), c.tot)}${kpi(t('collected'), c.paid, 'pos')}${kpi(t('receivable'), c.bal)}</div>` + payForm() +
  `<div class="card"><h2>${t('schedule')}</h2><p class="sub">${t('msHint')} ${t('scheduleTotal')}: <b>${money(c.msTotal)}</b> · ${t('contract')}: <b>${money(c.tot)}</b></p>
  ${c.ms.map(m => `<div class="row r-ms">${fld('milestones', m, 'label', 'text', 'lb2')}${fld('milestones', m, 'amount', 'number', 'am')}<span class="pill ${m.st}">${t('ms_' + m.st)}</span>${del('milestones', m.id)}</div>`).join('')}<button class="add" data-add="milestones">${t('addMs')}</button></div>
  <div class="card"><h2>${t('history')}</h2>${cur.payments.slice().sort((a, b) => String(a.paid_on).localeCompare(String(b.paid_on))).map(x => `<div class="row r-pay">${fld('payments', x, 'paid_on', 'date', 'dt')}${fld('payments', x, 'note', 'text', 'nt')}${fld('payments', x, 'amount', 'number', 'am')}${del('payments', x.id)}</div>`).join('') || `<p class="sub">${t('none')}</p>`}</div>`;
}
function cChanges() {
  const sts = ['draft', 'pending', 'approved', 'declined'].map(s => [s, t('co_' + s)]);
  return `<div class="card"><h2>${t('changes')}</h2><p class="sub">${t('coHint')}</p>
  ${cur.change_orders.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).map(co => `<div class="co"><div class="row r-co" style="border:0;padding:0">${fld('change_orders', co, 'title', 'text', 'tt')}${sel('change_orders', co, 'kind', kinds(), 'tp')}${fld('change_orders', co, 'amount', 'number', 'am')}${sel('change_orders', co, 'status', sts, 'stsel')}${del('change_orders', co.id)}
  <textarea class="det" rows="2" data-t="change_orders" data-id="${co.id}" data-f="details" aria-label="${t('f_details')}" style="display:block;width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--bg);font-size:16px">${esc(co.details)}</textarea></div>
  <div class="acts">${co.status === 'draft' ? `<button class="primary" data-sendco="${co.id}">${t('sendClient')}</button>` : `<span class="pill ${co.status}">${t('co_' + co.status)}</span>`}${co.decided_by ? `<small class="sub" style="margin:0">${t('by')} ${esc(co.decided_by)} · ${fdate(co.decided_at)}</small>` : ''}</div></div>`).join('') || `<p class="sub">${t('none')}</p>`}
  <button class="add" data-add="change_orders">${t('addCo')}</button></div>`;
}
let pending = [];
function cProgress() {
  const c = S.calc(cur);
  return `<div class="card"><h2>${t('updates')}</h2><label>${t('newUpd')}<textarea id="nu" rows="3"></textarea></label>
  <div class="acts" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:6px"><label class="btn2 drop" style="margin:0;color:var(--ink)">${t('addPhotos')}<input id="nuf" type="file" accept="image/*" multiple></label><span id="nuc" class="sub" style="margin:0">${pending.length ? pending.length + ' ' + t('photosSel') : ''}</span><button class="primary" data-post>${t('postUpd')}</button></div>
  ${cur.updates.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).map(u => `<div class="upd" style="margin-top:16px"><small>${fdate(u.created_at)}</small><div class="row" style="grid-template-columns:minmax(0,1fr) 44px;border:0;padding:4px 0">${fld('updates', u, 'body')}${del('updates', u.id)}</div>${S.photos(u.photos)}</div>`).join('')}</div>
  <div class="card"><h2>${t('steps')}</h2><p class="sub">${c.sd} / ${cur.steps.length} · ${c.pct}%</p><div class="bar"><i style="width:${c.pct}%"></i></div>
  ${sorted('steps').map(s => `<div class="row r-step">${chk('steps', s, 'done', t('f_done') + ': ' + (s.title || ''))}${fld('steps', s, 'title', 'text', 'tt')}${fld('steps', s, 'due_date', 'date', 'd')}${del('steps', s.id)}</div>`).join('')}<button class="add" data-add="steps">${t('addStep')}</button></div>`;
}
function cMats() {
  const c = S.calc(cur);
  return `<div class="card"><h2>${t('materials')}</h2><p class="sub">${c.mb} / ${cur.materials.length} · ${t('matPriv')}</p>
  ${sorted('materials').map(m => `<div class="row r-mat2">${chk('materials', m, 'purchased', t('purchased') + ': ' + (m.name || ''))}${fld('materials', m, 'name', 'text', 'nm')}${fld('materials', m, 'qty', 'number', 'q')}${fld('materials', m, 'unit', 'text', 'u')}${fld('materials', m, 'purchased_on', 'date', 'dt')}${del('materials', m.id)}</div>`).join('')}
  <button class="add" data-add="materials">${t('addMat')}</button><p class="hint">✓ = ${t('purchased')} · ${t('qty')} · ${t('unit')} · ${t('datePaid')}</p></div>`;
}
function cEst() {
  const c = S.calc(cur), p = cur.project;
  return `<div class="card"><div class="secthead" style="margin:0"><h2 style="margin-inline-end:auto">${t('estimate')}</h2><button class="btn2" data-doc="estimate">${t('dlEstimate')}</button></div>
  <p class="sub">${t('materials')}: <b>${money(c.subM)}</b> · ${t('labor')}: <b>${money(c.subL)}</b> · ${t('taxMat')}: <b>${money(c.tax)}</b> · ${t('total')}: <b>${money(c.tot)}</b></p>
  ${sorted('items').map(x => `<div class="row r-item">${fld('items', x, 'description', 'text', 'dd')}${sel('items', x, 'kind', kinds(), 'tp')}${fld('items', x, 'qty', 'number', 'q')}${fld('items', x, 'price', 'number', 'p')}${del('items', x.id)}</div>`).join('')}
  <button class="add" data-add="items">${t('addItem')}</button><label style="max-width:220px;margin-top:14px">${t('taxp')}${fld('projects', p, 'tax_rate', 'number')}</label></div>`;
}
const ta = (tb, r, f, rows = 3) => `<textarea rows="${rows}" data-t="${tb}" data-id="${r.id ?? ''}" data-f="${f}" aria-label="${esc(t(f === 'warranty' ? 'warranty' : 'extraTerms'))}" style="display:block;width:100%;margin-top:4px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--bg);font-size:16px">${esc(r[f] || '')}</textarea>`;
let docLang = null;
function cDocs() {
  const lang = docLang || S.L, miss = [['legal_name', 'legalName'], ['license_no', 'licenseNo'], ['address', 'bizAddress']].filter(([f]) => !String(settings[f] || '').trim()).map(([, k]) => t(k));
  const hasContract = cur.documents.some(x => x.kind === 'contract' && x.status !== 'void');
  const docs = cur.documents.slice().sort((x, y) => String(y.created_at).localeCompare(String(x.created_at)));
  return `<div class="card"><h2>${t('docs')}</h2><p class="sub">${t('docsSub')}</p>
  ${miss.length ? `<p class="hint" style="color:#b23a26;font-weight:600">${t('missingFor')}: ${miss.join(', ')}</p>` : ''}
  <div class="linkbox" style="margin-top:10px"><label style="margin:0">${t('docLang')} <select id="doclang" style="min-height:44px;margin-inline-start:6px">${[['es', 'Español'], ['en', 'English']].map(([v, l]) => `<option value="${v}"${lang === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label></div>
  <div class="linkbox" style="margin-top:12px"><button class="btn2" data-doc="estimate">${t('dlEstimate')}</button><button class="primary" data-mkdoc="contract">${t('mkContract')}</button><button class="btn2" data-mkdoc="completion">${t('mkCompletion')}</button></div>
  ${hasContract ? '' : `<p class="hint">${t('noContractYet')}</p>`}<p class="hint">${t('docsHint')}</p>
  <div class="linkbox" style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line)"><label style="margin:0">${t('upKind')} <select id="upkind" style="min-height:44px;margin-inline-start:6px">${['contract', 'estimate', 'completion'].map(k => `<option value="${k}">${t('doc_' + k)}</option>`).join('')}</select></label><button class="btn2" data-updoc>${t('upDoc')}</button></div><p class="hint">${t('upDocHint')}</p></div>
  <div class="card">${docs.map(x => `<div class="co"><div class="top2"><b>${t('doc_' + x.kind)}${x.snapshot && x.snapshot.items ? ' · ' + (x.lang || 'es').toUpperCase() : ' · ' + t('uploadedDoc')}</b><b class="amt">${money(x.total)}</b></div>
    <small class="sub">${fdate(x.created_at)}</small>
    <div class="acts">${sel('documents', x, 'status', ['draft', 'sent', 'signed', 'void'].map(s => [s, t('ds_' + s)]), 'stsel')}${x.file ? `<button class="primary" data-dlsigned="${x.id}">${t('dlSigned')}</button>` : ''}${x.snapshot && x.snapshot.items ? `<button class="btn2" data-dl="${x.id}">${x.file ? t('dlOriginal') : t('download')}</button>` : ''}<button class="btn2" data-upsigned="${x.id}">${t('upSigned')}</button>${x.status === 'draft' || (x.file && !(x.snapshot && x.snapshot.items)) ? del('documents', x.id) : ''}</div>
    ${x.file ? `<small class="sub" style="color:var(--ok);font-weight:600">✓ ${t('signedFile')}</small>` : ''}
    ${x.status === 'signed' ? `<div class="grid2" style="margin-top:10px"><label>${t('signedBy')}${fld('documents', x, 'signed_by')}</label><label>${t('signedOn')}${fld('documents', x, 'signed_on', 'date')}</label></div>` : ''}</div>`).join('') || `<p class="sub">${t('none')}</p>`}</div>
  <div class="card"><h2>${t('contractData')}</h2><p class="sub">${t('contractDataSub')}</p><div class="grid2" style="margin-top:12px">
  <label>${t('legalName')}${fld('settings', settings, 'legal_name')}</label><label>${t('licenseNo')}${fld('settings', settings, 'license_no')}</label>
  <label>${t('bizAddress')}${fld('settings', settings, 'address')}</label><label>${t('phone')}${fld('settings', settings, 'phone', 'tel')}</label></div>
  <label>${t('warranty')}${ta('settings', settings, 'warranty')}</label><p class="hint">${t('warrantyHint')}</p>
  <label style="margin-top:12px">${t('extraTerms')}${ta('settings', settings, 'extra_terms', 4)}</label>
  <p class="hint" style="margin-top:12px">${t('legalNote')}</p></div>`;
}
function cMsgs() {
  const me = settings.contact_name || t('contractor');
  return `<div class="card"><h2>${t('messages')}</h2><div class="chat" id="chat">${cur.comments.slice().sort((a, b) => String(a.created_at).localeCompare(String(b.created_at))).map(m => `<div class="bub ${m.author === 'contractor' ? 'me' : ''}"><small>${esc(m.name || (m.author === 'client' ? t('client') : me))} · ${fdate(m.created_at)}</small><p>${esc(m.body)}</p></div>`).join('') || `<p class="sub">${t('none')}</p>`}</div>
  <form class="sendrow" id="msgf"><textarea id="rp" rows="2" placeholder="${t('writeMsg')}" aria-label="${t('writeMsg')}"></textarea><button class="primary" type="submit">${t('send')}</button></form></div>`;
}
const clientLink = p => new URL('proyecto.html?p=' + p.client_token, location.href).href;
function shareBar(p) {
  const link = clientLink(p), digits = (p.client_phone || '').replace(/\D/g, ''), phone = digits.length === 10 ? '1' + digits : digits;
  const msg = encodeURIComponent(t('shareMsg').replace('{n}', (p.client_name || '').replace(/\s*\(.*\)\s*$/, '').split(' ')[0] || '').replace(/\s+,/, ',') + link);
  return `<div class="sharebar"><div class="sbtxt"><b>${t('shareT')}</b><small>${t('shareS')}</small></div>
  <div class="sbbtn"><button class="primary" data-copylink="${esc(link)}">${t('copy')}</button>
  <a class="btn2" href="https://wa.me/${phone}?text=${msg}" target="_blank" rel="noopener">WhatsApp</a>
  <a class="btn2" href="sms:${phone ? '+' + phone : ''}?&body=${msg}">${t('sms')}</a>
  <a class="btn2" href="${esc(link)}" target="_blank" rel="noopener">${t('open')}</a></div>
  ${phone ? '' : `<small class="sbhint">${t('noPhone')}</small>`}</div>`;
}
function cProj() {
  const p = cur.project, link = clientLink(p), wa = (p.client_phone || '').replace(/\D/g, '');
  const msg = encodeURIComponent((S.L === 'es' ? 'Hola, aquí puedes ver tu proyecto con Sonec: ' : 'Hi, here you can follow your project with Sonec: ') + link);
  return `<div class="card"><h2>${t('projInfo')}</h2><div class="grid2" style="margin-top:12px">
  <label>${t('ptitle')}${fld('projects', p, 'title')}</label><label>${t('status')}${sel('projects', { ...p, status: stOf(p) }, 'status', STATUSES.map(s => [s, t('st_' + s)]))}</label>
  <label>${t('clientName')}${fld('projects', p, 'client_name')}</label><label>${t('address')}${fld('projects', p, 'address')}</label>
  <label>${t('clientPhone')}${fld('projects', p, 'client_phone', 'tel')}</label><label>${t('clientEmail')}${fld('projects', p, 'client_email', 'email')}</label>
  <label>${t('start')}${fld('projects', p, 'start_date', 'date')}</label><label>${t('end')}${fld('projects', p, 'end_date', 'date')}</label></div></div>
  <div class="card"><h2>${t('clientLink')}</h2><p class="sub">${t('linkHint')}</p><div class="linkbox"><code id="clink">${esc(link)}</code><button class="btn2" data-copy>${t('copy')}</button><a class="btn2" href="${esc(link)}" target="_blank" rel="noopener">${t('open')}</a><a class="btn2" href="https://wa.me/${wa}?text=${msg}" target="_blank" rel="noopener">${t('whatsapp')}</a></div><p class="hint">${t('rotateHint')}</p><button class="btn2" data-rotate>${t('rotate')}</button></div>
  <div class="card"><div class="linkbox"><button class="btn2" data-print>${t('printEst')}</button><button class="btn2" data-dup>${t('duplicate')}</button></div></div>
  <div class="card"><h2>${t('deleteP')}</h2><p class="sub">${t('deleteConfirm')}</p><div class="linkbox"><input id="delc" style="flex:1 1 200px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--bg);min-height:44px;font-size:16px" aria-label="${t('deleteP')}"><button class="btn2 danger" data-delp>${t('deleteP')}</button></div></div>`;
}

/* ---------- render keeps focus where the user was typing ---------- */
function render() {
  const a = document.activeElement, ds = (a && a.dataset) || {};
  const key = ds.f ? `[data-t="${ds.t}"][data-id="${ds.id}"][data-f="${ds.f}"]` : ds.del ? `[data-del="${ds.del}"]` : (a && a.id ? '#' + a.id : null);
  const y = scrollY;
  app.innerHTML = view === 'setup' ? setup() : view === 'login' ? login() : view === 'home' ? home() : view === 'project' ? project() : `<div class="center"><p>${t('loading')}</p></div>`;
  document.title = 'Sonec · ' + t('contractor');
  scrollTo(0, y);
  if (key) { const n = document.querySelector(key); if (n) n.focus({ preventScroll: true }); }
  const ch = $('#chat'); if (ch) ch.scrollTop = ch.scrollHeight;
}

/* ---------- data ---------- */
async function loadAll() { [settings, B, leads] = await Promise.all([API.getSettings(), API.loadAll(), API.listLeads().catch(() => [])]); }
function openProject(id) {
  cur = B.find(b => b.project.id === id); if (!cur) { view = 'home'; return render(); }
  view = 'project'; ctab = ctab || 'dash'; try { history.replaceState(null, '', '#' + id); } catch (_) {}
  render(); scrollTo(0, 0);
}
const rowOf = (tb, id) => tb === 'projects' ? cur.project : tb === 'settings' ? settings : cur[tb].find(r => r.id === id);
const DEF = {
  items: () => ({ kind: 'mat', description: '', qty: 1, price: 0 }), materials: () => ({ name: '', qty: 1, unit: '' }), steps: () => ({ title: '' }),
  milestones: () => ({ label: '', amount: 0 }), budget: () => ({ category: '', amount: 0 }), change_orders: () => ({ title: '', kind: 'mat', amount: 0, status: 'draft' })
};

async function save(tb, id, f, v) {
  setDot(t('saving'));
  try {
    const row = rowOf(tb, id);
    const patch = { [f]: v };
    if (tb === 'materials' && f === 'purchased' && v && !row.purchased_on) patch.purchased_on = S.today();
    const res = tb === 'settings' ? await API.saveSettings(patch) : await API.update(tb, id, patch);
    Object.assign(row, res || patch); setDot(t('saved') + ' ✓');
    return true;
  } catch (e) { setDot(''); fail(e); return false; }
}

app.addEventListener('change', async e => {
  const n = e.target, d = n.dataset;
  if (n.id === 'doclang') { docLang = n.value; return; }
  if (n.id === 'nuf') { pending = [...n.files]; const c = $('#nuc'); if (c) c.textContent = pending.length ? pending.length + ' ' + t('photosSel') : ''; return; }
  if (!d.f) return;
  let v = n.type === 'checkbox' ? n.checked : n.value;
  if (n.type === 'number') v = v === '' ? 0 : +v;
  if (n.type === 'date' && !v) v = null;
  if (d.f === 'budget_id' && !v) v = null;
  if (d.f === 'share_pct') { v = Math.min(100, Math.max(0, +v || 0)); n.value = v; }
  if (d.t === 'projects' && d.f === 'title' && !String(v).trim()) { n.value = rowOf('projects', d.id).title || ''; return n.focus(); }
  const okSaved = await save(d.t, d.id, d.f, v);
  if (okSaved && (n.type !== 'text' || /category|title/.test(d.f) && ctab !== 'progress') && n.tagName !== 'TEXTAREA') render();
});

app.addEventListener('submit', async e => {
  e.preventDefault(); const id = e.target.id, sb = e.target.querySelector('[type=submit]');
  if (id !== 'loginf') { if (sb && sb.disabled) return; if (sb) sb.disabled = true; }
  try {
    if (id === 'loginf') {
      lastEmail = $('#em').value.trim(); const pw = $('#pw').value; busy = true; err = ''; render();
      try { await API.signIn(lastEmail, pw); await loadAll(); view = 'home'; const h = location.hash.slice(1); busy = false; if (h && B.some(b => b.project.id === h)) return openProject(h); }
      catch (x) { err = x.message; view = 'login'; }
      busy = false; return render();
    }
    if (id === 'newpf') {
      const title = $('#np-title').value.trim(); if (!title) return $('#np-title').focus();
      const p = await API.insert('projects', { title, client_name: $('#np-client').value.trim(), status: $('#np-status').value });
      creating = false; B.unshift(blank(p)); ctab = 'project'; return openProject(p.id);
    }
    if (id === 'buyf') {
      const desc = $('#xe-desc').value.trim(), amount = +$('#xe-amt').value || 0, mat = $('#xe-mat').value, f = $('#xe-file').files[0];
      if (!desc && !amount) return $('#xe-desc').focus();
      const date = $('#xe-date').value || S.today(), btn = e.target.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = t('saving');
      let receipt = null;
      if (f) { const blob = await S.compress(f); receipt = await API.upload('receipts', `${cur.project.id}/${S.uid()}.${blob.type === 'application/pdf' ? 'pdf' : 'jpg'}`, blob); }
      const m = cur.materials.find(x => x.id === mat);
      let row;
      try { row = await API.insert('expenses', { project_id: cur.project.id, description: desc || (m ? m.name : ''), amount, spent_on: date, budget_id: $('#xe-cat').value || null, vendor: $('#xe-store').value.trim(), receipt }); }
      catch (x) { if (receipt) API.removeFiles('receipts', [receipt]).catch(() => {}); throw x; }
      cur.expenses.push(row);
      if (m) Object.assign(m, await API.update('materials', m.id, { purchased: true, purchased_on: date }));
      render(); S.toast(t('buyOk'), async () => { await API.remove('expenses', row.id); cur.expenses = cur.expenses.filter(x => x.id !== row.id); render(); });
    }
    if (id === 'payf') {
      const amount = +$('#xp-amt').value || 0; if (!amount) return $('#xp-amt').focus();
      const row = await API.insert('payments', { project_id: cur.project.id, amount, paid_on: $('#xp-date').value || S.today(), note: $('#xp-note').value.trim() });
      cur.payments.push(row); render(); S.toast(t('payOk'), async () => { await API.remove('payments', row.id); cur.payments = cur.payments.filter(x => x.id !== row.id); render(); });
    }
    if (id === 'msgf') {
      const body = $('#rp').value.trim(); if (!body) return;
      cur.comments.push(await API.insert('comments', { project_id: cur.project.id, author: 'contractor', name: settings.contact_name || '', body, seen: true })); render(); $('#rp')?.focus();
    }
  } catch (x) { fail(x); render(); }
  finally { if (sb && id !== 'loginf') sb.disabled = false; }
});

app.addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b || (b.type === 'submit' && b.form) || b.dataset.busy) return; const d = b.dataset;
  const guard = !(d.lang || d.ctab || d.photo || d.rc || 'home' in d || 'print' in d);
  if (guard) { b.dataset.busy = '1'; b.disabled = true; }
  try {
    if (d.lang) { S.setLang(d.lang); render(); }
    else if ('logout' in d) { await API.signOut(); B = []; cur = null; view = 'login'; render(); }
    else if ('hideinstall' in d) { try { localStorage.setItem('sonec-noinstall', '1'); } catch (_) {} render(); }
    else if (d.leadst) { const [id, st] = d.leadst.split(':'); const l = leads.find(x => x.id === id); Object.assign(l, await API.update('leads', id, { status: st })); render(); }
    else if (d.leadp) {
      const l = leads.find(x => x.id === d.leadp);
      const p = await API.insert('projects', { title: l.service || (S.L === 'es' ? 'Nuevo proyecto' : 'New project'), client_name: l.name, client_phone: l.phone, client_email: l.email, address: l.city, status: 'estimate_sent' });
      Object.assign(l, await API.update('leads', l.id, { status: 'won', project_id: p.id }));
      const nb = blank(p);
      if (l.message) { try { nb.comments.push(await API.insert('comments', { project_id: p.id, author: 'client', name: l.name, body: l.message, seen: true })); } catch (_) {} }
      B.unshift(nb); ctab = 'project'; openProject(p.id);
    }
    else if (d.open) { ctab = 'dash'; openProject(d.open); }
    else if ('home' in d) { view = 'home'; cur = null; try { history.replaceState(null, '', location.pathname); } catch (_) {} render(); scrollTo(0, 0); }
    else if (d.ctab) { ctab = d.ctab; if (ctab === 'messages' && unseen(cur)) { await API.markSeen(cur.project.id); cur.comments.forEach(c => c.seen = true); } render(); scrollTo(0, 0); }
    else if ('newp' in d) { creating = true; render(); $('#np-title')?.focus(); }
    else if ('cancelnew' in d) { creating = false; render(); }
    else if (d.pf) { pfilter = d.pf; render(); }
    else if ('sample' in d) { b.disabled = true; const id = await makeSample(); ctab = 'dash'; openProject(id); }
    else if (d.add) {
      const tb = d.add, row = await API.insert(tb, { project_id: cur.project.id, sort: cur[tb].length, ...DEF[tb]() });
      cur[tb].push(row); render(); document.querySelector(`[data-id="${row.id}"]:not([type=checkbox]):not(select)`)?.focus();
    }
    else if (d.del) {
      const [tb, id] = d.del.split(':'), row = rowOf(tb, id); await API.remove(tb, id);
      cur[tb] = cur[tb].filter(r => r.id !== id); render();
      const files = tb === 'updates' ? ['photos', row.photos || []] : tb === 'expenses' && row.receipt ? ['receipts', [row.receipt]] : tb === 'documents' && row.file ? ['docs', [row.file]] : null;
      const tm = files && files[1].length ? setTimeout(() => API.removeFiles(files[0], files[1]).catch(er => console.warn('cleanup', er)), 6000) : null;
      S.toast(t('removed'), async () => { clearTimeout(tm); try { cur[tb].push(await API.insert(tb, row)); render(); } catch (x) { fail(x); } });
    }
    else if ('rotate' in d) {
      const tok = Array.from(crypto.getRandomValues(new Uint8Array(18)), x => x.toString(16).padStart(2, '0')).join('');
      if (await save('projects', cur.project.id, 'client_token', tok)) { render(); S.toast(t('rotated')); }
    }
    else if (d.sendco) { await save('change_orders', d.sendco, 'status', 'pending'); render(); }
    else if ('post' in d) {
      const body = $('#nu').value.trim(); if (!body && !pending.length) return $('#nu').focus();
      b.disabled = true; b.textContent = t('uploading');
      const photos = [];
      try {
        for (const f of pending) { const blob = await S.compress(f); photos.push(await API.upload('photos', `${cur.project.id}/${S.uid()}.jpg`, blob)); }
        cur.updates.push(await API.insert('updates', { project_id: cur.project.id, body, photos }));
      } catch (x) { API.removeFiles('photos', photos).catch(() => {}); b.textContent = t('postUpd'); throw x; }
      pending = []; render();
    }
    else if (d.photo) S.lightbox(d.photo);
    else if (d.rc) { const f = $('#rcfile'); f.dataset.id = d.rc; f.value = ''; f.click(); }
    else if (d.rcv) { const w = window.open('', '_blank'); const u = await API.receiptUrl(d.rcv); if (w) w.location = u; else location.href = u; }
    else if ('print' in d) S.printEstimate(cur, settings);
    else if (d.doc === 'estimate') { await S.docs.download('estimate', S.docs.snapshot(cur, settings, docLang || S.L)); }
    else if (d.mkdoc) {
      const lang = docLang || S.L;
      const contract = cur.documents.filter(x => x.kind === 'contract' && x.status !== 'void' && x.snapshot && x.snapshot.items).sort((x, y) => String(y.created_at).localeCompare(String(x.created_at)))[0];
      const snap = d.mkdoc === 'contract' ? S.docs.snapshot(cur, settings, lang) : S.docs.completionSnapshot(cur, settings, lang, contract);
      const row = await API.insert('documents', { project_id: cur.project.id, kind: d.mkdoc, lang, snapshot: snap, total: snap.totals.tot, status: 'draft' });
      cur.documents.push(row); render(); await S.docs.download(d.mkdoc, snap); S.toast(t('docMade'));
    }
    else if (d.copylink) { try { await navigator.clipboard.writeText(d.copylink); S.toast(t('copied')); } catch (_) { prompt(t('copy'), d.copylink); } }
    else if (d.dlsigned) { const x = cur.documents.find(y => y.id === d.dlsigned); window.open(API.docUrl(x.file), '_blank', 'noopener'); }
    else if (d.upsigned || 'updoc' in d) { const f = $('#docfile'); f.dataset.id = d.upsigned || ''; f.dataset.kind = d.upsigned ? '' : $('#upkind').value; f.value = ''; f.click(); }
    else if (d.dl) { const x = cur.documents.find(y => y.id === d.dl); await S.docs.download(x.kind, x.snapshot); }
    else if ('copy' in d) { try { await navigator.clipboard.writeText($('#clink').textContent); S.toast(t('copied')); } catch (_) { getSelection().selectAllChildren($('#clink')); } }
    else if ('dup' in d) { b.disabled = true; const id = await duplicate(cur); S.toast(t('dupOk')); ctab = 'project'; openProject(id); }
    else if ('delp' in d) {
      if (!/^(ELIMINAR|DELETE)$/i.test($('#delc').value.trim())) return $('#delc').focus();
      const pid = cur.project.id;
      for (const bk of ['photos', 'receipts', 'docs']) { try { await API.removeFiles(bk, await API.listFolder(bk, pid)); } catch (er) { console.warn('cleanup', er); } }
      await API.remove('projects', pid); B = B.filter(x => x !== cur); cur = null; view = 'home'; try { history.replaceState(null, '', location.pathname); } catch (_) {} render();
    }
  } catch (x) { fail(x); render(); }
  finally { if (guard) { delete b.dataset.busy; b.disabled = false; } }
});

$('#docfile').addEventListener('change', async e => {
  const f = e.target.files[0], id = e.target.dataset.id, kind = e.target.dataset.kind; if (!f) return;
  if (!/pdf$/i.test(f.type) && !/\.pdf$/i.test(f.name) || f.size > 20 * 1024 * 1024) return S.toast(t('pdfOnly'));
  try {
    setDot(t('uploading'));
    const path = await API.upload('docs', `${cur.project.id}/${S.uid()}.pdf`, new Blob([f], { type: 'application/pdf' }));
    if (id) {
      const x = cur.documents.find(y => y.id === id), old = x.file;
      Object.assign(x, await API.update('documents', id, { file: path, status: 'signed', signed_on: x.signed_on || S.today() }));
      if (old) API.removeFiles('docs', [old]).catch(() => {});
    } else {
      const c = S.calc(cur);
      cur.documents.push(await API.insert('documents', { project_id: cur.project.id, kind, lang: S.L, snapshot: { uploaded: true, name: f.name, created: new Date().toISOString(), totals: { tot: c.tot } }, total: c.tot, status: 'signed', signed_on: S.today(), file: path }));
    }
    setDot(t('saved') + ' ✓'); render(); S.toast(t('savedSigned'));
  } catch (x) { fail(x); }
});
$('#rcfile').addEventListener('change', async e => {
  const f = e.target.files[0], id = e.target.dataset.id; if (!f || !id) return;
  try { setDot(t('uploading')); const blob = await S.compress(f); const path = await API.upload('receipts', `${cur.project.id}/${S.uid()}.${blob.type === 'application/pdf' ? 'pdf' : 'jpg'}`, blob); await save('expenses', id, 'receipt', path); render(); }
  catch (x) { fail(x); }
});

function blank(p) { const b = { project: p }; API.CHILD.forEach(t => b[t] = []); return b; }
async function copyRows(tb, from, pid, map) { const rows = from.map(r => { const x = { ...map(r), project_id: pid }; delete x.id; delete x.created_at; return x; }); return API.insertMany(tb, rows); }
async function duplicate(src) {
  const s = src.project, p = await API.insert('projects', { title: `${s.title} ${t('copySuffix')}`, status: 'estimate_sent', tax_rate: s.tax_rate });
  const b = blank(p);
  b.items = await copyRows('items', src.items, p.id, r => r);
  b.materials = await copyRows('materials', src.materials, p.id, r => ({ ...r, purchased: false, purchased_on: null }));
  b.steps = await copyRows('steps', src.steps, p.id, r => ({ ...r, done: false, due_date: null }));
  b.budget = await copyRows('budget', src.budget, p.id, r => r);
  b.milestones = await copyRows('milestones', src.milestones, p.id, r => r);
  B.unshift(b); return p.id;
}
async function makeSample() {
  const d0 = new Date(), dd = n => new Date(d0.getTime() + n * 864e5).toISOString().slice(0, 10);
  const p = await API.insert('projects', { title: 'Remodelación de cocina', client_name: 'Familia Rivera (ejemplo)', address: '1450 N Valley View Dr, Lehi, UT', start_date: dd(-18), end_date: dd(28), status: 'progress', tax_rate: 7.25 });
  const b = blank(p), pid = p.id, many = (tb, rows) => API.insertMany(tb, rows.map((r, i) => ({ ...r, project_id: pid, sort: i })));
  const I = (description, kind, qty, price) => ({ description, kind, qty, price });
  [b.items, b.materials, b.steps, b.budget, b.milestones] = await Promise.all([
    many('items', [I('Demolición y retiro de gabinetes y piso', 'lab', 1, 1850), I('Gabinetes shaker blancos', 'mat', 22, 270), I('Instalación de gabinetes', 'lab', 22, 115), I('Cubierta de cuarzo Calacatta (pie²)', 'mat', 58, 45), I('Fabricación e instalación de cuarzo (pie²)', 'lab', 58, 23), I('Piso LVP roble claro (pie²)', 'mat', 240, 3.5), I('Instalación de piso (pie²)', 'lab', 240, 3), I('Azulejo subway, adhesivo y boquilla', 'mat', 1, 450), I('Instalación de backsplash', 'lab', 1, 1000), I('Luces LED, cable y contactos', 'mat', 1, 600), I('Electricista: 6 luces empotradas', 'lab', 1, 1600), I('Fregadero y llave', 'mat', 1, 560), I('Plomería: fregadero y llave', 'lab', 1, 420), I('Pintura y primer', 'mat', 1, 250), I('Pintura de paredes y techo', 'lab', 1, 850)]),
    many('materials', [{ name: 'Gabinetes shaker blancos', qty: 22, unit: 'pzas', purchased: true, purchased_on: dd(-8) }, { name: 'Losa de cuarzo Calacatta', qty: 2, unit: 'losas', purchased: true, purchased_on: dd(-7) }, { name: 'Piso LVP roble claro', qty: 260, unit: 'pie²', purchased: true, purchased_on: dd(-12) }, { name: 'Azulejo subway 3x6', qty: 45, unit: 'pie²' }, { name: 'Luces empotradas LED 6"', qty: 6, unit: 'pzas', purchased: true, purchased_on: dd(-14) }, { name: 'Fregadero de acero inoxidable', qty: 1, unit: 'pza' }, { name: 'Llave de cocina extraíble', qty: 1, unit: 'pza' }, { name: 'Pintura y primer', qty: 4, unit: 'galones' }]),
    many('steps', [{ title: 'Firma del estimado y anticipo', done: true, due_date: dd(-23) }, { title: 'Demolición y retiro de escombros', done: true, due_date: dd(-16) }, { title: 'Electricidad y plomería en bruto', done: true, due_date: dd(-10) }, { title: 'Instalación de piso LVP', done: true, due_date: dd(-6) }, { title: 'Instalación de gabinetes', due_date: dd(3) }, { title: 'Medición e instalación de cuarzo', due_date: dd(12) }, { title: 'Backsplash, fregadero y llave', due_date: dd(19) }, { title: 'Pintura, detalles y revisión final', due_date: dd(27) }]),
    many('budget', [{ category: 'Materiales', amount: 11500 }, { category: 'Mano de obra', amount: 6500 }, { category: 'Subcontratistas', amount: 2400 }, { category: 'Permisos y basura', amount: 650 }]),
    many('milestones', [{ label: 'Anticipo al firmar (30%)', amount: 6700 }, { label: 'Al terminar piso y gabinetes (30%)', amount: 6700 }, { label: 'Al instalar cuarzo (25%)', amount: 5600 }, { label: 'Al entregar (saldo)', amount: 3369.63 }])
  ]);
  const bid = n => b.budget.find(x => x.category === n)?.id || null;
  const E = (spent_on, description, category, vendor, amount) => ({ project_id: pid, spent_on, description, budget_id: bid(category), vendor, amount });
  [b.expenses, b.payments, b.updates, b.change_orders] = await Promise.all([
    API.insertMany('expenses', [E(dd(-6), 'Ayudantes, semana 2', 'Mano de obra', 'Nómina', 1400), E(dd(-7), 'Losa de cuarzo Calacatta (2)', 'Materiales', 'MSI Stone', 2650), E(dd(-8), 'Gabinetes shaker blancos (22)', 'Materiales', 'Home Depot', 5940), E(dd(-10), 'Electricista: cableado en bruto', 'Subcontratistas', 'Subcontrato', 1200), E(dd(-10), 'Plomero: líneas del fregadero', 'Subcontratistas', 'Subcontrato', 650), E(dd(-12), 'Piso LVP roble claro', 'Materiales', 'Floor & Decor', 780), E(dd(-13), 'Ayudantes, semana 1', 'Mano de obra', 'Nómina', 1400), E(dd(-14), 'Luces empotradas LED (6)', 'Materiales', 'Home Depot', 168), E(dd(-17), 'Contenedor de basura 15 yd', 'Permisos y basura', 'Waste Mgmt', 420)]),
    API.insertMany('payments', [{ project_id: pid, paid_on: dd(-23), note: 'Anticipo 30%', amount: 6700 }, { project_id: pid, paid_on: dd(-6), note: 'Segundo pago: piso terminado', amount: 5000 }]),
    API.insertMany('updates', [{ project_id: pid, body: 'Inspección de electricidad aprobada. Las 6 luces empotradas ya tienen cableado.' }, { project_id: pid, body: 'El piso quedó instalado. Esta semana llegan los gabinetes.' }]),
    API.insertMany('change_orders', [{ project_id: pid, title: 'Isla de cocina con tomacorriente', details: 'Gabinete base de 6 pies, cubierta de cuarzo y un tomacorriente nuevo.', kind: 'mat', amount: 1850, status: 'pending' }])
  ]);
  B.unshift(b); return pid;
}

/* ---------- start ---------- */
(async function boot() {
  if (!API.ready) { view = 'setup'; return render(); }
  API.onAuth && API.onAuth(s => { if (!s && view !== 'login' && view !== 'boot') { view = 'login'; render(); } });
  try {
    const s = await API.session();
    if (!s) { view = 'login'; return render(); }
    await loadAll(); view = 'home';
    const h = location.hash.slice(1); if (h && B.some(b => b.project.id === h)) return openProject(h);
    render();
  } catch (x) { err = x.message; view = 'login'; render(); }
})();
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState !== 'visible' || view !== 'home') return;
  try { await loadAll(); render(); } catch (_) {}
});
}
