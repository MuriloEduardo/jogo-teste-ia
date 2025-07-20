import * as THREE from "three";

export class MainRenderer {
    constructor() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Configurações de performance
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;

        // Configurar background
        this.renderer.setClearColor(0x87CEEB, 1); // Céu azul claro
    }

    getDomElement() {
        return this.renderer.domElement;
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
    }

    setPixelRatio(ratio) {
        this.renderer.setPixelRatio(ratio);
    }

    dispose() {
        this.renderer.dispose();
    }
}
