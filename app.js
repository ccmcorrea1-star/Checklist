var Screen = {
  Home: 'home-screen',
  Posto: 'posto-screen',
  Inspect: 'inspect-screen',
  History: 'history-screen',
};

var INSPECT_ITEMS = [
  {
    id: 'areia',
    label: 'Balde de areia lacrado em cada ilha de abastecimento.',
    status: 'empty',
    observation: '',
    photos: [],
  },
  {
    id: 'caixa-separadora',
    label:
      'Caixa separadora com cesta limpa e sem \u00f3leo sobrenadante no \u00faltimo compartimento.',
    status: 'empty',
    observation: '',
    photos: [],
  },
  {
    id: 'brake-way',
    label: 'Brake Way ajustado e funcionando corretamente.',
    status: 'empty',
    observation: '',
    photos: [],
  },
  {
    id: 'calhas',
    label: 'Calhas limpas e sem obstru\u00e7\u00f5es.',
    status: 'empty',
    observation: '',
    photos: [],
  },
  {
    id: 'motos',
    label: 'Procedimento de abastecimento de motos (cliente desembarca e utiliza o cavalete).',
    status: 'empty',
    observation: '',
    photos: [],
  },
  {
    id: 'gnv',
    label:
      'Procedimento de abastecimento de GNV (aterramento, porta-malas aberto e clientes a 3 metros de dist\u00e2ncia \u00e0 frente).',
    status: 'empty',
    observation: '',
    photos: [],
  },
  {
    id: 'sumps',
    label: 'Sumps, bocas de descarga e aterramento em conformidade.',
    status: 'empty',
    observation: '',
    photos: [],
  },
  {
    id: 'extintores',
    label: 'Extintores com press\u00e3o na faixa verde e validade vigente.',
    status: 'empty',
    observation: '',
    photos: [],
  },
  {
    id: 'emergencia',
    label: 'Plano de Emerg\u00eancia atualizado e dispon\u00edvel.',
    status: 'empty',
    observation: '',
    photos: [],
  },
  {
    id: 'simulado',
    label: 'Simulado do Plano de Emerg\u00eancia atualizado e com registro fotogr\u00e1fico.',
    status: 'empty',
    observation: '',
    photos: [],
  },
];

var currentPosto = '';
var currentDate = '';
var savedInspectionId = null;
var photoTargetId = '';

function showScreen(screen) {
  var screens = document.querySelectorAll('.screen');
  for (var i = 0; i < screens.length; i++) {
    screens[i].classList.remove('active');
  }
  var target = document.getElementById(screen);
  if (target) {
    target.classList.add('active');
  }
}

function setDateDefault() {
  var dateInput = document.getElementById('posto-date');
  if (!dateInput) return;
  var today = new Date();
  var y = today.getFullYear();
  var m = String(today.getMonth() + 1);
  if (m.length < 2) m = '0' + m;
  var d = String(today.getDate());
  if (d.length < 2) d = '0' + d;
  dateInput.value = y + '-' + m + '-' + d;
  currentDate = dateInput.value;
  dateInput.dataset.default = dateInput.value;
}

function validatePostoForm() {
  var nameInput = document.getElementById('posto-name');
  var dateInput = document.getElementById('posto-date');
  var continueBtn = document.getElementById('continue-btn');
  if (!nameInput || !dateInput || !continueBtn) return;
  var valid = nameInput.value.trim().length > 0 && dateInput.value.length > 0;
  continueBtn.disabled = !valid;
}

function statusText(status) {
  if (status === 'pass') return 'Conforme';
  if (status === 'fail') return 'N\u00e3o Conforme';
  return 'Pendente';
}

function createGalleryItem(src, index) {
  var wrapper = document.createElement('div');
  wrapper.className = 'gallery-item';
  wrapper.dataset.index = String(index);

  var img = document.createElement('img');
  img.src = src;
  img.alt = 'Foto';
  img.draggable = false;

  var removeBtn = document.createElement('button');
  removeBtn.className = 'photo-remove';
  removeBtn.dataset.action = 'remove-photo';
  removeBtn.textContent = '\u00D7';

  wrapper.appendChild(img);
  wrapper.appendChild(removeBtn);
  return wrapper;
}

