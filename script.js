
// Variabile globale contenente l'elenco delle destinazioni
let destinationsData = [];

// Ritorna l'immagine principale o di copertina di una città
function getCityImage(city) {
    return city.cover || city.images?.[0] || '';
}

// Genera la struttura HTML per l'immagine all'interno di una card
function cityCardImage(city, className) {
    const src = getCityImage(city);
    const alt = `Vista di ${city.city}, ${city.country}`;
    return `
        <div class="card-image-wrap">
            <img src="${src}" class="${className}" alt="${alt}" loading="lazy" decoding="async"
                onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1640799172468-d75176e6fa2f?auto=format&fit=crop&w=900&q=80';">
            <div class="card-image-overlay"></div>
            <span class="card-rating"><i class="fas fa-star"></i> ${city.rating}</span>
            <span class="card-flag">${city.countryCode || ''}</span>
        </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    
    if (typeof citiesData === 'undefined') {
        console.log('Caricamento dati...');
        setTimeout(() => location.reload(), 500);
        return;
    }
    
    destinationsData = citiesData;
    
    // Inizializza la pagina corrente
    if (document.getElementById('citiesList')) initHome();
    if (document.getElementById('destinationsGrid')) initDestinations();
    if (document.getElementById('citySelectA')) initCompare();
    
    initModal();
});

// Configura la home page con filtri e lista iniziale
function initHome() {
    populateProfileFilter('profileFilter');
    displayCities(destinationsData);
    
    document.getElementById('searchInput')?.addEventListener('input', filterCities);
    document.getElementById('profileFilter')?.addEventListener('change', filterCities);
    document.getElementById('resetBtn')?.addEventListener('click', resetFilters);
}

// Genera le card delle città e le inserisce nel contenitore HTML
function displayCities(cities) {
    const container = document.getElementById('citiesList');
    if (!container) return;
    
    if (!cities.length) {
        container.innerHTML = '<p class="empty-state">Nessuna destinazione trovata. Prova a modificare i filtri.</p>';
        return;
    }

    container.innerHTML = cities.map(city => `
        <div class="city-card" data-city="${city.city}">
            ${cityCardImage(city, 'city-img')}
            <div class="card-content">
                <div class="city-name">
                    <span>${city.city}</span>
                    <span class="country-tag">${city.country}</span>
                </div>
                <div class="city-course">
                    <i class="fas fa-graduation-cap"></i> ${city.profile}
                </div>
                <div class="city-stats">
                    <span><i class="fas fa-coins"></i> ${city.cost}€/mese</span>
                    <span><i class="fas fa-moon"></i> ${city.nightlife}/10</span>
                    <span><i class="fas fa-shield-alt"></i> ${city.safety}/10</span>
                </div>
                <span class="card-cta">Scopri di più <i class="fas fa-arrow-right"></i></span>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.city-card').forEach(card => {
        card.onclick = () => openModal(destinationsData.find(c => c.city === card.dataset.city));
    });
}

// Filtra le destinazioni in base a testo di ricerca e profilo di studio
function filterCities() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const profile = document.getElementById('profileFilter')?.value || 'all';
    
    const filtered = destinationsData.filter(city => {
        const matchSearch = !search || city.city.toLowerCase().includes(search) || city.country.toLowerCase().includes(search);
        const matchProfile = profile === 'all' || city.profile === profile;
        return matchSearch && matchProfile;
    });
    
    displayCities(filtered);
}

// Ripristina i valori dei filtri di ricerca al loro stato iniziale
function resetFilters() {
    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    if (document.getElementById('profileFilter')) document.getElementById('profileFilter').value = 'all';
    displayCities(destinationsData);
}

// Popola il menu a discesa dei profili di studio con opzioni univoche
function populateProfileFilter(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const profiles = [...new Set(destinationsData.map(c => c.profile))];
    select.innerHTML = '<option value="all">Tutti i corsi</option>' + 
        profiles.map(p => `<option value="${p}">${p}</option>`).join('');
}

