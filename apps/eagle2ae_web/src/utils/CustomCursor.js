import { gsap } from 'gsap';

// 仅对鼠标坐标增加阻尼：不替换系统光标、不创建任何可视叠加层
export function initCustomCursor() {
  if (typeof window === 'undefined') return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = prefersReduced ? 0.01 : 0.35; // 阻尼力度（越大越“粘”）
  const ease = prefersReduced ? 'none' : 'power3.out';

  // 通过一个虚拟对象存储阻尼后的坐标，并写入CSS变量供页面需要时使用
  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const setMX = (v) => document.documentElement.style.setProperty('--e2a-mx', v + 'px');
  const setMY = (v) => document.documentElement.style.setProperty('--e2a-my', v + 'px');

  // 使用 quickTo 实现阻尼更新
  const qx = gsap.quickTo(pos, 'x', { duration, ease, onUpdate: () => setMX(pos.x) });
  const qy = gsap.quickTo(pos, 'y', { duration, ease, onUpdate: () => setMY(pos.y) });

  const onMove = (e) => {
    qx(e.clientX);
    qy(e.clientY);
  };

  window.addEventListener('mousemove', onMove, { passive: true });

  // 提供释放函数以便路由切换时清理
  return function dispose() {
    window.removeEventListener('mousemove', onMove);
  };
}