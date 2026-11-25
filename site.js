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
    contractorLogin: 'Entrada del contratista', prev: 'Fotos anteriores', next: 'Siguientes fotos', workP2: 'Un deck de composite, una pérgola techada y una cocina exterior con asador empotrado, en un patio de Utah. Míralo tomar forma.', play: 'Reproducir', pause: 'Pausa', stepLabel: 'Paso de la obra', tlEnd: 'Terminado',
    errName: 'Escribe tu nombre.', errContact: 'Escribe un teléfono o un correo.', errEmail: 'Revisa el correo.', errSend: 'No se pudo enviar. Llámanos al (385) 266-0675.', errMany: 'Hay muchas solicitudes en este momento. Llámanos al (385) 266-0675.', sending: 'Enviando…',
    workH2: 'Nuestro trabajo, de principio a fin', projLabel: 'Proyectos', pDeck: 'Deck y cocina exterior', pShower: 'Regadera nueva', pTub: 'Baño con tina',
    pShowerD: 'Quitamos la regadera vieja hasta la estructura e hicimos una regadera de entrada con impermeabilización completa, porcelanato tipo mármol y piso de mosaico.',
    pTubD: 'Un baño completo: tina nueva, paredes y piso de porcelanato, nicho de mosaico, regadera de mano y luces empotradas.',
    s1: 'Demolición hasta la estructura', s2: 'Estructura y tubería revisadas', s3: 'Base de mortero y paneles para humedad', s4: 'Impermeabilización de paredes y piso', s5: 'Porcelanato tipo mármol en formato grande', s6: 'Piso de mosaico y paredes completas', s7: 'Terminado: regadera de entrada',
    t1: 'Así estaba: tina vieja y paredes dañadas', t2: 'Plomería y electricidad al descubierto', t3: 'Paneles nuevos resistentes a la humedad', t4: 'Tina nueva y base para el nicho', t5: 'Empieza el porcelanato', t6: 'Paredes niveladas pieza por pieza', t7: 'Membrana bajo el piso contra grietas', t8: 'Nicho de mosaico hexagonal', t9: 'Piso de porcelanato y muro bajo', t10: 'Terminado: tina, nicho y regadera de mano', t11: 'Luces empotradas nuevas', s8: 'Lista para usar',
    pKitchen: 'Cocina abierta', pDeck2: 'Deck elevado', pFloor: 'Pisos de madera',
    pKitchenD: 'Abrimos la casa: muros nuevos, piso nuevo, cocina con isla grande, gabinetes, luces colgantes y un baño principal con regadera de vidrio.',
    pDeck2D: 'Un deck elevado con vista al valle: estructura de madera tratada, piso de composite y barandal de metal.',
    pFloorD: 'Restauramos pisos de madera originales: lijado, prueba de color, tinte y barniz hasta dejarlos brillando.',
    k1: 'Así estaba: cuartos cerrados y oscuros', k2: 'Estructura de los muros nuevos', k3: 'Un espacio más abierto', k4: 'Piso nuevo en toda la planta', k5: 'Cocina con isla y gabinetes nuevos', k6: 'Isla con fregadero y luces colgantes', k7: 'Baño principal con regadera de vidrio',
    pBasement: 'Sótano terminado', pBasementD: 'Convertimos un sótano sin terminar en recámaras, baño con regadera, cocineta y lavandería: estructura, drenaje, electricidad, aislamiento, drywall, pintura y piso laminado.',
    m1: 'Estructura de los cuartos', m2: 'Muros para las recámaras', m3: 'Drenaje nuevo bajo el piso', m4: 'Pasillo y cajas eléctricas', m5: 'Base de la regadera y plomería', m6: 'Aislamiento y panel eléctrico', m7: 'Toda la planta enmarcada', m8: 'Drywall colocado', m9: 'Cocineta y cuarto de lavado', m10: 'Juntas y resanes', m11: 'Cinta y compuesto en todo el sótano', m12: 'Compuesto en paredes y textura en techos', m13: 'Escalera lista para pintura', m14: 'Paredes lisas y pintura blanca', m15: 'Closet pintado', m16: 'Instalando el piso laminado', m17: 'Piso hacia el baño y la lavandería', m18: 'Terminado: cocineta con piso nuevo', m19: 'Recámara terminada',
    pBasement2: 'Sótano con alfombra', pBasement2D: 'Otro sótano de principio a fin: estructura, aislamiento, baño con tina, pintura, alfombra en recámaras y escalera.',
    n1: 'Pasillo y cuartos enmarcados', n2: 'Estructura, plomería y electricidad', n3: 'Aislamiento en muros exteriores', n4: 'Drywall con compuesto', n5: 'Tina y regadera instaladas', n6: 'Paredes pintadas y molduras', n7: 'Espacio bajo la escalera', n8: 'Escalera lista para alfombra', n9: 'Baño terminado', n10: 'Recámara con alfombra nueva', n11: 'Escalera con alfombra',
    pBasement3: 'Sótano con piso vinílico', pBasement3D: 'Terminamos un sótano con textura en techos, luces empotradas, pintura y piso vinílico en recámaras, pasillo y cocineta.',
    v1: 'Textura nueva en el techo', v2: 'Pasillo con luz empotrada', v3: 'Luces empotradas en toda la planta', v4: 'Empieza el piso vinílico', v5: 'Piso en la recámara principal', v6: 'Piso hasta la puerta del baño', v7: 'Pasillo terminado', v8: 'Cocineta con piso nuevo', v9: 'Recámara con closet doble', v10: 'Recámara terminada',
    pPorch: 'Entrada de composite', pPorchD: 'Una entrada nueva con escalones anchos de composite, marco en ángulo y descanso al nivel de la banqueta.',
    e1: 'Piso de composite con marco', e2: 'Escalones con orillas en ángulo', e3: 'Detalle del descanso', e4: 'Escalones vistos de lado', e5: 'Descanso terminado', e6: 'Terminado: entrada lista',
    pShop: 'Pintura de taller', pShopD: 'Pintamos un taller mecánico con franjas en los colores del negocio: blanco arriba, naranja al centro y azul marino abajo, incluyendo el tapanco de madera.',
    sh1: 'Tapanco y muros antes de pintar', sh2: 'Primeras capas de las franjas', sh3: 'Muro con ventanas', sh4: 'Franjas junto al portón', sh5: 'Muro del tapanco en azul marino', sh6: 'Franjas terminadas', sh7: 'Piso lavado a presión', sh8: 'Terminado: taller con los colores del negocio',
    pWall: 'Pared nueva en la escalera', pWallD: 'Cerramos un hueco junto a la escalera: estructura, drywall, cinta, compuesto y textura para que la pared nueva se vea igual que el resto de la casa.',
    p1: 'Estructura para la pared nueva', p2: 'Drywall colocado', p3: 'Cinta en las uniones con el techo', p4: 'Primera capa de compuesto', p5: 'Compuesto alisado', p6: 'Terminado: textura igual al resto de la casa',
    pKitchenette: 'Cocineta nueva', pKitchenetteD: 'Una cocineta completa en un sótano: gabinetes grises, cubierta de cuarzo, campana, azulejo negro y conexiones para estufa y fregadero.',
    g1: 'Paredes listas para la cocineta', g2: 'Gabinetes, estufa y fregadero', g3: 'Cubierta de cuarzo', g4: 'Ajustes finales de la cubierta', g5: 'Plantilla para el azulejo', g6: 'Instalando el azulejo negro', g7: 'Terminado: cocineta lista',
    d1: 'Postes, vigas y estructura', d2: 'Barandal de metal', d3: 'Terminado, con vista al valle', d4: 'Listo para usarse',
    f1: 'Lijado de orillas a mano', f2: 'Madera lijada, sin el acabado viejo', f3: 'Prueba de color', f4: 'Aplicando el tinte', f5: 'Barniz final', f6: 'Brillo como nuevo', f7: 'Terminado',
    title: 'Grupo Sonec · Decks, sótanos, techos y remodelaciones en Utah'
  };
  const EN_EXTRA = { pShowerD: 'We took the old shower down to the studs and built a walk-in shower with full waterproofing, marble-look porcelain and a mosaic floor.',
    pTubD: 'A full bathroom: new tub, porcelain walls and floor, a mosaic niche, a handheld shower and recessed lights.',
    s1: 'Demolition down to the studs', s2: 'Framing and plumbing checked', s3: 'Mortar bed and moisture-resistant board', s4: 'Waterproofing on walls and floor', s5: 'Large marble-look porcelain', s6: 'Mosaic floor and finished walls', s7: 'Finished: walk-in shower',
    t1: 'Before: old tub and damaged walls', t2: 'Plumbing and wiring opened up', t3: 'New moisture-resistant board', t4: 'New tub and the niche framed', t5: 'Porcelain goes up', t6: 'Walls leveled tile by tile', t7: 'Crack-isolation membrane under the floor', t8: 'Hexagon mosaic niche', t9: 'Porcelain floor and half wall', t10: 'Finished: tub, niche and handheld shower', t11: 'New recessed lights', s8: 'Ready to use',
    pKitchenD: 'We opened up the house: new walls, new flooring, a kitchen with a large island, cabinets, pendant lights and a primary bath with a glass shower.',
    pDeck2D: 'A raised deck with a view of the valley: treated wood framing, composite decking and a metal railing.',
    pFloorD: 'We restored original hardwood floors: sanding, a color test, stain and finish until they shine.',
    k1: 'Before: closed, dark rooms', k2: 'Framing the new walls', k3: 'A more open space', k4: 'New flooring on the whole floor', k5: 'Kitchen with island and new cabinets', k6: 'Island with sink and pendant lights', k7: 'Primary bath with glass shower',
    pBasementD: 'We turned an unfinished basement into bedrooms, a bathroom with a shower, a kitchenette and a laundry room: framing, drain lines, electrical, insulation, drywall, paint and laminate flooring.',
    m1: 'Framing the rooms', m2: 'Bedroom walls', m3: 'New drain lines under the floor', m4: 'Hallway and electrical boxes', m5: 'Shower base and plumbing', m6: 'Insulation and electrical panel', m7: 'The whole floor framed', m8: 'Drywall hung', m9: 'Kitchenette and laundry room', m10: 'Tape and mud', m11: 'Tape and mud across the basement', m12: 'Skim coat on walls, texture on ceilings', m13: 'Stairs ready for paint', m14: 'Smooth walls and white paint', m15: 'Closet painted', m16: 'Installing laminate flooring', m17: 'Flooring toward the bath and laundry', m18: 'Finished: kitchenette with new floor', m19: 'Bedroom finished',
    pBasement2D: 'Another basement start to finish: framing, insulation, a bathroom with tub, paint, carpet in the bedrooms and stairs.',
    n1: 'Hallway and rooms framed', n2: 'Framing, plumbing and electrical', n3: 'Insulation on exterior walls', n4: 'Drywall with mud', n5: 'Tub and shower installed', n6: 'Walls painted and trim', n7: 'Space under the stairs', n8: 'Stairs ready for carpet', n9: 'Bathroom finished', n10: 'Bedroom with new carpet', n11: 'Carpeted stairs',
    pBasement3D: 'We finished a basement with ceiling texture, recessed lights, paint and vinyl plank flooring in the bedrooms, hallway and kitchenette.',
    v1: 'New ceiling texture', v2: 'Hallway with recessed light', v3: 'Recessed lights across the floor', v4: 'Vinyl plank flooring begins', v5: 'Flooring in the main bedroom', v6: 'Flooring up to the bathroom door', v7: 'Hallway finished', v8: 'Kitchenette with new floor', v9: 'Bedroom with double closet', v10: 'Bedroom finished',
    pPorchD: 'A new entry with wide composite steps, a mitered picture frame and a landing at sidewalk level.',
    e1: 'Composite decking with border', e2: 'Steps with mitered edges', e3: 'Landing detail', e4: 'Steps from the side', e5: 'Landing finished', e6: 'Finished: entry ready',
    pShopD: 'We painted an auto shop in the business colors: white on top, orange in the middle and navy below, including the wood loft.',
    sh1: 'Loft and walls before paint', sh2: 'First coats of the stripes', sh3: 'Wall with windows', sh4: 'Stripes next to the bay door', sh5: 'Loft wall in navy', sh6: 'Stripes finished', sh7: 'Floor pressure washed', sh8: 'Finished: shop in the business colors',
    pWallD: 'We closed an opening next to the stairs: framing, drywall, tape, mud and texture so the new wall matches the rest of the house.',
    p1: 'Framing for the new wall', p2: 'Drywall hung', p3: 'Tape on the ceiling joints', p4: 'First coat of mud', p5: 'Mud smoothed out', p6: 'Finished: texture matching the house',
    pKitchenetteD: 'A full basement kitchenette: gray cabinets, quartz countertop, range hood, black tile backsplash and hookups for the range and sink.',
    g1: 'Walls ready for the kitchenette', g2: 'Cabinets, range and sink', g3: 'Quartz countertop', g4: 'Final countertop adjustments', g5: 'Template for the tile', g6: 'Installing the black tile', g7: 'Finished: kitchenette ready',
    d1: 'Posts, beams and framing', d2: 'Metal railing', d3: 'Finished, with a view of the valley', d4: 'Ready to enjoy',
    f1: 'Hand sanding the edges', f2: 'Wood sanded, old finish removed', f3: 'Color test', f4: 'Applying the stain', f5: 'Final finish coat', f6: 'Shining like new', f7: 'Finished', pause: 'Pause', errName: 'Please type your name.', errContact: 'Please add a phone or an email.', errEmail: 'Please check the email.', errSend: 'We could not send it. Call us at (385) 266-0675.', errMany: 'We are getting many requests right now. Call us at (385) 266-0675.', sending: 'Sending…' };

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

  /* ---- timelapse of the build, one project at a time ---- */
  {
    const tl = document.getElementById('tl'), frame = tl.querySelector('.tlframe'), barsBox = tl.querySelector('.tlbars');
    const range = document.getElementById('tlrange'), playBtn = document.getElementById('tlplay'), desc = document.getElementById('pdesc');
    const num = document.getElementById('tlnum'), txt = document.getElementById('tltxt'), strip = document.querySelector('.strip'), list = strip.querySelector('ol');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* the deck is written in the page (works without JavaScript); the bathrooms are added here */
    const deck = [...list.querySelectorAll('button')].map(b => { const im = b.querySelector('img'); return { img: im.getAttribute('src').replace('-sm.jpg', ''), w: +im.width || 800, h: +im.height || 600, k: b.querySelector('span').dataset.i18n }; });
    const tall = (keys, files) => files.map((f, n) => ({ img: 'img/' + f, w: 600, h: 800, k: keys + (n + 1) }));
    const wide = (keys, files) => files.map((f, n) => ({ img: 'img/' + f, w: 800, h: 600, k: keys + (n + 1) }));
    const P = {
      deck: { d: 'workP2', tall: false, steps: deck },
      shower: { d: 'pShowerD', tall: true, steps: tall('s', ['b1-demolicion', 'b2-estructura', 'b3-base', 'b4-impermeable', 'b5-porcelanato', 'b6-mosaico', 'b7-terminado', 'b8-listo']) },
      tub: { d: 'pTubD', tall: true, steps: tall('t', ['t01-antes', 't02-plomeria', 't03-paneles', 't04-tina', 't05-porcelanato', 't06-nivelacion', 't07-membrana', 't08-nicho', 't09-piso', 't10-terminado', 't11-luces']) },
      kitchen: { d: 'pKitchenD', tall: false, steps: wide('k', ['k1-antes', 'k2-estructura', 'k3-muro', 'k4-espacio', 'k5-cocina', 'k6-isla', 'k7-bano']) },
      deck2: { d: 'pDeck2D', tall: false, steps: wide('d', ['d1-estructura', 'd2-barandal', 'd3-vista', 'd4-terminado']) },
      basement: { d: 'pBasementD', tall: false, steps: wide('m', ['m01-estructura', 'm02-muros', 'm03-drenaje', 'm04-pasillo', 'm05-regadera', 'm06-aislamiento', 'm07-planta', 'm08-drywall', 'm09-lavanderia', 'm10-juntas', 'm11-terminado', 'm12-textura', 'm13-escalera', 'm14-pintura', 'm15-closet', 'm16-piso', 'm17-pasillo', 'm18-terminado', 'm19-recamara']) },
      basement2: { d: 'pBasement2D', tall: false, steps: wide('n', ['n01-pasillo', 'n02-estructura', 'n03-aislamiento', 'n04-compuesto', 'n05-tina', 'n06-pintura', 'n07-escalera-nicho', 'n08-escalera', 'n09-bano', 'n10-recamara', 'n11-alfombra']) },
      basement3: { d: 'pBasement3D', tall: false, steps: wide('v', ['v01-textura', 'v02-pasillo', 'v03-luces', 'v04-piso', 'v05-piso2', 'v06-bano', 'v07-pasillo', 'v08-cocineta', 'v09-recamara', 'v10-terminado']) },
      porch: { d: 'pPorchD', tall: false, steps: wide('e', ['e1-marco', 'e2-escalones', 'e3-detalle', 'e4-orilla', 'e5-descanso', 'e6-terminado']) },
      kitchenette: { d: 'pKitchenetteD', tall: false, steps: wide('g', ['g1-paredes', 'g2-gabinetes', 'g3-cubierta', 'g4-instalacion', 'g5-plantilla', 'g6-azulejo', 'g7-terminado']) },
      shop: { d: 'pShopD', tall: false, steps: wide('sh', ['w1-tapanco', 'w2-franjas', 'w3-ventanas', 'w4-porton', 'w5-muro', 'w6-terminado', 'w7-lavado', 'w8-terminado']) },
      wall: { d: 'pWallD', tall: true, steps: tall('p', ['p1-estructura', 'p2-drywall', 'p3-cinta', 'p4-compuesto', 'p5-resane', 'p6-terminado']) },
      floor: { d: 'pFloorD', tall: false, steps: wide('f', ['f1-lijado', 'f2-madera', 'f3-prueba', 'f4-tinte', 'f5-barniz', 'f6-brillo', 'f7-terminado']) }
    };
    let frames = [], chips = [], bars = [], i = 0, timer = null, played = false, cur = 'deck';
    const build = id => {
      const p = P[id]; cur = id;
      frame.querySelectorAll(':scope > img').forEach(x => x.remove());
      const cap = frame.firstElementChild;
      p.steps.forEach((s, n) => { const im = document.createElement('img'); im.src = s.img + '-sm.jpg'; im.srcset = `${s.img}-sm.jpg ${s.w}w, ${s.img}.jpg ${s.w * 2}w`; im.sizes = p.tall ? '(max-width:700px) 100vw, 600px' : '(max-width:1120px) 100vw, 1060px'; im.alt = ''; im.width = s.w; im.height = s.h; if (n > 1) im.loading = 'lazy'; frame.insertBefore(im, cap); });
      frame.classList.toggle('tall', p.tall);
      barsBox.innerHTML = p.steps.map(() => '<i></i>').join('');
      list.innerHTML = p.steps.map((s, n) => `<li><button type="button" data-step="${n}" aria-label="${n + 1}"><img src="${s.img}-sm.jpg" alt="" loading="lazy" width="${s.w}" height="${s.h}"><b>${n + 1}</b><span data-i18n="${s.k}">${t(s.k)}</span></button></li>`).join('');
      frames = [...frame.querySelectorAll(':scope > img')]; bars = [...barsBox.children]; chips = [...list.querySelectorAll('[data-step]')];
      range.max = frames.length; desc.dataset.i18n = p.d; desc.textContent = t(p.d);
      document.querySelectorAll('[data-proj]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.proj === id)));
      const on = document.querySelector(`[data-proj="${id}"]`), box = on && on.parentElement; if (box && box.scrollWidth > box.clientWidth) box.scrollTo({ left: on.offsetLeft - box.clientWidth / 2 + on.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
      strip.scrollTo({ left: 0 }); show(0);
    };
    const show = (n, fromUser) => {
      i = Math.max(0, Math.min(frames.length - 1, n));
      frames.forEach((f, k) => f.classList.toggle('on', k === i));
      bars.forEach((b, k) => b.classList.toggle('done', k <= i));
      chips.forEach((c, k) => k === i ? c.setAttribute('aria-current', 'step') : c.removeAttribute('aria-current'));
      range.value = i + 1; num.textContent = `${i + 1} / ${frames.length}`;
      txt.textContent = t(P[cur].steps[i].k);
      range.setAttribute('aria-valuetext', `${i + 1} / ${frames.length}: ${txt.textContent}`);
      if (fromUser) { const c = chips[i]; strip.scrollTo({ left: c.offsetLeft - strip.clientWidth / 2 + c.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' }); }
      if (frames[i + 1]) frames[i + 1].loading = 'eager';
    };
    const label = () => { playBtn.classList.toggle('playing', !!timer); playBtn.setAttribute('aria-label', t(timer ? 'pause' : 'play')); };
    const stop = () => { clearInterval(timer); timer = null; label(); };
    const play = () => {
      if (i >= frames.length - 1) show(0);
      stop(); played = true;
      timer = setInterval(() => { if (i >= frames.length - 1) return stop(); show(i + 1); }, 1500); label();
    };
    playBtn.addEventListener('click', () => (timer ? stop() : play()));
    range.addEventListener('input', () => { stop(); show(range.value - 1, true); });
    list.addEventListener('click', e => { const c = e.target.closest('[data-step]'); if (!c) return; stop(); show(+c.dataset.step, true); tl.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); });
    document.querySelectorAll('[data-proj]').forEach(b => b.addEventListener('click', () => { if (b.dataset.proj === cur) return; stop(); build(b.dataset.proj); if (!reduce) play(); }));
    tl.addEventListener('keydown', e => { if (e.target === range) return; if (e.key === 'ArrowRight') { stop(); show(i + 1, true); } if (e.key === 'ArrowLeft') { stop(); show(i - 1, true); } });
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !played && !reduce) play();
      if (!e.isIntersecting && timer) stop();
    }), { threshold: 0.55 }).observe(tl);
    build('deck'); label();
    document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => { list.querySelectorAll('[data-i18n]').forEach(n => { n.textContent = t(n.dataset.i18n); }); desc.textContent = t(P[cur].d); show(i); label(); }));
  }

  /* ---- reveal on scroll (only when motion is welcome) ---- */
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('anim');
    document.querySelectorAll('.rvkids').forEach(g => [...g.children].forEach((c, k) => c.style.setProperty('--d', `${k * 70}ms`)));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.rv, .rvkids').forEach(n => io.observe(n));
  }

  /* photo strip arrows (kept for older pages) */
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

/* hero intro: the outdoor kitchen builds itself once, then rests on the photo */
(function () {
  var v = document.querySelector('.herovid');
  if (!v) return;
  var rm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var save = navigator.connection && navigator.connection.saveData;
  if (rm || save) { v.remove(); return; }
  v.muted = true;
  v.src = v.dataset.src;
  v.addEventListener('playing', function () { v.classList.add('on'); }, { once: true });
  v.addEventListener('error', function () { v.remove(); }, { once: true });
  var p = v.play();
  if (p && p.catch) p.catch(function () { v.remove(); });
})();
