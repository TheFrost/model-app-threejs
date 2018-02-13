// css control
import '../css/master.styl';

// js control
import ModelApp from './model.module.js';
import Slider from './slider.js';


new ModelApp('.view__scene', {
	debuggerMode: true
});

new Slider('modelSlider', {
	navArrows: true,
	videoDetector: false
});