function renderInspectItems() {
  var container = document.getElementById('inspect-items');
  if (!container) return;
  container.innerHTML = '';

  for (var i = 0; i < INSPECT_ITEMS.length; i++) {
    var item = INSPECT_ITEMS[i];

    var card = document.createElement('div');
    card.className = 'accordion-card';
    card.dataset.id = item.id;

    var header = document.createElement('div');
    header.className = 'accordion-header';
    header.dataset.action = 'toggle';

    var label = document.createElement('span');
    label.className = 'item-label';
    label.textContent = item.label;

    var badge = document.createElement('span');
    badge.className = 'status-badge status-' + item.status;
    badge.textContent = statusText(item.status);

    var chevron = document.createElement('span');
    chevron.className = 'chevron';
    chevron.textContent = '\u203A';

    header.appendChild(label);
    header.appendChild(badge);
    header.appendChild(chevron);

    var body = document.createElement('div');
    body.className = 'accordion-body';

    var inner = document.createElement('div');
    inner.className = 'accordion-body-inner';

    var statusRow = document.createElement('div');
    statusRow.className = 'status-row';

    var conformBtn = document.createElement('button');
    conformBtn.className = 'status-btn' + (item.status === 'pass' ? ' is-pass' : '');
    conformBtn.dataset.status = 'pass';
    conformBtn.textContent = 'Conforme';

    var naoBtn = document.createElement('button');
    naoBtn.className = 'status-btn' + (item.status === 'fail' ? ' is-fail' : '');
    naoBtn.dataset.status = 'fail';
    naoBtn.textContent = 'N\u00e3o Conforme';

    statusRow.appendChild(conformBtn);
    statusRow.appendChild(naoBtn);

    var obsGroup = document.createElement('div');
    obsGroup.className = 'obs-group';

    var obsLabel = document.createElement('div');
    obsLabel.className = 'obs-label';
    obsLabel.textContent = 'OBSERVA\u00c7\u00c3O';

    var obsInput = document.createElement('textarea');
    obsInput.className = 'obs-input';
    obsInput.placeholder = 'Descreva qualquer observa\u00e7\u00e3o...';
    obsInput.value = item.observation;

    obsGroup.appendChild(obsLabel);
    obsGroup.appendChild(obsInput);

    var photoActions = document.createElement('div');
    photoActions.className = 'photo-actions';

    var cameraBtn = document.createElement('button');
    cameraBtn.className = 'photo-btn';
    cameraBtn.dataset.action = 'camera';
    cameraBtn.textContent = 'Tirar Foto';

    var galleryBtn = document.createElement('button');
    galleryBtn.className = 'photo-btn';
    galleryBtn.dataset.action = 'gallery';
    galleryBtn.textContent = 'Galeria';

    photoActions.appendChild(cameraBtn);
    photoActions.appendChild(galleryBtn);

    var gallery = document.createElement('div');
    gallery.className = 'photo-gallery';
    gallery.id = 'photo-gallery-' + item.id;

    for (var j = 0; j < item.photos.length; j++) {
      gallery.appendChild(createGalleryItem(item.photos[j], j));
    }

    inner.appendChild(statusRow);
    inner.appendChild(obsGroup);
    inner.appendChild(photoActions);
    inner.appendChild(gallery);
    body.appendChild(inner);

    card.appendChild(header);
    card.appendChild(body);
    container.appendChild(card);
  }

  updateProgress();
}

