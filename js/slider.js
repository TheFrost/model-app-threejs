import { whichAnimationEvent } from './helpers';

export default class Slider {
  constructor(id, userOptions) {
    this.instanceID = id;
    this.instance = document.getElementById(id);
    if (!this.instance) { return true; }

    this.isMobile = window.innerWidth < 768;
    this.isTouchDevice = window.innerWidth <= 1024;

    this.rangeTouchSize = 50;

    // default config
    this.options = {
      navArrows: false,
      navArrowPrev: false,
      navArrowNext: false,
      navBullets: false,
      videoDetector: true,
      muteVideos: true,
      muteControl: false,
      autoSlide: false,
      autoSlideTime: 5000,
      timeTransition: false,
      onlyMobile: false
    };
    // set user config
    if (userOptions) {
      for (let option in userOptions) {
        this.options[option] = userOptions[option];
      }
    }

    //stop constructor if mobile ctrl is active and resolution is not mobile state
    if (this.options.onlyMobile && !this.isMobile) return;

    this.activeIndex = 0;
    this.slides = document.querySelectorAll(`#${id} .slider__item`);
    this.videos = document.querySelectorAll(`#${id} video`);

    // validate mobile state for muteControl
    if (this.isMobile) { this.options.muteControl = false; }

    this.init();
  }

  init() {
    if (this.options.navArrows) { this.makeArrows(); }
    if (this.options.navBullets) { this.makeBullets(); }
    if (this.options.muteControl && !this.isMobile) { this.makeMuteControl(); }
    if (this.options.timeTransition) { this.applyTimeTransition(); }

    if (this.options.autoSlide) { 
      this.initAutoSlide(); 
    } else if (this.videos !== null) {
      for (let i = 0; i < this.videos.length; i++) {
        this.videos[i].loop = true;
      }
    }

    if (this.options.muteVideos && this.videos !== null) {
      this.audioVideosControl();
    }

    this.instance.classList.add('initialized');
    this.slides[0].classList.add('active');

    if (this.options.videoDetector) { this.videoDetector(); }

    this.bindEvents();
  }

  applyTimeTransition() {
    for (let i = 0; i < this.slides.length; i++) {
      var styles = this.slides[i].getAttribute('style');
      styles = styles ? styles : '';
      styles += `animation-duration: ${this.options.timeTransition}ms;`;
      this.slides[i].setAttribute('style', styles);
    }
  }

  makeArrows() {
    var arrow = document.createElement('a');
    arrow.setAttribute('href', '#');
    arrow.setAttribute('class', 'slider__ctrl');

    var prevArrow = arrow.cloneNode();
    prevArrow.setAttribute('data-dir', 'prev');
    prevArrow.classList.add('prev');
    if (this.options.navArrowPrev) {
      prevArrow.innerHTML = this.options.navArrowPrev;
    }

    var nextArrow = arrow.cloneNode();
    nextArrow.setAttribute('data-dir', 'next');
    nextArrow.classList.add('next');
    if (this.options.navArrowNext) {
      nextArrow.innerHTML = this.options.navArrowNext;
    }

    this.instance.appendChild(prevArrow);
    this.instance.appendChild(nextArrow);
    
    this.arrows = document.querySelectorAll(`#${this.instanceID} .slider__ctrl`);
  }

  makeBullets() {
    var bulletLink = document.createElement('a');
    bulletLink.setAttribute('href', '#');

    var bullet = document.createElement('li');
    bullet.setAttribute('class', 'slider__bullet');
    bullet.appendChild(bulletLink);

    var bulletsContainer = document.createElement('ul');
    bulletsContainer.setAttribute('class', 'slider__bullets list-nostyle');

    for (let i = 0; i < this.slides.length; i++) {
      let bulletNode = bullet.cloneNode(true);
      bulletNode.setAttribute('data-index', i);

      bulletsContainer.appendChild(bulletNode);
    }

    this.instance.appendChild(bulletsContainer);
    this.bullets = bulletsContainer.children;
    this.bullets[0].classList.add('active');
  }

  makeMuteControl() {
    this.muteCtrl = null;

    var ctrlWrap = document.createElement('a');
    ctrlWrap.setAttribute('href', '#');
    ctrlWrap.setAttribute('class', 'slider__mutectrl');

    var ctrlItem = document.createElement('span');

    for (let i = 0; i < 5; i++) {
      let itemNode = ctrlItem.cloneNode();
      ctrlWrap.appendChild(itemNode);
    }
    this.muteCtrl = ctrlWrap;
    this.instance.appendChild(this.muteCtrl);
  }

  initAutoSlide() {
    this.timer = setInterval(this.nextHandler.bind(this), this.options.autoSlideTime);
  }

  audioVideosControl() {
    if (this.options.muteControl) {
      this.muteCtrl.classList.toggle('mute');
    }

    for (let i = 0; i < this.videos.length; i++) {
      this.videos[i].muted = this.options.muteControl
        ? this.muteCtrl.classList.contains('mute')
        : this.options.muteVideos;
    }
  }

  resetAutoSlide() {
    clearInterval(this.timer);
    this.initAutoSlide();
  }

  stopAutoSlide() {
    clearInterval(this.timer);
  }

