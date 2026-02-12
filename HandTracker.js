export class HandTracker {
    constructor(videoElement, onGesture) {
        this.video = videoElement;
        this.onGesture = onGesture; // callback(gestureName)
        this.hands = null;
        this.camera = null;
    }

    async init() {
        // Load MediaPipe scripts dynamically if not using bundler properly
        // For simplicity, we assume libraries are available via npm/vite
        const { Hands } = window; // This might need adjustment based on how Vite bundles MediaPipe

        // Use CDN for MediaPipe to avoid heavy bundling issues in this environment
        await this.loadScripts();

        this.hands = new window.Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults((results) => this.processResults(results));

        this.camera = new window.Camera(this.video, {
            onFrame: async () => {
                await this.hands.send({ image: this.video });
            },
            width: 640,
            height: 480
        });

        await this.camera.start();
        this.video.style.display = 'block';
    }

    async loadScripts() {
        const scripts = [
            'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
            'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
        ];

        for (const src of scripts) {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }
    }

    processResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            // Helper to get distance
            const getDist = (i, j) => {
                const p1 = landmarks[i];
                const p2 = landmarks[j];
                return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
            };

            // Fingers: 
            // 8: Index Tip, 5: Index MIP
            // 12: Middle Tip, 9: Middle MIP
            // 16: Ring Tip, 13: Ring MIP
            // 20: Pinky Tip, 17: Pinky MIP

            // Check if fingers are extended (Tip is higher/further than MIP relative to palm)
            // Simpler check: Distance from Palm Base (0)
            const palmBase = landmarks[0];

            const isExtended = (tipIdx) => getDist(tipIdx, 0) > 0.3; // Threshold might need tuning
            const isFolded = (tipIdx) => getDist(tipIdx, 0) < 0.25;

            const indexExt = isExtended(8);
            const middleExt = isExtended(12);
            const ringFolded = isFolded(16);
            const pinkyFolded = isFolded(20);

            // Peace Sign: Index & Middle UP, Ring & Pinky DOWN
            if (indexExt && middleExt && ringFolded && pinkyFolded) {
                this.onGesture('peace');
                return;
            }

            // Fallback to simple Open/Closed for flight
            // Compare distance between index tip (8) and palm base (0)
            const indexTip = landmarks[8];
            const middleTip = landmarks[12];
            const ringTip = landmarks[16];
            const pinkyTip = landmarks[20];

            const avgDist = (getDist(8, 0) + getDist(12, 0) + getDist(16, 0) + getDist(20, 0)) / 4;

            // Threshold for open hand vs closed hand
            if (avgDist > 0.45) { // Slightly stricter open threshold
                this.onGesture('open');
            } else if (avgDist < 0.2) {
                this.onGesture('closed');
            }
        }
    }
}
