// Abilita le animazioni CSS solo se JS è disponibile (il contenuto resta
// sempre visibile senza JavaScript).
document.documentElement.classList.add('js-enabled');

// Anno automatico footer
document.getElementById('year').textContent = new Date().getFullYear();

// Cookie banner / Google Analytics
const GA_MEASUREMENT_ID = 'G-E2C088Q8M9'; //codice google qui.
const GA_DISABLED_FLAG = GA_MEASUREMENT_ID ? `ga-disable-${GA_MEASUREMENT_ID}` : null;
const CONSENT_KEY = 'cookie-consent';
const cookieBanner = document.getElementById('cookieBanner');
const cookieManage = document.getElementById('cookieManage');
const cookieAccept = document.getElementById('cookieAccept');
const cookieReject = document.getElementById('cookieReject');
let analyticsLoaded = false;

function showCookieBanner() {
    if (cookieBanner) {
        cookieBanner.classList.add('visible');
    }
    if (cookieManage) {
        cookieManage.classList.remove('visible');
    }
}

function hideCookieBanner() {
    if (cookieBanner) {
        cookieBanner.classList.remove('visible');
    }
}

function toggleManageButton(visible) {
    if (!cookieManage) return;
    cookieManage.classList.toggle('visible', Boolean(visible));
}

function clearAnalyticsCookies() {
    const analyticsCookies = ['_ga', '_gid', '_gat', `_ga_${GA_MEASUREMENT_ID?.replace('G-', '') || ''}`];
    analyticsCookies.forEach(function (cookieName) {
        if (!cookieName) return;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
}

function setAnalyticsDisabled(disabled) {
    if (!GA_DISABLED_FLAG) return;
    window[GA_DISABLED_FLAG] = Boolean(disabled);
    if (disabled) {
        clearAnalyticsCookies();
    }
}

function loadGoogleAnalytics() {
    if (analyticsLoaded) return;
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
        console.warn('Imposta GA_MEASUREMENT_ID per attivare Google Analytics.');
        return;
    }
    analyticsLoaded = true;
    setAnalyticsDisabled(false);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = window.gtag || gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
}

function applyConsent(status) {
    if (status === 'accepted') {
        loadGoogleAnalytics();
        hideCookieBanner();
        toggleManageButton(true);
    } else if (status === 'rejected') {
        setAnalyticsDisabled(true);
        hideCookieBanner();
        toggleManageButton(true);
    }
}

if (cookieAccept) {
    cookieAccept.addEventListener('click', function () {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        applyConsent('accepted');
    });
}

if (cookieReject) {
    cookieReject.addEventListener('click', function () {
        localStorage.setItem(CONSENT_KEY, 'rejected');
        applyConsent('rejected');
    });
}

if (cookieManage) {
    cookieManage.addEventListener('click', function () {
        showCookieBanner();
    });
}

(function initConsent() {
    setAnalyticsDisabled(true);
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved === 'accepted') {
        applyConsent('accepted');
    } else if (saved === 'rejected') {
        applyConsent('rejected');
    } else {
        showCookieBanner();
    }
})();

// Smooth scroll
function smoothScrollTo(target) {
    // "#top" / logo: torna proprio all'inizio del sito, non al titolo dell'hero
    if (target === '#top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    const el = document.querySelector(target);
    if (!el) return;
    const headerOffset = 70;
    const rect = el.getBoundingClientRect();
    const offset = rect.top + window.scrollY - headerOffset;

    window.scrollTo({
        top: offset,
        behavior: 'smooth'
    });
}

// Toggle menu mobile
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function setNavOpen(open) {
    // header ha backdrop-filter, che crea un containing block per gli elementi
    // "fixed" al suo interno: spostiamo il menu nel <body> per farlo occupare
    // davvero tutto lo schermo, poi lo rimettiamo al suo posto alla chiusura.
    if (open) {
        document.body.appendChild(navLinks);
    } else {
        navToggle.insertAdjacentElement('afterend', navLinks);
    }
    navLinks.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
}

document.querySelectorAll('[data-scroll]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('data-scroll');
        smoothScrollTo(target);
        setNavOpen(false);
    });
});

navToggle.addEventListener('click', function () {
    setNavOpen(!navLinks.classList.contains('open'));
});

// Chiudi menu se clic fuori (mobile)
document.addEventListener('click', function (e) {
    if (window.innerWidth > 768) return;
    if (!navLinks.contains(e.target) && e.target !== navToggle && !navToggle.contains(e.target)) {
        setNavOpen(false);
    }
});

window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
        setNavOpen(false);
    }
});

// SEDI: tab selector + rettangolo unico (mappa + dettagli) che ruota in 3D
const mapFrame = document.getElementById('mapFrame');
const sedeFlip = document.getElementById('sedeFlip');
const sedeName = document.getElementById('sedeName');
const sedeAddress = document.getElementById('sedeAddress');
const sedeTabs = document.querySelectorAll('.sede-tab');

function setSede(tab) {
    const address = tab.getAttribute('data-address');
    const name = tab.getAttribute('data-name') || '';
    const line1 = tab.getAttribute('data-address-line1') || '';
    const line2 = tab.getAttribute('data-address-line2') || '';
    if (!address || !mapFrame) return;

    const base = 'https://www.google.com/maps?q=';
    mapFrame.src = base + encodeURIComponent(address) + '&output=embed';
    if (sedeName) sedeName.textContent = 'Sede di ' + name;
    if (sedeAddress) sedeAddress.innerHTML = line1 + '<br>' + line2;

    sedeTabs.forEach(function (t) {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
}

function flipToSede(tab) {
    if (!sedeFlip) {
        setSede(tab);
        return;
    }
    sedeFlip.classList.add('flipping');
    window.setTimeout(function () {
        setSede(tab);
        sedeFlip.classList.remove('flipping');
    }, 360);
}

sedeTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
        if (tab.classList.contains('active')) return;
        flipToSede(tab);
    });
});

// Sede iniziale: la prima tab (Pomezia)
if (sedeTabs.length) setSede(sedeTabs[0]);

// Reveal-on-scroll: gli elementi principali entrano in scena mentre si scorre
// L'hero (testo, CTA e strisce materie) è visibile da subito; l'animazione
// di ingresso resta solo per le sezioni sottostanti.
const revealEls = document.querySelectorAll(
    '.section-inner, .about-lead, .goal-row, .program-card, .sede-flip-wrapper, .contact-row'
);

const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

revealEls.forEach(function (el) {
    const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
    const idx = siblings.indexOf(el);
    if (idx > 0) el.style.transitionDelay = Math.min(idx * 70, 300) + 'ms';
    el.classList.add('reveal');
    revealObserver.observe(el);
});

// Pulsante WhatsApp flottante: compare (con dissolvenza) solo quando l'hero
// è fuori dallo schermo, per non ripetere la CTA già presente nell'hero.
const waFab = document.querySelector('.wa-fab');
const heroWrapper = document.querySelector('.hero-wrapper');
if (waFab && heroWrapper) {
    const fabObserver = new IntersectionObserver(function (entries) {
        waFab.classList.toggle('visible', !entries[0].isIntersecting);
    }, { threshold: 0 });
    fabObserver.observe(heroWrapper);
}
