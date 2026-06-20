
const availabilityLabels = {
  en: {
    available: 'Available',
    reserved: 'Reserved',
    pending: 'Option pending',
    closed: 'Closed',
    error: 'Availability will be published soon.',
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  },
  fr: {
    available: 'Disponible',
    reserved: 'Réservé',
    pending: 'Option en cours',
    closed: 'Fermé',
    error: 'Les disponibilités seront publiées prochainement.',
    weekdays: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'],
    months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
  }
};

function parseDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function buildDayMap(rows, lang) {
  const priority = { reserved: 4, pending: 3, closed: 2, available: 1 };
  const dayMap = {};

  rows.forEach(row => {
    const current = parseDate(row.from);
    const end = parseDate(row.to);
    const note = lang === 'fr' ? (row.note_fr || row.note || '') : (row.note_en || row.note || '');

    while (current < end) {
      const key = formatDateKey(current);
      const existing = dayMap[key];
      if (!existing || priority[row.status] > priority[existing.status]) {
        dayMap[key] = { status: row.status, note };
      }
      current.setDate(current.getDate() + 1);
    }
  });

  return dayMap;
}

function getMonthsWithData(dayMap) {
  const months = new Map();

  Object.keys(dayMap).forEach(key => {
    const date = parseDate(key);
    const id = `${date.getFullYear()}-${date.getMonth()}`;
    months.set(id, { year: date.getFullYear(), month: date.getMonth() });
  });

  return Array.from(months.values()).sort((a, b) => (
    a.year - b.year || a.month - b.month
  ));
}

function renderMonth(year, month, dayMap, labels) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const monthTitle = `${labels.months[month]} ${year}`;

  const weekdayHeaders = labels.weekdays.map(day => `<div class="calendar-weekday">${day}</div>`).join('');
  const leadingCells = Array.from({ length: mondayOffset }, () => '<div class="calendar-day empty" aria-hidden="true"></div>').join('');

  const dayCells = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, month, day);
    const key = formatDateKey(date);
    const entry = dayMap[key];
    const status = entry?.status || 'open';
    const statusLabel = labels[entry?.status] || '';
    const note = entry?.note ? ` — ${entry.note}` : '';
    const ariaLabel = `${day} ${labels.months[month]} ${year}${statusLabel ? `: ${statusLabel}${note}` : ''}`;

    return `<div class="calendar-day ${status}" role="gridcell" aria-label="${ariaLabel}"><span>${day}</span></div>`;
  }).join('');

  return `
    <section class="calendar-month">
      <h3 class="calendar-month-title">${monthTitle}</h3>
      <div class="calendar-grid" role="grid" aria-label="${monthTitle}">
        ${weekdayHeaders}
        ${leadingCells}
        ${dayCells}
      </div>
    </section>
  `;
}

async function renderAvailability() {
  const container = document.querySelector('[data-availability-calendar]');
  if (!container) return;

  const lang = document.documentElement.lang || 'en';
  const labels = availabilityLabels[lang] || availabilityLabels.en;

  try {
    const response = await fetch('/data/availability.json');
    const rows = await response.json();
    const dayMap = buildDayMap(rows, lang);
    const monthsToRender = getMonthsWithData(dayMap);
    const months = monthsToRender.map(({ year, month }) => (
      renderMonth(year, month, dayMap, labels)
    ));

    const legend = ['available', 'pending', 'reserved', 'closed'].map(status => `
      <span class="calendar-legend-item">
        <span class="calendar-legend-swatch ${status}" aria-hidden="true"></span>
        ${labels[status]}
      </span>
    `).join('');

    container.innerHTML = `
      <div class="calendar-legend" aria-label="${lang === 'fr' ? 'Légende' : 'Legend'}">${legend}</div>
      <div class="calendar-months">${months.join('')}</div>
    `;
  } catch (error) {
    container.innerHTML = `<p class="muted">${labels.error}</p>`;
  }
}

async function renderGallery() {
  const container = document.querySelector('[data-gallery]');
  if (!container) return;
  const lang = document.documentElement.lang || 'en';
  try {
    const response = await fetch('/data/gallery.json');
    const sections = await response.json();
    container.innerHTML = sections.map(section => {
      const title = lang === 'fr' ? section.title_fr : section.title_en;
      const alt = lang === 'fr'
        ? `Chalet Oddaz — ${section.title_fr}`
        : `Chalet Oddaz — ${section.title_en}`;
      const photos = section.photos.map(photo => `
        <figure class="gallery-photo">
          <img src="/assets/photos/${photo}" alt="${alt}" loading="lazy" />
        </figure>
      `).join('');
      return `
        <section class="section tight gallery-section" id="${section.id}">
          <p class="kicker">${title}</p>
          <div class="gallery-grid">${photos}</div>
        </section>
      `;
    }).join('');
  } catch (error) {
    container.innerHTML = `<section class="section"><p class="muted">${lang === 'fr' ? 'La galerie sera publiée prochainement.' : 'Gallery photos will be published soon.'}</p></section>`;
  }
}

function initEnquiryForm() {
  const dialog = document.querySelector('[data-enquiry-dialog]');
  const openButton = document.querySelector('[data-open-enquiry]');
  const form = document.querySelector('[data-enquiry-form]');
  if (!dialog || !openButton || !form) return;

  const lang = document.documentElement.lang || 'en';
  const copy = {
    en: {
      success: 'Your enquiry is ready to send. We look forward to welcoming you.',
      error: 'Please complete all required fields before sending.',
      subject: 'Chalet Oddaz — stay enquiry'
    },
    fr: {
      success: 'Votre demande est prête à être envoyée. Nous avons hâte de vous accueillir.',
      error: 'Merci de remplir tous les champs obligatoires avant l’envoi.',
      subject: 'Chalet Oddaz — demande de séjour'
    }
  };
  const labels = copy[lang] || copy.en;
  const feedback = form.querySelector('[data-enquiry-feedback]');

  const closeDialog = () => {
    dialog.close();
    feedback.hidden = true;
    feedback.className = 'form-feedback';
  };

  openButton.addEventListener('click', () => dialog.showModal());
  dialog.querySelectorAll('[data-close-enquiry]').forEach(button => {
    button.addEventListener('click', closeDialog);
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const contactEmail = form.dataset.contactEmail;
    if (!contactEmail) {
      feedback.textContent = labels.error;
      feedback.className = 'form-feedback error';
      feedback.hidden = false;
      return;
    }

    const fieldLabels = lang === 'fr'
      ? { name: 'Nom', email: 'E-mail', phone: 'Téléphone', arrival: 'Arrivée', departure: 'Départ', guests: 'Personnes' }
      : { name: 'Name', email: 'Email', phone: 'Phone', arrival: 'Arrival', departure: 'Departure', guests: 'Guests' };

    const body = [
      `${fieldLabels.name}: ${data.get('name')}`,
      `${fieldLabels.email}: ${data.get('email')}`,
      `${fieldLabels.phone}: ${data.get('phone') || '—'}`,
      `${fieldLabels.arrival}: ${data.get('arrival')}`,
      `${fieldLabels.departure}: ${data.get('departure')}`,
      `${fieldLabels.guests}: ${data.get('guests')}`,
      '',
      String(data.get('message'))
    ].join('\n');

    const mailto = `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(labels.subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    feedback.textContent = labels.success;
    feedback.className = 'form-feedback success';
    feedback.hidden = false;
    form.reset();
    setTimeout(closeDialog, 2200);
  });
}

renderAvailability();
renderGallery();
initEnquiryForm();
