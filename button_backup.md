## Button Backup

### HTML Structure

```html
            <router-link to="/ae-preview" class="inline-flex justify-center w-36 px-4 py-2 text-lg font-bold transition-all duration-300 transform rounded-xl hover:scale-105 has-sweep-light"
                         style="background-color: rgb(0, 0, 91); border: 3px solid rgb(82, 59, 196); color: rgb(153, 153, 255);">
              AE 预览
            </router-link>
            <router-link to="/eagle-preview" class="inline-flex justify-center w-36 px-4 py-2 text-lg font-bold text-white transition-all duration-300 transform rounded-xl border border-white/30 bg-emerald-500 hover:bg-emerald-600 hover:scale-105 has-sweep-light">
              Eagle 预览
            </router-link>
```

### CSS Styles

```css
<style scoped>
  .has-sweep-light {
    position: relative;
    overflow: hidden; /* Ensure sweep light stays within bounds */
  }

  .has-sweep-light::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%; /* Start off-screen to the left */
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.3), /* Light sweep color */
      transparent
    );
    transition: transform 0.5s ease-in-out; /* Smooth transition for sweep */
    transform: skewX(-20deg); /* Optional: add a slight skew for effect */
    z-index: 1; /* Ensure it's above button background but below text */
  }

  .has-sweep-light:hover::before {
    transform: translateX(200%) skewX(-20deg); /* Move across the button */
  }
</style>
```