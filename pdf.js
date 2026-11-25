/* Sonec documents: estimate, contract and completion statement as real PDF files (jsPDF).
   Every document is drawn from a snapshot, so a contract always shows what was agreed,
   and the completion statement lists every amount added or changed since then. */
(function () {
const S = window.SONEC;
const TX = {
es: {
  estimate: 'Estimado', contract: 'Contrato de construcción residencial', completion: 'Terminación del proyecto y estado de cuenta final',
  date: 'Fecha', page: 'Página', of: 'de', client: 'Cliente', contractor: 'Contratista', property: 'Propiedad', project: 'Proyecto',
  phone: 'Tel.', email: 'Correo', license: 'Licencia de contratista de Utah (DOPL)', materials: 'Materiales', labor: 'Mano de obra',
  desc: 'Concepto', qty: 'Cant.', price: 'Precio', amount: 'Importe', subtotal: 'Subtotal', taxMat: 'Impuesto sobre materiales', total: 'Total',
  changes: 'Cambios aprobados', schedule: 'Calendario de pagos', none: 'Ninguno', paid: 'Pagado', balance: 'Saldo pendiente',
  start: 'Inicio estimado', end: 'Terminación estimada', blank: '________________',
  estNote: 'Este estimado se basa en las cantidades y precios conocidos a la fecha. El monto final puede cambiar según los materiales realmente necesarios, permisos y requisitos de la ciudad, como se explica en el contrato.',
  validity: 'Estimado válido por 30 días a partir de la fecha.',
  sigContractor: 'Firma del contratista', sigClient: 'Firma del cliente', name: 'Nombre', signDate: 'Fecha',
  original: 'Monto original del contrato', adjustments: 'Ajustes al monto del contrato', adjTotal: 'Total de ajustes', final: 'Monto final del contrato',
  added: 'Agregado', removed: 'Quitado', changed: 'Cambio de cantidad o precio', co: 'Orden de cambio aprobada', taxAdj: 'Ajuste de impuesto sobre materiales',
  noAdj: 'Sin ajustes: el monto final es igual al del contrato.', payments: 'Pagos recibidos', totalPaid: 'Total pagado',
  contractRef: 'Contrato de referencia', noContract: 'No se encontró un contrato previo; se usa el estimado actual como monto original.',
  completionText: 'El contratista declara que el trabajo descrito en el contrato y en los ajustes de este documento quedó terminado. El cliente confirma que recibió el proyecto, revisó los ajustes listados y acepta el monto final y el saldo indicado.',
  balanceNote: 'Saldo a pagar al firmar este documento, salvo otro acuerdo por escrito.',
  sections: {
    parties: 'Partes', scope: 'Proyecto y alcance del trabajo', price: 'Precio del contrato', adjust: 'Ajustes de precio',
    pay: 'Forma de pago', changeOrders: 'Órdenes de cambio', permits: 'Permisos e inspecciones', time: 'Fechas y demoras',
    lic: 'Licencia y seguro', warranty: 'Garantía', site: 'Acceso, limpieza y materiales sobrantes', cancel: 'Derecho de cancelación',
    lien: 'Protección contra gravámenes (liens) y acciones civiles', law: 'Ley aplicable y acuerdo completo', extra: 'Condiciones adicionales', sign: 'Firmas'
  }
},
en: {
  estimate: 'Estimate', contract: 'Residential Construction Contract', completion: 'Project Completion and Final Statement',
  date: 'Date', page: 'Page', of: 'of', client: 'Client', contractor: 'Contractor', property: 'Property', project: 'Project',
  phone: 'Phone', email: 'Email', license: 'Utah contractor license (DOPL)', materials: 'Materials', labor: 'Labor',
  desc: 'Description', qty: 'Qty', price: 'Price', amount: 'Amount', subtotal: 'Subtotal', taxMat: 'Tax on materials', total: 'Total',
  changes: 'Approved changes', schedule: 'Payment schedule', none: 'None', paid: 'Paid', balance: 'Balance due',
  start: 'Estimated start', end: 'Estimated completion', blank: '________________',
  estNote: 'This estimate is based on the quantities and prices known as of its date. The final amount may change based on the materials actually needed, permits and city requirements, as explained in the contract.',
  validity: 'Estimate valid for 30 days from its date.',
  sigContractor: 'Contractor signature', sigClient: 'Client signature', name: 'Name', signDate: 'Date',
  original: 'Original contract amount', adjustments: 'Adjustments to the contract amount', adjTotal: 'Total adjustments', final: 'Final contract amount',
  added: 'Added', removed: 'Removed', changed: 'Quantity or price change', co: 'Approved change order', taxAdj: 'Tax adjustment on materials',
  noAdj: 'No adjustments: the final amount equals the contract amount.', payments: 'Payments received', totalPaid: 'Total paid',
  contractRef: 'Reference contract', noContract: 'No earlier contract was found; the current estimate is used as the original amount.',
  completionText: 'The Contractor states that the work described in the contract and in the adjustments in this document is complete. The Client confirms receiving the project, has reviewed the adjustments listed and accepts the final amount and the balance shown.',
  balanceNote: 'Balance due upon signing this document, unless otherwise agreed in writing.',
  sections: {
    parties: 'Parties', scope: 'Project and scope of work', price: 'Contract price', adjust: 'Price adjustments',
    pay: 'Payment terms', changeOrders: 'Change orders', permits: 'Permits and inspections', time: 'Schedule and delays',
    lic: 'License and insurance', warranty: 'Warranty', site: 'Site access, cleanup and leftover materials', cancel: 'Right to cancel',
    lien: 'Protection against liens and civil action', law: 'Governing law and entire agreement', extra: 'Additional terms', sign: 'Signatures'
  }
}};

/* contract clauses: functions of the snapshot so names and amounts are filled in */
const CLAUSES = {
es: {
  scope: s => `El contratista realizará el proyecto "${s.project.title}" en la propiedad indicada, según los conceptos de materiales y mano de obra del estimado incluido en este contrato, que forma parte del mismo.`,
  price: s => `El precio del contrato es de ${M(s.totals.tot)}: materiales ${M(s.totals.subM)}, mano de obra ${M(s.totals.subL)} e impuesto sobre materiales ${M(s.totals.tax)} (${s.project.tax_rate || 0}%). Es un precio estimado sujeto a los ajustes de la sección siguiente.`,
  adjust: () => [
    'El precio se calculó con las cantidades y precios de materiales conocidos a la fecha de este contrato. El cliente entiende y acepta que el monto final puede aumentar o disminuir por cualquiera de estas causas:',
    '(a) la cantidad de materiales realmente necesaria para terminar el trabajo;',
    '(b) cambios en el precio de los materiales por parte de los proveedores;',
    '(c) costos de permisos, cuotas, inspecciones y requisitos de la ciudad, el condado u otra autoridad, incluidas correcciones que pida un inspector o el código de construcción;',
    '(d) condiciones ocultas o imprevistas que se descubran durante el trabajo (por ejemplo daño por agua, madera podrida, problemas estructurales, eléctricos o de plomería existentes);',
    '(e) cambios o trabajo adicional que pida el cliente.',
    'El contratista informará al cliente cada ajuste por escrito, con su motivo y monto, por medio del portal del proyecto o de una orden de cambio, antes de hacer el trabajo cuando sea posible. Todos los montos agregados o modificados se incluirán en el documento de terminación del proyecto, que mostrará el monto original, cada ajuste y el monto final.'
  ],
  pay: s => s.milestones.length ? 'El cliente pagará conforme al calendario de pagos incluido abajo. Los ajustes de precio se sumarán o restarán del último pago, salvo otro acuerdo por escrito.' : 'El cliente pagará conforme a las facturas que presente el contratista. Los ajustes de precio se sumarán o restarán del último pago, salvo otro acuerdo por escrito.',
  changeOrders: () => 'Cualquier cambio al alcance del trabajo se hará por escrito. El cliente puede aprobarlo o rechazarlo en el portal del proyecto con su nombre, o firmando la orden de cambio. El trabajo adicional no aprobado no es obligatorio para ninguna de las partes.',
  permits: () => 'El contratista tramitará los permisos de construcción que el proyecto requiera, salvo que se acuerde otra cosa por escrito. El costo de permisos, cuotas e inspecciones, y de cualquier requisito adicional de la autoridad, se cobra al cliente como ajuste de precio. El cliente dará acceso a la propiedad para las inspecciones.',
  time: s => `Inicio estimado: ${s.project.start_date ? S.fdate(s.project.start_date) : TX.es.blank}. Terminación estimada: ${s.project.end_date ? S.fdate(s.project.end_date) : TX.es.blank}. Las fechas pueden extenderse por clima, disponibilidad de materiales, inspecciones, órdenes de cambio o causas fuera del control del contratista.`,
  lic: s => `El contratista declara contar con licencia de contratista vigente en el estado de Utah, número ${s.contact.license_no || TX.es.blank}, y con seguro de responsabilidad civil.`,
  warranty: s => s.contact.warranty ? s.contact.warranty : `Las garantías de los fabricantes de los materiales pasan al cliente. Garantía de mano de obra: ${TX.es.blank}.`,
  site: () => 'El cliente dará acceso razonable a la propiedad durante el horario de trabajo. El contratista mantendrá el área ordenada y retirará los escombros al terminar. Los materiales sobrantes que pagó el cliente le pertenecen, salvo otro acuerdo.',
  cancel: () => 'Si este contrato se firma en el domicilio del cliente, el cliente puede tener derecho a cancelarlo dentro de los tres días hábiles siguientes, conforme a la ley federal y de Utah.',
  lien: () => [
    'Se notifica conforme a la sección 38-11-108 del Código de Utah que, bajo la ley de Utah, un "propietario" puede estar protegido contra gravámenes (liens) sobre una "residencia ocupada por su propietario" y contra otras acciones civiles para cobrar dinero por "servicios calificados" prestados por proveedores y subcontratistas como parte de este contrato, si se cumple cualquiera de estas condiciones: (1) el propietario celebró un contrato por escrito con un contratista original, un vendedor de vivienda prefabricada o un desarrollador inmobiliario; el contratista original tenía licencia vigente o estaba exento de licencia conforme al Título 58, Capítulo 55 (Utah Construction Trades Licensing Act) al firmarse el contrato; y el propietario pagó en su totalidad al contratista original conforme al contrato escrito y a cualquier modificación escrita u oral; o (2) el monto del contrato general entre el propietario y el contratista original no excede de $5,000.',
    'Un propietario que cumpla cualquiera de estas condiciones puede solicitar un Certificado de Cumplimiento (Certificate of Compliance) a la Division of Professional Licensing de Utah: dopl.utah.gov/residence-lien-recovery-fund.',
    '(The English text of this notice is included below, as required by Utah Admin. Code R156-38a-108.)'
  ],
  law: () => 'Este contrato se rige por las leyes del estado de Utah. Junto con el estimado incluido, las órdenes de cambio aprobadas y el documento de terminación, constituye el acuerdo completo entre las partes. Si alguna cláusula no es válida, las demás siguen vigentes.'
},
en: {
  scope: s => `The Contractor will perform the project "${s.project.title}" at the property listed, according to the materials and labor items in the estimate included in this contract, which is part of it.`,
  price: s => `The contract price is ${M(s.totals.tot)}: materials ${M(s.totals.subM)}, labor ${M(s.totals.subL)} and tax on materials ${M(s.totals.tax)} (${s.project.tax_rate || 0}%). This is an estimated price subject to the adjustments in the next section.`,
  adjust: () => [
    'The price was calculated with the material quantities and prices known as of the date of this contract. The Client understands and agrees that the final amount may increase or decrease for any of these reasons:',
    '(a) the quantity of materials actually needed to complete the work;',
    '(b) changes in material prices from suppliers;',
    '(c) permit costs, fees, inspections and requirements of the city, county or other authority, including corrections required by an inspector or the building code;',
    '(d) hidden or unforeseen conditions discovered during the work (for example water damage, rotten wood, or existing structural, electrical or plumbing problems);',
    '(e) changes or additional work requested by the Client.',
    'The Contractor will inform the Client of each adjustment in writing, with its reason and amount, through the project portal or a change order, before doing the work whenever possible. Every amount added or updated will be included in the project completion document, which will show the original amount, each adjustment and the final amount.'
  ],
  pay: s => s.milestones.length ? 'The Client will pay according to the payment schedule below. Price adjustments are added to or subtracted from the last payment, unless otherwise agreed in writing.' : 'The Client will pay according to the invoices presented by the Contractor. Price adjustments are added to or subtracted from the last payment, unless otherwise agreed in writing.',
  changeOrders: () => 'Any change to the scope of work will be made in writing. The Client may approve or decline it in the project portal with their name, or by signing the change order. Additional work that is not approved is not binding on either party.',
  permits: () => 'The Contractor will obtain the building permits the project requires, unless otherwise agreed in writing. The cost of permits, fees and inspections, and of any additional requirement of the authority, is charged to the Client as a price adjustment. The Client will provide access to the property for inspections.',
  time: s => `Estimated start: ${s.project.start_date ? S.fdate(s.project.start_date) : TX.en.blank}. Estimated completion: ${s.project.end_date ? S.fdate(s.project.end_date) : TX.en.blank}. Dates may be extended due to weather, material availability, inspections, change orders or causes beyond the Contractor's control.`,
  lic: s => `The Contractor states that it holds a current Utah contractor license, number ${s.contact.license_no || TX.en.blank}, and general liability insurance.`,
  warranty: s => s.contact.warranty ? s.contact.warranty : `Manufacturer warranties on materials pass to the Client. Workmanship warranty: ${TX.en.blank}.`,
  site: () => 'The Client will provide reasonable access to the property during working hours. The Contractor will keep the area orderly and remove debris when finished. Leftover materials paid for by the Client belong to the Client, unless otherwise agreed.',
  cancel: () => 'If this contract is signed at the Client\'s home, the Client may have the right to cancel it within three business days, under federal and Utah law.',
  lien: () => [
    'Notice is hereby provided in accordance with Section 38-11-108 of the Utah Code that under Utah law an "owner" may be protected against liens being maintained against an "owner-occupied residence" and from other civil action being maintained to recover monies owed for "qualified services" performed or provided by suppliers and subcontractors as a part of this contract, if either of the following conditions are met: (1) the owner entered into a written contract with an original contractor, a factory built housing retailer, or a real estate developer; the original contractor was properly licensed or exempt from licensure under Title 58, Chapter 55, Utah Construction Trades Licensing Act at the time the contract was executed; and the owner paid in full the original contractor, factory built housing retailer, or real estate developer or their successors or assigns in accordance with the written contract and any written or oral amendments to the contract; or (2) the amount of the general contract between the owner and the original contractor totals no more than $5,000.',
    'An owner who meets either of these conditions may apply to the Utah Division of Professional Licensing for a Certificate of Compliance: dopl.utah.gov/residence-lien-recovery-fund.'
  ],
  law: () => 'This contract is governed by the laws of the State of Utah. Together with the included estimate, approved change orders and the completion document, it is the entire agreement between the parties. If any clause is not valid, the others remain in effect.'
}};

const M = n => S.money(n);
const lt = i => (+i.qty || 0) * (+i.price || 0);
let LOGO = null;
async function logo() {
  if (LOGO !== null) return LOGO;
  try { const b = await (await fetch('icon-180.png')).blob(); LOGO = await new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); }); }
  catch (_) { LOGO = ''; }
  return LOGO;
}

