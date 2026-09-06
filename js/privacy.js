// Abilita le animazioni CSS solo con JS disponibile (contenuto sempre
// visibile senza JavaScript).
document.documentElement.classList.add('js-enabled');

// Anno automatico footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===================== MENU MOBILE (come in index.js) =====================
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function setNavOpen(open) {
    // header ha backdrop-filter → crea un containing block per i figli
    // "fixed": spostiamo il menu nel <body> per farlo occupare tutto lo
    // schermo, poi lo rimettiamo al suo posto alla chiusura.
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

if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
        setNavOpen(!navLinks.classList.contains('open'));
    });

    navLinks.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { setNavOpen(false); });
    });

    document.addEventListener('click', function (e) {
        if (window.innerWidth > 768) return;
        if (!navLinks.contains(e.target) && e.target !== navToggle && !navToggle.contains(e.target)) {
            setNavOpen(false);
        }
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) setNavOpen(false);
    });
}

// ===================== INDICE: scroll-spy =====================
const tocLinks = Array.from(document.querySelectorAll('.privacy-toc a'));
const blocks = tocLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

if ('IntersectionObserver' in window && blocks.length) {
    let current = null;
    const spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            if (id === current) return;
            current = id;
            tocLinks.forEach(function (a) {
                a.classList.toggle('active', a.getAttribute('href') === '#' + id);
            });
        });
    }, { rootMargin: '-84px 0px -70% 0px', threshold: 0 });

    blocks.forEach(function (b) { spy.observe(b); });
}

// "Torna all'inizio"
const toTop = document.getElementById('toTop');
if (toTop) {
    toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Pulsante WhatsApp flottante: qui non c'è hero, mostralo dopo un po' di scroll.
const waFab = document.querySelector('.wa-fab');
if (waFab) {
    const updateFab = function () {
        waFab.classList.toggle('visible', window.scrollY > 400);
    };
    updateFab();
    window.addEventListener('scroll', updateFab, { passive: true });
}

// ===================== COOKIE BANNER / GOOGLE ANALYTICS =====================
const GA_MEASUREMENT_ID = 'G-E2C088Q8M9';
const GA_DISABLED_FLAG = GA_MEASUREMENT_ID ? `ga-disable-${GA_MEASUREMENT_ID}` : null;
const CONSENT_KEY = 'cookie-consent';
const cookieBanner = document.getElementById('cookieBanner');
const cookieManage = document.getElementById('cookieManage');
const cookieOpen = document.getElementById('cookieOpen');
const cookieAccept = document.getElementById('cookieAccept');
const cookieReject = document.getElementById('cookieReject');
let analyticsLoaded = false;

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
window.gtag = window.gtag || gtag;

// Google Consent Mode v2 (default: nessun consenso)
gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
});

function showCookieBanner() {
    if (cookieBanner) cookieBanner.classList.add('visible');
    if (cookieManage) cookieManage.classList.remove('visible');
}

function hideCookieBanner() {
    if (cookieBanner) cookieBanner.classList.remove('visible');
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
    if (disabled) clearAnalyticsCookies();
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

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
}

function applyConsent(status) {
    if (status === 'accepted') {
        gtag('consent', 'update', {
            ad_storage: 'granted',
            analytics_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted'
        });
        loadGoogleAnalytics();
        hideCookieBanner();
        toggleManageButton(true);
    } else if (status === 'rejected') {
        gtag('consent', 'update', {
            ad_storage: 'denied',
            analytics_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });
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
    cookieManage.addEventListener('click', showCookieBanner);
}

if (cookieOpen) {
    cookieOpen.addEventListener('click', function () {
        showCookieBanner();
        cookieBanner?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
