/* Sonec shared helpers: language, money, brand art, totals, printing, photos. */
(function () {
const T = {
es: {
 client:'Cliente',contractor:'Contratista',thanks:'Gracias por confiar en nosotros',dream:'Tu sueño es nuestro sueño',enter:'Ver mi proyecto',skip:'Saltar',
 overview:'Resumen',estimate:'Estimado',pays:'Pagos',changes:'Cambios',materials:'Materiales',steps:'Pasos',updates:'Avances',messages:'Mensajes',
 done:'completado',start:'Inicio',end:'Entrega estimada',st_estimate_sent:'Estimado enviado',st_estimate_accepted:'Estimado aceptado',st_progress:'En progreso',st_done:'Terminado',st_planning:'Estimado enviado',st_paused:'En progreso',
 total:'Total del proyecto',labor:'Mano de obra',subtotal:'Subtotal',taxMat:'Impuesto sobre materiales',desc:'Concepto',qty:'Cant.',price:'Precio',amount:'Importe',
 paidSoFar:'Has pagado',remaining:'Falta por pagar',paidPct:'del total pagado',history:'Historial de pagos',date:'Fecha',note:'Nota',amt:'Monto',
 schedule:'Calendario de pagos',ms_paid:'Pagado',ms_next:'Siguiente pago',ms_later:'Pendiente',coveredOf:'cubierto de',
 estSub:'Detalle del trabajo cotizado.',paySub:'Lo que has pagado y lo que falta por pagar.',matSub:'Todo lo necesario para tu proyecto y lo que ya compramos.',
 all:'Todos',pending:'Por comprar',purchased:'Comprado',stepsSub:'Lo que ya hicimos y lo que sigue.',taken:'Pasos realizados',next:'Pasos pendientes',
 updSub:'Notas y fotos del equipo sobre tu proyecto.',contact:'¿Preguntas? Contáctanos',none:'Nada por aquí todavía.',
 changesSub:'Trabajo extra o cambios al estimado. Los aprobados se suman al total.',co_draft:'Borrador',co_pending:'Esperando aprobación',co_approved:'Aprobado',co_declined:'Rechazado',
 approve:'Aprobar',decline:'Rechazar',yourName:'Tu nombre',nameNeeded:'Escribe tu nombre para firmar.',by:'por',
 msgSub:'Escríbenos aquí. Te contestamos lo antes posible.',send:'Enviar',writeMsg:'Escribe tu mensaje',you:'Tú',
 printEst:'Imprimir / PDF del estimado',signClient:'Firma del cliente',signContractor:'Firma del contratista',prepared:'Preparado para',estNo:'Estimado',
 noLink:'Usa el enlace que te mandó tu contratista para ver tu proyecto.',notFound:'No encontramos este proyecto. Revisa el enlace.',loading:'Cargando…',
 refresh:'Actualizar',error:'Algo salió mal',retry:'Intentar de nuevo',
 /* contractor */
 login:'Entrar',email:'Correo',password:'Contraseña',loginT:'Panel del contratista',loginS:'Entra con tu cuenta de Sonec.',logout:'Salir',
 setupT:'Falta conectar la base de datos',setupS:'Abre config.js y pega la URL y la llave de tu proyecto de Supabase. Los pasos están en el README.',
 projects:'Proyectos',newProject:'+ Nuevo proyecto',sampleProject:'Crear proyecto de ejemplo',allProjects:'Todos los proyectos',
 contracts:'Contratos',collected:'Cobrado',receivable:'Por cobrar',spent:'Gastado',profit:'Ganancia estimada',budget:'Presupuesto de costos',left:'Queda del presupuesto',
 profitSub:'Contrato sin impuesto menos lo gastado',contract:'Contrato (cliente)',thisWeek:'Próximos 14 días',noUpcoming:'Sin pasos programados.',
 unread:'mensajes nuevos',settings:'Datos de la empresa',company:'Empresa',cname:'Contacto',phone:'Teléfono',
 dash:'Panel',money:'Presupuesto y gastos',progress:'Avance',project:'Proyecto',back:'← Proyectos',
 logBuy:'Registrar compra o gasto',logPay:'Registrar pago del cliente',store:'Tienda / a quién',cat:'Categoría',linkMat:'Marcar material como comprado',noMat:'Ninguno',register:'Registrar',
 buyOk:'Gasto registrado',payOk:'Pago registrado',addCat:'+ Agregar categoría',expLog:'Registro de gastos',of:'de',over:'Sobre presupuesto',byCat:'Presupuesto por categoría',recent:'Compras y gastos recientes',
 receipt:'Recibo',addReceipt:'Subir recibo',viewReceipt:'Ver recibo',
 addItem:'+ Agregar concepto',addMat:'+ Agregar material',addStep:'+ Agregar paso',addMs:'+ Agregar pago programado',addCo:'+ Nuevo cambio',
 postUpd:'Publicar avance',newUpd:'Escribe un avance para el cliente',addPhotos:'Agregar fotos',photosSel:'fotos listas',uploading:'Subiendo…',
 sendClient:'Enviar al cliente',coHint:'Los cambios en borrador no los ve el cliente. Al enviarlo, el cliente lo puede aprobar o rechazar.',
 msHint:'El estado de cada pago se calcula solo, con lo que el cliente ha pagado.',scheduleTotal:'Suma del calendario',
 reply:'Responder',
 projInfo:'Datos del proyecto',clientName:'Cliente',clientPhone:'Teléfono del cliente',clientEmail:'Correo del cliente',ptitle:'Proyecto',address:'Dirección',status:'Estado',taxp:'Impuesto % (materiales)',
 clientLink:'Enlace privado del cliente',copy:'Copiar',copied:'Copiado',open:'Abrir',whatsapp:'Enviar por WhatsApp',linkHint:'Cualquiera con este enlace puede ver el proyecto (no tus costos). Mándalo solo al cliente.',
 duplicate:'Duplicar como plantilla',dupOk:'Proyecto duplicado',deleteP:'Eliminar proyecto',deleteConfirm:'Escribe ELIMINAR para borrar este proyecto y todo su contenido.',
 saved:'Guardado',saving:'Guardando…',removed:'Eliminado',undo:'Deshacer',category:'Categoría',unit:'Unidad',datePaid:'Fecha de compra',
 sampleNote:'Proyecto de ejemplo: cámbialo o bórralo.',kind:'Tipo',copySuffix:'(copia)',matPriv:'El cliente ve el material y si ya se compró, pero no su costo.',noCat:'Sin categoría',docs:'Documentos',docsSub:'Estimado, contrato y terminación del proyecto en PDF.',contractData:'Datos de la empresa para contratos',contractDataSub:'Utah pide el nombre legal, el número de licencia DOPL y la dirección en cada contrato con un propietario.',legalName:'Nombre legal de la empresa',licenseNo:'Número de licencia DOPL',bizAddress:'Dirección de la empresa',warranty:'Garantía (texto del contrato)',warrantyHint:'Ej. Garantizamos la mano de obra por 1 año desde la terminación. Si lo dejas vacío, el contrato deja una línea para llenarla.',extraTerms:'Condiciones adicionales (opcional)',docLang:'Idioma del documento',dlEstimate:'Descargar estimado (PDF)',mkContract:'Crear contrato',mkCompletion:'Crear documento de terminación',doc_estimate:'Estimado',doc_contract:'Contrato',doc_completion:'Terminación y estado de cuenta final',ds_draft:'Borrador',ds_sent:'Enviado al cliente',ds_signed:'Firmado',ds_void:'Anulado',signedBy:'Firmado por',signedOn:'Fecha de firma',download:'Descargar PDF',legalNote:'El contrato es una plantilla general, no asesoría legal. Revísalo con un abogado de Utah antes de usarlo, incluido el aviso de protección contra gravámenes (Utah Admin. Code R156-38a-108).',missingFor:'Para el contrato faltan',contractBanner:'El estimado fue aceptado. Crea el contrato para enviarlo a firmar.',goDocs:'Ir a documentos',docMade:'Documento creado y descargado',noContractYet:'Aún no hay contrato: la terminación usará el estimado actual como monto original.',docsClient:'Tus documentos del proyecto.',docsHint:'El cliente ve el documento en su página cuando lo marcas como Enviado o Firmado.',newProjectT:'Nuevo proyecto',ptitleEx:'Ej. Deck y pérgola, familia López',create:'Crear proyecto',cancel:'Cancelar',noneInStatus:'No hay proyectos con este estado.',leads:'Solicitudes de estimado',leadsSub:'Llegan desde el formulario del sitio web.',lead_new:'Nueva',lead_contacted:'Contactado',lead_won:'Proyecto creado',leadToProject:'Crear proyecto',archive:'Archivar',installT:'Ponlo en tu pantalla de inicio',installS:'En Safari toca Compartir y luego "Agregar a pantalla de inicio". Se abrirá como una app.',hide:'Ocultar',delete:'Eliminar',close:'Cerrar',f_description:'Concepto',f_qty:'Cantidad',f_price:'Precio',f_amount:'Monto',f_label:'Pago programado',f_title:'Título',f_category:'Categoría',f_name:'Material',f_unit:'Unidad',f_body:'Texto del avance',f_vendor:'Tienda',f_note:'Nota',f_spent_on:'Fecha',f_paid_on:'Fecha',f_due_date:'Fecha',f_purchased_on:'Fecha de compra',f_kind:'Tipo',f_status:'Estado',f_budget_id:'Categoría',f_details:'Detalles',f_done:'Hecho',f_purchased:'Comprado',f_tax_rate:'Impuesto',rotate:'Crear enlace nuevo',rotateHint:'Si el enlace llegó a otra persona, crea uno nuevo. El anterior deja de funcionar.',rotated:'Enlace nuevo creado. Mándaselo al cliente.',tooMany:'Mandaste muchos mensajes seguidos. Intenta en unos minutos.',saveFail:'No se pudo guardar. Revisa tu conexión e intenta otra vez.'
},
en: {
 client:'Client',contractor:'Contractor',thanks:'Thank you for trusting us',dream:'Your dream is our dream',enter:'See my project',skip:'Skip',
 overview:'Overview',estimate:'Estimate',pays:'Payments',changes:'Changes',materials:'Materials',steps:'Steps',updates:'Updates',messages:'Messages',
 done:'complete',start:'Start',end:'Estimated completion',st_estimate_sent:'Estimate sent',st_estimate_accepted:'Estimate accepted',st_progress:'In progress',st_done:'Completed',st_planning:'Estimate sent',st_paused:'In progress',
 total:'Project total',labor:'Labor',subtotal:'Subtotal',taxMat:'Tax on materials',desc:'Description',qty:'Qty',price:'Price',amount:'Amount',
 paidSoFar:'You have paid',remaining:'Still due',paidPct:'of the total paid',history:'Payment history',date:'Date',note:'Note',amt:'Amount',
 schedule:'Payment schedule',ms_paid:'Paid',ms_next:'Next payment',ms_later:'Upcoming',coveredOf:'covered of',
 estSub:'Quoted work, line by line.',paySub:'What you have paid and what is still due.',matSub:'Everything your project needs and what we already bought.',
 all:'All',pending:'To buy',purchased:'Purchased',stepsSub:'What we have done and what comes next.',taken:'Steps completed',next:'Steps remaining',
 updSub:'Notes and photos from the crew about your project.',contact:'Questions? Contact us',none:'Nothing here yet.',
 changesSub:'Extra work or changes to the estimate. Approved ones are added to the total.',co_draft:'Draft',co_pending:'Waiting for approval',co_approved:'Approved',co_declined:'Declined',
 approve:'Approve',decline:'Decline',yourName:'Your name',nameNeeded:'Type your name to sign.',by:'by',
 msgSub:'Write to us here. We will answer as soon as we can.',send:'Send',writeMsg:'Write your message',you:'You',
 printEst:'Print / PDF estimate',signClient:'Client signature',signContractor:'Contractor signature',prepared:'Prepared for',estNo:'Estimate',
 noLink:'Use the link your contractor sent you to see your project.',notFound:'We could not find this project. Check the link.',loading:'Loading…',
 refresh:'Refresh',error:'Something went wrong',retry:'Try again',
 login:'Sign in',email:'Email',password:'Password',loginT:'Contractor panel',loginS:'Sign in with your Sonec account.',logout:'Sign out',
 setupT:'The database is not connected yet',setupS:'Open config.js and paste your Supabase project URL and key. The steps are in the README.',
 projects:'Projects',newProject:'+ New project',sampleProject:'Create sample project',allProjects:'All projects',
 contracts:'Contracts',collected:'Collected',receivable:'Still to collect',spent:'Spent',profit:'Estimated profit',budget:'Cost budget',left:'Budget left',
 profitSub:'Contract before tax minus spending',contract:'Contract (client)',thisWeek:'Next 14 days',noUpcoming:'No steps scheduled.',
 unread:'new messages',settings:'Company details',company:'Company',cname:'Contact',phone:'Phone',
 dash:'Dashboard',money:'Budget and expenses',progress:'Progress',project:'Project',back:'← Projects',
 logBuy:'Log a purchase or expense',logPay:'Log a client payment',store:'Store / paid to',cat:'Category',linkMat:'Mark material as purchased',noMat:'None',register:'Log it',
 buyOk:'Expense logged',payOk:'Payment logged',addCat:'+ Add category',expLog:'Expense log',of:'of',over:'Over budget',byCat:'Budget by category',recent:'Recent purchases and expenses',
 receipt:'Receipt',addReceipt:'Upload receipt',viewReceipt:'View receipt',
 addItem:'+ Add line item',addMat:'+ Add material',addStep:'+ Add step',addMs:'+ Add scheduled payment',addCo:'+ New change',
 postUpd:'Post update',newUpd:'Write an update for the client',addPhotos:'Add photos',photosSel:'photos ready',uploading:'Uploading…',
 sendClient:'Send to client',coHint:'Drafts are hidden from the client. Once sent, the client can approve or decline it.',
 msHint:'Each payment status is worked out automatically from what the client has paid.',scheduleTotal:'Schedule total',
 reply:'Reply',
 projInfo:'Project details',clientName:'Client',clientPhone:'Client phone',clientEmail:'Client email',ptitle:'Project',address:'Address',status:'Status',taxp:'Tax % (materials)',
 clientLink:'Client private link',copy:'Copy',copied:'Copied',open:'Open',whatsapp:'Send on WhatsApp',linkHint:'Anyone with this link can see the project (not your costs). Send it only to the client.',
 duplicate:'Duplicate as template',dupOk:'Project duplicated',deleteP:'Delete project',deleteConfirm:'Type DELETE to erase this project and everything in it.',
 saved:'Saved',saving:'Saving…',removed:'Removed',undo:'Undo',category:'Category',unit:'Unit',datePaid:'Purchase date',
 sampleNote:'Sample project: change it or delete it.',kind:'Type',copySuffix:'(copy)',matPriv:'The client sees each material and whether it was bought, not its cost.',noCat:'No category',docs:'Documents',docsSub:'Estimate, contract and project completion as PDF.',contractData:'Company details for contracts',contractDataSub:'Utah requires the legal name, DOPL license number and address in every contract with a homeowner.',legalName:'Company legal name',licenseNo:'DOPL license number',bizAddress:'Company address',warranty:'Warranty (contract text)',warrantyHint:'E.g. We warranty our workmanship for 1 year from completion. If left empty, the contract leaves a line to fill in.',extraTerms:'Additional terms (optional)',docLang:'Document language',dlEstimate:'Download estimate (PDF)',mkContract:'Create contract',mkCompletion:'Create completion document',doc_estimate:'Estimate',doc_contract:'Contract',doc_completion:'Completion and final statement',ds_draft:'Draft',ds_sent:'Sent to client',ds_signed:'Signed',ds_void:'Void',signedBy:'Signed by',signedOn:'Signed on',download:'Download PDF',legalNote:'The contract is a general template, not legal advice. Have a Utah attorney review it before use, including the lien protection notice (Utah Admin. Code R156-38a-108).',missingFor:'Missing for the contract',contractBanner:'The estimate was accepted. Create the contract to send it for signature.',goDocs:'Go to documents',docMade:'Document created and downloaded',noContractYet:'No contract yet: the completion document will use the current estimate as the original amount.',docsClient:'Your project documents.',docsHint:'The client sees the document on their page once you mark it Sent or Signed.',newProjectT:'New project',ptitleEx:'E.g. Deck and pergola, López family',create:'Create project',cancel:'Cancel',noneInStatus:'No projects with this status.',leads:'Estimate requests',leadsSub:'They come from the website form.',lead_new:'New',lead_contacted:'Contacted',lead_won:'Project created',leadToProject:'Create project',archive:'Archive',installT:'Put it on your Home Screen',installS:'In Safari tap Share, then "Add to Home Screen". It will open like an app.',hide:'Hide',delete:'Delete',close:'Close',f_description:'Description',f_qty:'Quantity',f_price:'Price',f_amount:'Amount',f_label:'Scheduled payment',f_title:'Title',f_category:'Category',f_name:'Material',f_unit:'Unit',f_body:'Update text',f_vendor:'Store',f_note:'Note',f_spent_on:'Date',f_paid_on:'Date',f_due_date:'Date',f_purchased_on:'Purchase date',f_kind:'Type',f_status:'Status',f_budget_id:'Category',f_details:'Details',f_done:'Done',f_purchased:'Purchased',f_tax_rate:'Tax',rotate:'Create a new link',rotateHint:'If the link reached someone else, create a new one. The old one stops working.',rotated:'New link created. Send it to the client.',tooMany:'You sent many messages in a row. Try again in a few minutes.',saveFail:'Could not save. Check your connection and try again.'
}};
let L = 'es';
try { L = localStorage.getItem('sonec-lang') || ((navigator.language || 'es').startsWith('es') ? 'es' : 'en'); } catch (_) {}
const S = window.SONEC = {
  get L() { return L; },
  setLang(x) { L = x; try { localStorage.setItem('sonec-lang', x); } catch (_) {} document.documentElement.lang = x; },
  t: k => T[L][k] || T.es[k] || k,
  esc: v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  money: n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(+n || 0),
  today() { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); },
  fdate(d) { if (!d) return ''; const x = new Date(String(d).length <= 10 ? d + 'T12:00' : d); return isNaN(x) ? d : x.toLocaleDateString(L === 'es' ? 'es-MX' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }); },
  uid: () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2))
};
const t = S.t;

