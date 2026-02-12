import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

export class Parrot {
    constructor() {
        this.group = new THREE.Group();
        this.state = 'idle';
        this.lovePhase = 0; // Track phases: 0=turn back, 1=walk back, 2=grab heart, 3=turn front, 4=walk front

        this.normalMap = TextureGenerator.createNormalMap();
        this.roughnessMap = TextureGenerator.createRoughnessMap(0.7);
        this.beakRoughnessMap = TextureGenerator.createRoughnessMap(0.3);

        this.createModel();
        this.createHeart();
    }

    createModel() {
        // Body (Higher resolution esferoide)
        const bodyGeo = new THREE.SphereGeometry(0.5, 64, 64);
        bodyGeo.scale(0.85, 1.25, 0.9);
        const bodyMat = new THREE.MeshStandardMaterial({
            map: TextureGenerator.createParrotTexture('body'),
            normalMap: this.normalMap,
            roughnessMap: this.roughnessMap,
            roughness: 0.8,
            metalness: 0.0
        });
        this.body = new THREE.Mesh(bodyGeo, bodyMat);
        this.body.castShadow = true;
        this.body.receiveShadow = true;
        this.group.add(this.body);

        // Head (Smooth surface to avoid artifacts)
        const headGeo = new THREE.SphereGeometry(0.42, 64, 64);
        const headMat = new THREE.MeshStandardMaterial({
            map: TextureGenerator.createParrotTexture('head'),
            roughness: 0.9, // Higher roughness for a soft, matte feather look
            metalness: 0.0
        });
        this.head = new THREE.Mesh(headGeo, headMat);
        this.head.position.y = 0.65;
        this.head.position.z = 0.05;
        this.head.castShadow = true;
        this.group.add(this.head);

        // Create Two-Part Beak (Moved forward to avoid head clipping)
        this.beak = new THREE.Group();
        this.createDetailedBeak();
        this.beak.position.set(0, 0.65, 0.45); // Moved slightly down (0.66->0.65) and forward (0.36->0.45)
        this.group.add(this.beak);

        // Eyes (Large with white border)
        this.createEye(0.22, 0.72, 0.35); // Left
        this.createEye(-0.22, 0.72, 0.35); // Right

        // Feet (Gris claro)
        this.createFeet(0.15, -0.7, 0); // Left
        this.createFeet(-0.15, -0.7, 0); // Right

        // Refined Wings
        this.leftWing = this.createWing(0.45, 0.25, 0, 1);
        this.rightWing = this.createWing(-0.45, 0.25, 0, -1);

        this.group.add(this.leftWing);
        this.group.add(this.rightWing);
    }

    createDetailedBeak() {
        // Keratin Material (Smooth, natural red)
        const keratinMat = new THREE.MeshStandardMaterial({
            color: 0xff3322,
            roughness: 0.2, // Satin/silk look
            metalness: 0.1,
            map: TextureGenerator.createParrotTexture('beak')
        });

        // Bone/Cere Material (Creamy white base)
        const cereMat = new THREE.MeshStandardMaterial({
            color: 0xfff4cc,
            roughness: 0.9,
            metalness: 0.0
        });

        // 1. Cere (Ultra-compact white base)
        const cereGeo = new THREE.SphereGeometry(0.18, 32, 32);
        cereGeo.scale(0.8, 0.9, 0.25); // Reduced Y (1.0 -> 0.9) and Z (0.3 -> 0.25)
        const cere = new THREE.Mesh(cereGeo, cereMat);
        cere.position.set(0, 0, -0.05);
        this.beak.add(cere);

        // 2. Upper Beak (Ultra-short triangular profile)
        const upperGeo = new THREE.SphereGeometry(0.2, 32, 32);
        upperGeo.scale(0.5, 0.9, 0.6); // Reduced Y (1.1 -> 0.9) and Z (0.7 -> 0.6)
        const upperBeak = new THREE.Mesh(upperGeo, keratinMat);
        upperBeak.position.set(0, -0.04, 0.05); // Retracted more for ultra-short look
        upperBeak.rotation.x = -0.15;
        this.beak.add(upperBeak);

        // Add a 'hook tip' sphere (Ultra-short)
        const tipGeo = new THREE.SphereGeometry(0.12, 16, 16);
        tipGeo.scale(0.25, 0.8, 0.35); // Reduced Y (1.0 -> 0.8) and Z (0.4 -> 0.35)
        const tip = new THREE.Mesh(tipGeo, keratinMat);
        tip.position.set(0, -0.22, 0.12); // Moved up ( -0.28 -> -0.22) and retracted
        tip.rotation.x = -0.6;
        this.beak.add(tip);

        // 3. Lower Beak (Ultra-compact)
        const lowerGeo = new THREE.SphereGeometry(0.14, 32, 32);
        lowerGeo.scale(0.45, 0.35, 0.45); // Reduced Y (0.4 -> 0.35) and Z (0.5 -> 0.45)
        const lowerBeak = new THREE.Mesh(lowerGeo, keratinMat);
        lowerBeak.position.set(0, -0.18, 0.02); // Moved up (-0.24 -> -0.18)
        this.beak.add(lowerBeak);
    }