/* ---- snapshots ---- */
function snapshot(b, contact, lang) {
  const c = S.calc(b), p = b.project, k = contact || {};
  return {
    v: 1, lang, created: new Date().toISOString(),
    project: { title: p.title || '', details: p.details || '', client_name: p.client_name || '', client_phone: [p.client_phone, p.client_phone2].filter(Boolean).join(' / '), client_email: p.client_email || '', address: p.address || '', start_date: p.start_date || null, end_date: p.end_date || null, tax_rate: +p.tax_rate || 0 },
    contact: { company: k.company || 'Grupo Sonec', legal_name: k.legal_name || '', license_no: k.license_no || '', address: k.address || '', phone: k.phone || '', email: k.email || '', contact_name: k.contact_name || k.name || '', warranty: k.warranty || '', extra_terms: k.extra_terms || '' },
    items: b.items.map(i => ({ id: i.id, kind: i.kind === 'lab' ? 'lab' : 'mat', description: i.description || '', qty: +i.qty || 0, price: +i.price || 0 })),
    cos: c.coOk.map(x => ({ id: x.id, title: x.title || '', kind: x.kind === 'lab' ? 'lab' : 'mat', amount: +x.amount || 0 })),
    milestones: c.ms.map(m => ({ label: m.label || '', amount: +m.amount || 0 })),
    payments: b.payments.slice().sort((x, y) => String(x.paid_on).localeCompare(String(y.paid_on))).map(x => ({ paid_on: x.paid_on, note: x.note || '', amount: +x.amount || 0 })),
    totals: { subM: c.subM, subL: c.subL, tax: c.tax, tot: c.tot, paid: c.paid }
  };
}
/* what changed between the contract and today */
function adjustments(orig, cur) {
  const out = [], key = (a) => a.id;
  const om = new Map(orig.items.map(i => [key(i), i]));
  for (const i of cur.items) {
    const o = om.get(key(i));
    if (!o) { out.push({ type: 'added', desc: i.description, kind: i.kind, amount: lt(i) }); continue; }
    om.delete(key(i));
    const d = lt(i) - lt(o);
    if (Math.abs(d) > 0.004 || o.description !== i.description) {
      out.push({ type: 'changed', desc: i.description, kind: i.kind, amount: d, detail: `${o.qty} x ${M(o.price)} -> ${i.qty} x ${M(i.price)}` });
    }
  }
  for (const o of om.values()) out.push({ type: 'removed', desc: o.description, kind: o.kind, amount: -lt(o) });
  const oc = new Set(orig.cos.map(x => x.id));
  for (const x of cur.cos) if (!oc.has(x.id)) out.push({ type: 'co', desc: x.title, kind: x.kind, amount: x.amount });
  const cc = new Set(cur.cos.map(x => x.id));
  for (const x of orig.cos) if (!cc.has(x.id)) out.push({ type: 'removed', desc: x.title, kind: x.kind, amount: -x.amount });
  const dTax = cur.totals.tax - orig.totals.tax;
  if (Math.abs(dTax) > 0.004) out.push({ type: 'tax', desc: '', amount: dTax });
  return out.filter(a => Math.abs(a.amount) > 0.004 || a.type === 'changed');
}

