/**
 * The Story of Us: A 5-Act Love Story Film & Constellation Cinema
 * 
 * Act 1: Love Symbol & Her Portrait (First love symbol / beating heart -> blooms into her radiant portrait)
 * Act 2: A Random Snap Request (How we met on Snapchat and started our journey)
 * Act 3: Falling In Love (Endless starry walks hand-in-hand under fairy lights)
 * Act 4: Our Temple Date (Seeking sacred blessings together with glowing diyas)
 * Act 5: Candlelight & Forever (Table date & eternal love declaration - A gift for my loved one)
 */

class ConstellationEngine {
    constructor() {
        this.canvas = document.getElementById('cinemaCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 5-Act Romantic Storyline
        this.scenes = [
            {
                id: 'portrait',
                title: 'Act 1: Her Constellation',
                caption: 'Every heartbeat in this universe beats for you ❤️',
                imageKey: 'girlfriend',
                duration: 12.0,
                focusFalloff: 0.0,
                threshold: 18,
                dotDensity: 14000,
                type: 'portrait',
                badge: '💖 Act 1: Love & Her Portrait'
            },
            {
                id: 'snapStory',
                title: 'Act 2: Random Snap Request',
                caption: 'It all began with one random Snapchat request... and turned into my whole world 👻💬✨',
                imageKey: 'snapStory',
                duration: 10.0,
                focusFalloff: 0.15,
                threshold: 25,
                dotDensity: 14000,
                type: 'snapStory',
                badge: '👻 Act 2: How We Met'
            },
            {
                id: 'walking',
                title: 'Act 3: Falling In Love',
                caption: 'Late night talks became endless walks, and day by day, I fell deeply in love with you 🌙✨',
                imageKey: 'walking',
                duration: 10.0,
                focusFalloff: 0.15,
                threshold: 28,
                dotDensity: 14000,
                type: 'walking',
                badge: '🌙 Act 3: Falling In Love'
            },
            {
                id: 'templeDate',
                title: 'Act 4: Our Temple Date',
                caption: 'Holding hands before God, praying for a lifetime of love and togetherness 🛕🪔🙏',
                imageKey: 'templeDate',
                duration: 10.0,
                focusFalloff: 0.18,
                threshold: 30,
                dotDensity: 14000,
                type: 'templeDate',
                badge: '🛕 Act 4: Temple Date'
            },
            {
                id: 'tableDate',
                title: 'Act 5: Candlelight & Forever',
                caption: 'To my favorite person, my greatest love... this is my forever gift to you 🕯️🍷💖',
                imageKey: 'tableDate',
                duration: 11.0,
                focusFalloff: 0.18,
                threshold: 28,
                dotDensity: 14000,
                type: 'tableDate',
                badge: '🕯️ Act 5: Candlelight Date'
            },
            {
                id: 'proposal',
                title: 'Act 6: Sacred Temple Proposal',
                caption: 'Before God and the sacred temple flames, down on one knee with a diamond ring... 💍🛕❤️',
                imageKey: 'proposalKnee',
                acceptedImageKey: 'proposalKiss',
                duration: 18.0,
                focusFalloff: 0.10,
                threshold: 22,
                dotDensity: 14000,
                type: 'proposal',
                badge: '💍 Act 6: Sacred Proposal'
            }
        ];

        this.currentSceneIndex = 0;
        this.isFullMovieMode = true; // Continuous cinematic love story playback
        this.sceneParticleCache = {};
        this.sceneSparkleCache = {};
        this.sceneImages = {};

        // Proposal State (Act 6 Interactive Proposal)
        this.proposalAccepted = false;
        this.proposalModalShown = false;
        this.proposalAcceptTime = 0.0;
        this.celebrationPetals = null;

        // Active State
        this.particles = [];
        this.sparklePoints = [];
        this.ambientStars = [];
        this.floatingPetals = [];
        this.candleEmbers = [];
        this.templeDiyaEmbers = [];
        this.diamondGlitter = [];
        this.touchSparkles = [];

        // Timing
        this.currentTime = 0.0;
        this.isPlaying = true;
        this.lastFrameTime = performance.now();
        this.playbackRate = 1.0;

        // Config settings
        this.config = {
            dotDensity: 14000,
            particleSize: 1.6,
            glowIntensity: 8,
            diamondBrilliance: 1.2,  // Diamond sparkle multiplier
            threshold: 38,
            focusFalloff: 0.85,
            showPetals: true,
            showSparkles: true,
            rippleStrength: 110,
            autoReplay: true
        };

        // Interactive mouse
        this.mouse = { x: -9999, y: -9999, active: false };

        // Video Recorder
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => {
            this.resize();
            this.reprocessAllScenes();
        });

        this.createAmbientStars();
        this.createFloatingPetals();
        this.createCandleEmbers();
        this.createTempleDiyaEmbers();
        this.createDiamondGlitter();

        // Mouse & Touch interaction
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.mouse.active = true;
            if (this.scenes[this.currentSceneIndex].type === 'portrait' && Math.random() < 0.35) {
                this.spawnDiamondSparkle(e.clientX, e.clientY);
            }
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.active = false;
        });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
                this.mouse.active = true;
                if (this.scenes[this.currentSceneIndex].type === 'portrait' && Math.random() < 0.35) {
                    this.spawnDiamondSparkle(e.touches[0].clientX, e.touches[0].clientY);
                }
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.mouse.active = false;
        });

        // Preload all 5 scenes
        this.preloadAllScenes();

        // Render loop
        requestAnimationFrame((t) => this.renderLoop(t));
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
    }

    createAmbientStars() {
        this.ambientStars = [];
        for (let i = 0; i < 150; i++) {
            this.ambientStars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 1.3 + 0.3,
                baseAlpha: Math.random() * 0.4 + 0.1,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.05,
                vy: (Math.random() - 0.5) * 0.05
            });
        }
    }

    createFloatingPetals() {
        this.floatingPetals = [];
        for (let i = 0; i < 32; i++) {
            this.floatingPetals.push({
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + Math.random() * 300,
                size: Math.random() * 4 + 2.5,
                alpha: Math.random() * 0.35 + 0.15,
                vy: -(Math.random() * 0.45 + 0.25),
                vx: (Math.random() - 0.5) * 0.3,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.015,
                hue: Math.random() > 0.45 ? 'rgba(255, 180, 205,' : 'rgba(255, 255, 255,'
            });
        }
    }

    createCandleEmbers() {
        this.candleEmbers = [];
        for (let i = 0; i < 24; i++) {
            this.candleEmbers.push({
                x: this.width * 0.5 + (Math.random() - 0.5) * 160,
                y: this.height * 0.52 + Math.random() * 120,
                size: Math.random() * 2.2 + 0.8,
                alpha: Math.random() * 0.7 + 0.3,
                vy: -(Math.random() * 0.8 + 0.4),
                vx: (Math.random() - 0.5) * 0.35,
                life: Math.random() * 60 + 40,
                maxLife: 100
            });
        }
    }

    createTempleDiyaEmbers() {
        this.templeDiyaEmbers = [];
        for (let i = 0; i < 30; i++) {
            this.templeDiyaEmbers.push({
                x: Math.random() * window.innerWidth,
                y: this.height * 0.65 + Math.random() * (this.height * 0.25),
                size: Math.random() * 2.5 + 1.0,
                alpha: Math.random() * 0.8 + 0.2,
                vy: -(Math.random() * 0.6 + 0.3),
                vx: (Math.random() - 0.5) * 0.25,
                life: Math.random() * 50 + 30,
                maxLife: 80
            });
        }
    }

    createDiamondGlitter() {
        this.diamondGlitter = [];
        for (let i = 0; i < 48; i++) {
            this.diamondGlitter.push({
                x: this.width * 0.32 + Math.random() * (this.width * 0.36),
                y: this.height * 0.12 + Math.random() * (this.height * 0.72),
                size: Math.random() * 2.2 + 0.8,
                phase: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.04 + Math.random() * 0.05,
                vx: (Math.random() - 0.5) * 0.18,
                vy: (Math.random() - 0.5) * 0.18,
                baseAlpha: Math.random() * 0.75 + 0.25
            });
        }
    }

    spawnDiamondSparkle(x, y) {
        if (this.touchSparkles.length > 25) return;
        this.touchSparkles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            size: Math.random() * 8 + 4,
            alpha: 1.0,
            decay: 0.04 + Math.random() * 0.03,
            rot: Math.random() * Math.PI
        });
    }

    preloadAllScenes() {
        let loadedCount = 0;
        const total = this.scenes.length;

        this.scenes.forEach((scene) => {
            const img = new Image();
            img.onload = () => {
                this.sceneImages[scene.id] = img;
                if (scene.id === 'proposal') {
                    this.sceneImages['proposalKnee'] = img;
                }
                this.processScene(scene, img);
                loadedCount++;
                // If the portrait (Act 1) is ready, activate it right away so the love symbol & pic show immediately!
                if (scene.id === 'portrait' || loadedCount === total) {
                    if (this.currentSceneIndex === 0 && (!this.particles || this.particles.length === 0)) {
                        this.setActiveScene(0);
                    }
                }
            };
            img.onerror = () => {
                console.warn('Failed to load image for scene:', scene.id);
                loadedCount++;
                if (loadedCount === total && (!this.particles || this.particles.length === 0)) {
                    this.setActiveScene(0);
                }
            };

            let dataSrc = null;
            if (window.SCENES_DATA && window.SCENES_DATA[scene.imageKey]) {
                dataSrc = window.SCENES_DATA[scene.imageKey];
            } else if (scene.id === 'portrait' && window.DEFAULT_PHOTO_BASE64) {
                dataSrc = window.DEFAULT_PHOTO_BASE64;
            } else if (scene.id === 'portrait') {
                dataSrc = 'girlfriend.jpg';
            } else if (scene.id === 'proposal') {
                dataSrc = (window.SCENES_DATA && window.SCENES_DATA['proposalKnee']) ? window.SCENES_DATA['proposalKnee'] : 'proposal_knee.jpg';
            } else {
                dataSrc = `${scene.imageKey}.jpg`;
            }

            img.src = dataSrc;
        });

        // Also preload proposalKiss for Act 6 finale acceptance scene
        const kissImg = new Image();
        kissImg.onload = () => {
            this.sceneImages['proposalKiss'] = kissImg;
        };
        kissImg.src = (window.SCENES_DATA && window.SCENES_DATA['proposalKiss'])
            ? window.SCENES_DATA['proposalKiss']
            : 'proposal_kiss.jpg';
    }

    reprocessAllScenes() {
        this.scenes.forEach(scene => {
            if (this.sceneImages[scene.id]) {
                this.processScene(scene, this.sceneImages[scene.id]);
            }
        });
        if (this.sceneImages['proposalKiss']) {
            this.processScene({
                id: 'proposalKiss',
                type: 'proposalKiss',
                threshold: 22,
                dotDensity: 14000,
                focusFalloff: 0.10
            }, this.sceneImages['proposalKiss']);
        }
        this.setActiveScene(this.currentSceneIndex);
    }

    getHeartCoord(normIndex, scale = 14) {
        const angle = normIndex * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(angle), 3);
        const y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
        const r = Math.sqrt(Math.random());
        const volumeFactor = 0.25 + r * 0.75;
        return {
            x: this.width / 2 + x * scale * volumeFactor,
            y: (this.height / 2 - 25) + y * scale * volumeFactor
        };
    }

    processScene(scene, img) {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');

        const isWide = scene.type !== 'portrait';
        const maxWidth = this.width * (isWide ? 0.76 : 0.68);
        const maxHeight = this.height * (isWide ? 0.74 : 0.78);
        let drawWidth = img.width;
        let drawHeight = img.height;

        const ratio = Math.min(maxWidth / drawWidth, maxHeight / drawHeight);
        drawWidth = Math.round(drawWidth * ratio);
        drawHeight = Math.round(drawHeight * ratio);

        offCanvas.width = drawWidth;
        offCanvas.height = drawHeight;
        offCtx.drawImage(img, 0, 0, drawWidth, drawHeight);

        let imgData;
        try {
            imgData = offCtx.getImageData(0, 0, drawWidth, drawHeight);
        } catch (e) {
            console.warn('Error reading pixels:', e);
            return;
        }

        const data = imgData.data;
        const targetParticles = [];
        const sparkles = [];
        const offsetX = (this.width - drawWidth) / 2;
        const offsetY = (this.height - drawHeight) / 2 - (isWide ? 10 : 20);

        const totalPixels = drawWidth * drawHeight;
        const approxStep = Math.max(1, Math.round(Math.sqrt(totalPixels / (scene.dotDensity * 1.55))));

        const focalCenterX = drawWidth * (scene.type === 'portrait' ? 0.56 : 0.5);
        const focalCenterY = drawHeight * (scene.type === 'portrait' ? 0.30 : 0.5);
        const maxDistX = drawWidth * 0.55;
        const maxDistY = drawHeight * 0.65;

        let pIdx = 0;

        for (let y = 0; y < drawHeight; y += approxStep) {
            for (let x = 0; x < drawWidth; x += approxStep) {
                const idx = (y * drawWidth + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = data[idx + 3] / 255;

                let lum = (0.299 * r + 0.587 * g + 0.114 * b);

                if (scene.focusFalloff > 0) {
                    const fdx = (x - focalCenterX) / maxDistX;
                    const fdy = (y - focalCenterY) / maxDistY;
                    const dist = Math.sqrt(fdx * fdx + fdy * fdy);
                    const vig = Math.max(0, 1.0 - Math.pow(dist, 2.5) * scene.focusFalloff);
                    lum *= vig;
                }

                if (lum > scene.threshold && a > 0.25) {
                    const targetX = offsetX + x;
                    const targetY = offsetY + y;

                    // Cosmic galaxy outer origin
                    const spiralAngle = Math.random() * Math.PI * 2;
                    const spiralDist = Math.max(this.width, this.height) * (0.65 + Math.random() * 0.75);
                    const startX = this.width / 2 + Math.cos(spiralAngle) * spiralDist;
                    const startY = this.height / 2 + Math.sin(spiralAngle) * spiralDist;

                    const heartPos = this.getHeartCoord(Math.random(), Math.min(this.width, this.height) * 0.016);
                    const normLum = (lum - scene.threshold) / (255 - scene.threshold);
                    const dotSize = Math.max(0.6, (normLum * this.config.particleSize * (isWide ? 1.15 : 1.3)) + 0.35);

                    // Twinkle sparkles (jewelry, diyas, candles, lanterns, snap stars)
                    if (lum > 175 && (scene.type !== 'portrait' || y < drawHeight * 0.65)) {
                        sparkles.push({ x: targetX, y: targetY, lum: normLum });
                    }

                    targetParticles.push({
                        x: startX,
                        y: startY,
                        startX: startX,
                        startY: startY,
                        heartX: heartPos.x,
                        heartY: heartPos.y,
                        targetX: targetX,
                        targetY: targetY,
                        size: dotSize,
                        baseAlpha: Math.min(1.0, 0.25 + normLum * 0.75),
                        colorLuminance: normLum,
                        staggerDelay: Math.random() * 1.3,
                        twinkleSpeed: 0.02 + Math.random() * 0.035,
                        twinklePhase: Math.random() * Math.PI * 2,
                        floatAngle: Math.random() * Math.PI * 2,
                        floatSpeed: 0.005 + Math.random() * 0.01,
                        floatRadius: 0.6 + Math.random() * 1.2,
                        vx: 0,
                        vy: 0
                    });

                    pIdx++;
                }
            }
        }

        this.sceneParticleCache[scene.id] = targetParticles;

        sparkles.sort(() => Math.random() - 0.5);
        const sparkleCount = scene.type === 'portrait' ? 85 : 24;
        this.sceneSparkleCache[scene.id] = sparkles.slice(0, sparkleCount).map(sp => ({
            x: sp.x,
            y: sp.y,
            phase: Math.random() * Math.PI * 2,
            speed: 0.035 + Math.random() * 0.045,
            maxSize: (scene.type === 'portrait' ? 8 : 5) + Math.random() * (scene.type === 'portrait' ? 12 : 5),
            rot: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.03,
            isDiamond: scene.type === 'portrait'
        }));
    }

    setActiveScene(index, userTriggered = false) {
        this.currentSceneIndex = index;
        const scene = this.scenes[index];
        this.particles = this.sceneParticleCache[scene.id] || [];
        this.sparklePoints = this.sceneSparkleCache[scene.id] || [];
        this.currentTime = 0.0;
        this.lastFrameTime = performance.now();

        // Reset proposal interactive state if entering or switching to proposal scene
        if (scene.id === 'proposal') {
            this.proposalAccepted = false;
            this.proposalModalShown = false;
            this.proposalAcceptTime = 0.0;
            this.celebrationPetals = null;
            const modal = document.getElementById('proposalModal');
            if (modal) modal.classList.remove('active');
        }

        // Update romantic caption
        const captionEl = document.getElementById('romanticCaption');
        const captionInput = document.getElementById('captionInput');
        if (captionEl) {
            captionEl.textContent = scene.caption;
            captionEl.style.opacity = 0;
        }
        if (captionInput) {
            captionInput.value = scene.caption;
        }

        // Update active tab in UI
        this.updateSceneTabsUI();
        this.updatePlayPauseUI();

        if (userTriggered) {
            if (window.soundscape && !window.soundscape.isPlaying) {
                window.soundscape.start();
            }
        }
    }

    updateSceneTabsUI() {
        document.querySelectorAll('.scene-tab').forEach((tab) => {
            const sceneIdx = tab.getAttribute('data-scene');
            if (this.isFullMovieMode && tab.classList.contains('tab-movie')) {
                tab.classList.add('active');
            } else if (!this.isFullMovieMode && sceneIdx !== null && parseInt(sceneIdx) === this.currentSceneIndex) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    setFullMovieMode(enable = true) {
        this.isFullMovieMode = enable;
        if (enable) {
            this.setActiveScene(0, true);
        }
        this.updateSceneTabsUI();
    }

    restartVideo() {
        if (this.isFullMovieMode) {
            this.setActiveScene(0, true);
        } else {
            this.currentTime = 0.0;
            if (this.scenes[this.currentSceneIndex].id === 'proposal') {
                this.proposalAccepted = false;
                this.proposalModalShown = false;
                this.proposalAcceptTime = 0.0;
                this.celebrationPetals = null;
                const modal = document.getElementById('proposalModal');
                if (modal) modal.classList.remove('active');
            }
        }
        this.isPlaying = true;
        this.lastFrameTime = performance.now();
        if (window.soundscape) {
            window.soundscape.start();
        }
        this.updatePlayPauseUI();
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        this.lastFrameTime = performance.now();
        if (this.isPlaying && window.soundscape) {
            window.soundscape.start();
        }
        this.updatePlayPauseUI();
    }

    seek(timeSeconds) {
        const curScene = this.scenes[this.currentSceneIndex];
        this.currentTime = Math.max(0, Math.min(curScene.duration, timeSeconds));
        this.lastFrameTime = performance.now();
    }

    showProposalModal() {
        this.proposalModalShown = true;
        const modal = document.getElementById('proposalModal');
        if (modal) modal.classList.add('active');
    }

    acceptProposal() {
        if (this.proposalAccepted) return;
        this.proposalAccepted = true;
        this.proposalAcceptTime = this.currentTime;

        // Ensure plenty of time for the romantic kiss and ring scene
        const curScene = this.scenes[this.currentSceneIndex];
        if (curScene && curScene.type === 'proposal') {
            curScene.duration = Math.max(curScene.duration, this.currentTime + 14.0);
        }

        const modal = document.getElementById('proposalModal');
        if (modal) modal.classList.remove('active');

        // Romantic caption update
        const captionEl = document.getElementById('romanticCaption');
        const captionText = "She said YES! 💍 Forever in his arms under God's eternal blessings 💖✨";
        if (captionEl) {
            captionEl.textContent = captionText;
            captionEl.style.opacity = 1.0;
        }

        // Play glorious temple celebration chimes & chords
        if (window.soundscape) {
            window.soundscape.playTempleCelebration();
        }

        // Spawn celebratory diamond sparkle bursts
        for (let i = 0; i < 60; i++) {
            this.spawnDiamondSparkle(
                this.width * 0.15 + Math.random() * (this.width * 0.7),
                this.height * 0.15 + Math.random() * (this.height * 0.7)
            );
        }

        this.isPlaying = true;
        this.lastFrameTime = performance.now();
        this.updatePlayPauseUI();
    }

    updatePlayPauseUI() {
        const playBtn = document.getElementById('playPauseBtn');
        if (playBtn) {
            playBtn.innerHTML = this.isPlaying ? '❚❚ Pause' : '▶ Play';
        }
    }

    easeOutCubic(t) {
        return (--t) * t * t + 1;
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    renderLoop(now) {
        requestAnimationFrame((t) => this.renderLoop(t));

        const dt = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        const curScene = this.scenes[this.currentSceneIndex];
        const sceneDuration = curScene ? curScene.duration : 10.0;

        if (this.isPlaying) {
            this.currentTime += dt * this.playbackRate;

            // Trigger proposal question when he is on one knee holding the ring (Act 6)
            if (curScene.type === 'proposal' && !this.proposalAccepted) {
                if (!this.proposalModalShown && this.currentTime >= 1.8) {
                    this.showProposalModal();
                }
                // While waiting for her answer, hold time so the moment stays alive and never abruptly ends or loops!
                if (this.proposalModalShown && this.currentTime > 3.8) {
                    this.currentTime = 3.8;
                }
            }

            if (this.currentTime >= sceneDuration) {
                if (this.isFullMovieMode) {
                    const nextIndex = this.currentSceneIndex + 1;
                    if (nextIndex < this.scenes.length) {
                        this.setActiveScene(nextIndex);
                    } else if (this.isRecording) {
                        this.stopRecording();
                        this.isPlaying = false;
                    } else if (this.config.autoReplay) {
                        this.setActiveScene(0); // Seamlessly loop love story film
                    } else {
                        this.currentTime = sceneDuration;
                        this.isPlaying = false;
                        this.updatePlayPauseUI();
                    }
                } else {
                    if (this.config.autoReplay && !this.isRecording) {
                        this.currentTime = 0;
                    } else if (this.isRecording) {
                        this.stopRecording();
                        this.isPlaying = false;
                    } else {
                        this.currentTime = sceneDuration;
                        this.isPlaying = false;
                        this.updatePlayPauseUI();
                    }
                }
            }
        }

        this.updateUIProgress(sceneDuration);
        this.drawScene();
    }

    updateUIProgress(duration) {
        const progressBar = document.getElementById('timelineProgress');
        const timeDisplay = document.getElementById('timeDisplay');
        if (progressBar) {
            const pct = (this.currentTime / duration) * 100;
            progressBar.style.width = `${pct}%`;
        }
        if (timeDisplay) {
            const curSec = Math.floor(this.currentTime);
            const curMs = Math.floor((this.currentTime % 1) * 10);
            const totSec = Math.floor(duration);
            timeDisplay.textContent = `[Act ${this.currentSceneIndex + 1}/${this.scenes.length}] 00:${curSec < 10 ? '0' : ''}${curSec}.${curMs} / 00:${totSec < 10 ? '0' : ''}${totSec}.0`;
        }

        const captionEl = document.getElementById('romanticCaption');
        if (captionEl) {
            const revealTime = this.scenes[this.currentSceneIndex].type === 'portrait' ? 7.5 : 4.8;
            if (this.currentTime >= revealTime) {
                const alpha = Math.min(1.0, (this.currentTime - revealTime) / 2.0);
                captionEl.style.opacity = alpha;
                captionEl.style.transform = `translateY(${(1.0 - alpha) * 12}px)`;
            } else {
                captionEl.style.opacity = 0;
            }
        }
    }

    drawScene() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const t = this.currentTime;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        this.drawAmbientStars(ctx);

        if (this.config.showPetals) {
            this.drawFloatingPetals(ctx);
        }

        const curScene = this.scenes[this.currentSceneIndex];
        if (!curScene) return;

        // Act 6: Sacred Temple Proposal (3D Indian Anime Cinematic Experience!)
        if (curScene.type === 'proposal') {
            this.drawProposalScene(ctx, t);
            return;
        }

        if (this.particles.length === 0) return;

        // Scene-specific animated elements
        if (curScene.type === 'tableDate') {
            this.drawCandleEmbers(ctx);
        } else if (curScene.type === 'templeDate') {
            this.drawTempleDiyaEmbers(ctx);
        } else if (curScene.type === 'portrait' && t >= 3.0) {
            this.drawDiamondGlitter(ctx, t);
        }

        const rippleDist = this.config.rippleStrength;
        const rippleDistSq = rippleDist * rippleDist;

        // Diamond Shimmer Light Sweep for Act 1 (Her Portrait)
        const shimmerSweep = (t * 0.35) % 1.0;
        const sweepPos = shimmerSweep * (w + h);

        ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
        ctx.shadowBlur = this.config.glowIntensity;
        ctx.fillStyle = '#ffffff';

        // Love Symbol / Pulsating Heart for Act 1
        let heartPulse = 1.0;
        if (curScene.type === 'portrait' && t < 4.2) {
            const beatCycle = (t % 0.85) / 0.85;
            if (beatCycle < 0.16) {
                heartPulse = 1.0 + Math.sin((beatCycle / 0.16) * Math.PI) * 0.16;
            } else if (beatCycle >= 0.22 && beatCycle < 0.38) {
                heartPulse = 1.0 + Math.sin(((beatCycle - 0.22) / 0.16) * Math.PI) * 0.10;
            }
        }

        // Draw radiant glowing love heart outline & stardust bloom (Act 1)
        if (curScene.type === 'portrait') {
            this.drawGlowingHeartOutline(ctx, t, heartPulse);
        }

        const breathTime = t * 1.5;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            let curX, curY, alpha;

            if (curScene.type === 'portrait') {
                // First: Love symbol / Beating Heart -> Then: Her Portrait
                if (t < 4.0) {
                    // Assemble instantly and pulse as the cosmic love heart!
                    const prog = Math.min(1.0, t / 0.8);
                    const ease = this.easeInOutQuad(prog);
                    const swirl = (1.0 - prog) * 2.5;
                    const hx = (p.heartX - this.width / 2) * heartPulse + this.width / 2;
                    const hy = (p.heartY - (this.height / 2 - 25)) * heartPulse + (this.height / 2 - 25);
                    curX = p.startX + (hx - p.startX) * ease + Math.sin(swirl + p.twinklePhase) * (1.0 - prog) * 40;
                    curY = p.startY + (hy - p.startY) * ease + Math.cos(swirl + p.twinklePhase) * (1.0 - prog) * 40;
                    alpha = Math.max(0.65, prog * 0.95) * (0.85 + Math.sin(t * 3.5 + p.twinklePhase) * 0.15);
                } else if (t < 7.8) {
                    // Blossoms into her gorgeous portrait!
                    const prog = Math.min(1.0, (t - 4.0) / (3.2 + p.staggerDelay * 0.5));
                    const ease = this.easeOutCubic(prog);
                    const deflect = Math.sin(prog * Math.PI) * 35;
                    const angle = Math.atan2(p.targetY - p.heartY, p.targetX - p.heartX) + Math.PI / 2;
                    curX = p.heartX + (p.targetX - p.heartX) * ease + Math.cos(angle) * deflect;
                    curY = p.heartY + (p.targetY - p.heartY) * ease + Math.sin(angle) * deflect;
                    alpha = Math.max(0.45, 0.5 + ease * 0.5 * p.baseAlpha);
                } else {
                    // Living diamond constellation portrait
                    p.floatAngle += p.floatSpeed;
                    const fOff = Math.sin(p.floatAngle + breathTime) * p.floatRadius;
                    curX = p.targetX + Math.cos(p.floatAngle) * fOff;
                    curY = p.targetY + Math.sin(p.floatAngle) * fOff;
                    const tw = Math.sin(t * 3.0 + p.twinklePhase) * 0.18;
                    alpha = Math.max(0.35, Math.min(1.0, p.baseAlpha + tw));
                    curX = this.applyMouseRipple(p, curX, curY, rippleDist, rippleDistSq);
                }
            } else if (curScene.type === 'proposal' && this.isMorphingToKiss) {
                // Morph into proposalKiss: Putting ring on finger & kissing forehead & cheek!
                const morphElapsed = Math.max(0, t - this.morphStartTime);
                const transitDuration = 3.2 + (p.staggerDelay || 0) * 0.4;
                if (morphElapsed < transitDuration) {
                    const prog = Math.min(1.0, morphElapsed / transitDuration);
                    const ease = this.easeInOutQuad(prog);
                    const swirl = Math.sin(prog * Math.PI) * 28;
                    const travelAngle = Math.atan2(p.targetY - p.morphStartY, p.targetX - p.morphStartX) + Math.PI / 2;
                    curX = p.morphStartX + (p.targetX - p.morphStartX) * ease + Math.cos(travelAngle) * swirl;
                    curY = p.morphStartY + (p.targetY - p.morphStartY) * ease + Math.sin(travelAngle) * swirl;
                    alpha = Math.max(0.4, p.baseAlpha);
                } else {
                    p.floatAngle += p.floatSpeed;
                    const fOff = Math.sin(p.floatAngle + breathTime) * p.floatRadius;
                    curX = p.targetX + Math.cos(p.floatAngle) * fOff;
                    curY = p.targetY + Math.sin(p.floatAngle) * fOff;
                    const tw = Math.sin(t * 3.0 + p.twinklePhase) * 0.18;
                    alpha = Math.max(0.35, Math.min(1.0, p.baseAlpha + tw));
                    curX = this.applyMouseRipple(p, curX, curY, rippleDist, rippleDistSq);
                }
            } else {
                // Acts 2, 3, 4, 5, 6(initial): Graceful stardust flow into the chapter memory
                const transitDuration = 4.0 + p.staggerDelay * 0.5;
                if (t < 0.8) {
                    const pre = t * 0.5;
                    curX = p.startX + Math.sin(pre + p.twinklePhase) * 12;
                    curY = p.startY + Math.cos(pre + p.twinklePhase) * 12;
                    alpha = Math.max(0, Math.sin(p.twinklePhase + t * 2.5)) * 0.12;
                } else if (t < 0.8 + transitDuration) {
                    const prog = Math.min(1.0, (t - 0.8) / transitDuration);
                    const ease = this.easeOutCubic(prog);
                    const swirl = Math.sin(prog * Math.PI) * 35;
                    const travelAngle = Math.atan2(p.targetY - p.startY, p.targetX - p.startX) + Math.PI / 2;
                    curX = p.startX + (p.targetX - p.startX) * ease + Math.cos(travelAngle) * swirl;
                    curY = p.startY + (p.targetY - p.startY) * ease + Math.sin(travelAngle) * swirl;
                    alpha = prog * p.baseAlpha;
                } else {
                    p.floatAngle += p.floatSpeed;
                    const fOff = Math.sin(p.floatAngle + breathTime) * p.floatRadius;
                    curX = p.targetX + Math.cos(p.floatAngle) * fOff;
                    curY = p.targetY + Math.sin(p.floatAngle) * fOff;
                    const tw = Math.sin(t * 3.0 + p.twinklePhase) * 0.18;
                    alpha = Math.max(0.25, Math.min(1.0, p.baseAlpha + tw));
                    curX = this.applyMouseRipple(p, curX, curY, rippleDist, rippleDistSq);
                }
            }

            p.x = curX;
            p.y = curY;

            let pSize = p.size;
            let isDiamondPrism = false;

            // Diamond light sweep effect on her face & diamond ring (Act 1 & Act 6)
            if ((curScene.type === 'portrait' || curScene.type === 'proposal') && t >= 5.0) {
                const distToSweep = Math.abs((curX + curY) - sweepPos);
                if (distToSweep < 120) {
                    const sweepGlow = (1.0 - distToSweep / 120) * this.config.diamondBrilliance;
                    alpha = Math.min(1.0, alpha + sweepGlow * 0.45);
                    pSize = p.size * (1.0 + sweepGlow * 0.85);
                    isDiamondPrism = true;
                }
            }

            if (alpha > 0.02) {
                ctx.globalAlpha = alpha;
                if (isDiamondPrism) {
                    ctx.shadowColor = 'rgba(215, 240, 255, 1.0)';
                    ctx.shadowBlur = 12 * this.config.diamondBrilliance;
                    ctx.fillStyle = '#f0f9ff';
                } else {
                    ctx.shadowBlur = 0; // ZERO shadowBlur for normal dots: 60 FPS buttery smooth!
                    ctx.fillStyle = '#ffffff';
                }
                ctx.beginPath();
                ctx.arc(curX, curY, pSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Diamond sparkles (jewelry, diyas, phone stars, lanterns, candles)
        if (this.config.showSparkles && t >= 4.0) {
            this.drawDiamondSparkles(ctx, t);
        }

        // Interactive touch diamond bursts
        this.drawTouchSparkles(ctx);

        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
    }

    applyMouseRipple(p, curX, curY, rippleDist, rippleDistSq) {
        if (this.mouse.active) {
            const mdx = curX - this.mouse.x;
            const mdy = curY - this.mouse.y;
            const distSq = mdx * mdx + mdy * mdy;
            if (distSq < rippleDistSq) {
                const dist = Math.sqrt(distSq);
                const force = (1.0 - dist / rippleDist) * 35;
                p.vx += (mdx / (dist || 1)) * force;
                p.vy += (mdy / (dist || 1)) * force;
            }
        }
        p.vx *= 0.88;
        p.vy *= 0.88;
        return curX + p.vx;
    }

    drawProposalScene(ctx, t) {
        const w = this.width;
        const h = this.height;

        // Choose image: knee or kiss (with smooth cross-fade upon acceptance)
        const kneeImg = this.sceneImages['proposalKnee'] || this.sceneImages['proposal'];
        const kissImg = this.sceneImages['proposalKiss'];

        let crossfade = 0;
        if (this.proposalAccepted) {
            const elapsed = Math.max(0, t - this.proposalAcceptTime);
            crossfade = Math.min(1.0, elapsed / 1.2); // 1.2s smooth cinematic cross-fade
        }

        const renderAnimeFrame = (img, alpha, zoomFactor) => {
            if (!img || !img.complete || (img.naturalWidth && img.naturalWidth === 0)) return;
            const imgW = img.naturalWidth || img.width;
            const imgH = img.naturalHeight || img.height;
            if (!imgW || !imgH) return;

            const screenAspect = w / h;
            const imgAspect = imgW / imgH;

            let dw, dh;
            if (screenAspect > imgAspect) {
                dw = w * zoomFactor;
                dh = (w / imgAspect) * zoomFactor;
            } else {
                dh = h * zoomFactor;
                dw = (h * imgAspect) * zoomFactor;
            }
            const dx = (w - dw) / 2;
            const dy = (h - dh) / 2;

            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1.0, alpha));
            ctx.drawImage(img, dx, dy, dw, dh);

            // Subtle dark cinematic vignette around edges
            const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.78);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.65)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.restore();
        };

        const realTime = performance.now() * 0.001;

        // Gentle breathing zoom (Ken Burns camera motion)
        const zoom1 = 1.0 + Math.sin(realTime * 0.25) * 0.02;
        const zoom2 = 1.0 + Math.sin((realTime + 2) * 0.25) * 0.025;

        if (crossfade < 1.0 && kneeImg) {
            renderAnimeFrame(kneeImg, 1.0 - crossfade, zoom1);
        }
        if (crossfade > 0.0 && kissImg) {
            renderAnimeFrame(kissImg, crossfade, zoom2);
        }

        // Rising temple oil lamp diya embers
        this.drawTempleDiyaEmbers(ctx);

        // Falling celebration rose & jasmine petals upon acceptance
        if (this.proposalAccepted) {
            this.drawProposalCelebrationPetals(ctx);
        }

        // Diamond Ring Sparkle Flares
        this.drawProposalRingGlints(ctx, t, crossfade);

        // Touch Sparkles
        this.drawTouchSparkles(ctx);
    }

    drawProposalRingGlints(ctx, t, crossfade) {
        ctx.save();
        const brilliance = this.config.diamondBrilliance || 1.2;
        ctx.shadowColor = 'rgba(215, 245, 255, 1.0)';
        ctx.shadowBlur = 18 * brilliance;

        // Position of the diamond ring:
        // In knee scene: center-right where ring box is held (~52% w, ~48% h)
        // In kiss scene: lower center where ring finger is held (~53% w, ~70% h)
        let ringX = this.width * (0.52 + (crossfade * 0.01));
        let ringY = this.height * (0.48 + (crossfade * 0.22));

        const realTime = performance.now() * 0.001;
        const pulse = 0.5 + Math.sin(realTime * 5.0) * 0.5;
        const flareSize = (14 + pulse * 10) * brilliance;

        ctx.translate(ringX, ringY);
        ctx.rotate(realTime * 0.4);

        // 8-point brilliant star flare on the diamond ring
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-flareSize * 0.1, 0);
        ctx.lineTo(0, -flareSize);
        ctx.lineTo(flareSize * 0.1, 0);
        ctx.lineTo(0, flareSize);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, -flareSize * 0.1);
        ctx.lineTo(-flareSize, 0);
        ctx.lineTo(0, flareSize * 0.1);
        ctx.lineTo(flareSize, 0);
        ctx.closePath();
        ctx.fill();

        // Diagonal sparkles
        const diag = flareSize * 0.55;
        ctx.fillStyle = 'rgba(210, 240, 255, 0.9)';
        ctx.beginPath();
        ctx.moveTo(-diag * 0.08, -diag * 0.08);
        ctx.lineTo(diag * 0.7, -diag * 0.7);
        ctx.lineTo(diag * 0.08, diag * 0.08);
        ctx.lineTo(-diag * 0.7, diag * 0.7);
        ctx.closePath();
        ctx.fill();

        // Center jewel glint
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, flareSize * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawProposalCelebrationPetals(ctx) {
        if (!this.celebrationPetals) {
            this.celebrationPetals = [];
            for (let i = 0; i < 45; i++) {
                this.celebrationPetals.push({
                    x: Math.random() * this.width,
                    y: Math.random() * -this.height,
                    size: Math.random() * 5 + 3,
                    alpha: Math.random() * 0.5 + 0.5,
                    vy: Math.random() * 1.5 + 1.0,
                    vx: (Math.random() - 0.5) * 0.8,
                    rot: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.03,
                    color: Math.random() > 0.35 ? '#ff4d6d' : '#ffffff'
                });
            }
        }

        ctx.save();
        for (let p of this.celebrationPetals) {
            p.y += p.vy;
            p.x += p.vx + Math.sin(p.y * 0.01) * 0.4;
            p.rot += p.rotSpeed;

            if (p.y > this.height + 20) {
                p.y = -20;
                p.x = Math.random() * this.width;
            }

            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }

    drawGlowingHeartOutline(ctx, t, heartPulse) {
        if (t >= 4.5) return;
        ctx.save();

        let heartAlpha = 1.0;
        if (t < 0.6) {
            heartAlpha = Math.min(1.0, t / 0.6);
        } else if (t > 3.8) {
            heartAlpha = Math.max(0, 1.0 - (t - 3.8) / 0.7);
        }
        if (heartAlpha <= 0.01) {
            ctx.restore();
            return;
        }

        const cx = this.width / 2;
        const cy = this.height / 2 - 25;
        const scale = Math.min(this.width, this.height) * 0.016 * heartPulse;

        const drawHeartPath = (s) => {
            ctx.beginPath();
            const steps = 100;
            for (let i = 0; i <= steps; i++) {
                const angle = (i / steps) * Math.PI * 2;
                const x = 16 * Math.pow(Math.sin(angle), 3);
                const y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
                const px = cx + x * s;
                const py = cy + y * s;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
        };

        // 1. Soft ethereal inner heart glow
        ctx.globalAlpha = heartAlpha * 0.22;
        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 260 * (scale / 12));
        grad.addColorStop(0, 'rgba(255, 90, 140, 0.7)');
        grad.addColorStop(0.5, 'rgba(255, 180, 210, 0.25)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        drawHeartPath(scale);
        ctx.fill();

        // 2. Glowing Rose & Diamond Neon Contour
        ctx.shadowColor = 'rgba(255, 120, 170, 0.95)';
        ctx.shadowBlur = 24;
        ctx.strokeStyle = `rgba(255, 220, 235, ${(heartAlpha * 0.9).toFixed(2)})`;
        ctx.lineWidth = 2.5;
        drawHeartPath(scale);
        ctx.stroke();

        // 3. Crisp Diamond White Inner Core Outline
        ctx.shadowColor = 'rgba(255, 255, 255, 1.0)';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = `rgba(255, 255, 255, ${(heartAlpha * 0.95).toFixed(2)})`;
        ctx.lineWidth = 1.2;
        drawHeartPath(scale);
        ctx.stroke();

        ctx.restore();
    }

    drawDiamondSparkles(ctx, t) {
        const curScene = this.scenes[this.currentSceneIndex];
        const isPortrait = curScene && curScene.type === 'portrait';
        const brilliance = this.config.diamondBrilliance || 1.0;

        ctx.shadowBlur = (isPortrait ? 16 : 12) * brilliance;
        ctx.shadowColor = isPortrait ? 'rgba(215, 245, 255, 1.0)' : 'rgba(255, 255, 255, 1.0)';
        ctx.fillStyle = '#ffffff';

        for (let sp of this.sparklePoints) {
            const cycle = Math.sin(t * sp.speed * 60 + sp.phase);
            if (cycle > 0.25) {
                const flareSize = sp.maxSize * Math.pow(cycle, 1.8) * (isPortrait ? brilliance : 1.0);
                const alpha = Math.min(1.0, (cycle - 0.25) * 1.5) * (isPortrait ? Math.min(1.0, brilliance) : 1.0);

                ctx.globalAlpha = alpha;
                ctx.save();
                ctx.translate(sp.x, sp.y);
                
                if (sp.rot !== undefined) {
                    ctx.rotate(sp.rot + t * sp.rotSpeed);
                }

                if (sp.isDiamond) {
                    // 8-Point Brilliant Cut Diamond Star
                    // Primary Cardinal Spikes
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.moveTo(-flareSize * 0.12, 0);
                    ctx.lineTo(0, -flareSize);
                    ctx.lineTo(flareSize * 0.12, 0);
                    ctx.lineTo(0, flareSize);
                    ctx.closePath();
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(0, -flareSize * 0.12);
                    ctx.lineTo(-flareSize, 0);
                    ctx.lineTo(0, flareSize * 0.12);
                    ctx.lineTo(flareSize, 0);
                    ctx.closePath();
                    ctx.fill();

                    // Secondary Diagonal Facet Spikes (45 degrees) with Prismatic Hue
                    const diagSize = flareSize * 0.55;
                    ctx.fillStyle = 'rgba(215, 240, 255, 0.9)';

                    ctx.beginPath();
                    ctx.moveTo(-diagSize * 0.08, -diagSize * 0.08);
                    ctx.lineTo(diagSize * 0.7, -diagSize * 0.7);
                    ctx.lineTo(diagSize * 0.08, diagSize * 0.08);
                    ctx.lineTo(-diagSize * 0.7, diagSize * 0.7);
                    ctx.closePath();
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(-diagSize * 0.08, diagSize * 0.08);
                    ctx.lineTo(diagSize * 0.7, diagSize * 0.7);
                    ctx.lineTo(diagSize * 0.08, -diagSize * 0.08);
                    ctx.lineTo(-diagSize * 0.7, -diagSize * 0.7);
                    ctx.closePath();
                    ctx.fill();

                    // Center Radiant Diamond Jewel Glint
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(0, 0, flareSize * 0.28, 0, Math.PI * 2);
                    ctx.fill();

                    // Delicate Prismatic Refraction Ring
                    ctx.strokeStyle = 'rgba(180, 230, 255, 0.6)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(0, 0, flareSize * 0.45, 0, Math.PI * 2);
                    ctx.stroke();

                } else {
                    // Standard 4-point Star
                    ctx.beginPath();
                    ctx.moveTo(-flareSize * 0.15, 0);
                    ctx.lineTo(0, -flareSize);
                    ctx.lineTo(flareSize * 0.15, 0);
                    ctx.lineTo(0, flareSize);
                    ctx.closePath();
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(0, -flareSize * 0.15);
                    ctx.lineTo(-flareSize, 0);
                    ctx.lineTo(0, flareSize * 0.15);
                    ctx.lineTo(flareSize, 0);
                    ctx.closePath();
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(0, 0, flareSize * 0.25, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }
        }
    }

    drawDiamondGlitter(ctx, t) {
        ctx.save();
        const brilliance = this.config.diamondBrilliance || 1.0;
        ctx.shadowColor = 'rgba(210, 240, 255, 1.0)';
        ctx.shadowBlur = 10 * brilliance;
        ctx.fillStyle = '#ffffff';

        for (let g of this.diamondGlitter) {
            g.x += g.vx;
            g.y += g.vy;

            const tw = Math.sin(t * g.twinkleSpeed * 60 + g.phase);
            if (tw > 0.2) {
                const alpha = Math.min(1.0, (tw - 0.2) * 1.5) * g.baseAlpha * brilliance;
                ctx.globalAlpha = alpha;

                ctx.save();
                ctx.translate(g.x, g.y);
                ctx.rotate(g.phase + t * 0.5);

                const s = g.size * (0.8 + tw * 0.5) * brilliance;
                ctx.beginPath();
                ctx.moveTo(0, -s);
                ctx.lineTo(s * 0.3, 0);
                ctx.lineTo(0, s);
                ctx.lineTo(-s * 0.3, 0);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            }
        }
        ctx.restore();
    }

    drawTouchSparkles(ctx) {
        if (this.touchSparkles.length === 0) return;
        ctx.save();
        const brilliance = this.config.diamondBrilliance || 1.0;
        ctx.shadowColor = 'rgba(215, 245, 255, 1.0)';
        ctx.shadowBlur = 14 * brilliance;
        ctx.fillStyle = '#ffffff';

        for (let i = this.touchSparkles.length - 1; i >= 0; i--) {
            const sp = this.touchSparkles[i];
            sp.alpha -= sp.decay;
            if (sp.alpha <= 0) {
                this.touchSparkles.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = sp.alpha * brilliance;
            ctx.save();
            ctx.translate(sp.x, sp.y);
            ctx.rotate(sp.rot);

            const s = sp.size * brilliance;
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.lineTo(s * 0.25, -s * 0.25);
            ctx.lineTo(s, 0);
            ctx.lineTo(s * 0.25, s * 0.25);
            ctx.lineTo(0, s);
            ctx.lineTo(-s * 0.25, s * 0.25);
            ctx.lineTo(-s, 0);
            ctx.lineTo(-s * 0.25, -s * 0.25);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
        ctx.restore();
    }

    drawAmbientStars(ctx) {
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.fillStyle = '#ffffff';

        for (let star of this.ambientStars) {
            star.x += star.vx;
            star.y += star.vy;

            if (star.x < 0) star.x = this.width;
            if (star.x > this.width) star.x = 0;
            if (star.y < 0) star.y = this.height;
            if (star.y > this.height) star.y = 0;

            const twinkle = Math.sin(this.currentTime * 2 + star.twinklePhase) * 0.3;
            const alpha = Math.max(0.05, Math.min(0.9, star.baseAlpha + twinkle));

            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawFloatingPetals(ctx) {
        for (let petal of this.floatingPetals) {
            petal.y += petal.vy;
            petal.x += petal.vx + Math.sin(petal.y * 0.01) * 0.25;
            petal.rot += petal.rotSpeed;

            if (petal.y < -30) {
                petal.y = this.height + 30;
                petal.x = Math.random() * this.width;
            }

            ctx.save();
            ctx.translate(petal.x, petal.y);
            ctx.rotate(petal.rot);
            ctx.globalAlpha = petal.alpha;
            ctx.fillStyle = petal.hue + petal.alpha + ')';
            ctx.shadowBlur = 6;
            ctx.shadowColor = petal.hue + '0.6)';

            ctx.beginPath();
            ctx.ellipse(0, 0, petal.size * 0.6, petal.size, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    drawCandleEmbers(ctx) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255, 190, 80, 0.9)';
        ctx.fillStyle = '#ffe082';

        for (let ember of this.candleEmbers) {
            ember.y += ember.vy;
            ember.x += ember.vx + (Math.random() - 0.5) * 0.2;
            ember.life--;

            if (ember.life <= 0 || ember.y < this.height * 0.35) {
                ember.x = this.width * 0.5 + (Math.random() - 0.5) * 160;
                ember.y = this.height * 0.52 + Math.random() * 40;
                ember.life = Math.random() * 60 + 40;
            }

            const alpha = (ember.life / ember.maxLife) * ember.alpha;
            ctx.globalAlpha = Math.max(0, Math.min(1.0, alpha));
            ctx.beginPath();
            ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawTempleDiyaEmbers(ctx) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 160, 40, 0.95)';
        ctx.fillStyle = '#ffb300';

        for (let diya of this.templeDiyaEmbers) {
            diya.y += diya.vy;
            diya.x += diya.vx + Math.sin(diya.y * 0.02) * 0.3;
            diya.life--;

            if (diya.life <= 0 || diya.y < this.height * 0.45) {
                diya.x = Math.random() * this.width;
                diya.y = this.height * 0.75 + Math.random() * (this.height * 0.15);
                diya.life = Math.random() * 50 + 30;
            }

            const alpha = (diya.life / diya.maxLife) * diya.alpha;
            ctx.globalAlpha = Math.max(0, Math.min(1.0, alpha));
            ctx.beginPath();
            ctx.arc(diya.x, diya.y, diya.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    startRecording() {
        if (this.isRecording) return;
        
        try {
            const stream = this.canvas.captureStream(60);
            
            let options = { mimeType: 'video/webm;codecs=vp9' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm' };
            }
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = {};
            }

            this.mediaRecorder = new MediaRecorder(stream, options);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.recordedChunks.push(e.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder.mimeType || 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `our_complete_love_story_gift_${Date.now()}.webm`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);

                const recordBtn = document.getElementById('recordBtn');
                if (recordBtn) {
                    recordBtn.innerHTML = '📹 Record & Export Video';
                    recordBtn.classList.remove('recording-pulse');
                }
                this.isRecording = false;
                alert('✨ Love Story Gift video generated and saved to your Downloads!');
            };

            this.mediaRecorder.start();
            this.isRecording = true;

            // Start from Act 1
            this.setFullMovieMode(true);

            const recordBtn = document.getElementById('recordBtn');
            if (recordBtn) {
                recordBtn.innerHTML = '🔴 Recording 5-Act Film...';
                recordBtn.classList.add('recording-pulse');
            }

        } catch (err) {
            console.error('Error starting video recording:', err);
            alert('Video recording not supported: ' + err.message);
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
    }
}

function initConstellationEngine() {
    if (!window.engine) {
        window.engine = new ConstellationEngine();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConstellationEngine);
} else {
    initConstellationEngine();
}

// Global fail-safe hook for proposal acceptance
window.acceptProposal = function() {
    if (window.engine && typeof window.engine.acceptProposal === 'function') {
        window.engine.acceptProposal();
    }
};
