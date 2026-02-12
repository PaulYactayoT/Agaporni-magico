import { SceneManager } from './SceneManager.js';
import { Parrot } from './Parrot.js';
import { HandTracker } from './HandTracker.js';

const statusEl = document.getElementById('status');
const videoEl = document.getElementById('camera-preview');

const sceneManager = new SceneManager();
const parrot = new Parrot();
sceneManager.scene.add(parrot.group);

const tracker = new HandTracker(videoEl, (gesture) => {
    if (gesture === 'open') {
        parrot.fly();
        statusEl.innerText = '✨ Lorito volando! (Mano abierta)';
        statusEl.style.color = '#00ff88';
        statusEl.style.boxShadow = '0 0 15px #00ff88';
    } else if (gesture === 'closed') {
        parrot.land();
        statusEl.innerText = '💤 Lorito aterrizando... (Mano cerrada)';
        statusEl.style.color = '#ffcc00';
        statusEl.style.boxShadow = '0 0 15px #ffcc00';
    } else if (gesture === 'peace') {
        parrot.showLove();
        statusEl.innerText = '❤️ Amor para Niriel! (Amor y Paz)';
        statusEl.style.color = '#ff0066';
        statusEl.style.boxShadow = '0 0 15px #ff0066';
    }
});

tracker.init().then(() => {
    statusEl.innerText = '✋ Mueve tu mano frente a la cámara';
}).catch(err => {
    console.error(err);
    statusEl.innerText = '❌ Error al acceder a la cámara';
});

function animate(time) {
    requestAnimationFrame(animate);
    parrot.update(time);
    sceneManager.render(time);
}

animate(0);