// Configura la pagina delle destinazioni con il filtro di indirizzo
function initDestinations() {
    populateProfileFilter('destFilter');
    displayDestinations(destinationsData);
    
    document.getElementById('destFilter')?.addEventListener('change', (e) => {
        const val = e.target.value;
        displayDestinations(val === 'all' ? destinationsData : destinationsData.filter(c => c.profile === val));
    });
}

// Genera le card nella griglia della pagina delle destinazioni
function displayDestinations(cities) {
    const container = document.getElementById('destinationsGrid');
    if (!container) return;
    
    if (!cities.length) {
        container.innerHTML = '<p class="empty-state">Nessuna destinazione per questo corso.</p>';
        return;
    }

    container.innerHTML = cities.map(city => `
        <div class="dest-card" data-city="${city.city}">
            ${cityCardImage(city, 'dest-img')}
            <div class="card-content">
                <div class="city-name">
                    <span>${city.city}</span>
                    <span class="country-tag">${city.country}</span>
                </div>
                <div class="city-course">
                    <i class="fas fa-graduation-cap"></i> ${city.profile}
                </div>
                <div class="city-stats">
                    <span><i class="fas fa-coins"></i> ${city.cost}€/mese</span>
                    <span><i class="fas fa-chart-line"></i> Qualità ${city.quality}</span>
                </div>
                <span class="card-cta">Apri scheda <i class="fas fa-arrow-right"></i></span>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.dest-card').forEach(card => {
        card.onclick = () => openModal(destinationsData.find(c => c.city === card.dataset.city));
    });
}

// Configura i selettori di scelta città nella pagina di confronto
function initCompare() {
    const selectA = document.getElementById('citySelectA');
    const selectB = document.getElementById('citySelectB');
    
    const options = destinationsData.map(c => `<option value="${c.city}">${c.city} (${c.country})</option>`).join('');
    selectA.innerHTML = options;
    selectB.innerHTML = options;
    
    if (destinationsData.length >= 2) {
        selectA.value = destinationsData[0].city;
        selectB.value = destinationsData[1].city;
    }
    
    document.getElementById('compareBtn')?.addEventListener('click', performComparison);
    setTimeout(performComparison, 100);
}

// Esegue il calcolo dei punteggi e visualizza il confronto tra le due città
function performComparison() {
    const cityA = destinationsData.find(c => c.city === document.getElementById('citySelectA')?.value);
    const cityB = destinationsData.find(c => c.city === document.getElementById('citySelectB')?.value);
    const resultDiv = document.getElementById('compareResult');
    
    if (!cityA || !cityB || cityA.city === cityB.city) {
        resultDiv.innerHTML = `<div class="compare-alert"><i class="fas fa-exclamation-circle"></i> Seleziona due città diverse per confrontarle.</div>`;
        return;
    }
    
    const scoreA = Math.round(cityA.quality * 1.5 + cityA.nightlife * 8 + cityA.safety * 6 + (100 - cityA.cost / 6) + cityA.rating * 7);
    const scoreB = Math.round(cityB.quality * 1.5 + cityB.nightlife * 8 + cityB.safety * 6 + (100 - cityB.cost / 6) + cityB.rating * 7);
    
    const winner = scoreA > scoreB ? cityA.city : (scoreB > scoreA ? cityB.city : 'PAREGGIO');
    const winnerClass = scoreA > scoreB ? 'winner-a' : (scoreB > scoreA ? 'winner-b' : '');
    
    resultDiv.innerHTML = `
        <div class="compare-header">
            <div class="compare-city">
                <img src="${getCityImage(cityA)}" alt="${cityA.city}" class="compare-thumb">
                <h3>${cityA.city} <span class="compare-code">${cityA.countryCode}</span></h3>
                <div class="score-circle ${scoreA > scoreB ? 'winner' : ''}">${scoreA}</div>
            </div>
            <div class="vs-divider"><span>VS</span><i class="fas fa-bolt"></i></div>
            <div class="compare-city">
                <img src="${getCityImage(cityB)}" alt="${cityB.city}" class="compare-thumb">
                <h3>${cityB.city} <span class="compare-code">${cityB.countryCode}</span></h3>
                <div class="score-circle ${scoreB > scoreA ? 'winner' : ''}">${scoreB}</div>
            </div>
        </div>
        <div class="winner-banner ${winnerClass}"><i class="fas fa-trophy"></i> <strong>Vincitore: ${winner}</strong></div>
        <div class="compare-table">
            <div class="compare-row header"><div class="compare-category">Categoria</div><div class="compare-val">${cityA.city}</div><div class="compare-val">${cityB.city}</div></div>
            ${[
                ['Qualità vita', 'fa-chart-line', cityA.quality, cityB.quality],
                ['Costo mensile', 'fa-coins', cityA.cost + '€', cityB.cost + '€'],
                ['Vita notturna', 'fa-moon', cityA.nightlife + '/10', cityB.nightlife + '/10'],
                ['Sicurezza', 'fa-shield-alt', cityA.safety + '/10', cityB.safety + '/10'],
                ['Lingua', 'fa-language', cityA.language + '/10', cityB.language + '/10'],
                ['Voto studenti', 'fa-star', cityA.rating + '/10', cityB.rating + '/10']
            ].map(row => `<div class="compare-row"><div class="compare-category"><i class="fas ${row[1]}"></i> ${row[0]}</div><div class="compare-val">${row[2]}</div><div class="compare-val">${row[3]}</div></div>`).join('')}
        </div>
    `;
}

// Popola ed apre la modale di dettaglio per una specifica città
function openModal(city) {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modalContent');
    
    const mainImg = getCityImage(city);
    const gallery = city.images?.length ? `
        <img id="modalMainImg" src="${mainImg}" class="modal-img" alt="${city.city}">
        <div class="modal-gallery">
            ${city.images.map(img => `<img src="${img}" class="modal-thumb" alt="${city.city}" loading="lazy" onclick="document.getElementById('modalMainImg').src='${img}'">`).join('')}
        </div>
    ` : '';
    
    content.innerHTML = `
        ${gallery}
        <div class="modal-title-row">
            <h2>${city.city} <span class="modal-flag">${city.countryCode}</span></h2>
            <span class="modal-rating-pill"><i class="fas fa-star"></i> ${city.rating}/10</span>
        </div>
        <p class="modal-subtitle"><i class="fas fa-map-marker-alt"></i> ${city.country} · ${city.profile}</p>
        <div class="modal-stats">
            <div class="modal-stat"><strong><i class="fas fa-chart-line"></i> Qualità vita</strong><span>${city.quality}/100</span></div>
            <div class="modal-stat"><strong><i class="fas fa-coins"></i> Costo</strong><span>${city.cost}€/mese</span></div>
            <div class="modal-stat"><strong><i class="fas fa-moon"></i> Vita notturna</strong><span>${city.nightlife}/10</span></div>
            <div class="modal-stat"><strong><i class="fas fa-shield-alt"></i> Sicurezza</strong><span>${city.safety}/10</span></div>
            <div class="modal-stat"><strong><i class="fas fa-language"></i> Lingua</strong><span>${city.language}/10</span></div>
            <div class="modal-stat"><strong><i class="fas fa-star"></i> Voto</strong><span>${city.rating}/10</span></div>
        </div>
        <div class="modal-block"><strong><i class="fas fa-bus"></i> Trasporti</strong><br>${city.transport}</div>
        <div class="modal-block"><strong><i class="fas fa-university"></i> Università</strong><br>${city.uni}</div>
        <div class="modal-block"><strong><i class="fas fa-utensils"></i> Cibo tipico</strong><br>${city.food}</div>
        <div class="modal-tip"><strong><i class="fas fa-lightbulb"></i> Consiglio</strong><br>${city.tips}</div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Configura i gestori di eventi
function initModal() {
    const modal = document.getElementById('modal');
    const close = document.querySelector('.modal-close');
    
    close?.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.style.display === 'flex') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}