S.MARK = (c = '') => `<svg class="mk ${c}" viewBox="-80 -80 160 160" aria-hidden="true"><defs><linearGradient id="cu${c}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3a26a"/><stop offset=".45" stop-color="#d06a2f"/><stop offset="1" stop-color="#8e3f17"/></linearGradient><linearGradient id="ag${c}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#b9bec5"/><stop offset=".55" stop-color="#8d939b"/><stop offset="1" stop-color="#e3e6ea"/></linearGradient></defs><path class="hex" d="M-60.6,30 V-35 L0,-70 L60.6,-35 V35 L0,70" fill="none" stroke="url(#ag${c})" stroke-width="12"/><path class="ess" d="M33,-30 H-18 L-30,-18 V-8 L-18,4 H18 L30,16 V26 L18,38 H-33" fill="none" stroke="url(#cu${c})" stroke-width="15"/><path class="tri" d="M-62,70 L-42,42 L-22,70 Z" fill="url(#ag${c})"/></svg>`;
S.WORD = (c = '') => `<svg class="wm" viewBox="-6 -22 340 92" aria-label="Grupo Sonec Remodelación"><defs><linearGradient id="wag${c}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#b9bec5"/><stop offset=".55" stop-color="#8d939b"/><stop offset="1" stop-color="#e3e6ea"/></linearGradient><linearGradient id="wcu${c}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3a26a"/><stop offset="1" stop-color="#a8501d"/></linearGradient><linearGradient id="gl${c}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><clipPath id="wc${c}"><rect x="-6" y="0" width="340" height="42"/></clipPath></defs><text x="164" y="-8" fill="#9aa0a7" font-family="Montserrat" font-weight="700" font-size="11" letter-spacing="8" text-anchor="middle">GRUPO</text><g fill="none" stroke="url(#wag${c})" stroke-width="8"><path d="M60,4 H12 L4,12 V14 L10,20 H54 L60,26 V28 L52,36 H4"/><path transform="translate(66,0)" d="M12,4 H52 L60,12 V28 L52,36 H12 L4,28 V12 Z" stroke="url(#wcu${c})"/><path transform="translate(132,0)" d="M4,40 V5 L60,35 V0"/><path transform="translate(198,0)" d="M60,4 H4 V36 H60 M4,20 H50"/><path transform="translate(264,0)" d="M60,4 H12 L4,12 V28 L12,36 H60"/></g><g clip-path="url(#wc${c})"><rect class="sh" x="-6" y="0" width="340" height="42" fill="url(#gl${c})" transform="translate(-400)"/></g><text x="164" y="64" fill="#d9874f" font-family="Montserrat" font-weight="700" font-size="13" letter-spacing="5" text-anchor="middle">REMODELACIÓN</text></svg>`;
S.langSeg = () => `<div class="seg" role="group" aria-label="Language"><button data-lang="es" aria-pressed="${L === 'es'}">ES</button><button data-lang="en" aria-pressed="${L === 'en'}">EN</button></div>`;
S.header = (extra = '', badge = '') => `<header class="top"><div class="wrap"><div class="brand">${S.MARK('h')}<div><b>SONEC</b>${badge}<small>${L === 'es' ? 'Remodelación' : 'Remodeling'}</small></div></div>${extra}${S.langSeg()}</div></header>`;

