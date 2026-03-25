// ==================== Starfield (流星背景) ====================
function createStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    let width = 0;
    let height = 0;
    let stars = [];
    const STAR_COUNT = 140;

    function resize() {
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.scale(dpr, dpr);
        initStars();
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function initStars() {
        stars = Array.from({ length: STAR_COUNT }, () => {
            const angle = random(0, Math.PI * 2);
            const speed = random(8, 22);

            return {
                x: random(0, width),
                y: random(0, height),
                radius: random(0.5, 1.6),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                opacity: random(0.2, 0.9),
                phase: random(0, Math.PI * 2),
            };
        });
    }

    const shootingStars = [];
    const SHOOTING_STAR_INTERVAL = 30_000;

    function spawnShootingStar(count = 1) {
        for (let i = 0; i < count; i += 1) {
            const angle = random(0, Math.PI * 2);
            const speed = random(720, 1100);
            const length = random(220, 340);

            const startX = random(0, width);
            const startY = random(0, height * 0.6);

            const dx = Math.cos(angle);
            const dy = Math.sin(angle);

            shootingStars.push({
                x: startX,
                y: startY,
                vx: dx * speed,
                vy: dy * speed,
                dx,
                dy,
                length,
                alpha: 1,
                life: 0,
                maxLife: random(0.9, 1.5),
            });
        }
    }

    function updateShootingStars(dt) {
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const star = shootingStars[i];
            star.life += dt;
            star.x += star.vx * dt;
            star.y += star.vy * dt;

            const progress = star.life / star.maxLife;
            star.alpha = Math.max(0, 1 - progress);

            if (progress >= 1 || star.x < -star.length || star.x > width + star.length || star.y < -star.length || star.y > height + star.length) {
                shootingStars.splice(i, 1);
            }
        }
    }

    function drawShootingStars() {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.55)';

        shootingStars.forEach((star) => {
            const x2 = star.x - star.dx * star.length;
            const y2 = star.y - star.dy * star.length;

            const grad = ctx.createLinearGradient(star.x, star.y, x2, y2);
            grad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, star.alpha * 1.4)})`);
            grad.addColorStop(0.55, `rgba(255, 255, 255, ${star.alpha * 0.4})`);
            grad.addColorStop(0.85, `rgba(255, 255, 255, ${star.alpha * 0.12})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.strokeStyle = grad;
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.arc(star.x, star.y, 3.3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    let lastTs = 0;

    function draw(ts) {
        const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.04) : 0.016;
        lastTs = ts;

        ctx.clearRect(0, 0, width, height);

        stars.forEach((star) => {
            const drift = 0.8;
            star.x += (star.vx + (random(-1, 1) * drift)) * dt;
            star.y += (star.vy + (random(-1, 1) * drift)) * dt;
            star.phase += 0.03;

            if (star.x < -10) star.x = width + 10;
            if (star.x > width + 10) star.x = -10;
            if (star.y < -10) star.y = height + 10;
            if (star.y > height + 10) star.y = -10;

            const glow = 0.5 + 0.5 * Math.sin(star.phase);
            const alpha = Math.min(1, star.opacity + glow * 0.5);

            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        updateShootingStars(dt);
        drawShootingStars();
    }

    function tick(ts) {
        draw(ts);
        requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);
    resize();

    function scheduleNextShootingStar() {
        const delay = random(15000, 30000);
        setTimeout(() => {
            const burst = Math.random() < 0.28 ? 2 : 1;
            spawnShootingStar(burst);
            scheduleNextShootingStar();
        }, delay);
    }

    setTimeout(() => {
        spawnShootingStar();
        scheduleNextShootingStar();
    }, random(1200, 4000));

    tick();
}

// ==================== JSON Data Loading ====================
async function loadData(type) {
    try {
        const res = await fetch(`data/${type}.json`);
        if (!res.ok) throw new Error(`Failed to load ${type}.json`);
        return await res.json();
    } catch (e) {
        console.error(`Error loading ${type}:`, e);
        return [];
    }
}

// ==================== Hero Section ====================
function renderHero(siteData) {
    const container = document.getElementById('heroContent');
    if (!container || !siteData.hero) return;

    const hero = siteData.hero;
    container.innerHTML = `
        <p class="hero-subtitle">${hero.subtitle}</p>
        <h1 class="hero-title">${hero.title}</h1>
        <p class="hero-description">${hero.description}</p>
        <div class="hero-cta">
            <a href="${hero.ctaPrimary.link}" class="btn btn-primary">${hero.ctaPrimary.text}</a>
            <a href="${hero.ctaSecondary.link}" class="btn btn-secondary">${hero.ctaSecondary.text}</a>
        </div>
    `;
}

// ==================== About Section ====================
function renderAbout(siteData) {
    if (!siteData.about) return;

    const about = siteData.about;

    // Render gallery
    const galleryContainer = document.getElementById('galleryContainer');
    if (galleryContainer) {
        galleryContainer.innerHTML = about.gallery.map((img, index) => `
            <img src="${img.src}" alt="${img.alt}" class="gallery-photo ${index === 0 ? 'active' : ''}">
        `).join('');
    }

    // Render about content
    const aboutContent = document.getElementById('aboutContent');
    if (aboutContent) {
        const socialIcons = {
            wechat: `<path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>`,
            douyin: `<path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>`
        };

        const socialLinksHtml = about.socialLinks.map(link => `
            <a href="${link.url}" class="social-link" title="${link.title}" data-qrcode="${link.qrcode || ''}" data-name="${link.title}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    ${socialIcons[link.icon] || ''}
                </svg>
            </a>
        `).join('');

        aboutContent.innerHTML = `
            <div class="section-header">
                <span class="section-tag">About</span>
                <h2 class="section-title">关于我</h2>
            </div>
            ${about.text.map(t => `<p class="about-text">${t}</p>`).join('')}
            <div class="about-links">${socialLinksHtml}</div>
        `;
    }
}

// ==================== Render Functions ====================
function renderPhotos(photos) {
    const container = document.getElementById('photoGrid');
    if (!container) return;

    container.innerHTML = photos.map((photo, index) => `
        <div class="photo-card fade-in" data-src="${photo.src}" data-index="${index}">
            <div class="photo-wrapper">
                <img src="${photo.thumb || photo.src}" alt="${photo.title}">
                <div class="photo-overlay">
                    <h3>${photo.title}</h3>
                    <p>${photo.meta}</p>
                </div>
            </div>
        </div>
    `).join('');

    // Add fade-in observer to new elements
    observeFadeElements(container.querySelectorAll('.photo-card'));
}

function renderVideos(videos) {
    const container = document.getElementById('videoGrid');
    if (!container) return;

    container.innerHTML = videos.map((video, index) => `
        <div class="video-card fade-in" data-video="${video.video}" data-index="${index}">
            <div class="video-thumbnail">
                <img src="${video.poster}" alt="${video.title}">
                <div class="play-button">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            </div>
            <div class="video-info">
                <h3>${video.title}</h3>
                <p>${video.meta}</p>
            </div>
        </div>
    `).join('');

    observeFadeElements(container.querySelectorAll('.video-card'));
}

function renderMusic(music) {
    const container = document.getElementById('musicGrid');
    if (!container) return;

    container.innerHTML = music.map((track, index) => `
        <div class="music-card fade-in" data-src="${track.src}" data-index="${index}">
            <div class="music-cover">
                <img src="${track.cover}" alt="${track.title}">
                <div class="music-play">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            </div>
            <div class="music-info">
                <h3>${track.title}</h3>
                <p>${track.meta}</p>
            </div>
        </div>
    `).join('');

    observeFadeElements(container.querySelectorAll('.music-card'));
}

function renderWritings(writings) {
    const container = document.getElementById('writingsList');
    if (!container) return;

    // Store writings data globally for later use
    writingsData.length = 0;
    writings.forEach(w => writingsData.push(w));

    container.innerHTML = writings.map((writing, index) => `
        <article class="writing-card fade-in" data-index="${index}" data-md="${writing.md || ''}">
            <div class="writing-image">
                <img src="${writing.image}" alt="${writing.title}">
            </div>
            <div class="writing-content">
                <span class="writing-date">${writing.date}</span>
                <h3>${writing.title}</h3>
                <p>${writing.excerpt}</p>
                <span class="reading-link">继续阅读</span>
            </div>
        </article>
    `).join('');

    observeFadeElements(container.querySelectorAll('.writing-card'));
}

// ==================== Intersection Observer for Fade-in ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 80);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

function observeFadeElements(elements) {
    elements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// ==================== Global State ====================
let currentPhotoIndex = 0;
let currentTrackIndex = -1;
let isPlaying = false;
const photoSources = [];

// ==================== DOM Elements ====================
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');

// Video Modal
const videoModal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');
const modalClose = document.querySelector('.modal-close');

// Writing Modal
const writingModal = document.getElementById('writingModal');
const writingModalTitle = document.getElementById('writingModalTitle');
const writingModalArticle = document.getElementById('writingModalArticle');
const writingModalClose = document.querySelector('.writing-modal-close');

// Social Modal
const socialModal = document.getElementById('socialModal');
const socialModalTitle = document.getElementById('socialModalTitle');
const socialModalQRCode = document.getElementById('socialModalQRCode');
const socialModalClose = document.querySelector('.social-modal-close');

// Audio Player
const audioElement = document.getElementById('audioElement');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const playerCover = document.getElementById('playerCover');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');

const tracks = [];
const writingsData = [];

// ==================== Navbar ====================
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Active nav link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ==================== Lightbox ====================
function openLightbox(src) {
    lightboxImage.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function initLightboxHandlers() {
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.photo-card');
        if (card) {
            currentPhotoIndex = parseInt(card.dataset.index);
            openLightbox(card.dataset.src);
        }
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    lightboxPrev.addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex - 1 + photoSources.length) % photoSources.length;
        lightboxImage.src = photoSources[currentPhotoIndex];
    });

    lightboxNext.addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex + 1) % photoSources.length;
        lightboxImage.src = photoSources[currentPhotoIndex];
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxPrev.click();
        if (e.key === 'ArrowRight') lightboxNext.click();
    });
}

