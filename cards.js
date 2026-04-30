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
    // 2a. MOBILE ONLY — 2-row mirrored layout
    // ============================================================
    if (isMobile) {

        const CARD_W        = 160;
        const CARD_H        = 220;
        const PEEK          = 30;
        const STACK_OVERLAP = 12;
        const ROW_GAP       = 12;
        const stackWidth    = 6 * STACK_OVERLAP + CARD_W;
        const centerOffset  = (window.innerWidth - stackWidth) / 2;

        for (let i = 0; i < totalCards; i++) {
            cards[i].style.width  = CARD_W + 'px';
            cards[i].style.height = CARD_H + 'px';

            if (i < 7) {
                // TOP ROW (cards 0–6) — spreads right, stacks right
                cards[i].style.top    = '0px';
                leftStart[i]          = i * PEEK;
                leftEnd[i]            = centerOffset + i * STACK_OVERLAP;
                cards[i].style.zIndex = i + 1;
            } else {
                // BOTTOM ROW (cards 7–13) — spreads left, stacks left (mirror)
                cards[i].style.top    = (CARD_H + ROW_GAP) + 'px';
                leftStart[i]          = (13 - i) * PEEK;
                leftEnd[i]            = centerOffset + (13 - i) * STACK_OVERLAP;
                cards[i].style.zIndex = 14 - (i - 7);
            }

            cards[i].style.transform = `translateX(${leftStart[i]}px) translateZ(0)`;
        }

    // ============================================================
    // 2b. DESKTOP ONLY — single-row layout, centered
    // ============================================================
    } else {

        const CARD_W        = 500;   // bigger cards
        const CARD_H        = 620;   // bigger cards
        const STRIDE        = 540;   // stride matches card width + small gap
        const STACK_OVERLAP = 55;

        // Center the stacked state on screen
        const stackTotalW   = (totalCards - 1) * STACK_OVERLAP + CARD_W;
        const stackCenter   = (window.innerWidth - stackTotalW) / 2;

        // Center the spread state on screen
        const spreadTotalW  = (totalCards - 1) * STRIDE + CARD_W;
        const spreadCenter  = (window.innerWidth - spreadTotalW) / 2;

        for (let i = 0; i < totalCards; i++) {
            cards[i].style.width  = CARD_W + 'px';
            cards[i].style.height = CARD_H + 'px';
            cards[i].style.top    = '0px';
            leftStart[i]          = spreadCenter + i * STRIDE;  // spread — centered
            leftEnd[i]            = stackCenter  + i * STACK_OVERLAP; // stack — centered
            cards[i].style.zIndex = i + 1;
            cards[i].style.transform = `translateX(${leftStart[i]}px) translateZ(0)`;
        }

    }

    // ============================================================
    // 3. Scroll animation engine — shared for both devices
    // ============================================================
    let targetProgress   = 0;
    let currentProgress  = 0;
    let animationFrameId = null;
    let isAnimating      = true;

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

        if (!isAnimating) {
            isAnimating = true;
            render();
        }
    }, { passive: true });

    function render() {
        targetProgress = Math.max(0, Math.min(1, targetProgress));

        if (Math.abs(targetProgress - currentProgress) < 0.0005) {
            currentProgress = targetProgress;
            isAnimating     = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        } else {
            currentProgress += (targetProgress - currentProgress) * 0.07;
            currentProgress  = Math.max(0, Math.min(1, currentProgress));
        }

        for (let i = 0; i < totalCards; i++) {
            if (cards[i]) {
                const currentLeft = leftStart[i] + currentProgress * (leftEnd[i] - leftStart[i]);
                cards[i].style.transform = `translateX(${currentLeft}px) translateZ(0)`;
            }
        }

        if (isAnimating) {
            const nextFrame  = window.requestPostAnimationFrame || window.requestAnimationFrame;
            animationFrameId = nextFrame(render);
        }
    }

    render();

});
