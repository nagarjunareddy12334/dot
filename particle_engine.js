/**
 * Ultra-Romantic White Dot Constellation Particle Engine
 * Features:
 * - Cosmic Black Void -> Pulsating Celestial Heart -> Graceful Blooming Reveal into Her Portrait
 * - Smart subject focus & background suppression for her face, smile, and jewelry
 * - Diamond / Cross-Star twinkling flares on her earrings and necklace
 * - Floating glowing rose petals and stardust
 * - 60 FPS Canvas capture & direct video file recording
 */

class ConstellationEngine {
    constructor() {
        this.canvas = document.getElementById('cinemaCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // State
        this.particles = [];
        this.ambientStars = [];
        this.floatingPetals = [];
        this.sparklePoints = [];
        this.imageLoaded = false;
        this.currentImage = null;
        
        // Video Timeline (Duration: 13 seconds)
        this.duration = 13.0; 
        this.currentTime = 0.0;
        this.isPlaying = true;
        this.lastFrameTime = performance.now();
        this.playbackRate = 1.0;
        
        // Config settings
        this.config = {
            dotDensity: 14000,       // Total particles target
            particleSize: 1.6,       // Base dot size
            glowIntensity: 7,        // Shadow blur glow
            threshold: 38,           // Luminance cutoff
            focusFalloff: 0.85,      // Subject radial focus (suppresses background door/floor)
            showPetals: true,        // Floating glowing rose petals
            showSparkles: true,      // Diamond twinkle on jewelry & eyes
            heartSequence: true,     // Heart-first reveal sequence
            rippleStrength: 110,     // Mouse interactive ripple distance
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
            if (this.currentImage) this.processImage(this.currentImage);
        });

        // Initialize ambient background stars and floating petals
        this.createAmbientStars();
        this.createFloatingPetals();

        // Mouse & Touch interaction
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.mouse.active = true;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.active = false;
        });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
                this.mouse.active = true;
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.mouse.active = false;
        });

        // Load default photo
        this.loadInitialPhoto();

        // Start render loop
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
        const count = 130;
        for (let i = 0; i < count; i++) {
            this.ambientStars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 1.2 + 0.3,
                baseAlpha: Math.random() * 0.4 + 0.1,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.06,
                vy: (Math.random() - 0.5) * 0.06
            });
        }
    }

    createFloatingPetals() {
        this.floatingPetals = [];
        const count = 28;
        for (let i = 0; i < count; i++) {
            this.floatingPetals.push({
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + Math.random() * 200,
                size: Math.random() * 4 + 3,
                alpha: Math.random() * 0.35 + 0.15,
                vy: -(Math.random() * 0.4 + 0.25),
                vx: (Math.random() - 0.5) * 0.3,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.015,
                hue: Math.random() > 0.4 ? 'rgba(255, 180, 200,' : 'rgba(255, 255, 255,'
            });
        }
    }

    loadInitialPhoto() {
        const img = new Image();
        img.onload = () => {
            this.currentImage = img;
            this.processImage(img);
        };
        if (window.DEFAULT_PHOTO_BASE64) {
            img.src = window.DEFAULT_PHOTO_BASE64;
        } else {
            img.src = 'girlfriend.jpg';
        }
    }

    loadCustomPhoto(source) {
        const img = new Image();
        img.onload = () => {
            this.currentImage = img;
            this.processImage(img);
            this.restartVideo();
        };
        img.src = source;
    }

    /**
     * Parametric Heart coordinate calculator
     */
    getHeartCoord(normIndex, scale = 11) {
        const angle = normIndex * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(angle), 3);
        const y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
        // Add subtle internal stardust volume
        const radialNoise = (0.7 + Math.random() * 0.35);
        return {
            x: this.width / 2 + x * scale * radialNoise,
            y: this.height / 2 - 30 + y * scale * radialNoise
        };
    }

    processImage(img) {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');

        // Scale portrait gracefully to fit nicely on the screen
        const maxWidth = this.width * 0.68;
        const maxHeight = this.height * 0.78;
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
            console.warn('Canvas security error reading image pixels:', e);
            return;
        }

        const data = imgData.data;
        const targetParticles = [];
        const sparkleCandidates = [];
        const offsetX = (this.width - drawWidth) / 2;
        const offsetY = (this.height - drawHeight) / 2 - 15;

        // Dynamic sampling step
        const totalPixels = drawWidth * drawHeight;
        const approxStep = Math.max(1, Math.round(Math.sqrt(totalPixels / (this.config.dotDensity * 1.6))));

        // Subject focal center (for Indian portrait: face is near top-center/right)
        const faceFocalX = drawWidth * 0.56;
        const faceFocalY = drawHeight * 0.30;
        const maxFocalDistX = drawWidth * 0.55;
        const maxFocalDistY = drawHeight * 0.65;

        let pIndex = 0;

        for (let y = 0; y < drawHeight; y += approxStep) {
            for (let x = 0; x < drawWidth; x += approxStep) {
                const idx = (y * drawWidth + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = data[idx + 3] / 255;

                // Perceived brightness
                let lum = (0.299 * r + 0.587 * g + 0.114 * b);

                // Smart subject falloff: gently fade distant doorway/edges to keep face & dress crisp
                const fdx = (x - faceFocalX) / maxFocalDistX;
                const fdy = (y - faceFocalY) / maxFocalDistY;
                const distFocal = Math.sqrt(fdx * fdx + fdy * fdy);
                const vignetteFactor = Math.max(0, 1.0 - Math.pow(distFocal, 2.5) * this.config.focusFalloff);

                lum = lum * vignetteFactor;

                if (lum > this.config.threshold && a > 0.25) {
                    const targetX = offsetX + x;
                    const targetY = offsetY + y;

                    // Cosmic galaxy origin (spiral around screen perimeter)
                    const spiralAngle = Math.random() * Math.PI * 2;
                    const spiralDist = Math.max(this.width, this.height) * (0.65 + Math.random() * 0.8);
                    const startX = this.width / 2 + Math.cos(spiralAngle) * spiralDist;
                    const startY = this.height / 2 + Math.sin(spiralAngle) * spiralDist;

                    // Heart shape position for Phase 2
                    const heartPos = this.getHeartCoord(pIndex % 1000 / 1000, Math.min(this.width, this.height) * 0.022);

                    const normLum = (lum - this.config.threshold) / (255 - this.config.threshold);
                    const dotSize = Math.max(0.6, (normLum * this.config.particleSize * 1.3) + 0.35);

                    // Detect bright highlights (jewelry, bindi, eyes, smile) for diamond sparkle
                    if (lum > 175 && y < drawHeight * 0.65) {
                        sparkleCandidates.push({ x: targetX, y: targetY, lum: normLum });
                    }

                    targetParticles.push({
                        // Current render coordinates
                        x: startX,
                        y: startY,
                        // Origin in outer cosmos
                        startX: startX,
                        startY: startY,
                        // Cosmic heart coordinate
                        heartX: heartPos.x,
                        heartY: heartPos.y,
                        // Destination on her portrait
                        targetX: targetX,
                        targetY: targetY,
                        // Visual attributes
                        size: dotSize,
                        baseAlpha: Math.min(1.0, 0.25 + normLum * 0.75),
                        colorLuminance: normLum,
                        // Timings for graceful organic reveal
                        staggerDelay: Math.random() * 1.2,
                        twinkleSpeed: 0.02 + Math.random() * 0.035,
                        twinklePhase: Math.random() * Math.PI * 2,
                        floatAngle: Math.random() * Math.PI * 2,
                        floatSpeed: 0.006 + Math.random() * 0.012,
                        floatRadius: 0.7 + Math.random() * 1.2,
                        // Disturbance velocities
                        vx: 0,
                        vy: 0
                    });

                    pIndex++;
                }
            }
        }

        this.particles = targetParticles;

        // Pick 15-20 most dazzling sparkle points (earrings, smile, necklace)
        this.sparklePoints = [];
        sparkleCandidates.sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(18, sparkleCandidates.length); i++) {
            this.sparklePoints.push({
                x: sparkleCandidates[i].x,
                y: sparkleCandidates[i].y,
                phase: Math.random() * Math.PI * 2,
                speed: 0.04 + Math.random() * 0.03,
                maxSize: 6 + Math.random() * 6
            });
        }

        this.imageLoaded = true;
    }

    restartVideo() {
        this.currentTime = 0.0;
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
        this.currentTime = Math.max(0, Math.min(this.duration, timeSeconds));
        this.lastFrameTime = performance.now();
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

        if (this.isPlaying) {
            this.currentTime += dt * this.playbackRate;
            if (this.currentTime >= this.duration) {
                if (this.config.autoReplay && !this.isRecording) {
                    this.currentTime = 0;
                } else if (this.isRecording) {
                    this.stopRecording();
                    this.isPlaying = false;
                } else {
                    this.currentTime = this.duration;
                    this.isPlaying = false;
                    this.updatePlayPauseUI();
                }
            }
        }

        this.updateUIProgress();
        this.drawScene();
    }

    updateUIProgress() {
        const progressBar = document.getElementById('timelineProgress');
        const timeDisplay = document.getElementById('timeDisplay');
        if (progressBar) {
            const pct = (this.currentTime / this.duration) * 100;
            progressBar.style.width = `${pct}%`;
        }
        if (timeDisplay) {
            const curSec = Math.floor(this.currentTime);
            const curMs = Math.floor((this.currentTime % 1) * 10);
            timeDisplay.textContent = `00:${curSec < 10 ? '0' : ''}${curSec}.${curMs} / 00:13.0`;
        }

        // Romantic Caption visibility (fades in as portrait crystallizes)
        const captionEl = document.getElementById('romanticCaption');
        if (captionEl) {
            if (this.currentTime >= 8.2) {
                const alpha = Math.min(1.0, (this.currentTime - 8.2) / 2.0);
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

        // OLED True Black
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        // Draw ambient starfield
        this.drawAmbientStars(ctx);

        // Draw floating rose petals & stardust
        if (this.config.showPetals) {
            this.drawFloatingPetals(ctx);
        }

        if (!this.imageLoaded || this.particles.length === 0) {
            return;
        }

        const t = this.currentTime;
        const rippleDist = this.config.rippleStrength;
        const rippleDistSq = rippleDist * rippleDist;

        // Glow bloom setup
        ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
        ctx.shadowBlur = this.config.glowIntensity;
        ctx.fillStyle = '#ffffff';

        // Heartbeat pulse factor for Phase 2
        let heartPulse = 1.0;
        if (t >= 2.0 && t < 4.2) {
            // Two gentle beats
            const beat1 = Math.max(0, Math.sin((t - 2.0) * Math.PI * 4));
            const beat2 = Math.max(0, Math.sin((t - 3.2) * Math.PI * 4));
            heartPulse = 1.0 + (beat1 + beat2) * 0.12;
        }

        const breathTime = t * 1.5;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            let curX, curY, alpha;

            if (t < 1.0) {
                // Phase 0: Distant cosmos
                const preTime = t * 0.4;
                curX = p.startX + Math.sin(preTime + p.twinklePhase) * 10;
                curY = p.startY + Math.cos(preTime + p.twinklePhase) * 10;
                alpha = Math.max(0, Math.sin(p.twinklePhase + t * 2)) * 0.1;

            } else if (t < 4.2) {
                // Phase 1 & 2: Swarm into pulsating Celestial Heart!
                const progressToHeart = Math.min(1.0, (t - 1.0) / 2.2);
                const easeHeart = this.easeInOutQuad(progressToHeart);

                // Swirl into heart
                const swirlAngle = (1.0 - progressToHeart) * 3.5;
                const hx = (p.heartX - this.width / 2) * heartPulse + this.width / 2;
                const hy = (p.heartY - (this.height / 2 - 30)) * heartPulse + (this.height / 2 - 30);

                const interX = p.startX + (hx - p.startX) * easeHeart;
                const interY = p.startY + (hy - p.startY) * easeHeart;

                // Add gentle orbital swirl
                curX = interX + Math.sin(swirlAngle + p.twinklePhase) * (1.0 - progressToHeart) * 50;
                curY = interY + Math.cos(swirlAngle + p.twinklePhase) * (1.0 - progressToHeart) * 50;

                alpha = progressToHeart * p.baseAlpha * (0.8 + Math.sin(t * 3 + p.twinklePhase) * 0.2);

            } else if (t < 8.6) {
                // Phase 3: The Heart blossoms and particles flow into HER PORTRAIT!
                const progressToFace = Math.min(1.0, (t - 4.2) / (3.6 + p.staggerDelay * 0.6));
                const easeFace = this.easeOutCubic(progressToFace);

                // Blossom deflection (particles expand outwards before landing)
                const deflect = Math.sin(progressToFace * Math.PI) * 40;
                const travelAngle = Math.atan2(p.targetY - p.heartY, p.targetX - p.heartX) + Math.PI / 2;

                curX = p.heartX + (p.targetX - p.heartX) * easeFace + Math.cos(travelAngle) * deflect;
                curY = p.heartY + (p.targetY - p.heartY) * easeFace + Math.sin(travelAngle) * deflect;

                alpha = 0.5 + easeFace * 0.5 * p.baseAlpha;

            } else {
                // Phase 4: Crystallized into her radiant smiling portrait!
                p.floatAngle += p.floatSpeed;
                const floatOffset = Math.sin(p.floatAngle + breathTime) * p.floatRadius;
                
                curX = p.targetX + Math.cos(p.floatAngle) * floatOffset;
                curY = p.targetY + Math.sin(p.floatAngle) * floatOffset;

                // Twinkle
                const twinkle = Math.sin(t * 3.0 + p.twinklePhase) * 0.18;
                alpha = Math.max(0.25, Math.min(1.0, p.baseAlpha + twinkle));

                // Mouse / Touch ripple disturbance
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
                curX += p.vx;
                curY += p.vy;
            }

            p.x = curX;
            p.y = curY;

            // Draw particle
            if (alpha > 0.02) {
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(curX, curY, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw diamond lens-flare sparkles on her jewelry & eyes
        if (this.config.showSparkles && t >= 7.8) {
            this.drawDiamondSparkles(ctx, t);
        }

        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
    }

    /**
     * Dazzling 4-point Diamond Cross-Star sparkle (✦)
     */
    drawDiamondSparkles(ctx, t) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(255, 255, 255, 1.0)';
        ctx.fillStyle = '#ffffff';

        for (let sp of this.sparklePoints) {
            const cycle = Math.sin(t * 3.5 + sp.phase);
            if (cycle > 0.3) {
                const flareSize = sp.maxSize * Math.pow(cycle, 2);
                const alpha = Math.min(1.0, (cycle - 0.3) * 1.5);

                ctx.globalAlpha = alpha;
                ctx.save();
                ctx.translate(sp.x, sp.y);

                // Draw 4-point cross star
                ctx.beginPath();
                // Vertical flare
                ctx.moveTo(-flareSize * 0.15, 0);
                ctx.lineTo(0, -flareSize);
                ctx.lineTo(flareSize * 0.15, 0);
                ctx.lineTo(0, flareSize);
                ctx.closePath();
                ctx.fill();

                // Horizontal flare
                ctx.beginPath();
                ctx.moveTo(0, -flareSize * 0.15);
                ctx.lineTo(-flareSize, 0);
                ctx.lineTo(0, flareSize * 0.15);
                ctx.lineTo(flareSize, 0);
                ctx.closePath();
                ctx.fill();

                // Center diamond dot
                ctx.beginPath();
                ctx.arc(0, 0, flareSize * 0.25, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }
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

            // Draw delicate petal oval
            ctx.beginPath();
            ctx.ellipse(0, 0, petal.size * 0.6, petal.size, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
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
                a.download = `my_girlfriends_constellation_${Date.now()}.webm`;
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
                alert('✨ Video generated and saved successfully to your Downloads!');
            };

            this.mediaRecorder.start();
            this.isRecording = true;

            this.restartVideo();

            const recordBtn = document.getElementById('recordBtn');
            if (recordBtn) {
                recordBtn.innerHTML = '🔴 Recording Video... (13s)';
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

window.addEventListener('DOMContentLoaded', () => {
    window.engine = new ConstellationEngine();
});
