enum AppScreen {
  Home = 'home-screen',
  Posto = 'posto-screen',
  Inspect = 'inspect-screen',
  History = 'history-screen',
}

interface InspectItemData {
  id: string;
  label: string;
  status: 'empty' | 'pass' | 'fail';
  observation: string;
  photos: string[];
}

interface SavedInspection {
  id: string;
  posto: string;
  date: string;
  items: Array<{
    id: string;
    label: string;
    status: 'empty' | 'pass' | 'fail';
    observation: string;
    photos: string[];
  }>;
  completedAt: string;
}

interface StoredInspection extends Omit<SavedInspection, 'items'> {
  items: Array<Omit<SavedInspection['items'][number], 'photos'> & { photos: Blob[] }>;
}

const DB_NAME = 'inspection-checklist';
const DB_VERSION = 1;
const INSPECTIONS_STORE = 'inspections';
const LEGACY_STORAGE_KEY = 'inspections';
let databasePromise: Promise<IDBDatabase> | null = null;
let storageReady: Promise<void> = Promise.resolve();

const INSPECT_ITEMS: InspectItemData[] = [
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

let currentPosto = '';
let currentDate = '';
let savedInspectionId: string | null = null;
let photoTargetId = '';
let lastSavedSignature: string | null = null;

function showScreen(screen: AppScreen): void {
  document.querySelectorAll('.screen').forEach((el) => {
    el.classList.remove('active');
  });
  const target = document.getElementById(screen);
  if (target) {
    target.classList.add('active');
  }
}

function setDateDefault(): void {
  const dateInput = document.getElementById('posto-date') as HTMLInputElement;
  if (!dateInput) return;
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  dateInput.value = `${y}-${m}-${d}`;
  currentDate = dateInput.value;
  dateInput.dataset.default = dateInput.value;
}

function validatePostoForm(): void {
  const nameInput = document.getElementById('posto-name') as HTMLInputElement;
  const dateInput = document.getElementById('posto-date') as HTMLInputElement;
  const continueBtn = document.getElementById('continue-btn') as HTMLButtonElement;
  if (!nameInput || !dateInput || !continueBtn) return;
  const valid = nameInput.value.trim().length > 0 && dateInput.value.length > 0;
  continueBtn.disabled = !valid;
}

function renderInspectItems(): void {
  const container = document.getElementById('inspect-items');
  if (!container) return;
  container.innerHTML = '';

  for (const item of INSPECT_ITEMS) {
    const card = document.createElement('div');
    card.className = 'accordion-card';
    card.dataset.id = item.id;

    const header = document.createElement('button');
    header.className = 'accordion-header';
    header.dataset.action = 'toggle';
    header.type = 'button';
    header.setAttribute('aria-expanded', 'false');

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
    body.id = `accordion-body-${item.id}`;
    header.setAttribute('aria-controls', body.id);

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

function statusText(status: string): string {
  if (status === 'pass') return 'Conforme';
  if (status === 'fail') return 'N\u00e3o Conforme';
  return 'Pendente';
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  };
  return value.replace(/[&<>'"]/g, (character) => entities[character] ?? character);
}

function createGalleryItem(src: string, index: number): HTMLElement {
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

function toggleCard(id: string): void {
  const card = document.querySelector(`[data-id="${id}"]`) as HTMLElement;
  if (!card) return;
  const body = card.querySelector('.accordion-body') as HTMLElement;
  const chevron = card.querySelector('.chevron') as HTMLElement;

  const isOpening = !body.classList.contains('is-open');

  document.querySelectorAll('.accordion-body.is-open').forEach((el) => {
    (el as HTMLElement).style.maxHeight = '0';
    el.classList.remove('is-open');
    (el.parentElement?.querySelector('.accordion-header') as HTMLElement)?.setAttribute(
      'aria-expanded',
      'false',
    );
  });
  document.querySelectorAll('.chevron.is-open').forEach((el) => {
    el.classList.remove('is-open');
  });

  if (isOpening) {
    body.classList.add('is-open');
    body.style.maxHeight = `${body.scrollHeight}px`;
    chevron.classList.add('is-open');
    (card.querySelector('.accordion-header') as HTMLElement)?.setAttribute('aria-expanded', 'true');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    (card.querySelector('.accordion-header') as HTMLElement)?.setAttribute(
      'aria-expanded',
      'false',
    );
  }
}

function resizeAccordionBody(card: HTMLElement): void {
  const body = card.querySelector('.accordion-body.is-open') as HTMLElement;
  if (body) {
    body.style.maxHeight = `${body.scrollHeight}px`;
  }
}

function setItemStatus(id: string, value: 'pass' | 'fail'): void {
  const item = INSPECT_ITEMS.find((i) => i.id === id);
  if (!item) return;
  item.status = value;

  const card = document.querySelector(`[data-id="${id}"]`) as HTMLElement;
  if (!card) return;

  const badge = card.querySelector('.status-badge') as HTMLElement;
  badge.className = `status-badge status-${value}`;
  badge.textContent = statusText(value);

  const conformBtn = card.querySelector('[data-status="pass"]') as HTMLElement;
  const naoBtn = card.querySelector('[data-status="fail"]') as HTMLElement;
  conformBtn.classList.remove('is-pass', 'is-fail');
  naoBtn.classList.remove('is-pass', 'is-fail');

  if (value === 'pass') {
    conformBtn.classList.add('is-pass');
  } else if (value === 'fail') {
    naoBtn.classList.add('is-fail');
  }

  updateProgress();
}

function triggerCamera(itemId: string): void {
  photoTargetId = itemId;
  const input = document.getElementById('camera-input') as HTMLInputElement;
  input.value = '';
  input.click();
}

function triggerGallery(itemId: string): void {
  photoTargetId = itemId;
  const input = document.getElementById('gallery-input') as HTMLInputElement;
  input.value = '';
  input.click();
}

async function addPhotos(itemId: string, files: FileList): Promise<void> {
  const item = INSPECT_ITEMS.find((i) => i.id === itemId);
  if (!item) return;

  for (let i = 0; i < files.length; i++) {
    const url = URL.createObjectURL(files[i]);
    const img = await loadImage(url);
    URL.revokeObjectURL(url);
    if (img) {
      item.photos.push(imgToBase64(img));
    }
  }
  renderGallery(itemId);
}

function renderGallery(itemId: string): void {
  const gallery = document.getElementById(`photo-gallery-${itemId}`);
  if (!gallery) return;
  const item = INSPECT_ITEMS.find((i) => i.id === itemId);
  if (!item) return;

  gallery.innerHTML = '';
  for (let i = 0; i < item.photos.length; i++) {
    gallery.appendChild(createGalleryItem(item.photos[i], i));
  }

  const card = gallery.closest('.accordion-card') as HTMLElement;
  if (card) resizeAccordionBody(card);
}

function removePhoto(itemId: string, index: number): void {
  if (!confirm('Remover esta foto?')) return;

  const item = INSPECT_ITEMS.find((i) => i.id === itemId);
  if (!item) return;

  item.photos.splice(index, 1);
  renderGallery(itemId);
}

function updateProgress(): void {
  const total = INSPECT_ITEMS.length;
  const done = INSPECT_ITEMS.filter((i) => i.status !== 'empty').length;
  const pct = total > 0 ? (done / total) * 100 : 0;

  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');

  if (fill) fill.style.width = `${pct}%`;
  if (label) label.textContent = `${done} / ${total}`;
}

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(INSPECTIONS_STORE)) {
        db.createObjectStore(INSPECTIONS_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return databasePromise;
}

function isSavedInspection(value: unknown): value is SavedInspection {
  if (!value || typeof value !== 'object') return false;
  const inspection = value as Partial<SavedInspection>;
  if (
    typeof inspection.id !== 'string' ||
    typeof inspection.posto !== 'string' ||
    typeof inspection.date !== 'string' ||
    typeof inspection.completedAt !== 'string' ||
    !Array.isArray(inspection.items)
  ) {
    return false;
  }

  return inspection.items.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const candidate = item as Partial<SavedInspection['items'][number]>;
    return (
      typeof candidate.id === 'string' &&
      typeof candidate.label === 'string' &&
      (candidate.status === 'empty' ||
        candidate.status === 'pass' ||
        candidate.status === 'fail') &&
      typeof candidate.observation === 'string' &&
      Array.isArray(candidate.photos) &&
      candidate.photos.every((photo) => typeof photo === 'string')
    );
  });
}

function isStoredInspection(value: unknown): value is StoredInspection {
  if (!value || typeof value !== 'object') return false;
  const inspection = value as Partial<StoredInspection>;
  return (
    typeof inspection.id === 'string' &&
    typeof inspection.posto === 'string' &&
    typeof inspection.date === 'string' &&
    typeof inspection.completedAt === 'string' &&
    Array.isArray(inspection.items) &&
    inspection.items.every(
      (item) =>
        !!item &&
        typeof item.id === 'string' &&
        typeof item.label === 'string' &&
        (item.status === 'empty' || item.status === 'pass' || item.status === 'fail') &&
        typeof item.observation === 'string' &&
        Array.isArray(item.photos) &&
        item.photos.every((photo) => photo instanceof Blob),
    )
  );
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [metadata, encoded] = dataUrl.split(',', 2);
  const binary = atob(encoded || '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const mime = metadata.match(/^data:([^;]+)/)?.[1] || 'image/jpeg';
  return new Blob([bytes], { type: mime });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function toStoredInspection(inspection: SavedInspection): StoredInspection {
  return {
    ...inspection,
    items: inspection.items.map((item) => ({
      ...item,
      photos: item.photos.map(dataUrlToBlob),
    })),
  };
}

async function fromStoredInspection(inspection: StoredInspection): Promise<SavedInspection> {
  return {
    ...inspection,
    items: await Promise.all(
      inspection.items.map(async (item) => ({
        ...item,
        photos: await Promise.all(item.photos.map(blobToDataUrl)),
      })),
    ),
  };
}

async function getStoredInspections(): Promise<SavedInspection[]> {
  const db = await openDatabase();
  const stored = await new Promise<StoredInspection[]>((resolve, reject) => {
    const transaction = db.transaction(INSPECTIONS_STORE, 'readonly');
    const request = transaction.objectStore(INSPECTIONS_STORE).getAll();
    request.onsuccess = () => resolve(request.result as StoredInspection[]);
    request.onerror = () => reject(request.error);
  });

  const converted = await Promise.all(stored.filter(isStoredInspection).map(fromStoredInspection));
  return converted.filter(isSavedInspection);
}

async function putStoredInspection(inspection: SavedInspection): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(INSPECTIONS_STORE, 'readwrite');
    transaction.objectStore(INSPECTIONS_STORE).put(toStoredInspection(inspection));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

async function deleteStoredInspection(id: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(INSPECTIONS_STORE, 'readwrite');
    transaction.objectStore(INSPECTIONS_STORE).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

async function migrateLegacyStorage(): Promise<void> {
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacy) return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(legacy);
  } catch {
    showToast('O histórico antigo está corrompido e foi ignorado.');
    return;
  }

  if (!Array.isArray(parsed)) return;
  const validInspections = parsed.filter(isSavedInspection);
  for (const inspection of validInspections) await putStoredInspection(inspection);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

async function initializeStorage(): Promise<void> {
  try {
    await openDatabase();
    await migrateLegacyStorage();
  } catch {
    showToast('Não foi possível inicializar o armazenamento offline.');
  }
}

async function saveToLocalStorage(): Promise<boolean> {
  const saved: SavedInspection = {
    id: savedInspectionId || Date.now().toString(),
    posto: currentPosto,
    date: currentDate,
    items: INSPECT_ITEMS.map((item) => ({
      id: item.id,
      label: item.label,
      status: item.status,
      observation: item.observation,
      photos: item.photos.slice(),
    })),
    completedAt: new Date().toISOString(),
  };

  try {
    await putStoredInspection(saved);
  } catch {
    showToast('Não foi possível salvar. O armazenamento pode estar cheio.');
    return false;
  }
  savedInspectionId = saved.id;
  lastSavedSignature = getInspectionSignature();

  const exportBtn = document.getElementById('export-pdf') as HTMLElement;
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
  return true;
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function imgToBase64(img: HTMLImageElement, maxW = 300): string {
  const scale = Math.min(1, maxW / img.naturalWidth);
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', 0.5);
}

function sumStatus(status: 'pass' | 'fail' | 'empty'): number {
  return INSPECT_ITEMS.filter((i) => i.status === status).length;
}

async function exportPDF(): Promise<void> {
  const allImgs: (HTMLImageElement | null)[][] = [];
  for (const item of INSPECT_ITEMS) {
    if (item.photos.length === 0) {
      allImgs.push([]);
    } else {
      allImgs.push(await Promise.all(item.photos.map(loadImage)));
    }
  }

  const allBase64: string[][] = allImgs.map((itemArr) =>
    itemArr.map((img) => (img ? imgToBase64(img) : '')),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsPDF = (window as any).jspdf.jsPDF;
  const doc = new jsPDF();
  const margin = 14;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let pageCount = 1;

  function nextPage(): void {
    doc.addPage();
    pageCount++;
    doc.setFillColor(0, 122, 255);
    doc.rect(0, 0, pageW, 3, 'F');
  }

  function addFooter(): void {
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
    const imgs = allImgs[i].filter((img): img is HTMLImageElement => img !== null);
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

    const badgeColors: Record<string, [number, number, number]> = {
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
      const maxDim = 52;
      const gap = 4;

      for (let j = 0; j < imgs.length; j++) {
        const img = imgs[j];
        const aspect = img.naturalWidth / img.naturalHeight;
        let pw = maxDim;
        let ph = maxDim;
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
    } catch {
      // user cancelled share sheet, fall through to save
    }
  }

  doc.save(filename);
}

function cleanupPhotos(): void {
  for (const item of INSPECT_ITEMS) {
    item.photos = [];
    item.observation = '';
  }
}

function resetInspection(): void {
  cleanupPhotos();
  for (const item of INSPECT_ITEMS) {
    item.status = 'empty';
  }
  currentPosto = '';
  currentDate = '';
  savedInspectionId = null;
  lastSavedSignature = null;
  renderInspectItems();
  updateProgress();

  const exportBtn = document.getElementById('export-pdf') as HTMLElement;
  if (exportBtn) {
    exportBtn.classList.remove('is-visible');
    exportBtn.classList.add('is-hidden');
  }

  const indicator = document.getElementById('saved-indicator');
  if (indicator) {
    indicator.classList.remove('is-visible');
    indicator.textContent = '';
  }

  const finishBtn = document.getElementById('finish-inspection') as HTMLElement;
  if (finishBtn) {
    finishBtn.textContent = 'Concluir Inspe\u00e7\u00e3o';
    finishBtn.className = 'btn btn-done';
  }
}

async function deleteInspection(id: string): Promise<void> {
  if (!confirm('Excluir esta inspe\u00e7\u00e3o permanentemente?')) return;
  try {
    await deleteStoredInspection(id);
  } catch {
    showToast('Não foi possível excluir a inspeção.');
    return;
  }
  showToast('Inspe\u00e7\u00e3o exclu\u00edda');
  await renderHistory();
}

async function renderHistory(): Promise<void> {
  const container = document.getElementById('history-screen')?.querySelector('.screen-content');
  if (!container) return;

  let inspections: SavedInspection[];
  try {
    inspections = await getStoredInspections();
  } catch {
    container.className = 'screen-content is-empty';
    container.textContent = 'N\u00e3o foi poss\u00edvel carregar o hist\u00f3rico offline.';
    return;
  }

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
        <strong>${escapeHtml(insp.posto)}</strong>
        <small>${escapeHtml(insp.date)}</small>
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
      void deleteInspection(insp.id);
    });

    card.addEventListener('click', () => void loadInspection(insp.id));

    container.appendChild(card);
  }
}

async function loadInspection(id: string): Promise<void> {
  let inspections: SavedInspection[];
  try {
    inspections = await getStoredInspections();
  } catch {
    showToast('N\u00e3o foi poss\u00edvel carregar a inspe\u00e7\u00e3o offline.');
    return;
  }
  const insp = inspections.find((i) => i.id === id);
  if (!insp) return;

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
      item.photos = savedItem.photos.slice();
    }
  }

  lastSavedSignature = getInspectionSignature();

  const nameInput = document.getElementById('posto-name') as HTMLInputElement;
  const dateInput = document.getElementById('posto-date') as HTMLInputElement;
  if (nameInput) nameInput.value = currentPosto;
  if (dateInput) dateInput.value = currentDate;

  showScreen(AppScreen.Inspect);
  renderInspectItems();
  updateProgress();

  const finishBtn = document.getElementById('finish-inspection') as HTMLButtonElement;
  if (finishBtn) {
    finishBtn.textContent = 'Atualizar Inspe\u00e7\u00e3o';
    finishBtn.className = 'btn btn-primary';
    finishBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.12)';
  }

  const exportBtn = document.getElementById('export-pdf') as HTMLElement;
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

function showPostoForm(): void {
  setDateDefault();
  const nameInput = document.getElementById('posto-name') as HTMLInputElement;
  if (nameInput) {
    nameInput.value = '';
    currentPosto = '';
  }
  const continueBtn = document.getElementById('continue-btn') as HTMLButtonElement;
  if (continueBtn) continueBtn.disabled = true;
  showScreen(AppScreen.Posto);
}

function showToast(message: string, duration = 2000): void {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.textContent = message;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('is-out');
    setTimeout(() => {
      el.remove();
    }, 250);
  }, duration);
}

function hasUnsavedChanges(): boolean {
  return getInspectionSignature() !== lastSavedSignature;
}

function getInspectionSignature(): string {
  return JSON.stringify({
    posto: currentPosto,
    date: currentDate,
    items: INSPECT_ITEMS.map(({ id, status, observation, photos }) => ({
      id,
      status,
      observation,
      photos,
    })),
  });
}

/* ─── Event Handlers ─── */

function handleInspectClick(e: MouseEvent): void {
  const target = e.target as HTMLElement;
  const card = target.closest('.accordion-card') as HTMLElement;
  if (!card) return;
  const itemId = card.dataset.id;
  if (!itemId) return;

  const toggleHeader = target.closest('[data-action="toggle"]');
  if (toggleHeader) {
    toggleCard(itemId);
    return;
  }

  const statusBtn = target.closest('[data-status]') as HTMLElement;
  if (statusBtn) {
    setItemStatus(itemId, statusBtn.dataset.status as 'pass' | 'fail');
    resizeAccordionBody(card);
    return;
  }

  const actionBtn = target.closest('.photo-btn') as HTMLElement;
  if (actionBtn) {
    const action = actionBtn.dataset.action;
    if (action === 'camera') triggerCamera(itemId);
    else if (action === 'gallery') triggerGallery(itemId);
    return;
  }

  const removeBtn = target.closest('[data-action="remove-photo"]') as HTMLElement;
  if (removeBtn) {
    const galleryItem = removeBtn.closest('.gallery-item') as HTMLElement;
    const index = parseInt(galleryItem.dataset.index || '0', 10);
    removePhoto(itemId, index);
    return;
  }
}

function handleObservationChange(e: Event): void {
  const textarea = e.target as HTMLTextAreaElement;
  if (!textarea.classList.contains('obs-input')) return;
  const card = textarea.closest('.accordion-card') as HTMLElement;
  if (!card) return;
  const itemId = card.dataset.id;
  if (!itemId) return;
  const item = INSPECT_ITEMS.find((i) => i.id === itemId);
  if (item) item.observation = textarea.value;
}

async function handleCameraCapture(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement;
  if (!input.files || !input.files.length) return;
  await addPhotos(photoTargetId, input.files);
  input.value = '';
}

async function handleGallerySelect(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement;
  if (!input.files || !input.files.length) return;
  await addPhotos(photoTargetId, input.files);
  input.value = '';
}

/* ─── Init ─── */

document.addEventListener('DOMContentLoaded', () => {
  storageReady = initializeStorage();
  renderInspectItems();

  const newInspectionBtn = document.getElementById('new-inspection');
  const historyBtn = document.getElementById('history-btn');
  const postoBackBtn = document.getElementById('posto-back');
  const inspectBackBtn = document.getElementById('inspect-back');
  const historyBackBtn = document.getElementById('history-back');
  const inspectItemsEl = document.getElementById('inspect-items');
  const finishBtn = document.getElementById('finish-inspection') as HTMLButtonElement | null;
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
    const nameInput = document.getElementById('posto-name') as HTMLInputElement;
    const dateInput = document.getElementById('posto-date') as HTMLInputElement;
    currentPosto = nameInput.value.trim();
    currentDate = dateInput.value;
    lastSavedSignature = getInspectionSignature();
    const titleEl = document.getElementById('inspect-title');
    if (titleEl) {
      titleEl.textContent = currentPosto;
    }
    showScreen(AppScreen.Inspect);
  });

  const postoForm = document.getElementById('posto-form');
  postoForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('continue-btn') as HTMLButtonElement;
    if (btn && !btn.disabled) btn.click();
  });

  postoNameInput?.addEventListener('input', validatePostoForm);
  postoDateInput?.addEventListener('change', validatePostoForm);

  historyBtn?.addEventListener('click', async () => {
    await storageReady;
    await renderHistory();
    showScreen(AppScreen.History);
  });

  inspectBackBtn?.addEventListener('click', () => {
    if (hasUnsavedChanges()) {
      if (
        !confirm(
          'H\u00e1 altera\u00e7\u00f5es n\u00e3o salvas. Se sair agora, perder\u00e1 todo o progresso. Deseja realmente sair?',
        )
      ) {
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

  finishBtn?.addEventListener('click', async () => {
    finishBtn.disabled = true;
    const saved = await saveToLocalStorage();
    finishBtn.disabled = false;
    if (!saved) return;

    finishBtn.textContent = 'Atualizar Inspe\u00e7\u00e3o';
    finishBtn.className = 'btn btn-primary';
    finishBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.12)';

    showToast('Inspe\u00e7\u00e3o salva com sucesso!');
  });

  exportBtn?.addEventListener('click', exportPDF);

  appEl?.addEventListener('touchstart', (e) => {
    if (
      document.activeElement &&
      (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')
    ) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'BUTTON' && tag !== 'SELECT') {
        (document.activeElement as HTMLElement).blur();
      }
    }
  });

  cameraInput?.addEventListener('change', handleCameraCapture);
  galleryInput?.addEventListener('change', handleGallerySelect);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      showToast('O modo offline não está disponível.');
    });
  }
});