/* ---- drawing ---- */
const PW = 612, PH = 792, MX = 54, CW = PW - MX * 2;
const INK = [23, 23, 26], MUTE = [98, 96, 92], CU = [162, 76, 28], LINE = [214, 209, 201];
function Doc(title, sub, snap) {
  const d = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter' });
  /* the built-in PDF fonts only cover Western characters: swap the ones people type that they lack */
  const cl = v => String(v ?? '').replace(/²/g, '2').replace(/³/g, '3').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, '-').replace(/\u2026/g, '...').replace(/\u2192/g, '->').replace(/[^\x00-\xFF\u20AC]/g, '');
  const _tx = d.text.bind(d), _sp = d.splitTextToSize.bind(d);
  d.text = (s, ...a) => _tx(Array.isArray(s) ? s.map(cl) : cl(s), ...a);
  d.splitTextToSize = (s, ...a) => _sp(cl(s), ...a);
  const T = TX[snap.lang];
  let y = 0;
  const api = {
    d, T,
    get y() { return y; }, set y(v) { y = v; },
    head() {
      d.setFillColor(13, 13, 15); d.rect(0, 0, PW, 92, 'F');
      if (LOGO) d.addImage(LOGO, 'PNG', MX, 20, 52, 52);
      d.setTextColor(255, 255, 255); d.setFont('helvetica', 'bold'); d.setFontSize(18); d.text('GRUPO SONEC', MX + 66, 42);
      d.setFont('helvetica', 'normal'); d.setFontSize(9.5); d.setTextColor(236, 146, 89); d.text(snap.lang === 'es' ? 'REMODELACIÓN' : 'REMODELING', MX + 66, 57);
      const k = snap.contact, right = [k.legal_name || k.company, k.address, [k.phone, k.email].filter(Boolean).join(' · '), k.license_no ? `${T.license}: ${k.license_no}` : ''].filter(Boolean);
      d.setTextColor(210, 208, 203); d.setFontSize(8.5); right.forEach((l, i) => d.text(l, PW - MX, 30 + i * 12, { align: 'right' }));
      y = 124;
      d.setTextColor(...INK); d.setFont('helvetica', 'bold'); d.setFontSize(20); d.text(title, MX, y); y += 18;
      if (sub) { d.setFont('helvetica', 'normal'); d.setFontSize(10); d.setTextColor(...MUTE); d.text(sub, MX, y); y += 8; }
      y += 10;
    },
    need(h) { if (y + h > PH - 60) { d.addPage(); y = 60; } },
    h2(t) { api.need(40); y += 8; d.setFont('helvetica', 'bold'); d.setFontSize(12.5); d.setTextColor(...CU); d.text(t, MX, y); y += 6; d.setDrawColor(...LINE); d.setLineWidth(0.6); d.line(MX, y, PW - MX, y); y += 14; d.setTextColor(...INK); },
    p(t, o = {}) {
      d.setFont('helvetica', o.bold ? 'bold' : 'normal'); d.setFontSize(o.size || 10); d.setTextColor(...(o.color || INK));
      const lines = d.splitTextToSize(String(t), o.w || CW - (o.indent || 0)), lh = (o.size || 10) * 1.38;
      for (const l of lines) { api.need(lh); d.text(l, MX + (o.indent || 0), y); y += lh; }
      y += o.gap ?? 5;
    },
    kv(rows) {
      d.setFontSize(10);
      for (const [k, v] of rows) { api.need(15); d.setFont('helvetica', 'bold'); d.setTextColor(...MUTE); d.text(k, MX, y); d.setFont('helvetica', 'normal'); d.setTextColor(...INK); const ls = d.splitTextToSize(String(v || T.blank), CW - 150); ls.forEach((l, i) => d.text(l, MX + 150, y + i * 13)); y += 13 * ls.length + 3; }
      y += 4;
    },
    table(cols, rows, foot) {
      const x = [MX]; cols.forEach((c, i) => x.push(x[i] + c.w));
      const header = () => { d.setFillColor(243, 241, 238); d.rect(MX, y - 11, CW, 17, 'F'); d.setFont('helvetica', 'bold'); d.setFontSize(9); d.setTextColor(...MUTE); cols.forEach((c, i) => d.text(c.t, c.r ? x[i + 1] - 4 : x[i] + 4, y, { align: c.r ? 'right' : 'left' })); y += 16; };
      api.need(40); header();
      d.setFontSize(9.5);
      for (const r of rows) {
        const cells = r.map((v, i) => d.splitTextToSize(String(v ?? ''), cols[i].w - 8));
        const h = Math.max(...cells.map(c => c.length)) * 12.5 + 5;
        if (y + h > PH - 60) { d.addPage(); y = 60; header(); d.setFontSize(9.5); }
        d.setFont('helvetica', 'normal'); d.setTextColor(...INK);
        cells.forEach((c, i) => c.forEach((l, j) => d.text(l, cols[i].r ? x[i + 1] - 4 : x[i] + 4, y + j * 12.5, { align: cols[i].r ? 'right' : 'left' })));
        y += h - 5; d.setDrawColor(...LINE); d.setLineWidth(0.4); d.line(MX, y - 3, PW - MX, y - 3); y += 9;
      }
      if (!rows.length) { d.setFont('helvetica', 'normal'); d.setTextColor(...MUTE); d.text(T.none, MX + 4, y); y += 16; }
      if (foot) api.totals(foot);
    },
    totals(rows) {
      y += 2;
      for (const [k, v, strong] of rows) {
        api.need(18); d.setFont('helvetica', strong ? 'bold' : 'normal'); d.setFontSize(strong ? 11.5 : 10); d.setTextColor(...INK);
        if (strong) { d.setDrawColor(...INK); d.setLineWidth(1); d.line(PW - MX - 230, y - 11, PW - MX, y - 11); }
        d.text(k, PW - MX - 230, y); d.text(v, PW - MX, y, { align: 'right' }); y += strong ? 18 : 15;
      }
      y += 6;
    },
    sign(anchor) {
      api.need(130); y += 30;
      const w = (CW - 40) / 2;
      [[T.sigContractor, snap.contact.legal_name || snap.contact.company, '/sn1/', '/dt1/'], [T.sigClient, snap.project.client_name, '/sn2/', '/dt2/']].forEach(([lab, nm, a1, a2], i) => {
        const x = MX + i * (w + 40);
        if (anchor) { d.setTextColor(255, 255, 255); d.setFontSize(6); d.text(a1, x + 4, y - 6); d.text(a2, x + w - 70, y + 40); }
        d.setDrawColor(...INK); d.setLineWidth(0.8); d.line(x, y, x + w, y);
        d.setFont('helvetica', 'bold'); d.setFontSize(9); d.setTextColor(...MUTE); d.text(lab, x, y + 13);
        d.setFont('helvetica', 'normal'); d.setTextColor(...INK); d.text(`${T.name}: ${nm || T.blank}`, x, y + 28);
        d.text(`${T.signDate}: ________________`, x, y + 43);
      });
      y += 60;
    },
    finish(file, footerNote) {
      const n = d.getNumberOfPages();
      for (let i = 1; i <= n; i++) {
        d.setPage(i); d.setFont('helvetica', 'normal'); d.setFontSize(8); d.setTextColor(...MUTE);
        d.text(`${snap.contact.legal_name || snap.contact.company}${snap.contact.license_no ? ' · ' + T.license + ' ' + snap.contact.license_no : ''}`, MX, PH - 30);
        d.text(`${T.page} ${i} ${T.of} ${n}`, PW - MX, PH - 30, { align: 'right' });
        if (footerNote) d.text(footerNote, MX, PH - 18);
      }
      return { doc: d, file };
    }
  };
  return api;
}
const fileName = (kind, snap) => `${kind}-${(snap.project.title || 'proyecto').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()}-${snap.created.slice(0, 10)}.pdf`;
const lineRows = (snap, kind) => snap.items.filter(i => i.kind === kind).map(i => [i.description, i.qty, M(i.price), M(lt(i))]);
const COLS = T => [{ t: T.desc, w: 290 }, { t: T.qty, w: 50, r: 1 }, { t: T.price, w: 80, r: 1 }, { t: T.amount, w: 84, r: 1 }];