    createEye(x, y, z) {
        const eyeGroup = new THREE.Group();

        // 1. Puffy White Periocular Ring (The fleshy skin) - Smaller radius
        const ringGeo = new THREE.SphereGeometry(0.16, 32, 32); // Reduced (0.22 -> 0.16)
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x222222, // Subtle constant brightness for visibility
            emissiveIntensity: 0.5,
            roughness: 1.0,
            metalness: 0.0
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.scale.set(1.1, 1.1, 0.4); // Puffy volume
        eyeGroup.add(ringMesh);

        // 2. Black Pupil (Tucked inside the fleshy white part) - Slightly smaller
        const pupilGeo = new THREE.SphereGeometry(0.08, 32, 32); // Reduced (0.1 -> 0.08)
        const pupilMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.2,
            metalness: 0.2
        });
        const pupil = new THREE.Mesh(pupilGeo, pupilMat);
        pupil.scale.set(1, 1, 0.5);
        pupil.position.z = 0.03; // Positioned to look recessed
        eyeGroup.add(pupil);

        eyeGroup.position.set(x, y, z);
        eyeGroup.lookAt(x * 2.5, y, z * 2.5);
        this.group.add(eyeGroup);
    }

    createFeet(x, y, z) {
        const feetGroup = new THREE.Group();
        const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 16);
        const feetMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.6 });

        const leg = new THREE.Mesh(legGeo, feetMat);
        feetGroup.add(leg);

        // Toes
        const toeGeo = new THREE.BoxGeometry(0.03, 0.03, 0.15);
        for (let i = -1; i <= 1; i++) {
            const toe = new THREE.Mesh(toeGeo, feetMat);
            toe.position.set(i * 0.04, -0.1, 0.05);
            toe.rotation.y = i * 0.2;
            feetGroup.add(toe);
        }

        feetGroup.position.set(x, y, z);
        this.group.add(feetGroup);
    }

    createWing(x, y, z, side) {
        const wingGroup = new THREE.Group();
        const wingGeo = new THREE.SphereGeometry(0.5, 32, 32);
        wingGeo.scale(1, 0.1, 0.4);
        const wingMat = new THREE.MeshStandardMaterial({
            map: TextureGenerator.createParrotTexture('body'),
            normalMap: this.normalMap,
            roughness: 0.8
        });
        const wingMesh = new THREE.Mesh(wingGeo, wingMat);
        wingMesh.position.x = 0.4 * side;
        wingGroup.add(wingMesh);

        wingGroup.position.set(x, y, z);
        return wingGroup;
    }

    createHeart() {
        const heartShape = new THREE.Shape();
        // Smaller heart (scaled down by ~30%)
        const scale = 0.7;
        heartShape.moveTo(0.25 * scale, 0.25 * scale);
        heartShape.bezierCurveTo(0.25 * scale, 0.25 * scale, 0.20 * scale, 0, 0, 0);
        heartShape.bezierCurveTo(-0.30 * scale, 0, -0.30 * scale, 0.35 * scale, -0.30 * scale, 0.35 * scale);
        heartShape.bezierCurveTo(-0.30 * scale, 0.55 * scale, -0.10 * scale, 0.77 * scale, 0.25 * scale, 0.95 * scale);
        heartShape.bezierCurveTo(0.60 * scale, 0.77 * scale, 0.80 * scale, 0.55 * scale, 0.80 * scale, 0.35 * scale);
        heartShape.bezierCurveTo(0.80 * scale, 0.35 * scale, 0.80 * scale, 0, 0.50 * scale, 0);
        heartShape.bezierCurveTo(0.35 * scale, 0, 0.25 * scale, 0.25 * scale, 0.25 * scale, 0.25 * scale);

        const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.05, bevelThickness: 0.05 };
        const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        geometry.center(); // Center the heart geometry

        const material = new THREE.MeshStandardMaterial({ color: 0xff0066, roughness: 0.3, metalness: 0.4, emissive: 0x330011 });
        const heart = new THREE.Mesh(geometry, material);

        // Rotate heart 180° on Z-axis to flip it vertically (point down)
        heart.rotation.z = Math.PI;

        // Add Text "Niriel" using a Sprite (always faces camera)
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Clear canvas with transparency
        ctx.clearRect(0, 0, 512, 256);

        // Draw text
        ctx.font = 'italic bold 70px Georgia, serif';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#ff0066';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText('Niriel', 256, 128);
        ctx.fillText('Niriel', 256, 128);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false // Always render on top
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(1, 0.5, 1); // Scale to fit nicely on heart
        sprite.position.set(0, 0, 0); // Center of heart
        heart.add(sprite);

        // Initially hidden
        heart.scale.set(0, 0, 0);
        heart.visible = false;

        this.heart = heart;
        this.group.add(heart);
    }

    update(time) {
        const t = time * 0.001;

        if (this.state === 'flying' || this.state === 'takeoff') {
            const flapSpeed = 20;
            const flapAngle = Math.sin(t * flapSpeed) * 0.9;
            this.leftWing.rotation.z = flapAngle;
            this.rightWing.rotation.z = -flapAngle;

            this.group.position.y = THREE.MathUtils.lerp(this.group.position.y, 2.0, 0.03);
            this.group.position.y += Math.sin(t * 3) * 0.01;
            this.group.rotation.x = -0.1;
        } else if (this.state === 'landing') {
            const flapSpeed = 8;
            const flapAngle = Math.sin(t * flapSpeed) * 0.3;
            this.leftWing.rotation.z = flapAngle;
            this.rightWing.rotation.z = -flapAngle;

            this.group.position.y = THREE.MathUtils.lerp(this.group.position.y, 0, 0.04);
            this.group.rotation.x = THREE.MathUtils.lerp(this.group.rotation.x, 0, 0.05);

            if (this.group.position.y < 0.05) {
                this.state = 'idle';
                this.leftWing.rotation.z = 0.4;
                this.rightWing.rotation.z = -0.4;
            }
        } else if (this.state === 'presenting_love') {
            // Multi-phase animation:
            // Phase 0: Turn 180° (face away)
            // Phase 1: Walk backward
            // Phase 2: Grab heart (pause and show heart appearing)
            // Phase 3: Turn 180° (face forward again)
            // Phase 4: Walk forward with heart

            // Phase 0: Turn 180° to face away
            if (this.lovePhase === 0) {
                this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, Math.PI, 0.05);

                if (Math.abs(this.group.rotation.y - Math.PI) < 0.1) {
                    this.lovePhase = 1;
                }
            }

            // Phase 1: Walk backward
            else if (this.lovePhase === 1) {
                this.group.position.z = THREE.MathUtils.lerp(this.group.position.z, -2.5, 0.03);
                this.group.position.y = Math.abs(Math.sin(t * 10)) * 0.1; // Bobbing walk

                if (this.group.position.z < -2.0) {
                    this.lovePhase = 2;
                }
            }

            // Phase 2: Grab heart (pause and show heart)
            else if (this.lovePhase === 2) {
                this.group.position.y = Math.abs(Math.sin(t * 15)) * 0.05; // Slight excited bounce

                // Show heart appearing between wings
                this.heart.visible = true;
                this.heart.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
                this.heart.position.set(0, -0.1, -0.5); // Between wings at back, lower
                this.heart.rotation.y = Math.sin(t * 3) * 0.1;

                // Wait a moment before turning
                if (this.heart.scale.x > 0.9) {
                    setTimeout(() => {
                        if (this.lovePhase === 2) this.lovePhase = 3;
                    }, 1000);
                }
            }

            // Phase 3: Turn 180° to face forward again
            else if (this.lovePhase === 3) {
                this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, Math.PI * 2, 0.05);

                // Move heart to front as we turn
                this.heart.position.lerp(new THREE.Vector3(0, 0.05, 0.8), 0.1);

                if (Math.abs(this.group.rotation.y - Math.PI * 2) < 0.1) {
                    this.lovePhase = 4;
                }
            }

            // Phase 4: Walk forward with heart
            else if (this.lovePhase === 4) {
                this.group.position.z = THREE.MathUtils.lerp(this.group.position.z, 1.5, 0.03);
                this.group.position.y = Math.abs(Math.sin(t * 10)) * 0.1; // Bobbing walk

                // Heart held proudly in front
                this.heart.visible = true;
                this.heart.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.05);
                this.heart.position.set(0, 0.05, 0.8);
                this.heart.rotation.y = Math.sin(t * 2) * 0.2; // Gentle sway
            }

            // Wings tucked but slight flutter of excitement
            this.leftWing.rotation.z = 0.4 + Math.sin(t * 20) * 0.05;
            this.rightWing.rotation.z = -0.4 - Math.sin(t * 20) * 0.05;

        } else {
            // Idle
            this.group.position.y = THREE.MathUtils.lerp(this.group.position.y, 0, 0.05);
            this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, 0, 0.05); // Face forward
            this.group.position.z = THREE.MathUtils.lerp(this.group.position.z, 0, 0.05); // Return to center

            this.leftWing.rotation.z = THREE.MathUtils.lerp(this.leftWing.rotation.z, 0.4, 0.1);
            this.rightWing.rotation.z = THREE.MathUtils.lerp(this.rightWing.rotation.z, -0.4, 0.1);

            this.body.rotation.y = Math.sin(t) * 0.05;
            this.head.rotation.y = Math.sin(t * 1.5) * 0.1;

            // Hide heart
            if (this.heart) {
                this.heart.scale.lerp(new THREE.Vector3(0, 0, 0), 0.2);
                if (this.heart.scale.x < 0.01) this.heart.visible = false;
            }

            // Reset love phase for next time
            this.lovePhase = 0;
        }
    }

    fly() { this.state = 'flying'; }
    land() { this.state = 'landing'; }
    showLove() { this.state = 'presenting_love'; }
} 