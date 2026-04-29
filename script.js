document.addEventListener('DOMContentLoaded', () => {
    // 1. Fade-up Animations via Intersection Observer
    const fadeElements = document.querySelectorAll('.fade-up');
    
    const fadeObserver = new IntersectionObserver((entries, observer) => {
        let delay = 0;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transitionDelay = `${delay}s`;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); 
                delay += 0.15; // staggered delay
            }
        });
    }, {
        threshold: 0.1, // Trigger slightly earlier for smoother mobile experience
        rootMargin: "0px 0px -20px 0px"
    });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // 2. High-Performance Scroll Engine
    const navbar = document.getElementById('navbar');
    const worksSection = document.querySelector('.works-scroll-wrapper');
    const worksGallery = document.getElementById('works-gallery');
    const cards = document.querySelectorAll('.work-card');
    const totalCards = cards.length;
    
    // Math Constants
    const CARD_WIDTH = 350;
    const SPREAD_GAP = 30;
    const STACK_OVERLAP = 50;

    let leftStart = [];
    let leftEnd = [];

    // Initialize Card Logic
    for (let i = 0; i < totalCards; i++) {
        // Spread state: first card (index 0) is on the far left (left: 0).
        // The remaining cards extend to the right side (left: 380, 760, etc.)
        leftStart[i] = i * (CARD_WIDTH + SPREAD_GAP);
        
        // Stacked state: first card stays at 0. Next card lands at 50, etc.
        // Last card (index 13) lands at 650.
        leftEnd[i] = i * STACK_OVERLAP;

        if (cards[i]) {
            cards[i].style.left = `${leftStart[i]}px`;
            // Z-index: highest on the last card (index 13 gets 14, index 0 gets 1)
            cards[i].style.zIndex = i + 1;
        }
    }

    let targetProgress = 0;
    let currentProgress = 0;
    let animationFrameId = null;
    let isAnimating = true;
    
    // Cache metrics to completely eliminate layout thrashing during scroll events
    let maxScrollLeft = 0;
    let sectionOffsetTop = 0;
    let sectionScrollDistance = 0;

    function updateMetrics() {
        if (worksGallery) {
            maxScrollLeft = Math.max(0, worksGallery.scrollWidth - window.innerWidth);
        }
        if (worksSection) {
            sectionOffsetTop = worksSection.offsetTop;
            sectionScrollDistance = worksSection.offsetHeight - window.innerHeight;
        }
    }
    updateMetrics();
    window.addEventListener('resize', updateMetrics);

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Navbar State
        if (scrollY > 50) {
            if (!navbar.classList.contains('scrolled')) navbar.classList.add('scrolled');
        } else {
            if (navbar.classList.contains('scrolled')) navbar.classList.remove('scrolled');
        }

        if (!worksSection || sectionScrollDistance <= 0) return;
        
        if (scrollY >= sectionOffsetTop && scrollY <= sectionOffsetTop + sectionScrollDistance) {
            targetProgress = (scrollY - sectionOffsetTop) / sectionScrollDistance;
        } else if (scrollY < sectionOffsetTop) {
            targetProgress = 0;
        } else if (scrollY > sectionOffsetTop + sectionScrollDistance) {
            targetProgress = 1;
        }
        
        targetProgress = Math.max(0, Math.min(1, targetProgress));

        // Restart RAF loop if it was stopped
        if (!isAnimating) {
            isAnimating = true;
            render();
        }
    }, { passive: true }); // Passive listener dramatically improves scroll performance

    function render() {
        // Clamp to strictly prevent overshooting
        targetProgress = Math.max(0, Math.min(1, targetProgress));

        if (Math.abs(targetProgress - currentProgress) < 0.001) {
            // Snap to target and stop loop
            currentProgress = targetProgress;
            isAnimating = false;
        } else {
            // Faster lerp calculation for snappier response
            currentProgress += (targetProgress - currentProgress) * 0.12;
            currentProgress = Math.max(0, Math.min(1, currentProgress));
        }

        // Apply card positions strictly inside RAF loop based on currentProgress
        for (let i = 0; i < totalCards; i++) {
            if (cards[i]) {
                // Starts spread (progress=0), collapses to left-anchored stack (progress=1)
                const currentLeft = leftStart[i] + currentProgress * (leftEnd[i] - leftStart[i]);
                cards[i].style.left = `${currentLeft}px`;
            }
        }
        
        if (isAnimating) {
            animationFrameId = requestAnimationFrame(render);
        }
    }
    
    // Start continuous animation loop
    render();
});
