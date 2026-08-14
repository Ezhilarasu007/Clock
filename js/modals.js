// Modal Dialogs Manager: Privacy Policy, Terms & Conditions, About, Contact, Country Explorer, and Settings
class ModalManager {
    constructor(countryData, onSelectCountry, onQualityChange) {
        this.countryData = countryData;
        this.onSelectCountry = onSelectCountry;
        this.onQualityChange = onQualityChange;
        
        this.activeModal = null;
        this.initDOM();
        this.bindEvents();
    }

    initDOM() {
        // Modal Container Element
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay hidden';
        this.overlay.id = 'modal-overlay';
        this.overlay.innerHTML = `
            <div class="modal-box glass-card" id="modal-box">
                <button class="modal-close-btn" id="modal-close-btn">&times;</button>
                <div class="modal-body" id="modal-body"></div>
            </div>
        `;
        document.body.appendChild(this.overlay);

        this.bodyContainer = document.getElementById('modal-body');
        this.closeBtn = document.getElementById('modal-close-btn');
    }

    bindEvents() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    }

    open(modalType, data = null) {
        if (window.AudioEngine) window.AudioEngine.playClickSound();
        this.overlay.classList.remove('hidden');
        this.bodyContainer.innerHTML = '';

        switch (modalType) {
            case 'country-explorer':
                this.renderCountryExplorer(data);
                break;
            case 'privacy':
                this.renderPrivacyPolicy();
                break;
            case 'terms':
                this.renderTerms();
                break;
            case 'about':
                this.renderAbout();
                break;
            case 'contact':
                this.renderContact();
                break;
            case 'settings':
                this.renderSettings();
                break;
        }
    }

    close() {
        if (window.AudioEngine) window.AudioEngine.playClickSound();
        this.overlay.classList.add('hidden');
    }

    renderCountryExplorer(selectedCode) {
        let html = `
            <h2 class="modal-title">🌍 World Country Explorer</h2>
            <p class="modal-subtitle">Select a nation to inspect local time, flag details, and highlight its particles in the 3D hourglass.</p>
            
            <div class="explorer-controls">
                <input type="text" id="country-search" placeholder="Search by country, capital or code..." class="glass-input" />
                <div class="continent-pills" id="continent-pills">
                    <button class="pill-btn active" data-continent="ALL">All</button>
                    <button class="pill-btn" data-continent="Asia">Asia</button>
                    <button class="pill-btn" data-continent="Europe">Europe</button>
                    <button class="pill-btn" data-continent="North America">N. America</button>
                    <button class="pill-btn" data-continent="South America">S. America</button>
                    <button class="pill-btn" data-continent="Africa">Africa</button>
                    <button class="pill-btn" data-continent="Oceania">Oceania</button>
                </div>
            </div>

            <div class="country-grid" id="country-grid"></div>
        `;
        this.bodyContainer.innerHTML = html;

        const grid = document.getElementById('country-grid');
        const searchInput = document.getElementById('country-search');
        const pills = document.getElementById('continent-pills');

        const populateGrid = (filterText = '', continent = 'ALL') => {
            grid.innerHTML = '';
            const filtered = this.countryData.filter(c => {
                const matchesSearch = c.name.toLowerCase().includes(filterText.toLowerCase()) || 
                                     c.capital.toLowerCase().includes(filterText.toLowerCase()) ||
                                     c.code.toLowerCase().includes(filterText.toLowerCase());
                const matchesContinent = continent === 'ALL' || c.continent === continent;
                return matchesSearch && matchesContinent;
            });

            filtered.forEach(country => {
                const now = new Date();
                const timeString = now.toLocaleTimeString('en-US', { timeZone: country.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const isSelected = selectedCode === country.code;

                const card = document.createElement('div');
                card.className = `country-card ${isSelected ? 'selected' : ''}`;
                card.innerHTML = `
                    <div class="country-card-header">
                        <span class="country-flag-icon">${this.getEmojiFlag(country.code)}</span>
                        <span class="country-name">${country.name}</span>
                    </div>
                    <div class="country-card-details">
                        <div><span>Capital:</span> <strong>${country.capital}</strong></div>
                        <div><span>Continent:</span> ${country.continent}</div>
                        <div><span>Timezone:</span> ${country.offset} (UTC)</div>
                        <div class="live-time-tag"><span>Local Time:</span> <strong>${timeString}</strong></div>
                    </div>
                `;
                card.addEventListener('click', () => {
                    this.onSelectCountry(country);
                    this.close();
                });
                grid.appendChild(card);
            });
        };

        populateGrid();

        searchInput.addEventListener('input', (e) => populateGrid(e.target.value, this.activeContinent || 'ALL'));
        pills.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                pills.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.activeContinent = e.target.dataset.continent;
                populateGrid(searchInput.value, this.activeContinent);
            }
        });
    }

    renderPrivacyPolicy() {
        this.bodyContainer.innerHTML = `
            <h2 class="modal-title">🛡️ Privacy Policy</h2>
            <div class="modal-scrollable">
                <p><strong>Effective Date:</strong> August 13, 2026</p>
                <p>At <strong>Chrono-Sphere 3D</strong>, we are committed to respecting your digital privacy. This document details how information is handled when you interact with our WebGL 3D simulation website.</p>

                <h3>1. Information Collection</h3>
                <p>Chrono-Sphere operates primarily as a client-side WebGL application. We do NOT collect, harvest, store, or sell personal identifiers, IP addresses, or browser usage logs.</p>

                <h3>2. Local Browser Storage & Cookies</h3>
                <p>We use HTML5 LocalStorage solely to persist your client preferences (such as selected Graphics Quality preset, mute state, and preferred default country time zone). No tracking cookies are written or transmitted to external advertising networks.</p>

                <h3>3. WebGL & Device Telemetry</h3>
                <p>The application queries hardware parameters (such as device pixel ratio and GPU capabilities) strictly within your local browser runtime to automatically scale the physical particle simulation count for smooth 60 FPS performance.</p>

                <h3>4. Third-Party Scripts & Assets</h3>
                <p>All 3D assets, vector textures, WebGL rendering routines, and Web Audio API synthesizers run locally without external telemetry trackers or analytical scripts.</p>

                <h3>5. Contact & Data Inquiries</h3>
                <p>If you have questions regarding this Privacy Policy, feel free to submit an inquiry using our Contact Us interface.</p>
            </div>
        `;
    }

    renderTerms() {
        this.bodyContainer.innerHTML = `
            <h2 class="modal-title">📜 Terms & Conditions</h2>
            <div class="modal-scrollable">
                <p><strong>Last Updated:</strong> August 13, 2026</p>
                <p>Welcome to <strong>Chrono-Sphere 3D</strong>. By accessing or using this website, you agree to comply with the following Terms and Conditions.</p>

                <h3>1. Intellectual Property & License</h3>
                <p>The 3D hourglass simulation, custom vector flag generation systems, UI glassmorphism design code, and interactive visual scripts are protected by copyright laws. You are granted a personal, non-exclusive license to experience and view the interactive web app.</p>

                <h3>2. Simulation Accuracy Notice</h3>
                <p>While Chrono-Sphere incorporates real-world country time zones and physical particle simulation algorithms, the sand flow dynamics and time displays are intended for artistic, educational, and technological demonstration purposes.</p>

                <h3>3. Limitation of Liability</h3>
                <p>The website is provided "AS IS" without warranties of any kind. Under no circumstances shall the creators be liable for device performance issues resulting from operating maximum graphics presets on unsupported hardware.</p>

                <h3>4. Modifications</h3>
                <p>We reserve the right to update these terms at any time. Continued usage of Chrono-Sphere constitutes acceptance of all updated terms.</p>
            </div>
        `;
    }

    renderAbout() {
        this.bodyContainer.innerHTML = `
            <h2 class="modal-title">⏳ About Chrono-Sphere</h2>
            <div class="modal-scrollable">
                <p><strong>"An interactive miniature universe where time flows through the flags of every country."</strong></p>
                <p>Chrono-Sphere is an ultra-realistic 3D web showcase combining real-time WebGL physics, optical glass refraction, and world time telemetry into an infinitely looping 3D hourglass experience.</p>
                
                <h3>Key Technological Innovations:</h3>
                <ul>
                    <li><strong>Instanced Flag Spheres:</strong> Over 45 world country flag textures procedurally drawn onto 3D spherical sand particles using vector graphics.</li>
                    <li><strong>Physically Believable Sand Flow:</strong> Real-time bottleneck funneling, particle collision repulsion, piling, and continuous 180° gravity rotation loops.</li>
                    <li><strong>3 Visually Distinct Experiences:</strong> Seamlessly switch between World Clock mode, World Flags explorer mode, and cinematic Time Loop telemetry mode.</li>
                    <li><strong>Web Audio Engine:</strong> Synthesized ambient soundscapes that dynamically react to sand trickling and hourglass flipping.</li>
                </ul>
            </div>
        `;
    }

    renderContact() {
        this.bodyContainer.innerHTML = `
            <h2 class="modal-title">📬 Contact & Feedback</h2>
            <p class="modal-subtitle">Have questions, feedback, or technology inquiries? Send us a direct message below.</p>
            
            <form id="contact-form" class="contact-form">
                <div class="form-group">
                    <label>Your Name</label>
                    <input type="text" id="contact-name" class="glass-input" placeholder="e.g. Alex Mercer" required />
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="contact-email" class="glass-input" placeholder="alex@example.com" required />
                </div>
                <div class="form-group">
                    <label>Inquiry Topic</label>
                    <select id="contact-topic" class="glass-input">
                        <option value="feedback">General Feedback</option>
                        <option value="feature">Feature Request</option>
                        <option value="tech">Technology / WebGL Question</option>
                        <option value="business">Partnership Inquiry</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea id="contact-msg" class="glass-input" rows="4" placeholder="Type your message here..." required></textarea>
                </div>
                <button type="submit" class="submit-btn">Send Message 🚀</button>
            </form>
            <div id="contact-alert" class="contact-alert hidden"></div>
        `;

        const form = document.getElementById('contact-form');
        const alertBox = document.getElementById('contact-alert');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alertBox.className = 'contact-alert success';
            alertBox.innerHTML = '✨ Thank you! Your message has been received. We will get back to you shortly.';
            alertBox.classList.remove('hidden');
            form.reset();
        });
    }

    renderSettings() {
        this.bodyContainer.innerHTML = `
            <h2 class="modal-title">⚙️ Performance & Graphics Settings</h2>
            <div class="settings-form">
                <div class="setting-row">
                    <div>
                        <strong>Graphics & Simulation Preset</strong>
                        <p class="setting-desc">Adjust particle density and shadow precision for optimal performance.</p>
                    </div>
                    <select id="setting-quality" class="glass-input">
                        <option value="Low">Low (1,200 Particles)</option>
                        <option value="Medium" selected>Medium (2,200 Particles)</option>
                        <option value="High">High (3,500 Particles)</option>
                        <option value="Ultra">Ultra (5,000 Particles)</option>
                    </select>
                </div>
                <div class="setting-row">
                    <div>
                        <strong>Audio Soundscapes</strong>
                        <p class="setting-desc">Enable synthesized sand trickling and rotation audio SFX.</p>
                    </div>
                    <button id="setting-audio-btn" class="pill-btn">Toggle Mute / Unmute</button>
                </div>
            </div>
        `;

        const qualitySelect = document.getElementById('setting-quality');
        const audioBtn = document.getElementById('setting-audio-btn');

        qualitySelect.addEventListener('change', (e) => {
            this.onQualityChange(e.target.value);
        });

        audioBtn.addEventListener('click', () => {
            const isMuted = window.AudioEngine.toggleMute();
            audioBtn.innerText = isMuted ? 'Unmute Audio 🔊' : 'Mute Audio 🔇';
        });
    }

    getEmojiFlag(code) {
        const codePoints = code.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }
}
window.ModalManager = ModalManager;
