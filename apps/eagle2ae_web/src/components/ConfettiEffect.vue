<template>
  <div class="pricing-hero__flair" ref="flairContainer">
    <div class="pricing-hero__hand" ref="handEl">
      <img class="pricing-hero__drag" src="https://assets.codepen.io/16327/hand-drag.png" alt="" ref="dragEl">
      <img class="pricing-hero__rock" src="https://assets.codepen.io/16327/hand-rock.png" alt="" ref="rockEl">
      <img class="pricing-hero__handle" src="https://assets.codepen.io/16327/2D-circle.png" alt="" ref="handleEl">
      <small ref="instructionsEl">drag me</small>
    </div>

    <div class="image-preload" aria-hidden="true">
      <img data-key="combo" src="https://assets.codepen.io/16327/3D-combo.png" width="1" height="1" style="position: absolute; left: -9999px;" />
      <img data-key="cone" src="https://assets.codepen.io/16327/3D-cone.png" width="1" height="1" style="position: absolute; left: -9999px;" />
      <img data-key="hoop" src="https://assets.codepen.io/16327/3D-hoop.png" width="1" height="1" style="position: absolute; left: -9999px;" />
      <img data-key="keyframe" src="https://assets.codepen.io/16327/3D-keyframe.png" width="1" height="1" style="position: absolute; left: -9999px;" />
      <img data-key="semi" src="https://assets.codepen.io/16327/3D-semi.png" width="1" height="1" style="position: absolute; left: -9999px;" />
      <img data-key="spiral" src="https://assets.codepen.io/16327/3D-spiral.png" width="1" height="1" style="position: absolute; left: -9999px;" />
      <img data-key="squish" src="https://assets.codepen.io/16327/3D-squish.png" width="1" height="1" style="position: absolute; left: -9999px;" />
      <img data-key="triangle" src="https://assets.codepen.io/16327/3D-triangle.png" width="1" height="1" style="position: absolute; left: -9999px;" />
      <img data-key="tunnel" src="https://assets.codepen.io/16327/3D-tunnel.png" width="1" height="1" style="position: absolute; left: -9999px;" />
      <img data-key="wat" src="https://assets.codepen.io/16327/3D-poly.png" width="1" height="1" style="position: absolute; left: -9999px;" />
    </div>
    <div class="explosion-preload" aria-hidden="true">
      <img data-key="blue-circle" src="https://assets.codepen.io/16327/2D-circles.png" style="position: absolute; left: -9999px;" />
      <img data-key="green-keyframe" src="https://assets.codepen.io/16327/2D-keyframe.png" style="position: absolute; left: -9999px;" />
      <img data-key="orange-lightning" src="https://assets.codepen.io/16327/2D-lightning.png" style="position: absolute; left: -9999px;" />
      <img data-key="orange-star" src="https://assets.codepen.io/16327/2D-star.png" style="position: absolute; left: -9999px;" />
      <img data-key="purple-flower" src="https://assets.codepen.io/16327/2D-flower.png" style="position: absolute; left: -9999px;" />
      <img data-key="cone" src="https://assets.codepen.io/16327/3D-cone.png" style="position: absolute; left: -9999px;" />
      <img data-key="keyframe" src="https://assets.codepen.io/16327/3D-spiral.png" style="position: absolute; left: -9999px;" />
      <img data-key="spiral" src="https://assets.codepen.io/16327/3D-spiral.png" style="position: absolute; left: -9999px;" />
      <img data-key="tunnel" src="https://assets.codepen.io/16327/3D-tunnel.png" style="position: absolute; left: -9999px;" />
      <img data-key="hoop" src="https://assets.codepen.io/16327/3D-hoop.png" style="position: absolute; left: -9999px;" />
      <img data-key="semi" src="https://assets.codepen.io/16327/3D-semi.png" style="position: absolute; left: -9999px;" />
    </div>
  </div>
  <svg class="pricing-hero__canvas" ref="svgCanvas"></svg>
  <div class="pricing-hero__proxy" ref="proxyDiv"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineExpose, nextTick } from 'vue';
import ConfettiCannon from '../utils/ConfettiCannon'; // Import the class

const flairContainer = ref(null);
const svgCanvas = ref(null);
const proxyDiv = ref(null);

const handEl = ref(null);
const instructionsEl = ref(null);
const rockEl = ref(null);
const dragEl = ref(null);
const handleEl = ref(null);
const preloadImagesEl = ref(null);
const xplodePreloadImagesEl = ref(null);

let cannonInstance = null;

onMounted(() => {
  nextTick(() => {
    const container = flairContainer.value;
    const canvas = svgCanvas.value;
    const proxy = proxyDiv.value;
    if (!container || !canvas || !proxy) return;

    // Pass the root element of the component as the container for confetti images
    cannonInstance = new ConfettiCannon(container, () => {
      // This function checks if we are outside the Hero section
      return window.scrollY > window.innerHeight - 100;
    });

    // Pass specific refs to the init method
    cannonInstance.init(
      container.querySelector(".pricing-hero__hand"),
      container.querySelector(".pricing-hero__hand small"),
      container.querySelector(".pricing-hero__rock"),
      container.querySelector(".pricing-hero__drag"),
      container.querySelector(".pricing-hero__handle"),
      container.querySelectorAll(".image-preload img"),
      container.querySelectorAll(".explosion-preload img"),
      canvas,
      proxy
    );
  });
});

onUnmounted(() => {
  if (cannonInstance && cannonInstance.observer) {
    cannonInstance.observer.kill();
  }
  cannonInstance = null;
});

defineExpose({
  // Expose methods if App.vue needs to call them directly, 
  // but cannonInstance manages its own events now.
});
</script>

<style scoped>
/* Adapted CSS from CodePen */
.pricing-hero__flair {
  display: block;
  margin: max(2rem, min(2.0712vw + 1.51456rem, 4rem)) auto
    max(2rem, min(6.21359vw + 0.543689rem, 8rem));
  width: 100%;
}

.pricing-hero__hand {
  left: 0;
  opacity: 0;
  pointer-events: none;
  position: fixed;
  top: 0;
  width: 30px;
  z-index: 4;
}

.pricing-hero__hand small {
  left: -60%;
  position: absolute;
  top: 20px;
  width: 200%;
}

.pricing-hero__drag,
.pricing-hero__rock {
  position: absolute;
  z-index: 4;
}

.pricing-hero__rock, .pricing-hero__drag {
  max-width: 141%;
  opacity: 0;
  right: 1px;
  top: -22px;
  width: 131%;
}

.pricing-hero__drag {
  opacity: 1;
}

.pricing-hero__handle {
  left: 0;
  opacity: 0;
  position: absolute;
  right: 0;
  top: -40px;
  width: 100%;
}

.pricing-hero__canvas {
  z-index: -1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Ensure clicks pass through */
}

.pricing-hero__proxy {
  bottom: 0;
  height: 100vh;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: 100vw;
  z-index: 3;
  pointer-events: none; /* THIS IS THE NEW LINE */
}

.explosion-img {
  will-change: transform;
}
</style>
