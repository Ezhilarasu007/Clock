# ⏳ Chrono-Sphere 3D — Futuristic World Flag Hourglass & Time Machine

> *"An interactive miniature universe where time flows through the flags of every country."*

Chrono-Sphere 3D is a state-of-the-art interactive web application built with **Three.js**, **WebGL**, and custom multi-particle physics. It features a realistic 3D glass hourglass centerpiece filled with thousands of tiny physical spherical sand particles, each wrapped in a crisp vector texture of a nation's flag.

---

## 🌟 Key Features

### 1. Ultra-Realistic 3D Glass Hourglass & Physics
- **Glass Optics**: Constructed with Three.js `MeshPhysicalMaterial` featuring physical light transmission, refraction index (`IOR 1.52`), thickness dispersion, specular reflections, and clearcoat gloss.
- **Physical Sand Simulation**:
  - Thousands of spherical flag particles (1,200 to 5,000 based on graphics quality preset).
  - Funnel dynamics at the narrow hourglass neck with particle jittering and trickle control.
  - Sphere-sphere spatial grid collision detection, natural stacking, rolling, and lower chamber accumulation.
- **Continuous Infinite Loop**:
  - Automatically triggers a smooth 180° rotation around the Z-axis when top chamber empties.
  - Smoothly reverses the local gravity vector over 2.5 seconds, ensuring endless sand flow.

### 2. Three Visually Distinct View Modes
1. **WORLD CLOCK (`TIME FLOWS AROUND THE WORLD`)**
   - Live digital clock, analog clock graphic, UTC offset, timezone info, and selected country time.
   - Live country switcher dialog.
2. **WORLD FLAGS (`ONE WORLD. ONE CLOCK.`)**
   - Interactive country inspector.
   - Selecting a country dynamically illuminates and scales all 3D flag particles belonging to that nation inside the hourglass!
3. **TIME LOOP (`TIME NEVER STOPS`)**
   - Minimalist cinematic HUD displaying real-time telemetry (Particle Count, Current Cycle Number, Progress %, Simulation Status, Particle Flow Rate).
   - Camera preset buttons (Front View, Close-Up, Top Down).

### 3. Integrated Audio Engine
- Built with the HTML5 **Web Audio API** (zero external mp3 assets).
- Synthesizes ambient sand flow trickle (modulated pink noise filter).
- Frequency sweep whoosh sound effect during 180° hourglass rotation.
- UI button click audio feedback with global Mute / Unmute controls.

### 4. Comprehensive Legal & Information Dialogs
- **Privacy Policy Modal**: Real legal privacy policy covering WebGL data handling and zero external tracking.
- **Terms & Conditions Modal**: Terms of service governing site usage.
- **About Us Modal**: In-depth story and technological overview.
- **Contact Us Modal**: Interactive form with input validation and instant submission feedback.
- **Graphics Quality Settings Modal**: Low (1,200), Medium (2,200), High (3,500), and Ultra (5,000) presets.

---

## 📁 Project Architecture

```
Clock/
├── index.html               # Main HTML5 document layout & UI overlays
├── style.css                # Futuristic dark glassmorphism design system
├── README.md                # Documentation & user manual
└── js/
    ├── country-data.js      # 45+ world countries dataset (capitals, timezones, flag color specs)
    ├── flag-generator.js    # Canvas HD procedural flag texture generator wrapped onto 3D spheres
    ├── physics-sand.js      # Custom multi-particle hourglass physics engine with neck funnel & flip loops
    ├── three-scene.js       # Three.js WebGL scene renderer, glass optics, lighting & instanced meshes
    ├── audio-engine.js      # Web Audio API ambient sand flow, rotation whoosh & UI sound synthesis
    ├── modals.js            # Modal dialogs manager for Privacy, Terms, About, Contact, Country Explorer
    └── app.js               # Application state orchestration, view routing & live clock telemetry
```

---

## 🚀 Running Locally

To run the application on port `3033`:

```bash
# Using npx serve
npx serve -l 3033

# Or using http-server
npx http-server -p 3033
```

Open your browser at `http://localhost:3033` to view the 3D hourglass!