S.splash = function () {
  const d = document.createElement('div'); d.id = 'splash'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Sonec');
  d.innerHTML = `<button class="skip">${t('skip')}</button><div>${S.MARK('s')}<div>${S.WORD('s')}</div><h2>${t('thanks')}</h2><p>${t('dream')}</p><button class="primary enter">${t('enter')}</button></div>`;
  document.body.appendChild(d);
  d.setAttribute('aria-modal', 'true');
  const close = () => { removeEventListener('keydown', key); d.classList.add('out'); setTimeout(() => d.remove(), 700); document.querySelector('main, .tabs button, h1')?.focus?.(); };
  const key = e => { if (e.key === 'Escape') close(); };
  addEventListener('keydown', key);
  d.querySelector('.skip').onclick = close; d.querySelector('.enter').onclick = close; d.querySelector('.skip').focus();
};

/* totals: approved change orders join the estimate, tax only on materials */
S.calc = function (b) {
  const lt = i => (+i.qty || 0) * (+i.price || 0), p = b.project;
  const ok = (b.change_orders || []).filter(c => c.status === 'approved');
  const subM = b.items.filter(i => i.kind !== 'lab').reduce((a, i) => a + lt(i), 0) + ok.filter(c => c.kind !== 'lab').reduce((a, c) => a + (+c.amount || 0), 0);
  const subL = b.items.filter(i => i.kind === 'lab').reduce((a, i) => a + lt(i), 0) + ok.filter(c => c.kind === 'lab').reduce((a, c) => a + (+c.amount || 0), 0);
  const sub = subM + subL, tax = subM * (+p.tax_rate || 0) / 100, tot = sub + tax;
  const paid = b.payments.reduce((a, x) => a + (+x.amount || 0), 0);
  const sd = b.steps.filter(s => s.done).length, mb = b.materials.filter(m => m.purchased).length;
  const r = { lt, subM, subL, sub, tax, tot, paid, bal: tot - paid, sd, mb, pct: b.steps.length ? Math.round(sd / b.steps.length * 100) : 0, coOk: ok };
  if (b.budget) {
    r.bud = b.budget.reduce((a, x) => a + (+x.amount || 0), 0);
    r.spent = (b.expenses || []).reduce((a, x) => a + (+x.amount || 0), 0);
    r.left = r.bud - r.spent; r.profit = sub - r.spent;
    r.byCat = id => (b.expenses || []).filter(e => e.budget_id === id).reduce((a, e) => a + (+e.amount || 0), 0);
    r.noCat = r.byCat(null) + (b.expenses || []).filter(e => e.budget_id === undefined).reduce((a, e) => a + (+e.amount || 0), 0);
  }
  let cum = 0, nextSet = false;
  r.ms = (b.milestones || []).slice().sort((a, b) => (a.sort || 0) - (b.sort || 0)).map(m => {
    const before = cum; cum += +m.amount || 0;
    let st = 'later'; if (paid >= cum - 0.005) st = 'paid'; else if (!nextSet) { st = 'next'; nextSet = true; }
    return { ...m, st, covered: Math.max(0, Math.min(+m.amount || 0, paid - before)) };
  });
  r.msTotal = cum;
  return r;
};

