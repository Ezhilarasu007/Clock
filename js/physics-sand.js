// High-Performance Physics Simulation Engine for 3D Flag Hourglass
class HourglassPhysics {
    constructor(particleCount = 2000, countryCount = 45) {
        this.particleCount = particleCount;
        this.countryCount = countryCount;
        
        // Hourglass Geometry Dimensions
        this.bulbMaxRadius = 2.2;
        this.neckRadius = 0.36;
        this.neckHeight = 0.4; // y from -0.2 to 0.2
        this.chamberHeight = 2.7; // y up to 2.9
        this.particleRadius = 0.068;
        
        // State Vectors
        this.positions = new Float32Array(particleCount * 3);
        this.velocities = new Float32Array(particleCount * 3);
        this.countryIds = new Int32Array(particleCount);
        
        // Simulation Controls
        this.isPaused = false;
        this.slowMotionFactor = 1.0;
        this.gravityConstant = 9.81;
        
        // Loop State
        this.gravitySign = 1; // 1 = falling down (-y), -1 = falling up after rotation (+y)
        this.hourglassAngle = 0; // 0 to Math.PI (180deg)
        this.isFlipping = false;
        this.flipProgress = 0;
        this.flipDuration = 2.5; // seconds
        this.currentCycle = 1;
        this.particlesPassed = 0;
        
        // Spatial Grid for Fast Collision Detection
        this.gridSize = 0.25;
        this.grid = new Map();
        
        // Highlighted Country Filter
        this.highlightedCountryId = -1;

        this.initParticles();
    }

    setQuality(particleCount) {
        this.particleCount = particleCount;
        this.positions = new Float32Array(particleCount * 3);
        this.velocities = new Float32Array(particleCount * 3);
        this.countryIds = new Int32Array(particleCount);
        this.initParticles();
    }

    initParticles() {
        this.particlesPassed = 0;
        this.gravitySign = 1;
        this.hourglassAngle = 0;
        this.isFlipping = false;
        
        for (let i = 0; i < this.particleCount; i++) {
            const idx = i * 3;
            // Assign country ID evenly across list
            this.countryIds[i] = i % this.countryCount;
            
            // Random distribution inside upper bulb (y: 0.4 to 2.6)
            const y = 0.4 + Math.random() * 2.2;
            const rMax = this.getContainerRadius(y) - this.particleRadius - 0.05;
            const angle = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * Math.max(0.05, rMax);
            
            this.positions[idx] = Math.cos(angle) * r;
            this.positions[idx + 1] = y;
            this.positions[idx + 2] = Math.sin(angle) * r;
            
            this.velocities[idx] = (Math.random() - 0.5) * 0.02;
            this.velocities[idx + 1] = -Math.random() * 0.05;
            this.velocities[idx + 2] = (Math.random() - 0.5) * 0.02;
        }
    }

    getContainerRadius(y) {
        const absY = Math.abs(y);
        if (absY <= 0.2) {
            return this.neckRadius;
        } else if (absY > 2.8) {
            return 0;
        } else {
            const normY = (absY - 0.2) / 2.6;
            return this.neckRadius + Math.pow(normY, 0.68) * (this.bulbMaxRadius - this.neckRadius);
        }
    }

