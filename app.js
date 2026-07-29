"use strict";
var AppScreen;
(function (AppScreen) {
    AppScreen["Home"] = "home-screen";
    AppScreen["Posto"] = "posto-screen";
    AppScreen["Inspect"] = "inspect-screen";
    AppScreen["History"] = "history-screen";
})(AppScreen || (AppScreen = {}));
const INSPECT_ITEMS = [
    {
        id: 'areia',
        label: 'Balde de areia lacrado em cada ilha de abastecimento.',
        status: 'empty',
        observation: '',
        photos: [],
    },
    {
        id: 'caixa-separadora',
        label: 'Caixa separadora com cesta limpa e sem \u00f3leo sobrenadante no \u00faltimo compartimento.',
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
        label: 'Procedimento de abastecimento de GNV (aterramento, porta-malas aberto e clientes a 3 metros de dist\u00e2ncia \u00e0 frente).',
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
let currentPosto = '';
let currentDate = '';
let savedInspectionId = null;
let photoTargetId = '';
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach((el) => {
        el.classList.remove('active');
    });
    const target = document.getElementById(screen);
    if (target) {
        target.classList.add('active');
    }
}
function setDateDefault() {
    const dateInput = document.getElementById('posto-date');
    if (!dateInput)
        return;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${y}-${m}-${d}`;
    currentDate = dateInput.value;
    dateInput.dataset.default = dateInput.value;
}
function validatePostoForm() {
    const nameInput = document.getElementById('posto-name');
    const dateInput = document.getElementById('posto-date');
    const continueBtn = document.getElementById('continue-btn');
    if (!nameInput || !dateInput || !continueBtn)
        return;
    const valid = nameInput.value.trim().length > 0 && dateInput.value.length > 0;
    continueBtn.disabled = !valid;
}
function renderInspectItems() {
    const container = document.getElementById('inspect-items');
    if (!container)
        return;
    container.innerHTML = '';
    for (const item of INSPECT_ITEMS) {
        const card = document.createElement('div');
        card.className = 'accordion-card';
        card.dataset.id = item.id;
        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.dataset.action = 'toggle';
        const label = document.createElement('span');
        label.className = 'item-label';
        label.textContent = item.label;
        const badge = document.createElement('span');
        badge.className = `status-badge status-${item.status}`;
        badge.textContent = statusText(item.status);
        const chevron = document.createElement('span');
        chevron.className = 'chevron';
        chevron.textContent = '\u203A';
        header.appendChild(label);
        header.appendChild(badge);
        header.appendChild(chevron);
        const body = document.createElement('div');
        body.className = 'accordion-body';
        const inner = document.createElement('div');
        inner.className = 'accordion-body-inner';
        const statusRow = document.createElement('div');
        statusRow.className = 'status-row';
        const conformBtn = document.createElement('button');
        conformBtn.className = `status-btn${item.status === 'pass' ? ' is-pass' : ''}`;
        conformBtn.dataset.status = 'pass';
        conformBtn.textContent = 'Conforme';
        const naoBtn = document.createElement('button');
        naoBtn.className = `status-btn${item.status === 'fail' ? ' is-fail' : ''}`;
        naoBtn.dataset.status = 'fail';
        naoBtn.textContent = 'N\u00e3o Conforme';
        statusRow.appendChild(conformBtn);
        statusRow.appendChild(naoBtn);
        const obsGroup = document.createElement('div');
        obsGroup.className = 'obs-group';
        const obsLabel = document.createElement('div');
        obsLabel.className = 'obs-label';
        obsLabel.textContent = 'OBSERVA\u00c7\u00c3O';
        const obsInput = document.createElement('textarea');
        obsInput.className = 'obs-input';
        obsInput.placeholder = 'Descreva qualquer observa\u00e7\u00e3o...';
        obsInput.value = item.observation;
        obsGroup.appendChild(obsLabel);
        obsGroup.appendChild(obsInput);
        const photoActions = document.createElement('div');
        photoActions.className = 'photo-actions';
        const cameraBtn = document.createElement('button');
        cameraBtn.className = 'photo-btn';
        cameraBtn.dataset.action = 'camera';
        cameraBtn.textContent = 'Tirar Foto';
        const galleryBtn = document.createElement('button');
        galleryBtn.className = 'photo-btn';
        galleryBtn.dataset.action = 'gallery';
        galleryBtn.textContent = 'Galeria';
        photoActions.appendChild(cameraBtn);
        photoActions.appendChild(galleryBtn);
        const gallery = document.createElement('div');
        gallery.className = 'photo-gallery';
        gallery.id = `photo-gallery-${item.id}`;
        for (let i = 0; i < item.photos.length; i++) {
            gallery.appendChild(createGalleryItem(item.photos[i], i));
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
function statusText(status) {
    if (status === 'pass')
        return 'Conforme';
    if (status === 'fail')
        return 'N\u00e3o Conforme';
    return 'Pendente';
}
function createGalleryItem(src, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'gallery-item';
    wrapper.dataset.index = String(index);
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Foto';
    img.draggable = false;
    const removeBtn = document.createElement('button');
    removeBtn.className = 'photo-remove';
    removeBtn.dataset.action = 'remove-photo';
    removeBtn.textContent = '\u00D7';
    wrapper.appendChild(img);
    wrapper.appendChild(removeBtn);
    return wrapper;
}
function toggleCard(id) {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (!card)
        return;
    const body = card.querySelector('.accordion-body');
    const chevron = card.querySelector('.chevron');
    const isOpening = !body.classList.contains('is-open');
    document.querySelectorAll('.accordion-body.is-open').forEach((el) => {
        el.style.maxHeight = '0';
        el.classList.remove('is-open');
    });
    document.querySelectorAll('.chevron.is-open').forEach((el) => {
        el.classList.remove('is-open');
    });
    if (isOpening) {
        body.classList.add('is-open');
        body.style.maxHeight = `${body.scrollHeight}px`;
        chevron.classList.add('is-open');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}
function resizeAccordionBody(card) {
    const body = card.querySelector('.accordion-body.is-open');
    if (body) {
        body.style.maxHeight = `${body.scrollHeight}px`;
    }
}
function setItemStatus(id, value) {
    const item = INSPECT_ITEMS.find((i) => i.id === id);
    if (!item)
        return;
    item.status = value;
    const card = document.querySelector(`[data-id="${id}"]`);
    if (!card)
        return;
    const badge = card.querySelector('.status-badge');
    badge.className = `status-badge status-${value}`;
    badge.textContent = statusText(value);
    const conformBtn = card.querySelector('[data-status="pass"]');
    const naoBtn = card.querySelector('[data-status="fail"]');
    conformBtn.classList.remove('is-pass', 'is-fail');
    naoBtn.classList.remove('is-pass', 'is-fail');
    if (value === 'pass') {
        conformBtn.classList.add('is-pass');
    }
    else if (value === 'fail') {
        naoBtn.classList.add('is-fail');
    }
    updateProgress();
}
function triggerCamera(itemId) {
    photoTargetId = itemId;
    const input = document.getElementById('camera-input');
    input.value = '';
    input.click();
}
function triggerGallery(itemId) {
    photoTargetId = itemId;
    const input = document.getElementById('gallery-input');
    input.value = '';
    input.click();
}
function addPhotos(itemId, files) {
    const item = INSPECT_ITEMS.find((i) => i.id === itemId);
    if (!item)
        return;
    for (let i = 0; i < files.length; i++) {
        const url = URL.createObjectURL(files[i]);
        item.photos.push(url);
    }
    renderGallery(itemId);
}
function renderGallery(itemId) {
    const gallery = document.getElementById(`photo-gallery-${itemId}`);
    if (!gallery)
        return;
    const item = INSPECT_ITEMS.find((i) => i.id === itemId);
    if (!item)
        return;
    gallery.innerHTML = '';
    for (let i = 0; i < item.photos.length; i++) {
        gallery.appendChild(createGalleryItem(item.photos[i], i));
    }
    const card = gallery.closest('.accordion-card');
    if (card)
        resizeAccordionBody(card);
}
function removePhoto(itemId, index) {
    if (!confirm('Remover esta foto?'))
        return;
    const item = INSPECT_ITEMS.find((i) => i.id === itemId);
    if (!item)
        return;
    URL.revokeObjectURL(item.photos[index]);
    item.photos.splice(index, 1);
    renderGallery(itemId);
}
function updateProgress() {
    const total = INSPECT_ITEMS.length;
    const done = INSPECT_ITEMS.filter((i) => i.status !== 'empty').length;
    const pct = total > 0 ? (done / total) * 100 : 0;
    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('progress-label');
    if (fill)
        fill.style.width = `${pct}%`;
    if (label)
        label.textContent = `${done} / ${total}`;
}
function saveToLocalStorage() {
    const stored = localStorage.getItem('inspections');
    const inspections = stored ? JSON.parse(stored) : [];
    const saved = {
        id: savedInspectionId || Date.now().toString(),
        posto: currentPosto,
        date: currentDate,
        items: INSPECT_ITEMS.map((item) => ({
            id: item.id,
            label: item.label,
            status: item.status,
            observation: item.observation,
            photoCount: item.photos.length,
        })),
        completedAt: new Date().toISOString(),
    };
    if (savedInspectionId) {
        const idx = inspections.findIndex((i) => i.id === savedInspectionId);
        if (idx >= 0) {
            inspections[idx] = saved;
        }
        else {
            inspections.push(saved);
        }
    }
    else {
        inspections.push(saved);
    }
    localStorage.setItem('inspections', JSON.stringify(inspections));
    savedInspectionId = saved.id;
    const exportBtn = document.getElementById('export-pdf');
    if (exportBtn) {
        exportBtn.classList.remove('is-hidden');
        exportBtn.classList.add('is-visible');
    }
    const indicator = document.getElementById('saved-indicator');
    if (indicator) {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        indicator.textContent = `Salvo \u00e0s ${h}:${m}`;
        indicator.classList.add('is-visible');
    }
}
function loadImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
    });
}
function imgToBase64(img, maxW = 300) {
    const scale = Math.min(1, maxW / img.naturalWidth);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.5);
}
function sumStatus(status) {
    return INSPECT_ITEMS.filter((i) => i.status === status).length;
}
async function exportPDF() {
    const allImgs = [];
    for (const item of INSPECT_ITEMS) {
        if (item.photos.length === 0) {
            allImgs.push([]);
        }
        else {
            allImgs.push(await Promise.all(item.photos.map(loadImage)));
        }
    }
    const allBase64 = allImgs.map((itemArr) => itemArr.map((img) => (img ? imgToBase64(img) : '')));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF();
    const margin = 14;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    let pageCount = 1;
    function nextPage() {
        doc.addPage();
        pageCount++;
        doc.setFillColor(0, 122, 255);
        doc.rect(0, 0, pageW, 3, 'F');
    }
    function addFooter() {
        const dateStr = new Date().toLocaleString('pt-BR');
        for (let p = 1; p <= pageCount; p++) {
            doc.setPage(p);
            doc.setDrawColor(220);
            doc.line(margin, pageH - 15, pageW - margin, pageH - 15);
            doc.setFontSize(7);
            doc.setTextColor(180);
            doc.text(`P\u00e1gina ${p} de ${pageCount}`, margin, pageH - 8);
            const gts = `Gerado em ${dateStr}`;
            doc.text(gts, pageW - margin - doc.getTextWidth(gts), pageH - 8);
        }
    }
    let y = 30;
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
    doc.text(`Posto: ${currentPosto}`, margin, y);
    doc.text(`Data: ${currentDate}`, margin + 100, y);
    y += 8;
    doc.setDrawColor(220);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
    for (let i = 0; i < INSPECT_ITEMS.length; i++) {
        const item = INSPECT_ITEMS[i];
        const st = statusText(item.status);
        const obs = item.observation || '';
        const imgs = allImgs[i].filter((img) => img !== null);
        const base64s = allBase64[i].filter((b) => b !== '');
        const obsLines = obs
            ? doc.splitTextToSize(`Observa\u00e7\u00e3o: ${obs}`, pageW - margin * 2 - 12)
            : [];
        const obsH = obsLines.length * 4;
        const docBadge = doc;
        docBadge.setFontSize(7);
        docBadge.setFont(undefined, 'normal');
        const stW = docBadge.getTextWidth(st);
        const badgeW = stW + 8;
        const badgeX = pageW - margin - badgeW;
        const labelMaxW = Math.max(badgeX - (margin + 8) - 4, 10);
        docBadge.setFontSize(10);
        docBadge.setFont(undefined, 'bold');
        const labelLines = docBadge.splitTextToSize(item.label, labelMaxW);
        const labelExtraH = (labelLines.length - 1) * 4;
        const est = 18 + labelExtraH + obsH + (imgs.length > 0 ? Math.ceil(imgs.length / 3) * 43 : 0);
        if (y + est > 260) {
            nextPage();
            y = 30;
        }
        const num = String(i + 1).padStart(2, '0');
        docBadge.setFontSize(7);
        docBadge.setFont(undefined, 'bold');
        docBadge.setTextColor(180);
        docBadge.text(num, margin, y);
        docBadge.setFontSize(10);
        docBadge.setFont(undefined, 'bold');
        docBadge.setTextColor(0);
        for (let li = 0; li < labelLines.length; li++) {
            docBadge.text(labelLines[li], margin + 8, y + li * 4);
        }
        const badgeColors = {
            Conforme: [36, 138, 61],
            'N\u00e3o Conforme': [196, 30, 30],
            Pendente: [153, 153, 153],
        };
        const bc = badgeColors[st] || badgeColors.Pendente;
        const badgeY = y + (labelLines.length - 1) * 4;
        docBadge.setFillColor(bc[0], bc[1], bc[2]);
        docBadge.roundedRect(badgeX, badgeY - 3, badgeW, 6, 3, 3, 'F');
        docBadge.setTextColor(255, 255, 255);
        docBadge.setFontSize(7);
        docBadge.setFont(undefined, 'normal');
        docBadge.text(st, badgeX + (badgeW - stW) / 2, badgeY + 1);
        docBadge.setTextColor(0);
        docBadge.setFontSize(10);
        docBadge.setFont(undefined, 'normal');
        y += 8;
        if (obsLines.length > 0) {
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(obsLines, margin + 8, y);
            y += obsLines.length * 4;
            doc.setTextColor(0);
        }
        if (imgs.length > 0) {
            let px = margin + 8;
            let py = y;
            const maxDim = 36;
            const gap = 4;
            for (let j = 0; j < imgs.length; j++) {
                const img = imgs[j];
                const aspect = img.naturalWidth / img.naturalHeight;
                let pw = maxDim;
                let ph = maxDim;
                if (aspect > 1) {
                    ph = pw / aspect;
                }
                else {
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
    const passCount = sumStatus('pass');
    const failCount = sumStatus('fail');
    const pendCount = sumStatus('empty');
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
    const dotY = y - 2;
    doc.setFillColor(36, 138, 61);
    doc.circle(margin + 3, dotY, 2.5, 'F');
    doc.setTextColor(36, 138, 61);
    doc.text(`Conforme: ${passCount}`, margin + 9, y);
    doc.setFillColor(196, 30, 30);
    doc.circle(margin + 65, dotY, 2.5, 'F');
    doc.setTextColor(196, 30, 30);
    doc.text(`N\u00e3o Conforme: ${failCount}`, margin + 71, y);
    doc.setFillColor(153, 153, 153);
    doc.circle(margin + 130, dotY, 2.5, 'F');
    doc.setTextColor(153, 153, 153);
    doc.text(`Pendente: ${pendCount}`, margin + 136, y);
    addFooter();
    const blob = doc.output('blob');
    const filename = `relatorio-inspecao-${currentPosto.replace(/[^a-z0-9]/gi, '-')}.pdf`;
    if (navigator.canShare?.({ files: [new File([blob], filename, { type: 'application/pdf' })] })) {
        try {
            await navigator.share({ files: [new File([blob], filename, { type: 'application/pdf' })] });
            return;
        }
        catch {
            // user cancelled share sheet, fall through
        }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}
function cleanupPhotos() {
    for (const item of INSPECT_ITEMS) {
        for (const url of item.photos) {
            URL.revokeObjectURL(url);
        }
        item.photos = [];
        item.observation = '';
    }
}
function resetInspection() {
    cleanupPhotos();
    for (const item of INSPECT_ITEMS) {
        item.status = 'empty';
    }
    currentPosto = '';
    currentDate = '';
    savedInspectionId = null;
    renderInspectItems();
    updateProgress();
    const exportBtn = document.getElementById('export-pdf');
    if (exportBtn) {
        exportBtn.classList.remove('is-visible');
        exportBtn.classList.add('is-hidden');
    }
    const indicator = document.getElementById('saved-indicator');
    if (indicator) {
        indicator.classList.remove('is-visible');
        indicator.textContent = '';
    }
    const finishBtn = document.getElementById('finish-inspection');
    if (finishBtn) {
        finishBtn.textContent = 'Concluir Inspe\u00e7\u00e3o';
        finishBtn.className = 'btn btn-done';
    }
}
function deleteInspection(id) {
    if (!confirm('Excluir esta inspe\u00e7\u00e3o permanentemente?'))
        return;
    const stored = localStorage.getItem('inspections');
    if (!stored)
        return;
    const inspections = JSON.parse(stored);
    localStorage.setItem('inspections', JSON.stringify(inspections.filter((i) => i.id !== id)));
    showToast('Inspe\u00e7\u00e3o exclu\u00edda');
    renderHistory();
}
function renderHistory() {
    const container = document.getElementById('history-screen')?.querySelector('.screen-content');
    if (!container)
        return;
    const stored = localStorage.getItem('inspections');
    const inspections = stored ? JSON.parse(stored) : [];
    if (inspections.length === 0) {
        container.className = 'screen-content is-empty';
        container.textContent = 'Nenhuma inspe\u00e7\u00e3o ainda.';
        return;
    }
    container.className = 'screen-content';
    container.innerHTML = '';
    inspections.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    for (const insp of inspections) {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.dataset.id = insp.id;
        const passCount = insp.items.filter((i) => i.status === 'pass').length;
        const failCount = insp.items.filter((i) => i.status === 'fail').length;
        const pendCount = insp.items.length - passCount - failCount;
        const d = new Date(insp.completedAt);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        const yy = d.getFullYear();
        card.innerHTML = `
      <div class="history-card-header">
        <strong>${insp.posto}</strong>
        <small>${insp.date}</small>
      </div>
      <div class="history-card-stats">
        <span class="stat pass">${passCount} Conforme</span>
        <span class="stat fail">${failCount} N\u00e3o Conforme</span>
        <span class="stat pending">${pendCount} Pendente</span>
      </div>
      <div class="history-card-footer">
        <small>Salvo em ${dd}/${mo}/${yy} \u00e0s ${hh}:${mm}</small>
        <button class="delete-btn" data-action="delete">Excluir</button>
      </div>
    `;
        card.querySelector('[data-action="delete"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteInspection(insp.id);
        });
        card.addEventListener('click', () => loadInspection(insp.id));
        container.appendChild(card);
    }
}
function loadInspection(id) {
    const stored = localStorage.getItem('inspections');
    if (!stored)
        return;
    const inspections = JSON.parse(stored);
    const insp = inspections.find((i) => i.id === id);
    if (!insp)
        return;
    cleanupPhotos();
    for (const item of INSPECT_ITEMS) {
        item.status = 'empty';
        item.observation = '';
    }
    currentPosto = insp.posto;
    currentDate = insp.date;
    savedInspectionId = insp.id;
    for (const savedItem of insp.items) {
        const item = INSPECT_ITEMS.find((i) => i.id === savedItem.id);
        if (item) {
            item.status = savedItem.status;
            item.observation = savedItem.observation;
        }
    }
    const nameInput = document.getElementById('posto-name');
    const dateInput = document.getElementById('posto-date');
    if (nameInput)
        nameInput.value = currentPosto;
    if (dateInput)
        dateInput.value = currentDate;
    showScreen(AppScreen.Inspect);
    renderInspectItems();
    updateProgress();
    const finishBtn = document.getElementById('finish-inspection');
    if (finishBtn) {
        finishBtn.textContent = 'Atualizar Inspe\u00e7\u00e3o';
        finishBtn.className = 'btn btn-primary';
        finishBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.12)';
    }
    const exportBtn = document.getElementById('export-pdf');
    if (exportBtn) {
        exportBtn.classList.remove('is-hidden');
        exportBtn.classList.add('is-visible');
    }
    const indicator = document.getElementById('saved-indicator');
    if (indicator) {
        const now = new Date(insp.completedAt);
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        indicator.textContent = `Salvo \u00e0s ${h}:${m}`;
        indicator.classList.add('is-visible');
    }
}
function showPostoForm() {
    setDateDefault();
    const nameInput = document.getElementById('posto-name');
    if (nameInput) {
        nameInput.value = '';
        currentPosto = '';
    }
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn)
        continueBtn.disabled = true;
    showScreen(AppScreen.Posto);
}
function showToast(message, duration = 2000) {
    const container = document.getElementById('toast-container');
    if (!container)
        return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
        el.classList.add('is-out');
        setTimeout(() => {
            el.remove();
        }, 250);
    }, duration);
}
function hasUnsavedChanges() {
    return INSPECT_ITEMS.some((item) => item.status !== 'empty' || item.observation.length > 0 || item.photos.length > 0);
}
/* ─── Event Handlers ─── */
function handleInspectClick(e) {
    const target = e.target;
    const card = target.closest('.accordion-card');
    if (!card)
        return;
    const itemId = card.dataset.id;
    if (!itemId)
        return;
    const toggleHeader = target.closest('[data-action="toggle"]');
    if (toggleHeader) {
        toggleCard(itemId);
        return;
    }
    const statusBtn = target.closest('[data-status]');
    if (statusBtn) {
        setItemStatus(itemId, statusBtn.dataset.status);
        resizeAccordionBody(card);
        return;
    }
    const actionBtn = target.closest('.photo-btn');
    if (actionBtn) {
        const action = actionBtn.dataset.action;
        if (action === 'camera')
            triggerCamera(itemId);
        else if (action === 'gallery')
            triggerGallery(itemId);
        return;
    }
    const removeBtn = target.closest('[data-action="remove-photo"]');
    if (removeBtn) {
        const galleryItem = removeBtn.closest('.gallery-item');
        const index = parseInt(galleryItem.dataset.index || '0', 10);
        removePhoto(itemId, index);
        return;
    }
}
function handleObservationChange(e) {
    const textarea = e.target;
    if (!textarea.classList.contains('obs-input'))
        return;
    const card = textarea.closest('.accordion-card');
    if (!card)
        return;
    const itemId = card.dataset.id;
    if (!itemId)
        return;
    const item = INSPECT_ITEMS.find((i) => i.id === itemId);
    if (item)
        item.observation = textarea.value;
}
function handleCameraCapture(e) {
    const input = e.target;
    if (!input.files || !input.files.length)
        return;
    addPhotos(photoTargetId, input.files);
    input.value = '';
}
function handleGallerySelect(e) {
    const input = e.target;
    if (!input.files || !input.files.length)
        return;
    addPhotos(photoTargetId, input.files);
    input.value = '';
}
/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', () => {
    renderInspectItems();
    const newInspectionBtn = document.getElementById('new-inspection');
    const historyBtn = document.getElementById('history-btn');
    const postoBackBtn = document.getElementById('posto-back');
    const inspectBackBtn = document.getElementById('inspect-back');
    const historyBackBtn = document.getElementById('history-back');
    const inspectItemsEl = document.getElementById('inspect-items');
    const finishBtn = document.getElementById('finish-inspection');
    const continueBtn = document.getElementById('continue-btn');
    const postoNameInput = document.getElementById('posto-name');
    const postoDateInput = document.getElementById('posto-date');
    const cameraInput = document.getElementById('camera-input');
    const galleryInput = document.getElementById('gallery-input');
    const exportBtn = document.getElementById('export-pdf');
    const appEl = document.getElementById('app');
    newInspectionBtn?.addEventListener('click', () => {
        resetInspection();
        showPostoForm();
    });
    postoBackBtn?.addEventListener('click', () => {
        showScreen(AppScreen.Home);
    });
    continueBtn?.addEventListener('click', () => {
        const nameInput = document.getElementById('posto-name');
        const dateInput = document.getElementById('posto-date');
        currentPosto = nameInput.value.trim();
        currentDate = dateInput.value;
        const titleEl = document.getElementById('inspect-title');
        if (titleEl) {
            titleEl.textContent = currentPosto;
        }
        showScreen(AppScreen.Inspect);
    });
    const postoForm = document.getElementById('posto-form');
    postoForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('continue-btn');
        if (btn && !btn.disabled)
            btn.click();
    });
    postoNameInput?.addEventListener('input', validatePostoForm);
    postoDateInput?.addEventListener('change', validatePostoForm);
    historyBtn?.addEventListener('click', () => {
        renderHistory();
        showScreen(AppScreen.History);
    });
    inspectBackBtn?.addEventListener('click', () => {
        if (savedInspectionId === null && hasUnsavedChanges()) {
            if (!confirm('H\u00e1 altera\u00e7\u00f5es n\u00e3o salvas. Se sair agora, perder\u00e1 todo o progresso. Deseja realmente sair?')) {
                return;
            }
        }
        resetInspection();
        showScreen(AppScreen.Home);
    });
    historyBackBtn?.addEventListener('click', () => {
        showScreen(AppScreen.Home);
    });
    inspectItemsEl?.addEventListener('click', handleInspectClick);
    inspectItemsEl?.addEventListener('input', handleObservationChange);
    finishBtn?.addEventListener('click', () => {
        saveToLocalStorage();
        finishBtn.textContent = 'Atualizar Inspe\u00e7\u00e3o';
        finishBtn.className = 'btn btn-primary';
        finishBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.12)';
        showToast('Inspe\u00e7\u00e3o salva com sucesso!');
    });
    exportBtn?.addEventListener('click', exportPDF);
    appEl?.addEventListener('touchstart', (e) => {
        if (document.activeElement &&
            (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            const tag = e.target.tagName;
            if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'BUTTON' && tag !== 'SELECT') {
                document.activeElement.blur();
            }
        }
    });
    cameraInput?.addEventListener('change', handleCameraCapture);
    galleryInput?.addEventListener('change', handleGallerySelect);
});
