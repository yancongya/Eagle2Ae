import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugin safely
try { gsap.registerPlugin(ScrollTrigger); } catch {}

export function cardHoverAnim(el, opts = {}) {
  const options = {
    scale: 1.03,
    shadow: '0 20px 40px -15px rgba(0,0,0,0.25)',
    duration: 0.25,
    ease: 'power2.out',
    ...opts
  };
  const enter = () => {
    gsap.to(el, { scale: options.scale, duration: options.duration, ease: options.ease });
    el.style.boxShadow = options.shadow;
  };
  const leave = () => {
    gsap.to(el, { scale: 1, duration: options.duration, ease: 'power2.in' });
    el.style.boxShadow = 'none';
  };
  return { enter, leave };
}

export function groupFadeIn(container, opts = {}) {
  const options = { duration: 0.6, ease: 'power3.out', groupIndex: 0, groupDelay: 0.12, baseDelay: 0, useScrollTrigger: true, ...opts };
  // 初始：仅组容器不可见并位移，标题与卡片随容器一起出现
  gsap.set(container, { autoAlpha: 0, y: 24, willChange: 'transform, opacity', pointerEvents: 'none' });

  const tl = gsap.timeline({
    delay: options.baseDelay + options.groupIndex * options.groupDelay,
    ...(options.useScrollTrigger ? {
      scrollTrigger: {
        trigger: container,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
        once: true
      }
    } : {})
  });

  // 分组容器整体淡入（标题+卡片随容器一起出现）
  tl.to(container, {
    autoAlpha: 1,
    y: 0,
    duration: options.duration,
    ease: options.ease,
    overwrite: 'auto',
    onComplete: () => {
      gsap.set(container, { clearProps: 'opacity,visibility,transform,willChange,pointer-events' });
    }
  });
  return tl;
}