// ==================== Video Modal ====================
function openVideoModal(src) {
    modalVideo.src = src;
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modalVideo.play();
}

function closeVideoModal() {
    videoModal.classList.remove('active');
    modalVideo.pause();
    modalVideo.src = '';
    document.body.style.overflow = '';
}

function initVideoHandlers() {
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.video-card');
        if (card) {
            openVideoModal(card.dataset.video);
        }
    });

    modalClose.addEventListener('click', closeVideoModal);
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) closeVideoModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });
}

// ==================== Audio Player ====================
function playTrack(index) {
    if (index === currentTrackIndex && isPlaying) {
        pauseTrack();
        return;
    }

    currentTrackIndex = index;
    const track = tracks[index];

    audioElement.src = track.src;
    playerCover.src = track.cover;
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;

    document.querySelectorAll('.music-card').forEach((card, i) => {
        card.classList.toggle('active', i === index);
    });

    audioElement.play();
    isPlaying = true;
    updatePlayIcon();
}

function pauseTrack() {
    audioElement.pause();
    isPlaying = false;
    updatePlayIcon();
}

function togglePlay() {
    if (currentTrackIndex === -1) {
        playTrack(0);
        return;
    }
    isPlaying ? pauseTrack() : audioElement.play();
    isPlaying = !isPlaying;
    updatePlayIcon();
}

