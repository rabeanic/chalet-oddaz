
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
renderAvailability();