function partyBlock(D, snap) {
  const T = D.T, p = snap.project, k = snap.contact;
  D.kv([[T.contractor, [k.legal_name || k.company, k.address, [k.phone, k.email].filter(Boolean).join(' · '), `${T.license}: ${k.license_no || T.blank}`].filter(Boolean).join('\n')],
        [T.client, [p.client_name, [p.client_phone, p.client_email].filter(Boolean).join(' · ')].filter(Boolean).join('\n')],
        [T.property, p.address], [T.project, p.title], [T.date, S.fdate(snap.created.slice(0, 10))]]);
}
function estimateBody(D, snap) {
  const T = D.T, t = snap.totals;
  D.h2(T.materials); D.table(COLS(T), lineRows(snap, 'mat'), [[`${T.subtotal} · ${T.materials}`, M(snap.items.filter(i => i.kind === 'mat').reduce((a, i) => a + lt(i), 0))]]);
  D.h2(T.labor); D.table(COLS(T), lineRows(snap, 'lab'), [[`${T.subtotal} · ${T.labor}`, M(snap.items.filter(i => i.kind === 'lab').reduce((a, i) => a + lt(i), 0))]]);
  if (snap.cos.length) { D.h2(T.changes); D.table([{ t: T.desc, w: 330 }, { t: T.materials + ' / ' + T.labor, w: 90 }, { t: T.amount, w: 84, r: 1 }], snap.cos.map(x => [x.title, x.kind === 'lab' ? T.labor : T.materials, M(x.amount)])); }
  D.totals([[T.materials, M(t.subM)], [T.labor, M(t.subL)], [`${T.taxMat} (${snap.project.tax_rate}%)`, M(t.tax)], [T.total, M(t.tot), 1]]);
  if (snap.milestones.length) { D.h2(T.schedule); D.table([{ t: T.desc, w: 420 }, { t: T.amount, w: 84, r: 1 }], snap.milestones.map(m => [m.label, M(m.amount)])); }
}