S.toast = function (msg, undo) {
  document.querySelector('.toast')?.remove();
  const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status');
  d.innerHTML = `<span>${S.esc(msg)}</span>${undo ? `<button>${t('undo')}</button>` : ''}`;
  document.body.appendChild(d);
  if (undo) d.querySelector('button').onclick = () => { d.remove(); undo(); };
  clearTimeout(S._tt); S._tt = setTimeout(() => d.remove(), 5000);
};

/* shrink phone photos before uploading */
S.compress = function (file, max = 1600, q = .82) {
  return new Promise((res) => {
    if (!/^image\//.test(file.type) || /gif|svg/.test(file.type)) return res(file);
    const img = new Image(), u = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      c.toBlob(b => res(b || file), 'image/jpeg', q);
    };
    img.onerror = () => { URL.revokeObjectURL(u); res(file); };
    img.src = u;
  });
};

S.photos = (paths) => paths && paths.length ? `<div class="photos">${paths.map(p => { const u = API.photoUrl(p); return `<button class="ph" data-photo="${S.esc(u)}" aria-label="${t('open')}"><img src="${S.esc(u)}" alt="" loading="lazy"></button>`; }).join('')}</div>` : '';
S.lightbox = function (url) {
  const d = document.createElement('div'); d.className = 'lb'; d.setAttribute('role', 'dialog');
  const back = document.activeElement;
  d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', t('updates'));
  d.innerHTML = `<img src="${S.esc(url)}" alt=""><button class="ghost" aria-label="${t('close')}">✕</button>`;
  const close = () => { d.remove(); removeEventListener('keydown', key); back && back.focus && back.focus(); };
  const key = e => { if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); if (e.key === 'Escape') close(); } };
  d.onclick = close; addEventListener('keydown', key); document.body.appendChild(d); d.querySelector('button').focus();
};