function updatePlayIcon() {
    playIcon.innerHTML = isPlaying
        ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
        : '<path d="M8 5v14l11-7z"/>';
}

function initMusicHandlers() {
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.music-card');
        if (card) {
            const index = parseInt(card.dataset.index);
            playTrack(index);
        }
    });

    playBtn.addEventListener('click', togglePlay);

    prevBtn.addEventListener('click', () => {
        const newIndex = currentTrackIndex <= 0 ? tracks.length - 1 : currentTrackIndex - 1;
        playTrack(newIndex);
    });

    nextBtn.addEventListener('click', () => {
        const newIndex = (currentTrackIndex + 1) % tracks.length;
        playTrack(newIndex);
    });

    audioElement.addEventListener('timeupdate', () => {
        if (audioElement.duration) {
            const percent = (audioElement.currentTime / audioElement.duration) * 100;
            progressFill.style.width = `${percent}%`;
            currentTimeEl.textContent = formatTime(audioElement.currentTime);
        }
    });

    audioElement.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audioElement.duration);
    });

    audioElement.addEventListener('ended', () => {
        nextBtn.click();
    });

    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioElement.currentTime = percent * audioElement.duration;
    });
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Volume
volumeSlider.addEventListener('input', (e) => {
    audioElement.volume = e.target.value / 100;
});

audioElement.volume = 0.8;