/* ---- the three documents ---- */
async function estimatePdf(snap) {
  await logo(); const D = Doc(TX[snap.lang].estimate, snap.project.title, snap), T = D.T;
  D.head(); partyBlock(D, snap); if (snap.project.details) { D.h2(T.project); D.p(snap.project.details); } estimateBody(D, snap);
  D.p(T.estNote, { size: 9, color: MUTE }); D.p(T.validity, { size: 9, color: MUTE });
  D.sign(false);
  return D.finish(fileName(snap.lang === 'es' ? 'estimado' : 'estimate', snap));
}
async function contractPdf(snap) {
  await logo(); const D = Doc(TX[snap.lang].contract, snap.project.title, snap), T = D.T, C = CLAUSES[snap.lang], s = T.sections;
  D.head();
  let n = 0; const sec = t => D.h2(`${++n}. ${t}`);
  sec(s.parties); partyBlock(D, snap);
  sec(s.scope); D.p(C.scope(snap)); if (snap.project.details) D.p(snap.project.details, { color: MUTE }); estimateBody(D, snap);
  sec(s.price); D.p(C.price(snap));
  sec(s.adjust); C.adjust().forEach((t, i) => D.p(t, { indent: i && i < 6 ? 14 : 0, gap: i && i < 6 ? 2 : 6, bold: i === 0 }));
  sec(s.pay); D.p(C.pay(snap));
  sec(s.changeOrders); D.p(C.changeOrders());
  sec(s.permits); D.p(C.permits());
  sec(s.time); D.p(C.time(snap));
  sec(s.lic); D.p(C.lic(snap));
  sec(s.warranty); D.p(C.warranty(snap));
  sec(s.site); D.p(C.site());
  sec(s.cancel); D.p(C.cancel());
  sec(s.lien); C.lien().forEach(t => D.p(t, { size: 10.5 }));
  if (snap.lang === 'es') { D.p('PROTECTION AGAINST LIENS AND CIVIL ACTION', { bold: 1, size: 10.5 }); CLAUSES.en.lien().forEach(t => D.p(t, { size: 10.5 })); }
  if (snap.contact.extra_terms) { sec(s.extra); D.p(snap.contact.extra_terms); }
  sec(s.law); D.p(C.law());
  sec(s.sign); D.sign(true);
  return D.finish(fileName(snap.lang === 'es' ? 'contrato' : 'contract', snap));
}
async function completionPdf(snap) {
  await logo(); const D = Doc(TX[snap.lang].completion, snap.project.title, snap), T = D.T;
  D.head(); partyBlock(D, snap);
  const ref = snap.contract_ref;
  D.h2(T.contractRef);
  if (ref) D.p(`${T.contract} · ${S.fdate(ref.created.slice(0, 10))} · ${M(ref.total)}`); else D.p(T.noContract, { color: MUTE });
  D.h2(T.adjustments);
  const label = a => ({ added: T.added, removed: T.removed, changed: T.changed, co: T.co, tax: T.taxAdj }[a.type]);
  const sign = v => (v >= 0 ? '+' : '-') + M(Math.abs(v)).replace('-', '');
  if (snap.adjustments.length) {
    D.table([{ t: T.desc, w: 250 }, { t: '', w: 170 }, { t: T.amount, w: 84, r: 1 }],
      snap.adjustments.map(a => [a.type === 'tax' ? T.taxAdj : a.desc + (a.detail ? `\n${a.detail}` : ''), a.type === 'tax' ? '' : label(a) + (a.kind ? ` · ${a.kind === 'lab' ? T.labor : T.materials}` : ''), sign(a.amount)]));
  } else D.p(T.noAdj, { color: MUTE });
  const adjSum = snap.adjustments.reduce((a, x) => a + x.amount, 0), orig = ref ? ref.total : snap.totals.tot;
  D.totals([[T.original, M(orig)], [T.adjTotal, sign(adjSum)], [T.final, M(snap.totals.tot), 1]]);
  D.h2(T.payments);
  D.table([{ t: T.date, w: 110 }, { t: T.desc, w: 310 }, { t: T.amount, w: 84, r: 1 }], snap.payments.map(x => [S.fdate(x.paid_on), x.note, M(x.amount)]),
    [[T.totalPaid, M(snap.totals.paid)], [T.balance, M(snap.totals.tot - snap.totals.paid), 1]]);
  D.p(T.balanceNote, { size: 9, color: MUTE });
  D.h2(T.sections.sign); D.p(T.completionText);
  D.sign(true);
  return D.finish(fileName(snap.lang === 'es' ? 'terminacion' : 'completion', snap));
}

