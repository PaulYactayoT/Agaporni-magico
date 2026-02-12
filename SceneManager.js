import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.container = document.body;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;
        this.camera.position.y = 1;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        this.addLights();
        this.setupPostProcessing();
        
        window.addEventListener('resize', () => this.onWindowResize());
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffaa44, 2); // Warm light
        spotLight.position.set(5, 10, 5);
        spotLight.castShadow = true;
        this.scene.add(spotLight);

        const pointLight = new THREE.PointLight(0xff6600, 1, 10);
        pointLight.position.set(-2, 2, 2);
        this.scene.add(pointLight);
    }

    setupPostProcessing() {
        // Simple glow effect placeholder or logic
        // For now, we'll keep it simple vanilla Three.js
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render(time) {
        this.renderer.render(this.scene, this.camera);
    }
}
