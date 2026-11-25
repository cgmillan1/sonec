// Manda un correo a Victor cuando llega una solicitud de estimado desde el sitio web.
// La llama el trigger "leads_notify" de la base de datos con { id } de la solicitud.
// No confia en lo que llega: busca la solicitud con la llave de servicio, y solo manda
// el aviso una vez y si la solicitud es de los ultimos 10 minutos.
// Necesita el secreto RESEND_API_KEY (Supabase > Edge Functions > Secrets).
import { createClient } from "jsr:@supabase/supabase-js@2";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const SVC: Record<string, string> = { basement: "Terminado de sótano", roof: "Techo", deck: "Deck y pérgola", kitchen: "Cocina exterior", remodel: "Remodelación interior", framing: "Estructura y ampliación", other: "Otro" };
const ok = (msg: string, status = 200) => new Response(JSON.stringify({ msg }), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return ok("method", 405);
  let id = "";
  try { id = String((await req.json())?.id || ""); } catch (_) { return ok("bad body", 400); }
  if (!UUID.test(id)) return ok("bad id", 400);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: lead } = await db.from("leads").select("id, owner, name, phone, email, city, service, message, lang, created_at, notified_at").eq("id", id).maybeSingle();
  if (!lead) return ok("not found", 404);
  if (lead.notified_at) return ok("already sent");
  if (Date.now() - new Date(lead.created_at).getTime() > 10 * 60 * 1000) return ok("too old");

  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) { console.log("lead-alert: falta RESEND_API_KEY, no se mando correo"); return ok("no key"); }

  const { data: set } = await db.from("settings").select("notify_email").eq("owner", lead.owner).maybeSingle();
  const to = (set?.notify_email || Deno.env.get("NOTIFY_TO") || "").trim();
  if (!to) return ok("no recipient");

  // marca antes de mandar: si dos avisos llegan juntos, solo uno gana
  const { data: claimed } = await db.from("leads").update({ notified_at: new Date().toISOString() }).eq("id", id).is("notified_at", null).select("id");
  if (!claimed?.length) return ok("already sent");

  const digits = String(lead.phone || "").replace(/\D/g, "");
  const wa = digits.length === 10 ? "1" + digits : digits;
  const svc = SVC[lead.service] || lead.service || "";
  const admin = "https://cgmillan1.github.io/sonec/admin.html";
  const row = (k: string, v: string) => v ? `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">${k}</td><td style="padding:6px 0;font-weight:600">${v}</td></tr>` : "";
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;color:#17171a">
  <div style="background:#0d0d0f;color:#fff;padding:18px 22px;border-radius:10px 10px 0 0"><b style="font-size:18px">Nueva solicitud de estimado</b><br><span style="color:#ec9259">Grupo Sonec · sitio web</span></div>
  <div style="border:1px solid #e3e3e6;border-top:0;padding:18px 22px;border-radius:0 0 10px 10px">
  <table style="border-collapse:collapse;font-size:15px">${row("Nombre", esc(lead.name))}${row("Teléfono", esc(lead.phone))}${row("Correo", esc(lead.email))}${row("Ciudad", esc(lead.city))}${row("Trabajo", esc(svc))}${row("Idioma", lead.lang === "en" ? "Inglés" : "Español")}</table>
  ${lead.message ? `<p style="background:#f7f1ec;padding:12px 14px;border-radius:8px;white-space:pre-wrap">${esc(lead.message)}</p>` : ""}
  <p style="margin:18px 0 6px">
  ${digits ? `<a href="tel:+${wa}" style="display:inline-block;background:#a24c1c;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;margin:0 6px 6px 0">Llamar</a><a href="https://wa.me/${wa}" style="display:inline-block;background:#1f7a3f;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;margin:0 6px 6px 0">WhatsApp</a>` : ""}
  <a href="${admin}" style="display:inline-block;border:1px solid #17171a;color:#17171a;text-decoration:none;padding:9px 16px;border-radius:8px">Abrir la app</a></p>
  <p style="color:#666;font-size:13px">Contestar en los primeros minutos es lo que más trabajos cierra.</p></div></div>`;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("NOTIFY_FROM") || "Sonec <onboarding@resend.dev>",
      to: [to],
      subject: `Nueva solicitud: ${String(lead.name || "").slice(0, 60)}${svc ? " · " + svc : ""}`,
      html,
      ...(/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(lead.email || "") ? { reply_to: lead.email } : {}),
    }),
  });
  if (!r.ok) {
    console.log("lead-alert: Resend respondio", r.status, (await r.text()).slice(0, 300));
    await db.from("leads").update({ notified_at: null }).eq("id", id); // permite reintentar
    return ok("send failed", 502);
  }
  return ok("sent");
});
