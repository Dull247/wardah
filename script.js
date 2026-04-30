document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // DEVICE DETECTION — userAgent ONLY. No fallback. No matchMedia. No screen size.
    // A real PC browser NEVER has Android/iPhone in its userAgent. This is 100% reliable.
    // ============================================================
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    console.log('isMobile:', isMobile, 'UA:', navigator.userAgent);

    if (isMobile) {
        document.body.classList.add('is-mobile');
    }

    // ============================================================
    // 1. Preload hero image
    // ============================================================
    const heroImg    = new Image();
    heroImg.decoding = 'async';
    heroImg.src      = 'background.png';

    // ============================================================
    // 2. Fade-up Animations via Intersection Observer
    // ============================================================
    const fadeElements = document.querySelectorAll('.fade-up');
    const fadeObserver = new IntersectionObserver((entries, observer) => {
        let delay = 0;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transitionDelay = `${delay}s`;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
                delay += 0.15;
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });
    fadeElements.forEach(el => fadeObserver.observe(el));

    // ============================================================
    // 3. Navbar scroll state
    // ============================================================
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            if (!navbar.classList.contains('scrolled')) navbar.classList.add('scrolled');
        } else {
            if (navbar.classList.contains('scrolled')) navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // Cards logic moved to cards.js

});
