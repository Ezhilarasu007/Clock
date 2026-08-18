// Main Application Orchestration, View Router, Live Clocks & Controls
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize 3D Scene
    const countryData = window.CountryData || [];
    const scene = new HourglassScene('canvas-container', countryData);
    
    // Default Selected Country (India or first)
    let selectedCountry = countryData.find(c => c.code === 'IN') || countryData[0];
    
    // 2. Initialize Modal Manager
    const modals = new ModalManager(
        countryData,
        (country) => selectCountry(country),
        (preset) => scene.setQualityPreset(preset)
    );

    // 3. Navigation View Routing
    const viewTabs = document.querySelectorAll('.nav-tab');
    const viewPanels = document.querySelectorAll('.view-panel');
    let currentView = 'world-clock';

    viewTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetView = tab.dataset.view;
            switchView(targetView);
        });
    });

    function switchView(viewId) {
        currentView = viewId;
        viewTabs.forEach(t => t.classList.toggle('active', t.dataset.view === viewId));
        viewPanels.forEach(p => p.classList.toggle('active', p.id === `view-${viewId}`));
        
        if (window.AudioEngine) window.AudioEngine.playClickSound();

        // Adjust camera target or view specific highlights
        if (viewId === 'time-loop') {
            scene.highlightCountry(-1); // Reset highlight for pure visual mode
        } else if (viewId === 'world-flags') {
            const countryIdx = countryData.findIndex(c => c.code === selectedCountry.code);
            scene.highlightCountry(countryIdx);
        }
    }

    // 4. Country Selection Handler
    function selectCountry(country) {
        selectedCountry = country;
        updateCountryDisplays();
        const idx = countryData.findIndex(c => c.code === country.code);
        scene.highlightCountry(idx);
    }

    function updateCountryDisplays() {
        // Update View 1 (World Clock)
        const clockCountryName = document.getElementById('wc-country-name');
        const clockCapital = document.getElementById('wc-capital');
        const clockTimezone = document.getElementById('wc-timezone');
        const clockUtc = document.getElementById('wc-utc');
        const clockFlag = document.getElementById('wc-flag-icon');

        if (clockCountryName) clockCountryName.innerText = selectedCountry.name;
        if (clockCapital) clockCapital.innerText = selectedCountry.capital;
        if (clockTimezone) clockTimezone.innerText = selectedCountry.timezone;
        if (clockUtc) clockUtc.innerText = `UTC ${selectedCountry.offset}`;
        if (clockFlag) clockFlag.innerText = modals.getEmojiFlag(selectedCountry.code);

        // Update View 2 (World Flags)
        const flagName = document.getElementById('wf-country-name');
        const flagCapital = document.getElementById('wf-capital');
        const flagContinent = document.getElementById('wf-continent');
        const flagTz = document.getElementById('wf-tz');
        const flagIcon = document.getElementById('wf-flag-icon');

        if (flagName) flagName.innerText = selectedCountry.name;
        if (flagCapital) flagCapital.innerText = selectedCountry.capital;
        if (flagContinent) flagContinent.innerText = selectedCountry.continent;
        if (flagTz) flagTz.innerText = selectedCountry.offset;
        if (flagIcon) flagIcon.innerText = modals.getEmojiFlag(selectedCountry.code);
    }

    // 5. Live Clocks & Telemetry Update Loop
    function updateTelemetry() {
        const now = new Date();
        
        // World Clock Local Time for Selected Country
        const localTimeStr = now.toLocaleTimeString('en-US', { timeZone: selectedCountry.timezone, hour12: false });
        const localDateStr = now.toLocaleDateString('en-US', { timeZone: selectedCountry.timezone, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const utcTimeStr = now.toUTCString().split(' ')[4] + ' UTC';

        const digitalClock = document.getElementById('wc-digital-clock');
        const digitalDate = document.getElementById('wc-digital-date');
        const utcClock = document.getElementById('wc-utc-clock');
        const flagLocalTime = document.getElementById('wf-local-time');

        if (digitalClock) digitalClock.innerText = localTimeStr;
        if (digitalDate) digitalDate.innerText = localDateStr;
        if (utcClock) utcClock.innerText = utcTimeStr;
        if (flagLocalTime) flagLocalTime.innerText = localTimeStr;

        // Analog Clock Hands (View 1)
        const hoursHand = document.getElementById('analog-hours');
        const minutesHand = document.getElementById('analog-minutes');
        const secondsHand = document.getElementById('analog-seconds');

        if (hoursHand && minutesHand && secondsHand) {
            // Get local hours/minutes/seconds for timezone
            const parts = new Intl.DateTimeFormat('en-US', { timeZone: selectedCountry.timezone, hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }).formatToParts(now);
            const h = parseInt(parts.find(p => p.type === 'hour').value) % 12;
            const m = parseInt(parts.find(p => p.type === 'minute').value);
            const s = parseInt(parts.find(p => p.type === 'second').value);

            const sDeg = (s / 60) * 360;
            const mDeg = ((m + s / 60) / 60) * 360;
            const hDeg = ((h + m / 60) / 12) * 360;

            secondsHand.style.transform = `rotate(${sDeg}deg)`;
            minutesHand.style.transform = `rotate(${mDeg}deg)`;
            hoursHand.style.transform = `rotate(${hDeg}deg)`;
        }

        // Time Loop View Telemetry (View 3)
        const phys = scene.physics;
        const totalP = phys.particleCount;
        const passedP = phys.particlesPassed;
        const progressPct = Math.min(100, Math.floor((passedP / totalP) * 100));

        const particleCountEl = document.getElementById('tl-particle-count');
        const cycleEl = document.getElementById('tl-current-cycle');
        const progressEl = document.getElementById('tl-cycle-progress');
        const statusEl = document.getElementById('tl-status');
        const flowRateEl = document.getElementById('tl-flow-rate');

        if (particleCountEl) particleCountEl.innerText = totalP.toLocaleString();
        if (cycleEl) cycleEl.innerText = `#${phys.currentCycle}`;
        if (progressEl) progressEl.innerText = `${progressPct}%`;
        if (statusEl) statusEl.innerText = phys.isFlipping ? '⏳ Flipping 180°' : (phys.isPaused ? '⏸ Paused' : '▶ Sand Flowing');
        if (flowRateEl) flowRateEl.innerText = phys.isFlipping ? '0.0 /s' : `${Math.floor(passedP * 0.08)} /s`;

        requestAnimationFrame(updateTelemetry);
    }
    updateTelemetry();

    // 6. Bottom Dock Controls
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnRestart = document.getElementById('btn-restart');
    const btnSlowMo = document.getElementById('btn-slow-mo');
    const btnCountries = document.getElementById('btn-countries');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const btnSound = document.getElementById('btn-sound');

    if (btnPlayPause) {
        btnPlayPause.addEventListener('click', () => {
            scene.physics.isPaused = !scene.physics.isPaused;
            btnPlayPause.innerHTML = scene.physics.isPaused ? '▶ Play' : '⏯ Pause';
            if (window.AudioEngine) window.AudioEngine.playClickSound();
        });
    }

    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            scene.physics.initParticles();
            if (window.AudioEngine) window.AudioEngine.playClickSound();
        });
    }

    if (btnSlowMo) {
        btnSlowMo.addEventListener('click', () => {
            const isSlow = scene.physics.slowMotionFactor < 1.0;
            scene.physics.slowMotionFactor = isSlow ? 1.0 : 0.25;
            btnSlowMo.classList.toggle('active', !isSlow);
            if (window.AudioEngine) window.AudioEngine.playClickSound();
        });
    }

    if (btnCountries) {
        btnCountries.addEventListener('click', () => {
            modals.open('country-explorer', selectedCountry.code);
        });
    }

    if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
            if (window.AudioEngine) window.AudioEngine.playClickSound();
        });
    }

    if (btnSound) {
        btnSound.addEventListener('click', () => {
            window.AudioEngine.init();
            const isMuted = window.AudioEngine.toggleMute();
            btnSound.innerHTML = isMuted ? '🔇 Muted' : '🔊 Sound';
        });
    }

    // Header Links & Legal Footer Binding
    document.getElementById('link-privacy')?.addEventListener('click', (e) => { e.preventDefault(); modals.open('privacy'); });
    document.getElementById('link-terms')?.addEventListener('click', (e) => { e.preventDefault(); modals.open('terms'); });
    document.getElementById('link-about')?.addEventListener('click', (e) => { e.preventDefault(); modals.open('about'); });
    document.getElementById('link-contact')?.addEventListener('click', (e) => { e.preventDefault(); modals.open('contact'); });
    document.getElementById('btn-settings-header')?.addEventListener('click', () => modals.open('settings'));
    document.getElementById('wc-select-country-btn')?.addEventListener('click', () => modals.open('country-explorer', selectedCountry.code));
    document.getElementById('wf-explore-btn')?.addEventListener('click', () => modals.open('country-explorer', selectedCountry.code));

    // Camera Preset Buttons in Time Loop view
    document.querySelectorAll('.cam-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.cam;
            if (preset === 'front') scene.camera.position.set(0, 0, 9.5);
            if (preset === 'top') scene.camera.position.set(0, 9.5, 0.1);
            if (preset === 'close') scene.camera.position.set(0, 0, 4.8);
            scene.controls.target.set(0, 0, 0);
            if (window.AudioEngine) window.AudioEngine.playClickSound();
        });
    });

    // Start Audio Context on First Gesture
    document.body.addEventListener('pointerdown', () => {
        window.AudioEngine.init();
    }, { once: true });

    // Initial Display Population
    updateCountryDisplays();
});