function toggleCard(id) {
  var card = document.querySelector('[data-id="' + id + '"]');
  if (!card) return;
  var body = card.querySelector('.accordion-body');
  var chevron = card.querySelector('.chevron');

  var isOpening = !body.classList.contains('is-open');

  var openBodies = document.querySelectorAll('.accordion-body.is-open');
  for (var i = 0; i < openBodies.length; i++) {
    openBodies[i].style.maxHeight = '0';
    openBodies[i].classList.remove('is-open');
  }
  var openChevrons = document.querySelectorAll('.chevron.is-open');
  for (var j = 0; j < openChevrons.length; j++) {
    openChevrons[j].classList.remove('is-open');
  }

  if (isOpening) {
    body.classList.add('is-open');
    body.style.maxHeight = body.scrollHeight + 'px';
    chevron.classList.add('is-open');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function resizeAccordionBody(card) {
  var body = card.querySelector('.accordion-body.is-open');
  if (body) {
    body.style.maxHeight = body.scrollHeight + 'px';
  }
}

function setItemStatus(id, value) {
  var item = null;
  for (var i = 0; i < INSPECT_ITEMS.length; i++) {
    if (INSPECT_ITEMS[i].id === id) {
      item = INSPECT_ITEMS[i];
      break;
    }
  }
  if (!item) return;
  item.status = value;

  var card = document.querySelector('[data-id="' + id + '"]');
  if (!card) return;

  var badge = card.querySelector('.status-badge');
  badge.className = 'status-badge status-' + value;
  badge.textContent = statusText(value);

  var conformBtn = card.querySelector('[data-status="pass"]');
  var naoBtn = card.querySelector('[data-status="fail"]');
  conformBtn.classList.remove('is-pass', 'is-fail');
  naoBtn.classList.remove('is-pass', 'is-fail');

  if (value === 'pass') {
    conformBtn.classList.add('is-pass');
  } else if (value === 'fail') {
    naoBtn.classList.add('is-fail');
  }

  updateProgress();
}

function triggerCamera(itemId) {
  photoTargetId = itemId;
  var input = document.getElementById('camera-input');
  input.value = '';
  input.click();
}

function triggerGallery(itemId) {
  photoTargetId = itemId;
  var input = document.getElementById('gallery-input');
  input.value = '';
  input.click();
}

function addPhotos(itemId, files) {
  var item = null;
  for (var i = 0; i < INSPECT_ITEMS.length; i++) {
    if (INSPECT_ITEMS[i].id === itemId) {
      item = INSPECT_ITEMS[i];
      break;
    }
  }
  if (!item) return;

  for (var j = 0; j < files.length; j++) {
    var url = URL.createObjectURL(files[j]);
    item.photos.push(url);
  }
  renderGallery(itemId);
}

function renderGallery(itemId) {
  var gallery = document.getElementById('photo-gallery-' + itemId);
  if (!gallery) return;
  var item = null;
  for (var i = 0; i < INSPECT_ITEMS.length; i++) {
    if (INSPECT_ITEMS[i].id === itemId) {
      item = INSPECT_ITEMS[i];
      break;
    }
  }
  if (!item) return;

  gallery.innerHTML = '';
  for (var j = 0; j < item.photos.length; j++) {
    gallery.appendChild(createGalleryItem(item.photos[j], j));
  }

  var card = gallery.closest('.accordion-card');
  if (card) resizeAccordionBody(card);
}

function removePhoto(itemId, index) {
  if (!confirm('Remover esta foto?')) return;

  var item = null;
  for (var i = 0; i < INSPECT_ITEMS.length; i++) {
    if (INSPECT_ITEMS[i].id === itemId) {
      item = INSPECT_ITEMS[i];
      break;
    }
  }
  if (!item) return;

  URL.revokeObjectURL(item.photos[index]);
  item.photos.splice(index, 1);
  renderGallery(itemId);
}

function updateProgress() {
  var total = INSPECT_ITEMS.length;
  var done = 0;
  for (var i = 0; i < INSPECT_ITEMS.length; i++) {
    if (INSPECT_ITEMS[i].status !== 'empty') {
      done++;
    }
  }
  var pct = total > 0 ? (done / total) * 100 : 0;

  var fill = document.getElementById('progress-fill');
  var label = document.getElementById('progress-label');

  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = done + ' / ' + total;
}

function saveToLocalStorage() {
  var stored = localStorage.getItem('inspections');
  var inspections = stored ? JSON.parse(stored) : [];

  var saved = {
    id: savedInspectionId || String(Date.now()),
    posto: currentPosto,
    date: currentDate,
    items: [],
    completedAt: new Date().toISOString(),
  };

  for (var i = 0; i < INSPECT_ITEMS.length; i++) {
    saved.items.push({
      id: INSPECT_ITEMS[i].id,
      label: INSPECT_ITEMS[i].label,
      status: INSPECT_ITEMS[i].status,
      observation: INSPECT_ITEMS[i].observation,
      photoCount: INSPECT_ITEMS[i].photos.length,
    });
  }

  if (savedInspectionId) {
    var found = false;
    for (var j = 0; j < inspections.length; j++) {
      if (inspections[j].id === savedInspectionId) {
        inspections[j] = saved;
        found = true;
        break;
      }
    }
    if (!found) {
      inspections.push(saved);
    }
  } else {
    inspections.push(saved);
  }

  localStorage.setItem('inspections', JSON.stringify(inspections));
  savedInspectionId = saved.id;

  var exportBtn = document.getElementById('export-pdf');
  if (exportBtn) {
    exportBtn.classList.remove('is-hidden');
    exportBtn.classList.add('is-visible');
  }

  var indicator = document.getElementById('saved-indicator');
  if (indicator) {
    var now = new Date();
    var h = String(now.getHours());
    if (h.length < 2) h = '0' + h;
    var m = String(now.getMinutes());
    if (m.length < 2) m = '0' + m;
    indicator.textContent = 'Salvo \u00e0s ' + h + ':' + m;
    indicator.classList.add('is-visible');
  }
}

function loadImage(url) {
  return new Promise(function (resolve) {
    var img = new Image();
    img.onload = function () {
      resolve(img);
    };
    img.onerror = function () {
      resolve(null);
    };
    img.src = url;
  });
}

function imgToBase64(img, maxW) {
  if (maxW === void 0) {
    maxW = 300;
  }
  var scale = Math.min(1, maxW / img.naturalWidth);
  var w = Math.round(img.naturalWidth * scale);
  var h = Math.round(img.naturalHeight * scale);
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', 0.5);
}

async function exportPDF() {
  var allImgs = [];
  for (var i = 0; i < INSPECT_ITEMS.length; i++) {
    var item = INSPECT_ITEMS[i];
    if (item.photos.length === 0) {
      allImgs.push([]);
    } else {
      var promises = [];
      for (var j = 0; j < item.photos.length; j++) {
        promises.push(loadImage(item.photos[j]));
      }
      allImgs.push(await Promise.all(promises));
    }
  }

  var allBase64 = [];
  for (i = 0; i < allImgs.length; i++) {
    var row = [];
    for (j = 0; j < allImgs[i].length; j++) {
      row.push(allImgs[i][j] ? imgToBase64(allImgs[i][j]) : '');
    }
    allBase64.push(row);
  }

  var doc = new jspdf.jsPDF();
  var margin = 14;
  var pageW = doc.internal.pageSize.getWidth();
  var pageH = doc.internal.pageSize.getHeight();
  var pageCount = 1;

  function nextPage() {
    doc.addPage();
    pageCount++;
    doc.setFillColor(0, 122, 255);
    doc.rect(0, 0, pageW, 3, 'F');
  }

  function addFooter() {
    var dateStr = new Date().toLocaleString('pt-BR');
    for (var p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setDrawColor(220);
      doc.line(margin, pageH - 15, pageW - margin, pageH - 15);
      doc.setFontSize(7);
      doc.setTextColor(180);
      doc.text('P\u00e1gina ' + p + ' de ' + pageCount, margin, pageH - 8);
      var gts = 'Gerado em ' + dateStr;
      doc.text(gts, pageW - margin - doc.getTextWidth(gts), pageH - 8);
    }
  }

  var y = 30;

  doc.setFillColor(0, 122, 255);
  doc.rect(0, 0, pageW, 3, 'F');

  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0);
  doc.text('Relat\u00f3rio de Inspe\u00e7\u00e3o', margin, y);

  y += 12;
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100);
  doc.text('Posto: ' + currentPosto, margin, y);
  doc.text('Data: ' + currentDate, margin + 100, y);

  y += 8;
  doc.setDrawColor(220);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  for (i = 0; i < INSPECT_ITEMS.length; i++) {
    item = INSPECT_ITEMS[i];
    var st = statusText(item.status);
    var obs = item.observation || '';
    var imgs = [];
    var rawImgs = allImgs[i];
    for (var k = 0; k < rawImgs.length; k++) {
      if (rawImgs[k] !== null) imgs.push(rawImgs[k]);
    }
    var base64s = [];
    var rawBase64 = allBase64[i];
    for (k = 0; k < rawBase64.length; k++) {
      if (rawBase64[k] !== '') base64s.push(rawBase64[k]);
    }

    var obsLines = obs
      ? doc.splitTextToSize('Observa\u00e7\u00e3o: ' + obs, pageW - margin * 2 - 12)
      : [];
    var obsH = obsLines.length * 4;

    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    var stW = doc.getTextWidth(st);
    var badgeW = stW + 8;
    var badgeX = pageW - margin - badgeW;

    var labelMaxW = Math.max(badgeX - (margin + 8) - 4, 10);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    var labelLines = doc.splitTextToSize(item.label, labelMaxW);
    var labelExtraH = (labelLines.length - 1) * 4;

    var est = 18 + labelExtraH + obsH + (imgs.length > 0 ? Math.ceil(imgs.length / 3) * 43 : 0);
    if (y + est > 260) {
      nextPage();
      y = 30;
    }

    var num = String(i + 1);
    if (num.length < 2) num = '0' + num;

    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(180);
    doc.text(num, margin, y);

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0);
    for (var li = 0; li < labelLines.length; li++) {
      doc.text(labelLines[li], margin + 8, y + li * 4);
    }

    var badgeY = y + (labelLines.length - 1) * 4;
    if (st === 'Conforme') {
      doc.setFillColor(36, 138, 61);
    } else if (st === 'N\u00e3o Conforme') {
      doc.setFillColor(196, 30, 30);
    } else {
      doc.setFillColor(153, 153, 153);
    }
    doc.roundedRect(badgeX, badgeY - 3, badgeW, 6, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.text(st, badgeX + (badgeW - stW) / 2, badgeY + 1);

    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    y += 8;

    if (obsLines.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(obsLines, margin + 8, y);
      y += obsLines.length * 4;
      doc.setTextColor(0);
    }

    if (imgs.length > 0) {
      var px = margin + 8;
      var py = y;
      var maxDim = 36;
      var gap = 4;

      for (j = 0; j < imgs.length; j++) {
        var img = imgs[j];
        var aspect = img.naturalWidth / img.naturalHeight;
        var pw = maxDim;
        var ph = maxDim;
        if (aspect > 1) {
          ph = pw / aspect;
        } else {
          pw = ph * aspect;
        }

        doc.setDrawColor(220);
        doc.rect(px - 0.5, py - 0.5, pw + 1, ph + 1, 'S');
        doc.addImage(base64s[j], 'JPEG', px, py, pw, ph);

        px += maxDim + gap;
        if ((j + 1) % 3 === 0 && j < imgs.length - 1) {
          px = margin + 8;
          py += maxDim + 5;
        }
      }

      y += Math.ceil(imgs.length / 3) * (maxDim + 5);
    }

    y += 1;
    doc.setDrawColor(235);
    doc.line(margin + 8, y, pageW - margin, y);
    y += 5;
  }

  var passCount = 0;
  var failCount = 0;
  var pendCount = 0;
  for (i = 0; i < INSPECT_ITEMS.length; i++) {
    if (INSPECT_ITEMS[i].status === 'pass') passCount++;
    else if (INSPECT_ITEMS[i].status === 'fail') failCount++;
    else pendCount++;
  }

  if (y + 20 > 260) {
    nextPage();
    y = 30;
  }

  doc.setDrawColor(0, 122, 255);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  doc.setLineWidth(0.1);
  y += 7;

  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0);
  doc.text('Resumo da Inspe\u00e7\u00e3o', margin, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');

  var dotY = y - 2;
  doc.setFillColor(36, 138, 61);
  doc.circle(margin + 3, dotY, 2.5, 'F');
  doc.setTextColor(36, 138, 61);
  doc.text('Conforme: ' + passCount, margin + 9, y);

  doc.setFillColor(196, 30, 30);
  doc.circle(margin + 65, dotY, 2.5, 'F');
  doc.setTextColor(196, 30, 30);
  doc.text('N\u00e3o Conforme: ' + failCount, margin + 71, y);

  doc.setFillColor(153, 153, 153);
  doc.circle(margin + 130, dotY, 2.5, 'F');
  doc.setTextColor(153, 153, 153);
  doc.text('Pendente: ' + pendCount, margin + 136, y);

  addFooter();

  doc.save('relatorio-inspecao-' + currentPosto.replace(/[^a-z0-9]/gi, '-') + '.pdf');
}

