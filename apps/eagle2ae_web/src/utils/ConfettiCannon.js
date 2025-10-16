import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
import { CustomEase } from 'gsap/CustomEase';
import { CustomWiggle } from 'gsap/CustomWiggle';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(Observer, CustomEase, CustomWiggle, Physics2DPlugin, ScrollTrigger, ScrollToPlugin);

export default class ConfettiCannon {
  constructor(containerEl, checkOutsideHeroFn) {
    this.hero = containerEl; // The container where explosion images will be appended
    this.checkOutsideHero = checkOutsideHeroFn; // Function to check if outside Hero
    this.el = {}; // To store refs to internal elements
    this.isDrawing = false;

    this.imageMap = {};
    this.imageKeys = [];

    this.explosionMap = {};
    this.explosionKeys = [];

    this.currentLine = null;
    this.startImage = null;
    this.circle = null;
    this.startX = 0;
    this.startY = 0;
    this.lastDistance = 0;

    this.animationIsOk = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

    this.wiggle = CustomWiggle.create("myWiggle", { wiggles: 6 });
    this.clamper = gsap.utils.clamp(1, 100);

    // These will be set in init, but need to be defined for quickTo
    this.xSetter = gsap.quickTo(document.createElement("div"), "x", { duration: 0.1 }); // Placeholder
    this.ySetter = gsap.quickTo(document.createElement("div"), "y", { duration: 0.1 }); // Placeholder
  }

  init(handEl, instructionsEl, rockEl, dragEl, handleEl, preloadImagesEl, xplodePreloadImagesEl, svgCanvasEl, proxyDivEl) {
    this.el.hand = handEl;
    this.el.instructions = instructionsEl;
    this.el.rock = rockEl;
    this.el.drag = dragEl;
    this.el.handle = handleEl;
    this.el.canvas = svgCanvasEl; // This is the SVG element
    this.el.proxy = proxyDivEl;

    preloadImagesEl.forEach((img) => {
      const key = img.dataset.key;
      this.imageMap[key] = img;
      this.imageKeys.push(key);
    });

    xplodePreloadImagesEl.forEach((img) => {
      const key = img.dataset.key;
      this.explosionMap[key] = img;
      this.explosionKeys.push(key);
    });

    this.xSetter = gsap.quickTo(this.el.hand, "x", { duration: 0.1 });
    this.ySetter = gsap.quickTo(this.el.hand, "y", { duration: 0.1 });

    this.setpricingMotion();
    this.initObserver();
    this.initEvents();
  }

  initEvents() {
    if (!this.animationIsOk || ScrollTrigger.isTouch === 1) return;

    // Mousemove for custom hand cursor (if implemented globally)
    // this.hero.addEventListener("mousemove", (e) => {
    //   this.xSetter(e.x);
    //   this.ySetter(e.y);
    // });
  }

  setpricingMotion() {
    gsap.set(this.el.hand, { xPercent: -50, yPercent: -50 });
  }

  initObserver() {
    if (!this.animationIsOk) return;

    // We want this to trigger outside the Hero section
    // The proxyDiv will be the target for Observer
    this.observer = Observer.create({
      target: this.el.proxy,
      type: "pointer",
      onPress: (e) => {
        if (this.checkOutsideHero()) {
          this.startDrawing(e);
        }
      },
      onDrag: (e) => this.isDrawing && this.updateDrawing(e),
      onDragEnd: (e) => this.clearDrawing(e),
      onRelease: (e) => this.clearDrawing(e)
    });
  }

