import * as THREE from 'three';
import Gui from 'dat-gui';
import StatsLib from 'three-stats';
import OrbitControlsLib from 'three-orbit-controls';

const Stats = StatsLib.Stats;
const OrbitControls = OrbitControlsLib(THREE);

export default class ModelApp {
  constructor(selector, userOptions) {
    this.containers = document.querySelectorAll(selector);
		if (!this.containers) return console.warn('Containers selector is not defined...');
		
		// default config
		this.options = {
			debuggerMode: false
		};

		// sync config
		if (userOptions) {
			for (let option in userOptions) {
				if (this.options.hasOwnProperty(option)) {
					this.options[option] = userOptions[option];
				}
			}
		}

		this.renderers = [];
		this.scenes = [];

    this.init();
  }

  init() {
    this.setup();
    this.animate();
  }

  setup() {
		this.setupRenderer();
		this.setupScenes();
		if (this.options.debuggerMode) this.setupDebuggerMode();
	}

	setupRenderer() {
		for (let i = 0; i < this.containers.length; i++) {
			let renderer = new THREE.WebGLRenderer({
				alpha: true
			});
			renderer.setSize(
				this.containers[i].clientWidth,
				this.containers[i].clientHeight,
			);
			renderer.setPixelRatio( window.devicePixelRatio );
			
			this.containers[i].appendChild(renderer.domElement);

			this.renderers.push(renderer);
		}
	}

	setupScenes() {
		for (let i = 0; i < this.containers.length; i++) {

			let scene = new THREE.Scene();

			// // scene container -----------------------------
			// scene.userData.view = this.containers[i];

			// scene camera --------------------------------
			let camera = new THREE.PerspectiveCamera(
				75,
				1,
				.1,
				100
			);
			camera.position.z = 5;
			scene.userData.camera = camera;

			// scene controls -----------------------------------------------
			let controls = new OrbitControls(camera, this.containers[i]);
			controls.minDistance = 2;
			controls.maxDistance = 5;
			controls.enablePan = false;
			controls.enableZoom = false;
			scene.userData.controls = controls;

			// temporal stuff ----------------------------------
			let geom = new THREE.IcosahedronGeometry(2, 1);
			let mat = new THREE.MeshNormalMaterial({
				flatShading: true
			});
			let mesh = new THREE.Mesh(geom, mat);
			scene.add(mesh);

			// save scene instancy ---------------------------------
			this.scenes.push(scene);

		}
	}
	
	setupDebuggerMode() {
		// stats -----------------------
		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);
	}

  animate() {
		if (this.options.debuggerMode) this.stats.begin(); // stats wrap start

		this.render();

		if (this.options.debuggerMode) this.stats.end(); // stats wrap end

		window.requestAnimationFrame(this.animate.bind(this));
	}
	
	render() {
		this.scenes.forEach((scene, index) => {
			
			// render scene updated
			this.renderers[index].render(scene, scene.userData.camera);

		});
	}
}