function cleanupPhotos() {
  for (var i = 0; i < INSPECT_ITEMS.length; i++) {
    for (var j = 0; j < INSPECT_ITEMS[i].photos.length; j++) {
      URL.revokeObjectURL(INSPECT_ITEMS[i].photos[j]);
    }
    INSPECT_ITEMS[i].photos = [];
    INSPECT_ITEMS[i].observation = '';
  }
}

function showToast(message, duration) {
  duration = duration || 2000;
  var container = document.getElementById('toast-container');
  if (!container) return;

  var el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  container.appendChild(el);

  setTimeout(function () {
    el.classList.add('is-out');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 250);
  }, duration);
}

function hasUnsavedChanges() {
  for (var i = 0; i < INSPECT_ITEMS.length; i++) {
    var item = INSPECT_ITEMS[i];
    if (item.status !== 'empty' || item.observation.length > 0 || item.photos.length > 0) {
      return true;
    }
  }
  return false;
}

function resetInspection() {
  cleanupPhotos();
  for (var i = 0; i < INSPECT_ITEMS.length; i++) {
    INSPECT_ITEMS[i].status = 'empty';
  }
  currentPosto = '';
  currentDate = '';
  savedInspectionId = null;
  renderInspectItems();
  updateProgress();

  var exportBtn = document.getElementById('export-pdf');
  if (exportBtn) {
    exportBtn.classList.remove('is-visible');
    exportBtn.classList.add('is-hidden');
  }

  var indicator = document.getElementById('saved-indicator');
  if (indicator) {
    indicator.classList.remove('is-visible');
    indicator.textContent = '';
  }

  var finishBtn = document.getElementById('finish-inspection');
  if (finishBtn) {
    finishBtn.textContent = 'Concluir Inspe\u00e7\u00e3o';
    finishBtn.className = 'btn btn-done';
  }
}

