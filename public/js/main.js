/* ═══════════════════════════════════════════════════════════
   ThermoKinetic — Main JavaScript
   Shared across all pages: nav, scroll animations, counters
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── Mobile Hamburger Toggle ─────────────────────────────
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
        });
    }

    // ─── Navbar Scroll Effect ────────────────────────────────
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (navbar) {
            if (currentScroll > 50) {
                navbar.style.background = 'rgba(6, 11, 20, 0.95)';
            } else {
                navbar.style.background = 'rgba(6, 11, 20, 0.85)';
            }
        }
        lastScroll = currentScroll;
    });

    // ─── Scroll Fade-Up Animations ───────────────────────────
    const fadeElements = document.querySelectorAll('.fade-up');

    if (fadeElements.length > 0) {
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        fadeElements.forEach(el => fadeObserver.observe(el));
    }

    // ─── SVG Draw Animation ──────────────────────────────────
    const svgDrawElements = document.querySelectorAll('.svg-draw');

    if (svgDrawElements.length > 0) {
        const svgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    svgObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        svgDrawElements.forEach(el => {
            // Calculate path length and set dash array
            if (el.getTotalLength) {
                const length = el.getTotalLength();
                el.style.strokeDasharray = length;
                el.style.strokeDashoffset = length;
            }
            svgObserver.observe(el);
        });
    }

    // ─── Animated Number Counters ────────────────────────────
    const counters = document.querySelectorAll('.counter');

    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.target, 10);
                    animateCounter(el, 0, target, 1500);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => counterObserver.observe(el));
    }

    function animateCounter(el, start, end, duration) {
        const startTime = performance.now();
        const suffix = el.dataset.suffix || '%';

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);

            el.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ─── Accordion ───────────────────────────────────────────
    const accordionTriggers = document.querySelectorAll('.accordion-trigger');

    accordionTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.closest('.accordion-item');
            const isOpen = item.classList.contains('open');

            // Close all
            document.querySelectorAll('.accordion-item.open').forEach(openItem => {
                openItem.classList.remove('open');
            });

            // Toggle current
            if (!isOpen) {
                item.classList.add('open');
            }
        });
    });

    // ─── Smooth Scroll for Anchor Links ──────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ─── Potency Counter Animation (Home Hero) ───────────────
    const potencyEl = document.getElementById('potencyCounter');
    if (potencyEl) {
        let potency = 97.1;
        const targetPotency = 98.4;

        function tickPotency() {
            if (potency < targetPotency) {
                potency += 0.1;
                potencyEl.textContent = potency.toFixed(1) + '%';
                setTimeout(tickPotency, 150);
            }
        }

        // Delay start
        setTimeout(tickPotency, 1000);
    }

});
