/* ============================================================
   COMIFARH — script.js  (versión final)
   ============================================================ */

/* Modal de correo — cerrar al hacer clic fuera */
document.addEventListener('click', function(e) {
    const overlay = document.getElementById('emailModal');
    if (overlay && e.target === overlay) overlay.classList.remove('open');
});

/* Copiar dirección de correo al portapapeles */
function copyEmail() {
    const email = document.getElementById('emailToCopy').textContent;
    navigator.clipboard.writeText(email).then(function() {
        const btn = document.getElementById('copyEmailBtn');
        btn.textContent = '¡Copiado!';
        setTimeout(function() { btn.textContent = 'Copiar'; }, 2000);
    });
}

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------
       1. NAVBAR — hamburger + scroll
    -------------------------------------------------------- */
    const navbar    = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks  = document.querySelector('.nav-links');

    function closeMenu() {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('active');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
        });

        navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target)) closeMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
    }

    // Navbar con scroll
    if (navbar) {
        const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* --------------------------------------------------------
       2. ENLACE ACTIVO según sección visible
    -------------------------------------------------------- */
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

    if (sections.length && navItems.length) {
        const sectionObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navItems.forEach(a => a.classList.remove('active'));
                    const match = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                    if (match) match.classList.add('active');
                }
            });
        }, { threshold: 0.35, rootMargin: '-60px 0px 0px 0px' });

        sections.forEach(s => sectionObs.observe(s));
    }

    /* --------------------------------------------------------
       3. SMOOTH SCROLL con offset por navbar
    -------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = navbar ? navbar.offsetHeight + 8 : 0;
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - offset,
                behavior: 'smooth'
            });
        });
    });

    /* --------------------------------------------------------
       4. CARRUSEL (con swipe táctil y autoplay)
    -------------------------------------------------------- */
    const slides     = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.indicator');
    const carousel   = document.querySelector('.carousel');
    let current = 0;
    let timer   = null;

    function goTo(index) {
        current = ((index % slides.length) + slides.length) % slides.length;
        slides.forEach((s, i) => {
            s.classList.toggle('active', i === current);
            s.setAttribute('aria-hidden', String(i !== current));
        });
        indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === current);
            ind.setAttribute('aria-selected', String(i === current));
        });
    }

    function startAutoplay() {
        clearInterval(timer);
        timer = setInterval(() => goTo(current + 1), 5000);
    }

    // Botones
    document.querySelector('.carousel-button.prev')
        ?.addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
    document.querySelector('.carousel-button.next')
        ?.addEventListener('click', () => { goTo(current + 1); startAutoplay(); });

    // Indicadores
    indicators.forEach((ind, i) => {
        ind.addEventListener('click', () => { goTo(i); startAutoplay(); });
    });

    // Swipe táctil
    if (carousel) {
        let touchX = 0;
        carousel.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
        carousel.addEventListener('touchend', e => {
            const diff = touchX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); startAutoplay(); }
        }, { passive: true });

        // Pausar al interactuar con mouse
        carousel.addEventListener('mouseenter', () => clearInterval(timer));
        carousel.addEventListener('mouseleave', startAutoplay);
    }

    // Iniciar si hay slides
    if (slides.length) { goTo(0); startAutoplay(); }

    /* --------------------------------------------------------
       5. SCROLL REVEAL (animaciones de entrada)
    -------------------------------------------------------- */
    const revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window && revealEls.length) {
        // Delay escalonado por posición dentro del grid
        revealEls.forEach((el, i) => {
            el.style.transitionDelay = `${(i % 4) * 0.08}s`;
        });

        const revealObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => revealObs.observe(el));
    } else {
        // Fallback: mostrar todo si no hay soporte
        revealEls.forEach(el => el.classList.add('visible'));
    }

    /* --------------------------------------------------------
       6. EFECTO RIPPLE en botón CTA
    -------------------------------------------------------- */
    document.querySelectorAll('.cta-button').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            Object.assign(ripple.style, {
                width:  `${size}px`,
                height: `${size}px`,
                left:   `${e.clientX - rect.left - size / 2}px`,
                top:    `${e.clientY - rect.top  - size / 2}px`,
            });
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
        });
    });

    /* --------------------------------------------------------
       7. AÑO DINÁMICO EN FOOTER
    -------------------------------------------------------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

});