    update(dt) {
        if (this.isPaused) return;
        
        const effectiveDt = Math.min(dt, 0.033) * this.slowMotionFactor;
        
        // Handle Hourglass Flip Animation
        if (this.isFlipping) {
            this.flipProgress += effectiveDt / this.flipDuration;
            if (this.flipProgress >= 1.0) {
                this.flipProgress = 1.0;
                this.isFlipping = false;
                this.hourglassAngle = (this.currentCycle % 2 === 0) ? Math.PI : 0;
                this.gravitySign *= -1; // Reverse gravity direction!
                this.currentCycle++;
            } else {
                // Smooth easing angle
                const t = this.flipProgress;
                const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                const startAngle = (this.currentCycle % 2 === 1) ? 0 : Math.PI;
                this.hourglassAngle = startAngle + easeT * Math.PI;
            }
        }

        // Effective Gravity Vector based on hourglass rotation angle
        const gY = -this.gravityConstant * this.gravitySign * Math.cos(this.hourglassAngle);
        const gX = this.gravityConstant * 0.4 * Math.sin(this.hourglassAngle);

        let countInTargetChamber = 0;
        const targetChamberSign = -this.gravitySign;

        // Build Spatial Grid for Neighbor Collisions
        this.buildSpatialGrid();

        // Physics Sub-stepping for smooth stability
        const steps = 2;
        const subDt = effectiveDt / steps;

        for (let step = 0; step < steps; step++) {
            for (let i = 0; i < this.particleCount; i++) {
                const idx = i * 3;
                let px = this.positions[idx];
                let py = this.positions[idx + 1];
                let pz = this.positions[idx + 2];
                let vx = this.velocities[idx];
                let vy = this.velocities[idx + 1];
                let vz = this.velocities[idx + 2];

                // 1. Apply Gravity
                vx += gX * subDt;
                vy += gY * subDt;

                // Damping / Terminal Velocity limit
                vx *= 0.985;
                vy *= 0.985;
                vz *= 0.985;

                // 2. Integration
                px += vx * subDt;
                py += vy * subDt;
                pz += vz * subDt;

                // 3. Chamber Wall Boundary Collision
                const pr = this.particleRadius;
                const maxR = Math.max(pr, this.getContainerRadius(py) - pr);
                const currentR = Math.sqrt(px * px + pz * pz);

                if (currentR > maxR) {
                    const nx = px / (currentR || 1);
                    const nz = pz / (currentR || 1);
                    
                    // Reposition onto boundary
                    px = nx * maxR;
                    pz = nz * maxR;

                    // Reflect velocity normal with friction
                    const dot = vx * nx + vz * nz;
                    if (dot > 0) {
                        vx = (vx - 1.4 * dot * nx) * 0.5;
                        vz = (vz - 1.4 * dot * nz) * 0.5;
                    }

                    // Funnel slope push towards bottleneck when in upper neck funnel
                    if (Math.sign(py) === this.gravitySign && Math.abs(py) <= 0.8) {
                        vx -= nx * 0.5 * subDt;
                        vz -= nz * 0.5 * subDt;
                    }
                }

                // Top & Bottom Glass Cap Collisions
                if (py > 2.8 - pr) {
                    py = 2.8 - pr;
                    if (vy > 0) vy = -vy * 0.3;
                } else if (py < -2.8 + pr) {
                    py = -2.8 + pr;
                    if (vy < 0) vy = -vy * 0.3;
                }

                // 4. Narrow Neck Funnel Jittering (Prevent Bottleneck Stalling)
                if (Math.abs(py) <= 0.25) {
                    vx += (Math.random() - 0.5) * 0.08;
                    vz += (Math.random() - 0.5) * 0.08;
                }

                // 5. Particle-Particle Collisions (Sphere-Sphere Repulsion)
                const neighborIndices = this.getGridNeighbors(px, py, pz);
                for (let j = 0; j < neighborIndices.length; j++) {
                    const nIdx = neighborIndices[j];
                    if (nIdx === i) continue;
                    
                    const n3 = nIdx * 3;
                    const dx = px - this.positions[n3];
                    const dy = py - this.positions[n3 + 1];
                    const dz = pz - this.positions[n3 + 2];
                    const distSq = dx * dx + dy * dy + dz * dz;
                    const minDist = pr * 2.0;

                    if (distSq < minDist * minDist && distSq > 0.00001) {
                        const dist = Math.sqrt(distSq);
                        const overlap = (minDist - dist) * 0.5;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        const nz = dz / dist;

                        // Position Correction
                        px += nx * overlap;
                        py += ny * overlap;
                        pz += nz * overlap;

                        // Velocity Impulse
                        const relVx = vx - this.velocities[n3];
                        const relVy = vy - this.velocities[n3 + 1];
                        const relVz = vz - this.velocities[n3 + 2];
                        const velDot = relVx * nx + relVy * ny + relVz * nz;

                        if (velDot < 0) {
                            const impulse = velDot * 0.45;
                            vx -= impulse * nx;
                            vy -= impulse * ny;
                            vz -= impulse * nz;
                        }
                    }
                }

                // Write back positions & velocities
                this.positions[idx] = px;
                this.positions[idx + 1] = py;
                this.positions[idx + 2] = pz;
                this.velocities[idx] = vx;
                this.velocities[idx + 1] = vy;
                this.velocities[idx + 2] = vz;

                // Count particles inside target (lower) chamber
                if (Math.sign(py) === targetChamberSign && Math.abs(py) > 0.3) {
                    countInTargetChamber++;
                }
            }
        }

        this.particlesPassed = countInTargetChamber;

        // Check for Cycle Completion -> Trigger Flip!
        const targetRatio = this.particlesPassed / this.particleCount;
        if (targetRatio >= 0.93 && !this.isFlipping) {
            this.triggerFlip();
        }
    }

    triggerFlip() {
        if (this.isFlipping) return;
        this.isFlipping = true;
        this.flipProgress = 0;
        if (window.AudioEngine) {
            window.AudioEngine.playFlipSound();
        }
    }

    buildSpatialGrid() {
        this.grid.clear();
        for (let i = 0; i < this.particleCount; i++) {
            const idx = i * 3;
            const gx = Math.floor(this.positions[idx] / this.gridSize);
            const gy = Math.floor(this.positions[idx + 1] / this.gridSize);
            const gz = Math.floor(this.positions[idx + 2] / this.gridSize);
            const key = `${gx},${gy},${gz}`;
            
            if (!this.grid.has(key)) {
                this.grid.set(key, []);
            }
            this.grid.get(key).push(i);
        }
    }

    getGridNeighbors(x, y, z) {
        const neighbors = [];
        const gx = Math.floor(x / this.gridSize);
        const gy = Math.floor(y / this.gridSize);
        const gz = Math.floor(z / this.gridSize);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    const key = `${gx + dx},${gy + dy},${gz + dz}`;
                    const list = this.grid.get(key);
                    if (list) {
                        for (let k = 0; k < list.length; k++) {
                            neighbors.push(list[k]);
                        }
                    }
                }
            }
        }
        return neighbors;
    }
}
window.HourglassPhysics = HourglassPhysics;