  startDrawing(e) {
    this.isDrawing = true;

    // gsap.set(this.el.instructions, { opacity: 0 });

    this.startX = e.x;
    this.startY = e.y + window.scrollY;

    // Create line
    this.currentLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    this.currentLine.setAttribute("x1", this.startX);
    this.currentLine.setAttribute("y1", this.startY);
    this.currentLine.setAttribute("x2", this.startX);
    this.currentLine.setAttribute("y2", this.startY);
    this.currentLine.setAttribute("stroke", "#fffce1");
    this.currentLine.setAttribute("stroke-width", "2");
    this.currentLine.setAttribute("stroke-dasharray", "4");

    this.circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    this.circle.setAttribute("cx", this.startX);
    this.circle.setAttribute("cy", this.startY);
    this.circle.setAttribute("r", "30");
    this.circle.setAttribute("fill", "#0e100f");

    // Create image at start point
    const randomKey = gsap.utils.random(this.imageKeys);
    const original = this.imageMap[randomKey];
    const clone = document.createElementNS("http://www.w3.org/2000/svg", "image");

    clone.setAttribute("x", this.startX - 25);
    clone.setAttribute("y", this.startY - 25);
    clone.setAttribute("width", "50");
    clone.setAttribute("height", "50");
    clone.setAttributeNS("http://www.w3.org/1999/xlink", "href", original.src);

    this.startImage = clone;

    this.el.canvas.appendChild(this.currentLine);
    this.el.canvas.appendChild(this.circle);
    this.el.canvas.appendChild(this.startImage);

    // gsap.set(this.el.drag, { opacity: 1 });
    // gsap.set(this.el.handle, { opacity: 1 });
    // gsap.set(this.el.rock, { opacity: 0 });
  }

  updateDrawing(e) {
    if (!this.currentLine || !this.startImage) return;

    let cursorX = e.x;
    let cursorY = e.y + window.scrollY;

    let dx = cursorX - this.startX;
    let dy = cursorY - this.startY;

    let distance = Math.sqrt(dx * dx + dy * dy);
    let shrink = (distance - 30) / distance;

    let x2 = this.startX + dx * shrink;
    let y2 = this.startY + dy * shrink;

    if (distance < 30) {
      x2 = this.startX;
      y2 = this.startY;
    }

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    gsap.to(this.currentLine, {
      attr: { x2, y2 },
      duration: 0.1,
      ease: "none"
    });

    // Eased scale (starts fast, slows down)
    let raw = distance / 100;
    let eased = Math.pow(raw, 0.5);
    let clamped = this.clamper(eased);

    gsap.set([this.startImage, this.circle], {
      scale: clamped,
      rotation: `${angle + -45}_short`,
      transformOrigin: "center center"
    });

    // Move & rotate hand (if implemented globally)
    // gsap.to(this.el.hand, {
    //   rotation: `${angle + -90}_short`,
    //   duration: 0.1,
    //   ease: "none"
    // });

    this.lastDistance = distance;
  }

  createExplosion(x, y, distance = 100) {
    const count = Math.round(gsap.utils.clamp(3, 100, distance / 20));
    const angleSpread = Math.PI * 2;
    const explosion = gsap.timeline();
    const speed = gsap.utils.mapRange(0, 500, 0.3, 1.5, distance);
    const sizeRange = gsap.utils.mapRange(0, 500, 20, 60, distance);

    for (let i = 0; i < count; i++) {
      const randomKey = gsap.utils.random(this.explosionKeys);
      const original = this.explosionMap[randomKey];
      const img = original.cloneNode(true);

      img.className = "explosion-img";
      img.style.position = "absolute";
      img.style.pointerEvents = "none";
      img.style.height = `${gsap.utils.random(20, sizeRange)}px`;
      img.style.left = `${x}px`;
      img.style.top = `${y}px`;
      img.style.zIndex = 4;

      this.hero.appendChild(img); // Append to the main container

      const angle = Math.random() * angleSpread;
      const velocity = gsap.utils.random(500, 1500) * speed;

      explosion
        .to(
          img,
          {
            physics2D: {
              angle: angle * (180 / Math.PI),
              velocity: velocity,
              gravity: 3000
            },
            rotation: gsap.utils.random(-180, 180),
            duration: 1 + Math.random()
          },
          0
        )
        .to(
          img,
          {
            opacity: 0,
            duration: 0.2,
            ease: "power1.out",
            onComplete: () => img.remove()
          },
          1
        );
    }

    return explosion;
  }

  clearDrawing(e) {
    if (!this.isDrawing) return;
    this.createExplosion(this.startX, this.startY, this.lastDistance);

    this.isDrawing = false;

    // Clear all elements from SVG and reset references
    this.el.canvas.innerHTML = "";
    this.currentLine = null;
    this.startImage = null;

    // Scroll to top after confetti
    gsap.to(window, { duration: 1.5, scrollTo: 0, ease: 'power2.inOut' });
  }
}