/* printable estimate (browser print dialog saves it as PDF) */
S.printEstimate = function (b, contact) {
  const c = S.calc(b), p = b.project, e = S.esc, m = S.money;
  const rows = k => b.items.filter(i => (i.kind === 'lab') === (k === 'lab')).map(i => `<tr><td>${e(i.description)}</td><td class="n">${e(i.qty)}</td><td class="n">${m(i.price)}</td><td class="n">${m(c.lt(i))}</td></tr>`).join('');
  const k = contact || {};
  const html = `<div class="pv-head">${S.MARK('p')}<div>${S.WORD('p')}</div><div class="pv-co"><b>${e(k.company || 'Grupo Sonec')}</b><br>${e(k.name || k.contact_name || '')}<br>${e(k.phone || '')}<br>${e(k.email || '')}</div></div>
  <h1>${t('estNo')}: ${e(p.title)}</h1><p>${t('prepared')}: <b>${e(p.client_name)}</b><br>${e(p.address)}<br>${t('date')}: ${S.fdate(S.today())}</p>
  <h2>${t('materials')}</h2><table><thead><tr><th>${t('desc')}</th><th class="n">${t('qty')}</th><th class="n">${t('price')}</th><th class="n">${t('amount')}</th></tr></thead><tbody>${rows('mat') || `<tr><td colspan="4">${t('none')}</td></tr>`}</tbody></table>
  <h2>${t('labor')}</h2><table><thead><tr><th>${t('desc')}</th><th class="n">${t('qty')}</th><th class="n">${t('price')}</th><th class="n">${t('amount')}</th></tr></thead><tbody>${rows('lab') || `<tr><td colspan="4">${t('none')}</td></tr>`}</tbody></table>
  ${c.coOk.length ? `<h2>${t('changes')}</h2><table><tbody>${c.coOk.map(x => `<tr><td>${e(x.title)} (${x.kind === 'lab' ? t('labor') : t('materials')})</td><td class="n">${m(x.amount)}</td></tr>`).join('')}</tbody></table>` : ''}
  <table class="tots"><tr><td>${t('materials')}</td><td class="n">${m(c.subM)}</td></tr><tr><td>${t('labor')}</td><td class="n">${m(c.subL)}</td></tr><tr><td>${t('taxMat')} (${e(p.tax_rate)}%)</td><td class="n">${m(c.tax)}</td></tr><tr class="g"><td>${t('total')}</td><td class="n">${m(c.tot)}</td></tr><tr><td>${t('paidSoFar')}</td><td class="n">${m(c.paid)}</td></tr><tr class="g"><td>${t('remaining')}</td><td class="n">${m(c.bal)}</td></tr></table>
  ${c.ms.length ? `<h2>${t('schedule')}</h2><table><tbody>${c.ms.map(x => `<tr><td>${e(x.label)}</td><td>${t('ms_' + x.st)}</td><td class="n">${m(x.amount)}</td></tr>`).join('')}</tbody></table>` : ''}
  <div class="sig"><div>${t('signClient')}</div><div>${t('signContractor')}</div></div>`;
  let pv = document.getElementById('pv'); if (!pv) { pv = document.createElement('div'); pv.id = 'pv'; document.body.appendChild(pv); }
  pv.innerHTML = html; document.body.classList.add('printing');
  const done = () => { document.body.classList.remove('printing'); removeEventListener('afterprint', done); };
  addEventListener('afterprint', done);
  setTimeout(() => { try { print(); } catch (_) { done(); } }, 60);
};
})();
