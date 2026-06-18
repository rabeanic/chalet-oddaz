
async function renderAvailability() {
  const tableBody = document.querySelector('[data-availability]');
  if (!tableBody) return;
  const lang = document.documentElement.lang || 'en';
  const labels = {
    en: { available: 'Available', reserved: 'Reserved', pending: 'Option pending', closed: 'Closed', error: 'Availability will be published soon.' },
    fr: { available: 'Disponible', reserved: 'Réservé', pending: 'Option en cours', closed: 'Fermé', error: 'Les disponibilités seront publiées prochainement.' }
  };
  try {
    const response = await fetch('/data/availability.json');
    const rows = await response.json();
    tableBody.innerHTML = rows.map(row => {
      const statusLabel = labels[lang][row.status] || row.status;
      const note = lang === 'fr' ? (row.note_fr || row.note || '') : (row.note_en || row.note || '');
      return `<tr>
        <td>${row.from}</td>
        <td>${row.to}</td>
        <td><span class="status ${row.status}">${statusLabel}</span></td>
        <td>${note}</td>
      </tr>`;
    }).join('');
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="4">${labels[lang].error}</td></tr>`;
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

renderAvailability();
renderGallery();