  bindEvents() {
    if (this.isTouchDevice) {
      this.instance.addEventListener('touchstart', (e) => {
        this.touchStartPos = e.changedTouches[0].clientX;
      }, false);

      this.instance.addEventListener('touchend', (e) => {
        this.touchEndPos = e.changedTouches[0].clientX;
        
        this.validateTouchGesture();
      }, false);
    }

    if (this.options.navArrows) {
      for (let i = 0; i < this.arrows.length; i++) {
        this.arrows[i].addEventListener('click', this.onClickArrow.bind(this), false);
      }
    }
    
    if (this.options.navBullets) {
      for (let i = 0; i < this.bullets.length; i++) {
        this.bullets[i].addEventListener('click', this.onClickBullet.bind(this), false);
      }
    }

    var animationEvent = whichAnimationEvent();
    for (let i = 0; i < this.slides.length; i++) {
      this.slides[i].addEventListener(animationEvent, this.onAnimationSlideEnd.bind(this), false);
    }

    if (this.options.muteControl && this.muteControl !== null) {
      this.muteCtrl.addEventListener('click', (e) => {
        e.preventDefault();
        this.audioVideosControl();
      }, false);

      if (this.videos !== null) {
        for (let i = 0; i < this.videos.length; i++) {
          this.videos[i].addEventListener('playing', this.onPlayingVideo.bind(this), false);
          this.videos[i].addEventListener('waiting', this.onWaitingVideo.bind(this), false);
          // this.videos[i].addEventListener('progress', () => { alert('progress trigger!!!'); } , false);
          // this.videos[i].addEventListener('loadeddata', () => { alert('loaded data trigger!!!'); } , false);
          // this.videos[i].addEventListener('error', () => { alert('error trigger!!!'); } , false);
          // this.videos[i].addEventListener('abort', () => { alert('abort trigger!!!'); } , false);
          // this.videos[i].addEventListener('suspend', () => { alert('suspend trigger!!!'); } , false);
          // this.videos[i].addEventListener('emptied', () => { alert('emptied trigger!!!'); } , false);
          // this.videos[i].addEventListener('canplay', () => { alert('canplay trigger!!!'); } , false);
          // this.videos[i].addEventListener('stalled', () => { alert('stalled trigger!!!'); } , false);
          // this.videos[i].addEventListener('loadstart', () => { alert('loadstart trigger!!!'); } , false);
        }
      }
    }
  }

  onPlayingVideo() {
    this.activeVideo.classList.add('show');
    this.muteCtrl.classList.add('show');
    // alert('play!!');
  }

  onWaitingVideo() {
    this.muteCtrl.classList.remove('show');
  }

  validateTouchGesture() {
    var diference = Math.abs(this.touchStartPos - this.touchEndPos);

    if (diference > this.rangeTouchSize) {
      
      if (this.touchStartPos < this.touchEndPos) {
        this.prevHandler();
      } else {
        this.nextHandler();
      }
    }
  }

  onAnimationSlideEnd(e) {
    var target = e.target;

    target.classList.remove('moving', 'entry', 'leave', 'next', 'prev');
  }

  onClickArrow(e) {
    e.preventDefault();

    var target = e.currentTarget,
        dir = target.getAttribute('data-dir'),
        method = this[dir + 'Handler'].bind(this);

    if (this.options.autoSlide) { this.resetAutoSlide(); }

    method();
  }

  onClickBullet(e) {
    e.preventDefault();

    var targetIndex = parseInt(e.currentTarget.getAttribute('data-index'));

    // stop function if click on active bullet
    if (targetIndex === this.activeIndex) return

    var dir = targetIndex > this.activeIndex ? 'next' : 'prev';
    
    if (this.options.autoSlide) { this.resetAutoSlide(); }

    this.changeSlide(targetIndex, dir);

    this.activeIndex = targetIndex;

    this.updateBullets();
  }

  nextHandler() {
    var nextIndex = this.activeIndex < this.slides.length - 1 
      ? this.activeIndex + 1
      : 0;

    this.changeSlide(nextIndex, 'next');

    this.activeIndex = this.activeIndex < this.slides.length - 1 
    ? this.activeIndex + 1
    : 0;

    if (this.options.navBullets) { this.updateBullets(); }
  }

  prevHandler() {
    var prevIndex = this.activeIndex > 0
      ? this.activeIndex - 1
      : this.slides.length - 1;

    this.changeSlide(prevIndex, 'prev');

    this.activeIndex = this.activeIndex > 0
    ? this.activeIndex - 1
    : this.slides.length - 1;

    if (this.options.navBullets) { this.updateBullets(); }
  }

  changeSlide(comingIndex, dir) {
    var current = this.slides[this.activeIndex],
        comingSlide = this.slides[comingIndex];

    if (this.options.videoDetector && this.activeVideo !== null) { this.stopActiveVideo(); }

    current.classList.remove('active');
    current.classList.add('moving', 'leave', dir);

    comingSlide.classList.add('active', 'entry', 'moving', dir);

    if (this.options.videoDetector) { this.videoDetector(); }
  }

  updateBullets() {
    var currentBullet = document.querySelector(`#${this.instanceID} .slider__bullet.active`);
    currentBullet.classList.remove('active');

    this.bullets[this.activeIndex].classList.add('active');
  }

  videoDetector() {
    this.activeVideo = document.querySelector(`#${this.instanceID} .slider__item.active video`);
    if (this.activeVideo !== null) {
      this.activeVideo.play();
      this.bindVideoEvents();
      if (this.options.autoSlide) { this.stopAutoSlide(); }
    } else if (this.options.muteControl) {
      this.muteCtrl.classList.remove('show');
    }
  }

  stopActiveVideo() {
    this.activeVideo.onended = null;
    this.activeVideo.pause();
    this.activeVideo.currentTime = 0;
    this.activeVideo.classList.remove('show');
  }

  bindVideoEvents() {
    this.activeVideo.onended = this.endVideoHandler.bind(this);
  }

  endVideoHandler() {
    if (this.options.autoSlide) { 
      this.nextHandler();
      this.resetAutoSlide(); 
    }
  }
}