// ==================== Smooth Scroll ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== Photo Gallery (About Section) ====================
function initPhotoGallery() {
    const gallery = document.getElementById('photoGallery');
    if (!gallery) return;

    const photos = gallery.querySelectorAll('.gallery-photo');
    const container = gallery.querySelector('.gallery-container');
    let currentIndex = 0;
    let isHovering = false;

    photos.forEach((photo, index) => {
        if (index === 0) {
            photo.classList.add('active');
        }
    });

    container.addEventListener('mousemove', (e) => {
        if (!isHovering) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;

        let newIndex = Math.floor(percentage * 4);
        newIndex = Math.max(0, Math.min(3, newIndex));

        if (newIndex !== currentIndex) {
            photos[currentIndex].classList.remove('active');
            photos[newIndex].classList.add('active');
            currentIndex = newIndex;
        }
    });

    container.addEventListener('mouseenter', () => {
        isHovering = true;
    });

    container.addEventListener('mouseleave', () => {
        isHovering = false;
        photos[currentIndex].classList.remove('active');
        currentIndex = 0;
        photos[0].classList.add('active');
    });

    container.addEventListener('click', () => {
        photos[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % photos.length;
        photos[currentIndex].classList.add('active');
    });
}

// ==================== Writing Modal ====================
async function openWritingModal(index) {
    const writing = writingsData[index];
    if (!writing) {
        console.error('Writing not found at index:', index);
        return;
    }

    writingModalTitle.textContent = writing.title;
    writingModalArticle.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);">加载中...</p>';

    writingModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log('Modal opened for:', writing.title);

    // Scroll to top of modal
    const modalBody = document.getElementById('writingModalBody');
    if (modalBody) modalBody.scrollTop = 0;

    // Load MD file if exists
    if (writing.md) {
        try {
            const res = await fetch(writing.md);
            if (res.ok) {
                const mdContent = await res.text();
                // Parse markdown using marked.js if available
                if (typeof marked !== 'undefined') {
                    writingModalArticle.innerHTML = marked.parse(mdContent);
                } else {
                    // Fallback: show plain text
                    writingModalArticle.innerHTML = '<pre>' + mdContent + '</pre>';
                }
            } else {
                writingModalArticle.innerHTML = '<p>无法加载文章内容</p>';
            }
        } catch (e) {
            console.error('Error loading MD:', e);
            writingModalArticle.innerHTML = '<p>加载失败，请重试</p>';
        }
    } else {
        writingModalArticle.innerHTML = `<p>${writing.excerpt || '暂无内容'}</p>`;
    }
}

function closeWritingModal() {
    writingModal.classList.remove('active');
    document.body.style.overflow = '';
}

function initWritingHandlers() {
    // Use event delegation on the writings container
    const writingsList = document.getElementById('writingsList');
    if (writingsList) {
        writingsList.addEventListener('click', (e) => {
            const card = e.target.closest('.writing-card');
            if (card) {
                const index = parseInt(card.dataset.index);
                console.log('Writing card clicked, index:', index);
                openWritingModal(index);
            }
        });
    }

    writingModalClose.addEventListener('click', closeWritingModal);

    const backdrop = writingModal.querySelector('.writing-modal-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', closeWritingModal);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && writingModal.classList.contains('active')) {
            closeWritingModal();
        }
    });
}

// ==================== Social Modal ====================
function openSocialModal(title, qrcode) {
    socialModalTitle.textContent = title;
    socialModalQRCode.src = qrcode;
    socialModalQRCode.alt = title + '二维码';
    socialModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSocialModal() {
    socialModal.classList.remove('active');
    document.body.style.overflow = '';
}

function initSocialHandlers() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.social-link');
        if (link && link.dataset.qrcode) {
            e.preventDefault();
            openSocialModal(link.dataset.name, link.dataset.qrcode);
        }
    });

    socialModalClose.addEventListener('click', closeSocialModal);

    const backdrop = socialModal.querySelector('.social-modal-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', closeSocialModal);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && socialModal.classList.contains('active')) {
            closeSocialModal();
        }
    });
}

// ==================== Initialize ====================
async function init() {
    // Load all data from JSON
    const [site, photos, videos, music, writings] = await Promise.all([
        loadData('site'),
        loadData('photos'),
        loadData('videos'),
        loadData('music'),
        loadData('writings')
    ]);

    // Render site-wide content (Hero and About)
    renderHero(site);
    renderAbout(site);

    // Render content
    renderPhotos(photos);
    renderVideos(videos);
    renderMusic(music);
    renderWritings(writings);

    // Populate photoSources for lightbox navigation
    photos.forEach(photo => {
        photoSources.push(photo.src);
    });

    // Populate tracks for music player
    music.forEach(track => {
        tracks.push({
            src: track.src,
            cover: track.cover,
            title: track.title,
            artist: track.meta
        });
    });

    // Initialize all handlers
    initLightboxHandlers();
    initVideoHandlers();
    initMusicHandlers();
    initWritingHandlers();
    initSocialHandlers();

    // Start starfield animation
    createStarfield();

    // Initialize photo gallery (About section)
    initPhotoGallery();

    // Mark body as loaded
    document.body.classList.add('loaded');
}

document.addEventListener('DOMContentLoaded', init);
