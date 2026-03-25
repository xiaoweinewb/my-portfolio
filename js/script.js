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

    container.innerHTML = writings.map((writing, index) => `
        <article class="writing-card fade-in" data-index="${index}">
            <div class="writing-image">
                <img src="${writing.image}" alt="${writing.title}">
            </div>
            <div class="writing-content">
                <span class="writing-date">${writing.date}</span>
                <h3>${writing.title}</h3>
                <p>${writing.excerpt}</p>
                <a href="#" class="reading-link">继续阅读</a>
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

// ==================== Initialize ====================
async function init() {
    // Load all data from JSON
    const [photos, videos, music, writings] = await Promise.all([
        loadData('photos'),
        loadData('videos'),
        loadData('music'),
        loadData('writings')
    ]);

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

    // Start starfield animation
    createStarfield();

    // Initialize photo gallery (About section)
    initPhotoGallery();

    // Mark body as loaded
    document.body.classList.add('loaded');
}

document.addEventListener('DOMContentLoaded', init);
