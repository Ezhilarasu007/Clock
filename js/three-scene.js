// 3D Scene Initialization, Glass Hourglass Model & Instanced Mesh Particle Renderer
class HourglassScene {
    constructor(containerId, countryData) {
        this.container = document.getElementById(containerId);
        this.countryData = countryData;
        
        this.clock = new THREE.Clock();
        this.particleCount = 2000;
        
        // Physics Engine Instance
        this.physics = new HourglassPhysics(this.particleCount, countryData.length);
        
        // Quality Presets
        this.qualitySettings = {
            'Low': 1200,
            'Medium': 2200,
            'High': 3500,
            'Ultra': 5000
        };
        
        this.initThree();
        this.initLights();
        this.initHourglassGlass();
        this.initFlagParticles();
        this.initDustParticles();
        this.initControls();
        
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Start Render Loop
        this.animate();
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050608);
        this.scene.fog = new THREE.FogExp2(0x050608, 0.035);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 0, 9.5);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);
    }

    initLights() {
        // Main Key Light
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
        keyLight.position.set(5, 8, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        this.scene.add(keyLight);

        // Soft Blue/Cyan Fill Light
        const fillLight = new THREE.DirectionalLight(0x4a90e2, 1.2);
        fillLight.position.set(-5, -2, -5);
        this.scene.add(fillLight);

        // Core Ambient Light inside neck
        this.coreLight = new THREE.PointLight(0x00d2ff, 1.5, 6);
        this.coreLight.position.set(0, 0, 0);
        this.scene.add(this.coreLight);

        const ambientLight = new THREE.AmbientLight(0x1a1d24, 1.5);
        this.scene.add(ambientLight);
    }

    initHourglassGlass() {
        this.hourglassGroup = new THREE.Group();
        this.scene.add(this.hourglassGroup);

        // Create Glass Lathe Geometry
        const points = [];
        const segments = 40;
        
        // Upper & Lower hyperbolic glass curves
        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * 2 - 1; // -1 to 1
            const y = t * 2.8;
            const absY = Math.abs(y);
            let r;
            if (absY <= 0.2) {
                r = 0.38;
            } else {
                const normY = (absY - 0.2) / 2.6;
                r = 0.38 + Math.pow(normY, 0.68) * (2.2 - 0.38);
            }
            points.push(new THREE.Vector2(r, y));
        }

        const latheGeo = new THREE.LatheGeometry(points, 64);
        
        // Physical Glass Material
        this.glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.05,
            roughness: 0.04,
            transmission: 0.94,
            ior: 1.52,
            thickness: 0.5,
            transparent: true,
            opacity: 0.85,
            specularIntensity: 1.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05
        });

        this.glassMesh = new THREE.Mesh(latheGeo, this.glassMaterial);
        this.glassMesh.castShadow = true;
        this.glassMesh.receiveShadow = true;
        this.hourglassGroup.add(this.glassMesh);

        // Metallic Support Frame
        this.initMetallicFrame();
    }

    initMetallicFrame() {
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x1c1e24,
            metalness: 0.9,
            roughness: 0.25,
            envMapIntensity: 1.5
        });

        const goldRingMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.95,
            roughness: 0.2
        });

        // Top & Bottom Caps
        const capGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.25, 48);
        const topCap = new THREE.Mesh(capGeo, metalMaterial);
        topCap.position.y = 2.925;
        topCap.castShadow = true;
        this.hourglassGroup.add(topCap);

        const bottomCap = new THREE.Mesh(capGeo, metalMaterial);
        bottomCap.position.y = -2.925;
        bottomCap.castShadow = true;
        this.hourglassGroup.add(bottomCap);

        // Gold Trim Rings
        const ringGeo = new THREE.TorusGeometry(2.42, 0.04, 16, 48);
        const topRing = new THREE.Mesh(ringGeo, goldRingMaterial);
        topRing.position.y = 2.8;
        topRing.rotation.x = Math.PI / 2;
        this.hourglassGroup.add(topRing);

        const bottomRing = new THREE.Mesh(ringGeo, goldRingMaterial);
        bottomRing.position.y = -2.8;
        bottomRing.rotation.x = Math.PI / 2;
        this.hourglassGroup.add(bottomRing);

        // Center Neck Ring
        const neckRingGeo = new THREE.TorusGeometry(0.42, 0.04, 16, 32);
        const neckRing = new THREE.Mesh(neckRingGeo, goldRingMaterial);
        neckRing.rotation.x = Math.PI / 2;
        this.hourglassGroup.add(neckRing);

        // 3 Vertical Pillars
        const pillarGeo = new THREE.CylinderGeometry(0.08, 0.08, 5.85, 16);
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const pillar = new THREE.Mesh(pillarGeo, metalMaterial);
            pillar.position.set(Math.cos(angle) * 2.3, 0, Math.sin(angle) * 2.3);
            pillar.castShadow = true;
            this.hourglassGroup.add(pillar);
        }
    }

    initFlagParticles() {
        // Generate crisp HD Flag Textures for all countries
        this.flagTextures = FlagTextureGenerator.generateAtlas(this.countryData);

        const sphereGeo = new THREE.SphereGeometry(this.physics.particleRadius, 16, 16);

        this.instancedMeshes = [];
        this.countryParticleIndices = Array.from({ length: this.countryData.length }, () => []);

        // Build mapping of particles to country meshes
        for (let i = 0; i < this.physics.particleCount; i++) {
            const cId = this.physics.countryIds[i];
            this.countryParticleIndices[cId].push(i);
        }

        // Create one InstancedMesh per country flag for efficient texture drawing
        for (let c = 0; c < this.countryData.length; c++) {
            const indices = this.countryParticleIndices[c];
            const count = indices.length;

            const mat = new THREE.MeshStandardMaterial({
                map: this.flagTextures[c],
                metalness: 0.1,
                roughness: 0.35,
                bumpScale: 0.02
            });

            const instancedMesh = new THREE.InstancedMesh(sphereGeo, mat, Math.max(count, 1));
            instancedMesh.castShadow = true;
            instancedMesh.receiveShadow = true;
            
            this.hourglassGroup.add(instancedMesh);
            this.instancedMeshes.push({ mesh: instancedMesh, indices: indices, count: count, material: mat });
        }

        this.dummyMatrix = new THREE.Matrix4();
        this.dummyEuler = new THREE.Euler();
        this.dummyQuat = new THREE.Quaternion();
    }

    initDustParticles() {
        const dustCount = 400;
        const dustGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(dustCount * 3);

        for (let i = 0; i < dustCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 15;
            positions[i + 1] = (Math.random() - 0.5) * 15;
            positions[i + 2] = (Math.random() - 0.5) * 15;
        }

        dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const dustMat = new THREE.PointsMaterial({
            color: 0x00d2ff,
            size: 0.05,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });

        this.dustPoints = new THREE.Points(dustGeo, dustMat);
        this.scene.add(this.dustPoints);
    }

    initControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 20;
        this.controls.minDistance = 4;
        this.controls.target.set(0, 0, 0);

        // Target smooth interpolation destination
        this.targetDestination = new THREE.Vector3(0, 0, 0);

        // Raycasting for Mouse Click Centering & Particle Selection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.renderer.domElement.addEventListener('pointerdown', (e) => {
            this.pointerDownPos = { x: e.clientX, y: e.clientY };
        });

        this.renderer.domElement.addEventListener('pointerup', (e) => {
            // Distinguish click from drag
            const dist = Math.hypot(e.clientX - (this.pointerDownPos?.x || 0), e.clientY - (this.pointerDownPos?.y || 0));
            if (dist < 6) {
                this.onCanvasClick(e);
            }
        });
    }

    onCanvasClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 1. Check Particle Intersections
        const meshesToTest = this.instancedMeshes.map(item => item.mesh);
        const particleIntersects = this.raycaster.intersectObjects(meshesToTest, false);

        if (particleIntersects.length > 0) {
            const hit = particleIntersects[0];
            const meshObj = hit.object;
            const instanceId = hit.instanceId;

            // Find country index
            const countryItem = this.instancedMeshes.find(item => item.mesh === meshObj);
            if (countryItem) {
                const cId = this.countryData.findIndex((_, idx) => this.instancedMeshes[idx] === countryItem);
                if (cId !== -1) {
                    this.highlightCountry(cId);
                    if (this.onSelectCountryCallback) {
                        this.onSelectCountryCallback(this.countryData[cId]);
                    }
                }
            }

            // Get hit point to move camera target
            if (hit.point) {
                this.targetDestination.copy(hit.point);
                if (window.AudioEngine) window.AudioEngine.playClickSound();
            }
            return;
        }

        // 2. Check Glass Mesh Intersection
        if (this.glassMesh) {
            const glassIntersects = this.raycaster.intersectObject(this.glassMesh, false);
            if (glassIntersects.length > 0) {
                this.targetDestination.copy(glassIntersects[0].point);
                if (window.AudioEngine) window.AudioEngine.playClickSound();
            }
        }
    }

    setQualityPreset(presetName) {
        const count = this.qualitySettings[presetName] || 2200;
        this.particleCount = count;
        
        // Remove old instanced meshes
        this.instancedMeshes.forEach(item => {
            this.hourglassGroup.remove(item.mesh);
            item.mesh.geometry.dispose();
            item.material.dispose();
        });

        this.physics.setQuality(count);
        this.initFlagParticles();
    }

    highlightCountry(countryIndex) {
        this.physics.highlightCountryId = countryIndex;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = this.clock.getDelta();
        
        // Update Physics
        this.physics.update(dt);

        // Visually Rotate 3D Hourglass Mesh Group during Flip
        this.hourglassGroup.rotation.z = this.physics.hourglassAngle;

        // Pulse Core Glow Light
        const time = this.clock.getElapsedTime();
        this.coreLight.intensity = 1.2 + Math.sin(time * 2.5) * 0.4;

        // Slow rotate ambient dust
        if (this.dustPoints) {
            this.dustPoints.rotation.y = time * 0.02;
        }

        // Update Particle Instanced Mesh Transformations
        const pos = this.physics.positions;
        const highlightedId = this.physics.highlightCountryId;

        for (let c = 0; c < this.instancedMeshes.length; c++) {
            const item = this.instancedMeshes[c];
            const isHighlighted = (c === highlightedId);

            // Dynamic Emissive glow for highlighted country
            if (isHighlighted) {
                item.material.emissive.setHex(0x00e5ff);
                item.material.emissiveIntensity = 0.6 + Math.sin(time * 6) * 0.3;
            } else {
                item.material.emissive.setHex(0x000000);
                item.material.emissiveIntensity = 0;
            }

            for (let i = 0; i < item.count; i++) {
                const particleIdx = item.indices[i];
                const p3 = particleIdx * 3;

                const scale = isHighlighted ? 1.45 : 1.0;

                // Tumble rotation based on index and movement
                this.dummyEuler.set(
                    time * 0.5 + particleIdx * 0.1,
                    time * 0.3 + particleIdx * 0.2,
                    0
                );
                this.dummyQuat.setFromEuler(this.dummyEuler);

                this.dummyMatrix.compose(
                    new THREE.Vector3(pos[p3], pos[p3 + 1], pos[p3 + 2]),
                    this.dummyQuat,
                    new THREE.Vector3(scale, scale, scale)
                );

                item.mesh.setMatrixAt(i, this.dummyMatrix);
            }
            item.mesh.instanceMatrix.needsUpdate = true;
        }

        // Smoothly interpolate controls.target towards targetDestination when clicked
        if (this.targetDestination && this.controls) {
            this.controls.target.lerp(this.targetDestination, 0.08);
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
window.HourglassScene = HourglassScene;
