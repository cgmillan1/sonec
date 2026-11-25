// Aviso diario para Victor: visitas de hoy y clientes que llevan 3 dias o mas sin respuesta.
// La llama pg_cron cada manana. Manda como maximo un correo cada 20 horas por cuenta, asi que
// llamarla de mas no llena el correo. No recibe datos: todo lo lee con la llave de servicio.
// A cada cliente sin respuesta lo recuerda una vez cada 3 dias (reminded_at), hasta que Victor
// le manda seguimiento, agenda visita, lo archiva o crea el proyecto.
// Usa el mismo secreto RESEND_API_KEY que lead-alert.
import { createClient } from "jsr:@supabase/supabase-js@2";

const TZ = "America/Denver", DAY = 864e5;
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const SVC_ES: Record<string, string> = { basement: "terminado de sótano", roof: "techo", deck: "deck y pérgola", kitchen: "cocina exterior", remodel: "remodelación interior", framing: "estructura y ampliación" };
const SVC_EN: Record<string, string> = { basement: "basement finishing", roof: "roofing", deck: "deck and pergola", kitchen: "outdoor kitchen", remodel: "interior remodel", framing: "framing and addition" };
const json = (msg: string, status = 200) => new Response(JSON.stringify({ msg }), { status, headers: { "Content-Type": "application/json" } });
const first = (n: string) => String(n || "").trim().split(/\s+/)[0] || "";
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });
const when = (iso: string) => new Date(iso).toLocaleString("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: TZ });
const btn = (href: string, label: string, bg: string) => `<a href="${esc(href)}" style="display:inline-block;background:${bg};color:#fff;text-decoration:none;padding:8px 14px;border-radius:8px;margin:0 6px 6px 0;font-size:14px">${label}</a>`;
const lastTouch = (l: any) => Math.max(Date.parse(l.created_at), l.followed_up_at ? Date.parse(l.followed_up_at) : 0);

Deno.serve(async (req) => {
  if (req.method !== "POST") return json("method", 405);
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return json("no key");
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: owners } = await db.from("settings").select("owner, notify_email, company, contact_name, digest_sent_at");
  const out: string[] = [];
  for (const s of owners || []) {
    const to = String(s.notify_email || "").trim();
    if (!to) continue;
    if (s.digest_sent_at && Date.now() - new Date(s.digest_sent_at).getTime() < 20 * 3600e3) { out.push("recent"); continue; }
    const { data: leads } = await db.from("leads").select("id, name, phone, email, city, service, message, lang, status, created_at, visit_at, visit_note, followed_up_at, reminded_at")
      .eq("owner", s.owner).in("status", ["new", "contacted"]).gte("created_at", new Date(Date.now() - 45 * DAY).toISOString());
    const now = Date.now(), today = dayKey(new Date());
    const visits = (leads || []).filter((l) => l.visit_at && dayKey(new Date(l.visit_at)) === today).sort((a, b) => Date.parse(a.visit_at) - Date.parse(b.visit_at));
    const stale = (leads || []).filter((l) => {
      const upcoming = l.visit_at && Date.parse(l.visit_at) > now - DAY;
      const reminded = l.reminded_at && now - Date.parse(l.reminded_at) < 3 * DAY - 3600e3;
      return now - lastTouch(l) >= 3 * DAY && !upcoming && !reminded;
    });
    if (!visits.length && !stale.length) { out.push("nothing"); continue; }

    const me = first(s.contact_name) || "Victor", co = s.company || "Grupo Sonec";
    const card = (l: any, kind: "visit" | "follow") => {
      const en = l.lang === "en", d = String(l.phone || "").replace(/\D/g, ""), wa = d.length === 10 ? "1" + d : d;
      const svc = (en ? SVC_EN : SVC_ES)[l.service] || "";
      const text = kind === "visit"
        ? (en ? `Hi ${first(l.name)}, this is ${me} from ${co}. Just confirming our visit today for your estimate. See you soon.` : `Hola ${first(l.name)}, soy ${me} de ${co}. Le confirmo la visita de hoy para su estimado. Nos vemos pronto.`)
        : (en ? `Hi ${first(l.name)}, this is ${me} from ${co}. Following up on the ${svc || "project"} estimate you asked for. Would you like us to come by and see the project this week?` : `Hola ${first(l.name)}, soy ${me} de ${co}. Le escribo por el estimado${svc ? " de " + svc : ""} que nos pidió. ¿Le gustaría que pasemos a ver el proyecto esta semana?`);
      const days = Math.floor((now - lastTouch(l)) / DAY);
      const sub = kind === "visit" ? `${esc(when(l.visit_at))}${l.visit_note ? " · " + esc(l.visit_note) : ""}` : `${days} días sin respuesta${SVC_ES[l.service] ? " · " + esc(SVC_ES[l.service]) : ""}${l.city ? " · " + esc(l.city) : ""}`;
      const links = [
        wa ? btn(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, "WhatsApp", "#1f7a3f") : "",
        wa ? btn(`sms:+${wa}?&body=${encodeURIComponent(text)}`, "Mensaje de texto", "#3d3d45") : "",
        /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(l.email || "") ? btn(`mailto:${l.email}?subject=${encodeURIComponent(co)}&body=${encodeURIComponent(text)}`, "Correo", "#3d3d45") : "",
        wa ? btn(`tel:+${wa}`, "Llamar", "#a24c1c") : "",
      ].join("");
      return `<div style="border:1px solid #e3e3e6;border-radius:10px;padding:12px 14px;margin:0 0 10px"><b style="font-size:16px">${esc(l.name)}</b><br><span style="color:#666;font-size:14px">${sub}</span>${l.message ? `<p style="margin:8px 0;color:#333;font-size:14px;white-space:pre-wrap">${esc(String(l.message).slice(0, 280))}</p>` : ""}<div style="margin-top:8px">${links}</div></div>`;
    };
    const html = `<div style="font-family:Arial,sans-serif;max-width:580px;color:#17171a">
<div style="background:#0d0d0f;color:#fff;padding:18px 22px;border-radius:10px 10px 0 0"><b style="font-size:18px">Tu día en Sonec</b><br><span style="color:#ec9259">Visitas de hoy y clientes por contestar</span></div>
<div style="border:1px solid #e3e3e6;border-top:0;padding:18px 22px;border-radius:0 0 10px 10px">
${visits.length ? `<h3 style="margin:0 0 10px">Visitas de hoy (${visits.length})</h3>${visits.map((l) => card(l, "visit")).join("")}` : ""}
${stale.length ? `<h3 style="margin:${visits.length ? 18 : 0}px 0 6px">Sin respuesta (${stale.length})</h3><p style="margin:0 0 10px;color:#666;font-size:14px">El mensaje ya va escrito: toca WhatsApp, revísalo y mándalo. Después márcalo en la app con "Mandar seguimiento".</p>${stale.map((l) => card(l, "follow")).join("")}` : ""}
<p style="margin:16px 0 0"><a href="https://cgmillan1.github.io/sonec/admin.html" style="color:#a24c1c">Abrir la app</a></p></div></div>`;

    const { data: claimed } = await db.from("settings").update({ digest_sent_at: new Date().toISOString() }).eq("owner", s.owner)
      .or(`digest_sent_at.is.null,digest_sent_at.lt.${new Date(Date.now() - 20 * 3600e3).toISOString()}`).select("owner");
    if (!claimed?.length) { out.push("recent"); continue; }
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: Deno.env.get("NOTIFY_FROM") || "Sonec <onboarding@resend.dev>", to: [to],
        subject: [visits.length ? `${visits.length} visita${visits.length > 1 ? "s" : ""} hoy` : "", stale.length ? `${stale.length} cliente${stale.length > 1 ? "s" : ""} sin respuesta` : ""].filter(Boolean).join(" · "), html }),
    });
    if (!r.ok) { console.log("lead-followup: Resend", r.status, (await r.text()).slice(0, 300)); await db.from("settings").update({ digest_sent_at: s.digest_sent_at }).eq("owner", s.owner); out.push("send failed"); continue; }
    if (stale.length) await db.from("leads").update({ reminded_at: new Date().toISOString() }).in("id", stale.map((l) => l.id));
    out.push(`sent ${visits.length}/${stale.length}`);
  }
  return json(out.join(",") || "no owners");
});
