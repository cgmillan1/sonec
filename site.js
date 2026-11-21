/* Sonec public website: language switch and estimate form. */
{
  /* old client links pointed at index.html?p=..., send them to the client app */
  const tok = new URLSearchParams(location.search).get('p');
  if (tok) location.replace('proyecto.html?p=' + encodeURIComponent(tok));

  const ES = {
    skip: 'Saltar al contenido', brandSub: 'Construcción y remodelación', navServices: 'Servicios', navWork: 'Nuestro trabajo', navApp: 'Tu proyecto', navEstimate: 'Estimado', call: 'Llamar',
    heroAlt: 'Deck con pérgola y cocina exterior iluminada de noche, construida por Sonec',
    heroH: 'Decks, sótanos, techos y remodelaciones en Utah',
    heroP: 'Desde la primera base hasta la última luz. Con licencia y seguro, en Utah County y Salt Lake County, en español e inglés.',
    ctaEstimate: 'Pide tu estimado', ctaCall: 'Llama al',
    trust1: 'Con licencia y seguro en Utah', trust2: 'Utah County y Salt Lake County', trust3: 'We speak English',
    servH: 'Lo que construimos', servP: 'Un mismo equipo de principio a fin, para proyectos grandes y pequeños.',
    s1h: 'Terminado de sótanos', s1p: 'Estructura, drywall y acabados para convertir un sótano vacío en espacios que tu familia va a usar.',
    s2h: 'Techos', s2p: 'Reparación y reemplazo de techos, bien hechos y con todo limpio al terminar.',
    s3h: 'Decks y pérgolas', s3p: 'Decks de composite y madera, escaleras, barandales y pérgolas techadas, hechos para el clima de Utah.',
    s4h: 'Cocinas exteriores', s4p: 'Asadores empotrados, piedra, cubiertas, fregaderos e iluminación para cocinar y convivir afuera.',
    s5h: 'Remodelación interior', s5p: 'Cocinas, baños, pisos y paredes, desde la demolición hasta los últimos detalles.',
    s6h: 'Estructura y ampliaciones', s6p: 'Paredes, estructura y marcos para cuartos nuevos, ampliaciones y espacios exteriores.',
    workH: 'Un proyecto, de principio a fin', workP: 'Un deck de composite, una pérgola techada y una cocina exterior con asador empotrado, en un patio de Utah. Desliza para ver cómo lo construimos.',
    w1: 'Bases y cimiento', w2: 'Estructura del deck', w3: 'Piso de composite', w4: 'Marco del muro', w5: 'Escalones y tablaroca de cemento', w6: 'Postes y vigas', w7: 'Estructura de la pérgola', w8: 'Marco de la cocina exterior', w9: 'Techo de la pérgola', w10: 'Paneles del muro', w11: 'Recubrimiento de piedra', w12: 'Cubierta y fregadero', w13: 'La primera noche con las luces',
    appH: 'Sigue tu proyecto desde tu teléfono', appP: 'Cada cliente tiene una página privada de su proyecto. Ya no tienes que preguntarte qué está pasando en tu casa.',
    a1: 'El avance, los pasos hechos y lo que sigue', a2: 'Tu estimado, separado en materiales y mano de obra', a3: 'Cuánto has pagado y cuánto falta', a4: 'Apruebas cualquier cambio antes de que se haga', a5: 'Fotos de cada etapa y mensajes con el equipo',
    procH: 'Cómo trabajamos',
    p1h: 'Visita y estimado', p1p: 'Vamos a tu casa, medimos y te mandamos un estimado claro.',
    p2h: 'Plan y aprobación', p2p: 'Apruebas el estimado y el calendario de pagos antes de empezar.',
    p3h: 'Construimos', p3p: 'El equipo trabaja y sube avances y fotos a la página de tu proyecto.',
    p4h: 'Entrega final', p4p: 'Revisamos contigo el proyecto terminado y cerramos cada detalle.',
    estH: 'Pide tu estimado', estP: 'Cuéntanos de tu proyecto y te llamamos. También puedes llamar o mandar un WhatsApp.',
    areaH: 'Dónde trabajamos', areaP: 'Utah County y Salt Lake County, Utah. Con licencia y seguro.',
    fName: 'Nombre', fPhone: 'Teléfono', fEmail: 'Correo', fContact: 'Teléfono o correo, para poder contactarte.', fCity: 'Ciudad', fService: 'Servicio', other: 'Otra cosa', fMsg: 'Cuéntanos del proyecto', fSend: 'Enviar solicitud',
    okH: '¡Gracias!', okP: 'Recibimos tu solicitud y te contactaremos pronto.',
    contractorLogin: 'Entrada del contratista', prev: 'Fotos anteriores', next: 'Siguientes fotos',
    errName: 'Escribe tu nombre.', errContact: 'Escribe un teléfono o un correo.', errEmail: 'Revisa el correo.', errSend: 'No se pudo enviar. Llámanos al (385) 266-0675.', errMany: 'Hay muchas solicitudes en este momento. Llámanos al (385) 266-0675.', sending: 'Enviando…',
    title: 'Grupo Sonec · Decks, sótanos, techos y remodelaciones en Utah'
  };
  const EN_EXTRA = { errName: 'Please type your name.', errContact: 'Please add a phone or an email.', errEmail: 'Please check the email.', errSend: 'We could not send it. Call us at (385) 266-0675.', errMany: 'We are getting many requests right now. Call us at (385) 266-0675.', sending: 'Sending…' };

  const nodes = [...document.querySelectorAll('[data-i18n]')], EN = {};
  nodes.forEach(n => { EN[n.dataset.i18n] = n.textContent; });
  document.querySelectorAll('[data-i18n-alt]').forEach(n => { EN[n.dataset.i18nAlt] = n.alt; });
  document.querySelectorAll('[data-i18n-aria]').forEach(n => { EN[n.dataset.i18nAria] = n.getAttribute('aria-label'); });
  EN.title = document.title; Object.assign(EN, EN_EXTRA);

  let L = 'en';
  try { L = localStorage.getItem('sonec-lang') || ((navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en'); } catch (_) {}
  const t = k => (L === 'es' ? ES[k] : EN[k]) ?? EN[k] ?? k;

  function apply() {
    document.documentElement.lang = L;
    nodes.forEach(n => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll('[data-i18n-alt]').forEach(n => { n.alt = t(n.dataset.i18nAlt); });
    document.querySelectorAll('[data-i18n-aria]').forEach(n => { n.setAttribute('aria-label', t(n.dataset.i18nAria)); });
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === L)));
    document.querySelectorAll('[data-shot]').forEach(i => { i.src = `img/app-${i.dataset.shot}-${L}.jpg`; });
    document.title = t('title');
  }
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => {
    L = b.dataset.lang; try { localStorage.setItem('sonec-lang', L); } catch (_) {} apply();
  }));
  apply();

  /* photo strip arrows */
  const strip = document.querySelector('.strip');
  document.querySelectorAll('[data-strip]').forEach(b => b.addEventListener('click', () => {
    strip.scrollBy({ left: +b.dataset.strip * Math.max(300, strip.clientWidth * 0.8), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }));

  /* estimate form */
  const f = document.getElementById('estf'), err = document.getElementById('ferr'), ok = document.getElementById('fok'), btn = f.querySelector('[type=submit]');
  f.addEventListener('submit', async e => {
    e.preventDefault(); err.textContent = '';
    const v = Object.fromEntries(new FormData(f)); Object.keys(v).forEach(k => v[k] = String(v[k] || '').trim());
    if (v.website) return; /* bots fill the hidden field */
    const bad = (name, msg) => { err.textContent = t(msg); f.elements[name].setAttribute('aria-invalid', 'true'); f.elements[name].focus(); };
    [...f.elements].forEach(x => x.removeAttribute && x.removeAttribute('aria-invalid'));
    if (!v.name) return bad('name', 'errName');
    if (!v.phone && !v.email) return bad('phone', 'errContact');
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return bad('email', 'errEmail');
    if (btn.disabled) return;
    btn.disabled = true; btn.textContent = t('sending');
    try {
      if (!window.API || !API.ready) throw new Error('not configured');
      await API.submitLead({ ...v, lang: L });
      [...f.querySelectorAll('label, .two, .hint, .err, button')].forEach(x => x.hidden = true);
      ok.hidden = false; ok.focus && ok.setAttribute('tabindex', '-1'); ok.focus();
    } catch (x) {
      console.error(x);
      err.textContent = t(/too many/i.test(x.message || '') ? 'errMany' : 'errSend');
      btn.disabled = false; btn.textContent = t('fSend');
    }
  });
}