function renderHistory() {
  var container = document.getElementById('history-screen');
  if (!container) return;
  container = container.querySelector('.screen-content');
  if (!container) return;

  var stored = localStorage.getItem('inspections');
  var inspections = stored ? JSON.parse(stored) : [];

  if (inspections.length === 0) {
    container.className = 'screen-content is-empty';
    container.textContent = 'Nenhuma inspe\u00e7\u00e3o ainda.';
    return;
  }

  container.className = 'screen-content';
  container.innerHTML = '';

  inspections.sort(function (a, b) {
    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
  });

  for (var i = 0; i < inspections.length; i++) {
    var insp = inspections[i];
    var card = document.createElement('div');
    card.className = 'history-card';
    card.dataset.id = insp.id;

    var passCount = 0;
    var failCount = 0;
    for (var j = 0; j < insp.items.length; j++) {
      if (insp.items[j].status === 'pass') passCount++;
      else if (insp.items[j].status === 'fail') failCount++;
    }
    var pendCount = insp.items.length - passCount - failCount;

    var d = new Date(insp.completedAt);
    var hh = String(d.getHours());
    if (hh.length < 2) hh = '0' + hh;
    var mm = String(d.getMinutes());
    if (mm.length < 2) mm = '0' + mm;
    var dd = String(d.getDate());
    if (dd.length < 2) dd = '0' + dd;
    var mo = String(d.getMonth() + 1);
    if (mo.length < 2) mo = '0' + mo;
    var yy = d.getFullYear();

    card.innerHTML =
      '<div class="history-card-header">' +
      '<strong>' +
      insp.posto +
      '</strong>' +
      '<small>' +
      insp.date +
      '</small>' +
      '</div>' +
      '<div class="history-card-stats">' +
      '<span class="stat pass">' +
      passCount +
      ' Conforme</span>' +
      '<span class="stat fail">' +
      failCount +
      ' N\u00e3o Conforme</span>' +
      '<span class="stat pending">' +
      pendCount +
      ' Pendente</span>' +
      '</div>' +
      '<div class="history-card-footer">' +
      '<small>Salvo em ' +
      dd +
      '/' +
      mo +
      '/' +
      yy +
      ' \u00e0s ' +
      hh +
      ':' +
      mm +
      '</small>' +
      '</div>';

    card.addEventListener(
      'click',
      (function (id) {
        return function () {
          loadInspection(id);
        };
      })(insp.id),
    );

    container.appendChild(card);
  }
}

