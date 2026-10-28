/**
 * UI Controls, Event Listeners, and Fullscreen Management
 */

document.addEventListener('DOMContentLoaded', () => {
    const engine = window.engine;
    const soundscape = window.soundscape;

    // Elements
    const playPauseBtn = document.getElementById('playPauseBtn');
    const replayBtn = document.getElementById('replayBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const topFullscreenBtn = document.getElementById('topFullscreenBtn');
    const audioBtn = document.getElementById('audioBtn');
    const recordBtn = document.getElementById('recordBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const timelineTrack = document.getElementById('timelineTrack');

    // Settings Inputs
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const dropZone = document.getElementById('dropZone');
    const captionInput = document.getElementById('captionInput');
    const romanticCaption = document.getElementById('romanticCaption');
    const focusSlider = document.getElementById('focusSlider');
    const focusVal = document.getElementById('focusVal');
    const densitySlider = document.getElementById('densitySlider');
    const densityVal = document.getElementById('densityVal');
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeVal = document.getElementById('sizeVal');
    const thresholdSlider = document.getElementById('thresholdSlider');
    const thresholdVal = document.getElementById('thresholdVal');
    const invertCheck = document.getElementById('invertCheck');

    // Auto-hide HUD on user idle (cinema blackout experience)
    let idleTimeout = null;
    function resetIdleTimer() {
        document.body.classList.remove('cinema-idle');
        clearTimeout(idleTimeout);
        // If settings modal is open, don't hide
        if (settingsModal.classList.contains('active')) return;
        
        idleTimeout = setTimeout(() => {
            document.body.classList.add('cinema-idle');
        }, 3500);
    }

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    resetIdleTimer();

    // Play / Pause
    playPauseBtn.addEventListener('click', () => {
        engine.togglePlayPause();
    });

    // Replay
    replayBtn.addEventListener('click', () => {
        engine.restartVideo();
    });

    // Timeline Scrubbing
    let isScrubbing = false;
    function handleScrub(e) {
        const rect = timelineTrack.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        engine.seek(pos * engine.duration);
    }

    timelineTrack.addEventListener('mousedown', (e) => {
        isScrubbing = true;
        handleScrub(e);
    });

    window.addEventListener('mousemove', (e) => {
        if (isScrubbing) handleScrub(e);
    });

    window.addEventListener('mouseup', () => {
        isScrubbing = false;
    });

    // Fullscreen Toggle
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
    if (topFullscreenBtn) topFullscreenBtn.addEventListener('click', toggleFullscreen);

    // Audio Synthesizer toggle
    audioBtn.addEventListener('click', () => {
        const isMuted = soundscape.toggleMute();
        audioBtn.innerHTML = isMuted ? '🔇 Audio: Off' : '🎵 Audio: Romantic';
    });

    // Record Video
    recordBtn.addEventListener('click', () => {
        engine.startRecording();
    });

    // Settings Modal
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
        document.body.classList.remove('cinema-idle');
        clearTimeout(idleTimeout);
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
        resetIdleTimer();
    });

    // Scene Selector Bar Handlers
    const movieModeBtn = document.getElementById('movieModeBtn');
    if (movieModeBtn) {
        movieModeBtn.addEventListener('click', () => {
            engine.setFullMovieMode(true);
        });
    }

    document.querySelectorAll('.scene-tab[data-scene]').forEach(tab => {
        tab.addEventListener('click', () => {
            const idx = parseInt(tab.getAttribute('data-scene'));
            engine.setFullMovieMode(false);
            engine.setActiveScene(idx, true);
        });
    });

    // File Upload handling
    uploadBtn.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('click', () => fileInput.click());

    function handleImageFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select a valid image file (JPG, PNG, WEBP).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                engine.sceneImages['portrait'] = img;
                engine.processScene(engine.scenes[2], img);
                engine.setActiveScene(2, true);
            };
            img.src = e.target.result;
            settingsModal.classList.remove('active');
            resetIdleTimer();
        };
        reader.readAsDataURL(file);
    }

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleImageFile(e.target.files[0]);
        }
    });

    // Drag and Drop
    ['dragenter', 'dragover'].forEach(eventName => {
        window.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
            document.body.classList.remove('cinema-idle');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        window.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        }, false);
    });

    window.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });

    // Caption Input
    captionInput.addEventListener('input', (e) => {
        romanticCaption.textContent = e.target.value;
    });

    // Sliders
    if (focusSlider) {
        focusSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            engine.scenes[2].focusFalloff = val / 100;
            focusVal.textContent = val + '%';
            engine.reprocessAllScenes();
        });
    }

    densitySlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        engine.config.dotDensity = val;
        engine.scenes.forEach(s => s.dotDensity = val);
        densityVal.textContent = val.toLocaleString();
        engine.reprocessAllScenes();
    });

    sizeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        engine.config.particleSize = val;
        sizeVal.textContent = val.toFixed(1) + 'px';
        engine.reprocessAllScenes();
    });

    thresholdSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        engine.config.threshold = val;
        thresholdVal.textContent = val;
        engine.reprocessAllScenes();
    });

    invertCheck.addEventListener('change', (e) => {
        engine.config.invertLuminance = e.target.checked;
        engine.reprocessAllScenes();
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;

        if (e.code === 'Space') {
            e.preventDefault();
            engine.togglePlayPause();
        } else if (e.code === 'KeyF') {
            toggleFullscreen();
        } else if (e.code === 'KeyR') {
            engine.restartVideo();
        } else if (e.code === 'KeyM') {
            audioBtn.click();
        } else if (e.code === 'Escape') {
            settingsModal.classList.remove('active');
        }
    });

    // Auto-start audio on first user click anywhere (browser autoplay policy)
    window.addEventListener('click', () => {
        if (!soundscape.isPlaying && !soundscape.isMuted) {
            soundscape.start();
        }
    }, { once: true });
});
