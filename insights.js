/* Insights: learns how the app is used, so the weekly report can suggest real improvements.
   Records which buttons and screens are used (no names, phones, emails, amounts, messages or the client's private link)
   and adds a small "Sugerencias / Suggestions" button. Saved through window.API.track / window.API.feedback.
   Settings come from the script tag: data-app, data-ns (global with .L for the language), data-role (default role). */
(function () {
  const tag = document.currentScript;
  const APP = (tag && tag.dataset.app) || 'app';
  const NS = (tag && tag.dataset.ns) || '';
  const DEFAULT_ROLE = (tag && tag.dataset.role) || null;
  const PAGE = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
  const SESSION = Math.random().toString(36).slice(2, 12);
  const SKIP_KEYS = new Set(['busy', 'id', 't', 'f', 'focus', 'i', 'n']);
  const SAFE = /^[a-z][a-z0-9_]{1,23}$/i;
  let queue = [];

  const api = () => window.API && window.API.ready !== false ? window.API : null;
  const lang = () => { try { return (window[NS] && window[NS].L) === 'en' ? 'en' : 'es'; } catch (_) { return 'es'; } };
  const currentRole = () => {
    try { if (typeof role === 'function' && role()) return String(role()); } catch (_) {} // C Plus exposes role()
    return DEFAULT_ROLE;
  };

  function track(event, props) {
    const clean = {};
    Object.entries(props || {}).forEach(([k, v]) => { if (/^[a-z]{1,20}$/i.test(k) && typeof v === 'string' && SAFE.test(v)) clean[k] = v; });
    queue.push({ event: String(event).slice(0, 60), screen: PAGE, role: currentRole(), lang: lang(), session: SESSION, props: Object.assign({ app: APP }, clean) });
    if (queue.length >= 40) flush();
  }

  function flush() {
    const a = api();
    if (!a || !a.track || !queue.length) return;
    const rows = queue.splice(0, queue.length);
    a.track(rows);
  }

  /* every button tap, named by its first data-* key; only short word values are kept (ids are dropped) */
  document.addEventListener('click', e => {
    const b = e.target && e.target.closest && e.target.closest('button, a[data-hv], a[data-tab]');
    if (!b || b.closest('.ci-fb')) return;
    const key = Object.keys(b.dataset || {}).find(k => !SKIP_KEYS.has(k));
    if (!key) return;
    const raw = String(b.dataset[key] || '');
    const value = raw.split(':').find(p => SAFE.test(p) && !/^[0-9a-f]{8,}$/i.test(p));
    track('tap_' + key.toLowerCase().slice(0, 40), value ? { v: value } : null);
  }, true);

  document.addEventListener('submit', e => {
    const f = e.target;
    if (f && f.id && SAFE.test(f.id)) track('submit_' + f.id);
  }, true);

  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  setInterval(flush, 15000);
  track('page_open');

  /* ---------- Suggestions button ---------- */
  const TX = {
    es: { btn: 'Sugerencias', title: '¿Qué mejorarías?', ph: 'Cuéntanos qué es difícil, qué falta o qué confunde', send: 'Enviar', cancel: 'Cancelar', ok: '¡Gracias! Leemos todas las sugerencias.', bad: 'No se pudo enviar. Intenta de nuevo.' },
    en: { btn: 'Suggestions', title: 'What would you improve?', ph: 'Tell us what is hard, missing or confusing', send: 'Send', cancel: 'Cancel', ok: 'Thank you! We read every suggestion.', bad: 'Could not send. Please try again.' }
  };
  const tx = k => TX[lang()][k];

  function openBox() {
    const d = document.createElement('dialog');
    d.className = 'ci-fb';
    d.setAttribute('aria-labelledby', 'ci-fb-h');
    d.style.cssText = 'border:1px solid var(--line,#ccc);border-radius:14px;padding:18px;max-width:min(92vw,440px);width:100%;background:var(--card,#fff);color:inherit';
    d.innerHTML = '<form method="dialog" style="display:flex;flex-direction:column;gap:12px"><h2 id="ci-fb-h" style="margin:0;font-size:19px"></h2>' +
      '<textarea required minlength="3" maxlength="2000" rows="5" style="font:inherit;font-size:16px;padding:10px;border-radius:10px"></textarea>' +
      '<p role="status" style="margin:0;min-height:1.3em"></p><div style="display:flex;gap:8px;justify-content:flex-end">' +
      '<button type="button" data-x style="background:transparent;color:inherit;border:1px solid var(--line,#ccc);border-radius:10px;padding:10px 16px;min-height:46px;font:inherit"></button><button type="submit" class="primary"></button></div></form>';
    d.querySelector('h2').textContent = tx('title');
    const area = d.querySelector('textarea'); area.placeholder = tx('ph'); area.setAttribute('aria-label', tx('title'));
    d.querySelector('[data-x]').textContent = tx('cancel');
    d.querySelector('[type=submit]').textContent = tx('send');
    d.querySelector('[data-x]').addEventListener('click', () => d.close());
    d.querySelector('form').addEventListener('submit', async ev => {
      ev.preventDefault();
      const message = area.value.trim(), st = d.querySelector('[role=status]'), a = api();
      if (message.length < 3 || !a || !a.feedback) return;
      const btn = d.querySelector('[type=submit]'); btn.disabled = true;
      try {
        await a.feedback({ message, screen: PAGE, role: currentRole(), lang: lang() });
        track('feedback_sent'); st.textContent = tx('ok'); setTimeout(() => d.close(), 1600);
      } catch (_) { st.textContent = tx('bad'); btn.disabled = false; }
    });
    d.addEventListener('close', () => d.remove());
    document.body.appendChild(d); d.showModal(); area.focus();
  }

  function mount() {
    if (document.querySelector('.ci-fb-btn')) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ci-fb-btn'; b.setAttribute('aria-haspopup', 'dialog');
    /* sits at the very end of the page, under the app, so it never covers content */
    b.style.cssText = 'display:block;margin:28px auto calc(28px + env(safe-area-inset-bottom));padding:10px 18px;border:1px solid var(--line,#ccc);border-radius:999px;font:inherit;font-size:15px;background:transparent;color:inherit;opacity:.8;cursor:pointer';
    const label = () => { b.textContent = '💬 ' + tx('btn'); };
    label();
    document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-lang]')) setTimeout(label, 50); });
    b.addEventListener('click', openBox);
    document.body.appendChild(b);
  }
  if (typeof HTMLDialogElement === 'function') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  }

  window.Insights = { track, flush };
})();