function loadInspection(id) {
  var stored = localStorage.getItem('inspections');
  if (!stored) return;
  var inspections = JSON.parse(stored);
  var insp = null;
  for (var i = 0; i < inspections.length; i++) {
    if (inspections[i].id === id) {
      insp = inspections[i];
      break;
    }
  }
  if (!insp) return;

  cleanupPhotos();
  for (i = 0; i < INSPECT_ITEMS.length; i++) {
    INSPECT_ITEMS[i].status = 'empty';
    INSPECT_ITEMS[i].observation = '';
  }

  currentPosto = insp.posto;
  currentDate = insp.date;
  savedInspectionId = insp.id;

  for (i = 0; i < insp.items.length; i++) {
    var savedItem = insp.items[i];
    for (var j = 0; j < INSPECT_ITEMS.length; j++) {
      if (INSPECT_ITEMS[j].id === savedItem.id) {
        INSPECT_ITEMS[j].status = savedItem.status;
        INSPECT_ITEMS[j].observation = savedItem.observation;
        break;
      }
    }
  }

  var nameInput = document.getElementById('posto-name');
  var dateInput = document.getElementById('posto-date');
  if (nameInput) nameInput.value = currentPosto;
  if (dateInput) dateInput.value = currentDate;

  showScreen(Screen.Inspect);
  renderInspectItems();
  updateProgress();

  var finishBtn = document.getElementById('finish-inspection');
  if (finishBtn) {
    finishBtn.textContent = 'Atualizar Inspe\u00e7\u00e3o';
    finishBtn.className = 'btn btn-primary';
    finishBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.12)';
  }

  var exportBtn = document.getElementById('export-pdf');
  if (exportBtn) {
    exportBtn.classList.remove('is-hidden');
    exportBtn.classList.add('is-visible');
  }

  var indicator = document.getElementById('saved-indicator');
  if (indicator) {
    var now = new Date(insp.completedAt);
    var h = String(now.getHours());
    if (h.length < 2) h = '0' + h;
    var m = String(now.getMinutes());
    if (m.length < 2) m = '0' + m;
    indicator.textContent = 'Salvo \u00e0s ' + h + ':' + m;
    indicator.classList.add('is-visible');
  }
}

