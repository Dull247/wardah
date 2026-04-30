// cards.js — Gallery card creation, layout, and scroll animation engine

document.addEventListener('DOMContentLoaded', () => {

    // Own detection — does NOT depend on script.js body class (avoids race condition)
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    console.log('isMobile (cards.js):', isMobile, '| UA:', navigator.userAgent.substring(0, 80));
    const worksSection  = document.querySelector('.works-scroll-wrapper');
    const worksGallery  = document.getElementById('works-gallery');
    const totalCards    = 14;

    // All 14 real images — exact filenames from the folder
    const cardImages = [
        'pic 1.jpg',  'pic 2.gif',  'pic 3.gif',  'pic 4.jpg',
        'pic 5.jpg',  'pic 6.jpg',  'pic 7.jpg',  'pic 8.jpg',
        'pic 9.jpg',  'pic 10.jpg', 'pic 11.jpg', 'pic 12.jpg',
        'pic 13.jpg', 'pic 14.jpg'
    ];

    // ============================================================
    // 1. Inject all 14 cards with real images
    // ============================================================
    for (let i = 0; i < totalCards; i++) {
        const card            = document.createElement('div');
        card.className        = 'work-card';
        card.style.willChange = 'transform';

        const img     = document.createElement('img');
        img.src       = cardImages[i];
        img.className = 'work-img-placeholder';
        img.alt       = `Work ${i + 1}`;
        img.loading   = 'lazy'; // lazy load for performance
        card.appendChild(img);

        worksGallery.appendChild(card);
    }

    const cards = document.querySelectorAll('.work-card');
    let leftStart = [];
    let leftEnd   = [];

    // ============================================================
    // 2a. MOBILE — single-row centered layout
    // ============================================================
    if (isMobile) {

        const CARD_W        = 200;
        const CARD_H        = 250;
        const STRIDE        = 215;
        const STACK_OVERLAP = 30;

        const stackTotalW  = (totalCards - 1) * STACK_OVERLAP + CARD_W;
        const stackCenter  = (window.innerWidth - stackTotalW) / 2;
        const spreadTotalW = (totalCards - 1) * STRIDE + CARD_W;
        const spreadCenter = (window.innerWidth - spreadTotalW) / 2;

        for (let i = 0; i < totalCards; i++) {
            cards[i].style.width  = CARD_W + 'px';
            cards[i].style.height = CARD_H + 'px';
            cards[i].style.top    = '0px';
            leftStart[i]          = spreadCenter + i * STRIDE;
            leftEnd[i]            = stackCenter  + i * STACK_OVERLAP;
            cards[i].style.zIndex = i + 1;
            cards[i].style.transform = `translateX(${leftStart[i]}px) translateZ(0)`;
        }

    // ============================================================
    // 2b. DESKTOP — spread starts from left edge, stacks to center
    // ============================================================
    } else {

        const CARD_W        = 500;
        const CARD_H        = 620;
        const STRIDE        = 540;
        const STACK_OVERLAP = 55;

        // Stack collapses to center of screen
        const stackTotalW  = (totalCards - 1) * STACK_OVERLAP + CARD_W;
        const stackCenter  = (window.innerWidth - stackTotalW) / 2;

        for (let i = 0; i < totalCards; i++) {
            cards[i].style.width  = CARD_W + 'px';
            cards[i].style.height = CARD_H + 'px';
            cards[i].style.top    = '0px';
            leftStart[i]          = i * STRIDE;                      // spread from left — always visible
            leftEnd[i]            = stackCenter + i * STACK_OVERLAP; // stack collapses to center
            cards[i].style.zIndex = i + 1;
            cards[i].style.transform = `translateX(${leftStart[i]}px) translateZ(0)`;
        }

    }

    // ============================================================
    // 3. Scroll animation engine — shared for both devices
    // ============================================================
    let targetProgress  = 0;
    let currentProgress = 0;

    let sectionOffsetTop      = 0;
    let sectionScrollDistance = 0;

    function updateMetrics() {
        if (worksSection) {
            sectionOffsetTop      = worksSection.offsetTop;
            sectionScrollDistance = worksSection.offsetHeight - window.innerHeight;
        }
    }
    updateMetrics();
    window.addEventListener('resize', updateMetrics);

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (!worksSection || sectionScrollDistance <= 0) return;

        if (scrollY >= sectionOffsetTop && scrollY <= sectionOffsetTop + sectionScrollDistance) {
            targetProgress = (scrollY - sectionOffsetTop) / sectionScrollDistance;
        } else if (scrollY < sectionOffsetTop) {
            targetProgress = 0;
        } else {
            targetProgress = 1;
        }
        targetProgress = Math.max(0, Math.min(1, targetProgress));
    }, { passive: true });

    // GSAP ticker replaces requestAnimationFrame — smoother, no frame skipping
    gsap.ticker.lagSmoothing(0); // prevents lag spikes when tab is inactive
    gsap.ticker.add(() => {
        currentProgress += (targetProgress - currentProgress) * 0.07; // same lerp as before
        for (let i = 0; i < totalCards; i++) {
            if (cards[i]) {
                const pos = leftStart[i] + currentProgress * (leftEnd[i] - leftStart[i]);
                cards[i].style.transform = `translateX(${pos}px) translateZ(0)`;
            }
        }
    });

});
