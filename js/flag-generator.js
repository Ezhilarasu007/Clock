// Procedural HD Flag Texture Generator for 3D Spheres
class FlagTextureGenerator {
    static generateAtlas(countries, width = 256, height = 128) {
        const textures = [];
        
        countries.forEach((country, index) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Draw flag background & patterns based on country code & colors
            this.drawFlag(ctx, country, width, height);
            
            // Convert to Three.js Texture
            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.needsUpdate = true;
            textures.push(texture);
        });

        return textures;
    }

    static drawFlag(ctx, country, w, h) {
        const colors = country.flagColors || ['#333333', '#666666'];
        
        ctx.save();
        
        switch (country.code) {
            case 'IN': // India: Tricolor with Ashoka Chakra
                ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, w, h/3);
                ctx.fillStyle = colors[1]; ctx.fillRect(0, h/3, w, h/3);
                ctx.fillStyle = colors[2]; ctx.fillRect(0, (2*h)/3, w, h/3);
                // Chakra
                ctx.strokeStyle = colors[3];
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(w/2, h/2, h/8, 0, Math.PI*2);
                ctx.stroke();
                break;

            case 'US': // USA: Stripes + Canton
                const stripeH = h / 13;
                for (let i = 0; i < 13; i++) {
                    ctx.fillStyle = (i % 2 === 0) ? colors[0] : colors[1];
                    ctx.fillRect(0, i * stripeH, w, stripeH);
                }
                ctx.fillStyle = colors[2];
                ctx.fillRect(0, 0, w * 0.4, stripeH * 7);
                // Stars representation
                ctx.fillStyle = '#FFFFFF';
                for (let r = 0.1; r < 0.35; r += 0.08) {
                    for (let c = 0.05; c < 0.35; c += 0.08) {
                        ctx.beginPath();
                        ctx.arc(w * c, h * r, 1.5, 0, Math.PI*2);
                        ctx.fill();
                    }
                }
                break;

            case 'GB': // UK Union Jack
                ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, w, h);
                ctx.strokeStyle = colors[2]; ctx.lineWidth = 14;
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, h); ctx.moveTo(w, 0); ctx.lineTo(0, h); ctx.stroke();
                ctx.strokeStyle = colors[1]; ctx.lineWidth = 8;
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, h); ctx.moveTo(w, 0); ctx.lineTo(0, h); ctx.stroke();
                ctx.fillStyle = colors[2]; ctx.fillRect(w/2 - 12, 0, 24, h); ctx.fillRect(0, h/2 - 12, w, 24);
                ctx.fillStyle = colors[1]; ctx.fillRect(w/2 - 6, 0, 12, h); ctx.fillRect(0, h/2 - 6, w, 12);
                break;

            case 'JP': // Japan: Red Sun
                ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = colors[1];
                ctx.beginPath(); ctx.arc(w/2, h/2, h*0.3, 0, Math.PI*2); ctx.fill();
                break;

            case 'KR': // South Korea: Taegeuk
                ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = colors[1];
                ctx.beginPath(); ctx.arc(w/2, h/2, h*0.25, Math.PI*0.5, Math.PI*1.5); ctx.fill();
                ctx.fillStyle = colors[2];
                ctx.beginPath(); ctx.arc(w/2, h/2, h*0.25, Math.PI*1.5, Math.PI*0.5); ctx.fill();
                break;

            case 'DE': // Germany: Horizontal 3
            case 'EG': case 'YE':
                this.drawHorizontalTricolor(ctx, colors, w, h);
                break;

            case 'FR': case 'IT': case 'RO': case 'BE': // Vertical 3
                this.drawVerticalTricolor(ctx, colors, w, h);
                break;

            case 'CA': // Canada
                ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, w*0.25, h); ctx.fillRect(w*0.75, 0, w*0.25, h);
                ctx.fillStyle = colors[1]; ctx.fillRect(w*0.25, 0, w*0.5, h);
                ctx.fillStyle = colors[0];
                ctx.beginPath(); ctx.arc(w/2, h/2, h*0.2, 0, Math.PI*2); ctx.fill();
                break;

            case 'BR': // Brazil: Green field, Yellow rhombus, Blue circle
                ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = colors[1];
                ctx.beginPath(); ctx.moveTo(w/2, h*0.1); ctx.lineTo(w*0.9, h/2); ctx.lineTo(w/2, h*0.9); ctx.lineTo(w*0.1, h/2); ctx.closePath(); ctx.fill();
                ctx.fillStyle = colors[2];
                ctx.beginPath(); ctx.arc(w/2, h/2, h*0.25, 0, Math.PI*2); ctx.fill();
                break;

            case 'CH': // Switzerland: Red with White Cross
                ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = colors[1];
                ctx.fillRect(w/2 - 8, h*0.2, 16, h*0.6);
                ctx.fillRect(w*0.3, h/2 - 8, w*0.4, 16);
                break;

            case 'TR': // Turkey: Crescent & Star
                ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = colors[1];
                ctx.beginPath(); ctx.arc(w*0.4, h/2, h*0.28, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = colors[0];
                ctx.beginPath(); ctx.arc(w*0.45, h/2, h*0.22, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = colors[1];
                ctx.beginPath(); ctx.arc(w*0.65, h/2, h*0.1, 0, Math.PI*2); ctx.fill();
                break;

            case 'AE': // UAE
                ctx.fillStyle = colors[1]; ctx.fillRect(0, 0, w, h/3);
                ctx.fillStyle = colors[2]; ctx.fillRect(0, h/3, w, h/3);
                ctx.fillStyle = colors[3]; ctx.fillRect(0, (2*h)/3, w, h/3);
                ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, w*0.25, h);
                break;

            case 'SA': // Saudi Arabia: Green field with sword/crested detail
                ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = colors[1];
                ctx.fillRect(w*0.25, h*0.48, w*0.5, h*0.06);
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🇸🇦', w/2, h*0.42);
                break;

            default: // Generic Horizontal or Vertical Multi-stripe fallback
                if (colors.length >= 3) {
                    this.drawHorizontalTricolor(ctx, colors, w, h);
                } else if (colors.length === 2) {
                    ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, w, h/2);
                    ctx.fillStyle = colors[1]; ctx.fillRect(0, h/2, w, h/2);
                } else {
                    ctx.fillStyle = colors[0] || '#4A90E2'; ctx.fillRect(0, 0, w, h);
                }
                break;
        }
        
        // Add subtle 3D sphere shadow overlay on edge of flag texture for extra depth
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0.15)');
        grad.addColorStop(0.1, 'rgba(0,0,0,0)');
        grad.addColorStop(0.9, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.15)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        
        ctx.restore();
    }

    static drawHorizontalTricolor(ctx, colors, w, h) {
        const step = h / Math.min(colors.length, 3);
        for (let i = 0; i < Math.min(colors.length, 3); i++) {
            ctx.fillStyle = colors[i];
            ctx.fillRect(0, i * step, w, step);
        }
    }

    static drawVerticalTricolor(ctx, colors, w, h) {
        const step = w / Math.min(colors.length, 3);
        for (let i = 0; i < Math.min(colors.length, 3); i++) {
            ctx.fillStyle = colors[i];
            ctx.fillRect(i * step, 0, step, h);
        }
    }
}
window.FlagTextureGenerator = FlagTextureGenerator;