function showPostoForm() {
  setDateDefault();
  var nameInput = document.getElementById('posto-name');
  if (nameInput) {
    nameInput.value = '';
    currentPosto = '';
  }
  var continueBtn = document.getElementById('continue-btn');
  if (continueBtn) continueBtn.disabled = true;
  showScreen(Screen.Posto);
}

function handleInspectClick(e) {
  var target = e.target;
  var card = target.closest('.accordion-card');
  if (!card) return;
  var itemId = card.dataset.id;
  if (!itemId) return;

  var toggleHeader = target.closest('[data-action="toggle"]');
  if (toggleHeader) {
    toggleCard(itemId);
    return;
  }

  var statusBtn = target.closest('[data-status]');
  if (statusBtn) {
    setItemStatus(itemId, statusBtn.dataset.status);
    resizeAccordionBody(card);
    return;
  }

  var actionBtn = target.closest('.photo-btn');
  if (actionBtn) {
    var action = actionBtn.dataset.action;
    if (action === 'camera') triggerCamera(itemId);
    else if (action === 'gallery') triggerGallery(itemId);
    return;
  }

  var removeBtn = target.closest('[data-action="remove-photo"]');
  if (removeBtn) {
    var galleryItem = removeBtn.closest('.gallery-item');
    var index = parseInt(galleryItem.dataset.index || '0', 10);
    removePhoto(itemId, index);
    return;
  }
}

