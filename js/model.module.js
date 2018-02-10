import * as THREE from 'three';
import Stats from 'three-stats';
import Gui from 'dat-gui';
import OrbitControls from 'three-orbit-controls';
const Controls = OrbitControls(THREE);

export default class ModelApp {
  constructor(container) {
    this.container = document.querySelector(container);
    if (!this.container) return console.warn('Container is not defined...');

    this.init();
  }

  init() {
    this.setup();
    this.bindEvents();


    // stuff
    var geom = new THREE.IcosahedronGeometry(2, 1);
    var mat = new THREE.MeshNormalMaterial({
      flatShading: true
    });
    var mesh = new THREE.Mesh(geom, mat);
    this.scene.add(mesh);

    this.animate();
  }

  setup() {
    // renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true
    });
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.container.appendChild(this.renderer.domElement);

    // scene
    this.scene = new THREE.Scene();

    // camera
    var fieldOfView   = 45,
        aspect        = this.getAspect(),
        nearPlane     = 1,
        farPlane      = 1000;
    this.camera = new THREE.PerspectiveCamera(
      fieldOfView,
      aspect,
      nearPlane,
      farPlane
    );
    this.camera.position.z = 10;
    this.scene.add(this.camera);

    // controls
    this.controls = new Controls(this.camera);
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  bindEvents() {
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  onWindowResize() {
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );

    this.camera.aspect = this.getAspect();
    this.camera.updateProjectionMatrix();
  }

  getAspect() {
    return this.container.clientWidth / this.container.clientHeight;
  }
}