import * as THREE from 'three';

export class TextureGenerator {
    static createParrotTexture(type = 'body') {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        if (type === 'body') {
            this.drawFeatherPattern(ctx, '#3a991b', '#60c131'); // Vibrant Agapornis Green
        } else if (type === 'head') {
            this.drawHeadGradient(ctx); // Specific head colors: Red -> Orange -> Yellow
        } else if (type === 'beak') {
            this.drawBeakGradient(ctx); // Existing beak logic
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    static createNormalMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Simple normal map approximation using noise
        ctx.fillStyle = '#8080ff'; // Neutral normal color
        ctx.fillRect(0, 0, 512, 512);

        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 5 + 2;
            const r = 120 + Math.random() * 20;
            const g = 120 + Math.random() * 20;
            ctx.fillStyle = `rgb(${r},${g},255)`;
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    static createRoughnessMap(baseValue = 0.5) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = `rgb(${baseValue * 255}, ${baseValue * 255}, ${baseValue * 255})`;
        ctx.fillRect(0, 0, 512, 512);

        // Add variation
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const v = (baseValue + (Math.random() - 0.5) * 0.2) * 255;
            ctx.fillStyle = `rgb(${v},${v},${v})`;
            ctx.fillRect(x, y, 4, 4);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    static drawFeatherPattern(ctx, color1, color2) {
        ctx.fillStyle = color1;
        ctx.fillRect(0, 0, 1024, 1024);

        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            const w = 40 + Math.random() * 40;
            const h = 20 + Math.random() * 20;

            const grad = ctx.createLinearGradient(x, y, x + w, y + h);
            grad.addColorStop(0, color1);
            grad.addColorStop(0.5, color2);
            grad.addColorStop(1, color1);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(x, y, w, h, Math.random() * 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Subtle "barb" highlights
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - w, y);
            ctx.lineTo(x + w, y);
            ctx.stroke();
        }
    }

    static drawBeakGradient(ctx) {
        // Lovebird/Agapornis beak: Consistently vibrant red to maintain clean look
        const grad = ctx.createLinearGradient(0, 0, 1024, 0);
        grad.addColorStop(0.0, '#ff3300'); // Solid Red-Orange base (matches face)
        grad.addColorStop(0.5, '#dd2200'); // Deep red
        grad.addColorStop(1.0, '#bb1100'); // Darker tip

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 1024);

        // Add keratin vertical lines with varying thickness and opacity
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * 1024;
            const width = 0.5 + Math.random() * 2;
            const opacity = 0.02 + Math.random() * 0.08;
            ctx.strokeStyle = `rgba(0,0,0,${opacity})`;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + (Math.random() - 0.5) * 40, 1024);
            ctx.stroke();
        }
    }

    static drawSmoothPattern(ctx, color1, color2) {
        const grad = ctx.createRadialGradient(512, 512, 100, 512, 512, 800);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 1024);

        // Add subtle highlights
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.beginPath();
            ctx.arc(Math.random() * 1024, Math.random() * 1024, Math.random() * 200, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    static drawHeadGradient(ctx) {
        // Lovebird head: Extremely clean and uniform face area
        // Solid fill everywhere first
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(0, 0, 1024, 1024);

        // Transition only towards the very bottom (neck area)
        const grad = ctx.createLinearGradient(0, 512, 0, 1024);
        grad.addColorStop(0.0, '#ff3300'); // Solid Face
        grad.addColorStop(1.0, '#ffd500'); // Yellow neck

        ctx.fillStyle = grad;
        ctx.fillRect(0, 512, 1024, 512);

        // No noise, no feathers, no pattern. Pure clean color.
    }
}