function handleObservationChange(e) {
  var textarea = e.target;
  if (!textarea.classList.contains('obs-input')) return;
  var card = textarea.closest('.accordion-card');
  if (!card) return;
  var itemId = card.dataset.id;
  if (!itemId) return;

  var item = null;
  for (var i = 0; i < INSPECT_ITEMS.length; i++) {
    if (INSPECT_ITEMS[i].id === itemId) {
      item = INSPECT_ITEMS[i];
      break;
    }
  }
  if (item) item.observation = textarea.value;
}

function handleCameraCapture(e) {
  var input = e.target;
  if (!input.files || !input.files.length) return;
  addPhotos(photoTargetId, input.files);
  input.value = '';
}

function handleGallerySelect(e) {
  var input = e.target;
  if (!input.files || !input.files.length) return;
  addPhotos(photoTargetId, input.files);
  input.value = '';
}

document.addEventListener('DOMContentLoaded', function () {
  renderInspectItems();

  var newInspectionBtn = document.getElementById('new-inspection');
  var historyBtn = document.getElementById('history-btn');
  var postoBackBtn = document.getElementById('posto-back');
  var inspectBackBtn = document.getElementById('inspect-back');
  var historyBackBtn = document.getElementById('history-back');
  var inspectItemsEl = document.getElementById('inspect-items');
  var finishBtn = document.getElementById('finish-inspection');
  var continueBtn = document.getElementById('continue-btn');
  var appEl = document.getElementById('app');
  var postoNameInput = document.getElementById('posto-name');
  var postoDateInput = document.getElementById('posto-date');
  var cameraInput = document.getElementById('camera-input');
  var galleryInput = document.getElementById('gallery-input');
  var exportBtn = document.getElementById('export-pdf');

  newInspectionBtn.addEventListener('click', function () {
    resetInspection();
    showPostoForm();
  });

  postoBackBtn.addEventListener('click', function () {
    showScreen(Screen.Home);
  });

  continueBtn.addEventListener('click', function () {
    var nameInput = document.getElementById('posto-name');
    var dateInput = document.getElementById('posto-date');
    currentPosto = nameInput.value.trim();
    currentDate = dateInput.value;
    var titleEl = document.getElementById('inspect-title');
    if (titleEl) {
      titleEl.textContent = currentPosto;
    }
    showScreen(Screen.Inspect);
  });

  var postoForm = document.getElementById('posto-form');
  postoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = document.getElementById('continue-btn');
    if (btn && !btn.disabled) btn.click();
  });

  postoNameInput.addEventListener('input', validatePostoForm);
  postoDateInput.addEventListener('change', validatePostoForm);

  historyBtn.addEventListener('click', function () {
    renderHistory();
    showScreen(Screen.History);
  });

  inspectBackBtn.addEventListener('click', function () {
    if (savedInspectionId === null && hasUnsavedChanges()) {
      if (
        !confirm(
          'H\u00e1 altera\u00e7\u00f5es n\u00e3o salvas. Se sair agora, perder\u00e1 todo o progresso. Deseja realmente sair?',
        )
      ) {
        return;
      }
    }
    resetInspection();
    showScreen(Screen.Home);
  });

  historyBackBtn.addEventListener('click', function () {
    showScreen(Screen.Home);
  });

  inspectItemsEl.addEventListener('click', handleInspectClick);
  inspectItemsEl.addEventListener('input', handleObservationChange);

  finishBtn.addEventListener('click', function () {
    saveToLocalStorage();

    finishBtn.textContent = 'Atualizar Inspe\u00e7\u00e3o';
    finishBtn.className = 'btn btn-primary';
    finishBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.12)';

    showToast('Inspe\u00e7\u00e3o salva com sucesso!');
  });

  exportBtn.addEventListener('click', exportPDF);

  appEl.addEventListener('touchstart', function (e) {
    if (
      document.activeElement &&
      (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')
    ) {
      var tag = e.target.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'BUTTON' && tag !== 'SELECT') {
        document.activeElement.blur();
      }
    }
  });

  cameraInput.addEventListener('change', handleCameraCapture);
  galleryInput.addEventListener('change', handleGallerySelect);
});
