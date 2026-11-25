/* Sonec data layer: every read and write goes through window.API. */
(function () {
  if (window.SONEC_MOCK) { window.API = window.SONEC_MOCK; return; }
  const cfg = window.SONEC_CONFIG || {};
  const ready = !!(cfg.url && cfg.key && window.supabase);
  const sb = ready ? window.supabase.createClient(cfg.url, cfg.key) : null;
  const ok = ({ data, error }) => { if (error) throw new Error(error.message || String(error)); return data; };
  const CHILD = ['items', 'materials', 'steps', 'updates', 'payments', 'milestones', 'change_orders', 'budget', 'expenses', 'comments', 'documents'];

  window.API = {
    ready,
    CHILD,
    async session() { return ok(await sb.auth.getSession()).session; },
    onAuth(cb) { sb.auth.onAuthStateChange((_e, s) => cb(s)); },
    async signIn(email, password) { return ok(await sb.auth.signInWithPassword({ email, password })); },
    async signOut() { await sb.auth.signOut(); },

    async getSettings() {
      const rows = ok(await sb.from('settings').select('*').limit(1));
      if (rows[0]) return rows[0];
      return ok(await sb.from('settings').insert({}).select().single());
    },
    async saveSettings(patch) { return ok(await sb.from('settings').update(patch).not('owner', 'is', null).select().single()); },

    /* every project with all of its rows, for the dashboard */
    async loadAll() {
      const projects = ok(await sb.from('projects').select('*').order('created_at', { ascending: false }));
      const out = {};
      projects.forEach(p => { out[p.id] = { project: p }; CHILD.forEach(t => out[p.id][t] = []); });
      await Promise.all(CHILD.map(async t => {
        const rows = ok(await sb.from(t).select('*'));
        rows.forEach(r => out[r.project_id] && out[r.project_id][t].push(r));
      }));
      return projects.map(p => out[p.id]);
    },
    async insert(table, row) { return ok(await sb.from(table).insert(row).select().single()); },
    async insertMany(table, rows) { return rows.length ? ok(await sb.from(table).insert(rows).select()) : []; },
    async update(table, id, patch) { return ok(await sb.from(table).update(patch).eq('id', id).select().single()); },
    async remove(table, id) { ok(await sb.from(table).delete().eq('id', id)); },
    async markSeen(projectId) { ok(await sb.from('comments').update({ seen: true }).eq('project_id', projectId).eq('author', 'client').eq('seen', false)); },

    async upload(bucket, path, blob) { ok(await sb.storage.from(bucket).upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: false })); return path; },
    async removeFiles(bucket, paths) { if (paths && paths.length) ok(await sb.storage.from(bucket).remove(paths)); },
    async listFolder(bucket, folder) { return (ok(await sb.storage.from(bucket).list(folder, { limit: 1000 })) || []).map(f => folder + '/' + f.name); },
    docUrl(path) { return sb.storage.from('docs').getPublicUrl(path).data.publicUrl; },
    photoUrl(path) { return sb.storage.from('photos').getPublicUrl(path).data.publicUrl; },
    async receiptUrl(path) { return ok(await sb.storage.from('receipts').createSignedUrl(path, 600)).signedUrl; },

    async listLeads() { return ok(await sb.from('leads').select('*').order('created_at', { ascending: false }).limit(200)); },
    async submitLead(f) { ok(await sb.rpc('submit_lead', { who: f.name, tel: f.phone, mail: f.email, town: f.city, svc: f.service, msg: f.message, lng: f.lang })); },
    /* client side: no login, only the private token */
    async clientProject(tok) { return ok(await sb.rpc('client_project', { tok })); },
    async clientComment(tok, who, msg) { ok(await sb.rpc('client_comment', { tok, who, msg })); },
    async clientDecide(tok, co, approve, who) { ok(await sb.rpc('client_decide', { tok, co, approve, who })); },
    async clientDecideSigned(tok, co, approve, who, sig) { ok(await sb.rpc('client_decide_signed', { tok, co, approve, who, sig })); },
    async clientSign(tok, doc, who, sig) { ok(await sb.rpc('client_sign', { tok, doc, who, sig })); },
    /* errors go to a private table Victor and Cristian can read; no personal data, no secret link */
    logError(msg, src) {
      if (!sb) return;
      const page = location.pathname.split('/').pop() || 'index.html';
      sb.rpc('log_error', { pg: page, m: String(msg || '').slice(0, 500), s: String(src || '').slice(0, 1500), u: navigator.userAgent.slice(0, 200) }).then(() => {}, () => {});
    }
  };

  /* catch what breaks on people's phones so it can be fixed before they call */
  const seen = new Set(); let sent = 0;
  const report = (msg, src) => {
    msg = String(msg || '').replace(/[?#]p=[\w-]+/g, '');
    if (!msg || seen.has(msg) || sent >= 5 || /ResizeObserver loop|Script error\.?$/.test(msg)) return;
    seen.add(msg); sent++; window.API.logError(msg, src);
  };
  addEventListener('error', e => report(e.message, (e.error && e.error.stack) || `${e.filename}:${e.lineno}:${e.colno}`));
  addEventListener('unhandledrejection', e => { const r = e.reason || {}; report(r.message || String(r), r.stack || ''); });
})();
