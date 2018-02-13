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

		this.scenes = [];
		this.canvas = document.getElementById('c');

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
    this.renderer = new THREE.WebGLRenderer({
			alpha: true,
			canvas:this.canvas
		});
		this.renderer.setPixelRatio( window.devicePixelRatio );
	}

	setupScenes() {
		for (let i = 0; i < this.containers.length; i++) {

			let scene = new THREE.Scene();

			// scene container -----------------------------
			scene.userData.view = this.containers[i];

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
		this.updateSize();

		this.renderer.setScissorTest( false );
		this.renderer.clear();
		this.renderer.setScissorTest( true );

		this.scenes.forEach((scene) => {

			// get its position relative to the page's viewport
			let rect = scene.userData.view.getBoundingClientRect();

			// check if it's offscreen. If so skip it
			if (rect.bottom < 0 || rect.top > this.renderer.domElement.clientHeight ||
					rect.right < 0 || rect.left > this.renderer.domElement.clientWidth) return; // it's off screen
			
			// set the viewport
			let width 	= rect.right - rect.left;
			let height 	= rect.bottom - rect.top;
			let left 		= rect.left;
			let top 		= rect.top;

			this.renderer.setViewport(left, top, width, height);
			this.renderer.setScissor(left, top, width, height);
			
			// render scene updated
			this.renderer.render(scene, scene.userData.camera);

		});
	}

	updateSize() {
		let width = this.canvas.clientWidth;
		let height = this.canvas.clientHeight;
		if ( this.canvas.width !== width || this.canvas.height != height ) {
			this.renderer.setSize( width, height, false );
		}
	}
}