/* ---- invoice for a scheduled payment, and receipt for a payment received ---- */
const IX = {
  es: { invoice: 'Factura', receipt: 'Recibo de pago', no: 'Número', date: 'Fecha', due: 'Vence', billTo: 'Facturar a', receivedFrom: 'Recibido de',
    thisStage: 'Monto de esta etapa', covered: 'Ya pagado de esta etapa', dueNow: 'Total a pagar', received: 'Monto recibido', note: 'Nota',
    statement: 'Estado de cuenta del proyecto', contractTot: 'Total del contrato (con cambios aprobados)', paidToDate: 'Pagado a la fecha', balance: 'Saldo pendiente',
    payTo: 'Hacer el pago a nombre de', questions: 'Preguntas', thanks: 'Gracias por su pago.', receiptLine: (n, a, d) => `Recibimos de ${n} la cantidad de ${a} el ${d}, como pago del proyecto indicado.`,
    upon: 'Al recibir', file: 'factura', rfile: 'recibo' },
  en: { invoice: 'Invoice', receipt: 'Payment receipt', no: 'Number', date: 'Date', due: 'Due', billTo: 'Bill to', receivedFrom: 'Received from',
    thisStage: 'Amount for this stage', covered: 'Already paid on this stage', dueNow: 'Amount due', received: 'Amount received', note: 'Note',
    statement: 'Project account statement', contractTot: 'Contract total (with approved changes)', paidToDate: 'Paid to date', balance: 'Balance due',
    payTo: 'Make payment to', questions: 'Questions', thanks: 'Thank you for your payment.', receiptLine: (n, a, d) => `We received from ${n} the amount of ${a} on ${d}, as payment for the project below.`,
    upon: 'Upon receipt', file: 'invoice', rfile: 'receipt' }
};
async function invoicePdf(snap) {
  await logo();
  const X = IX[snap.lang], v = snap.inv, isR = v.type === 'receipt';
  const D = Doc(isR ? X.receipt : X.invoice, snap.project.title, snap), T = D.T, p = snap.project, k = snap.contact;
  D.head();
  D.kv([[X.no, v.no], [X.date, S.fdate(v.date)], ...(isR ? [] : [[X.due, v.due ? S.fdate(v.due) : X.upon]]),
    [isR ? X.receivedFrom : X.billTo, [p.client_name, [p.client_phone, p.client_email].filter(Boolean).join(' · ')].filter(Boolean).join('\n')],
    [T.property, p.address], [T.project, p.title]]);
  if (isR) {
    D.p(X.receiptLine(p.client_name || T.blank, M(v.amount), S.fdate(v.date)), { size: 11, gap: 10 });
    D.table([{ t: T.desc, w: 420 }, { t: T.amount, w: 84, r: 1 }], [[v.label || X.received, M(v.amount)]], [[X.received, M(v.amount), 1]]);
  } else {
    const rows = [[X.thisStage, M(v.amount)]]; if (v.covered > 0.004) rows.push([X.covered, '-' + M(v.covered)]); rows.push([X.dueNow, M(v.amount - v.covered), 1]);
    D.table([{ t: T.desc, w: 420 }, { t: T.amount, w: 84, r: 1 }], [[v.label, M(v.amount)]], rows);
  }
  D.h2(X.statement);
  D.totals([[X.contractTot, M(snap.totals.tot)], [X.paidToDate, M(v.paidToDate)], [X.balance, M(Math.max(0, snap.totals.tot - v.paidToDate)), 1]]);
  D.p(isR ? X.thanks : `${X.payTo}: ${k.legal_name || k.company}`, { bold: 1, gap: 4 });
  const ask = [k.phone, k.email].filter(Boolean).join(' · ');
  if (ask) D.p(`${X.questions}: ${ask}`, { color: MUTE });
  return D.finish(fileName(isR ? X.rfile : X.file, snap).replace('.pdf', `-${String(v.no).replace(/[^a-z0-9-]/gi, '')}.pdf`));
}
async function build(kind, snap) { return kind === 'invoice' ? invoicePdf(snap) : kind === 'contract' ? contractPdf(snap) : kind === 'completion' ? completionPdf(snap) : estimatePdf(snap); }

S.docs = {
  snapshot, adjustments, build,
  /* completion snapshot = today's state + what changed since the latest contract */
  completionSnapshot(b, contact, lang, contract) {
    const cur = snapshot(b, contact, lang);
    cur.contract_ref = contract ? { id: contract.id, created: contract.created_at || contract.snapshot.created, total: +contract.snapshot.totals.tot } : null;
    cur.adjustments = contract ? adjustments(contract.snapshot, cur) : [];
    return cur;
  },
  async download(kind, snap) { const { doc, file } = await build(kind, snap); doc.save(file); return file; },
  async blob(kind, snap) { const { doc, file } = await build(kind, snap); return { blob: doc.output('blob'), file }; }
};
})();
