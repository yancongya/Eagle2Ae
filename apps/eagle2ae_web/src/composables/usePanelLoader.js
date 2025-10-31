import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';

// Lightweight scheduler for lazy-loading panels with IO visibility, retry, and memory guard
export function usePanelLoader(options = {}) {
  const cfg = Object.assign(
    {
      loadIntervalMs: 300,
      maxConcurrency: 1,
      timeoutMs: 12000,
      maxRetries: 2,
      placeholderMode: 'frosted', // 'solid' | 'frosted' | 'empty'
      blurRadius: 8,
      memoryGuard: { enable: true, maxIframes: 3, maxHeapMB: 1024 },
    },
    options
  );

  const items = reactive({}); // panelId -> state
  const order = ref([]); // registration order, used for background sequence
  const activeLoads = ref(0);
  const loadedCount = ref(0);
  const running = ref(false);
  let scheduleTimer = null;
  let io = null;

  function ensureIO() {
    if (io) return;
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = Object.keys(items).find((k) => items[k].el === e.target);
          if (!id) continue;
          items[id].visible = e.isIntersecting;
          // 仅在已入队的情况下根据可见性微调优先级，不自动排队
          if (items[id].status === 'queued') {
            items[id].priority = items[id].activated ? 0 : e.isIntersecting ? 1 : 2;
            scheduleSoon();
          }
        }
      },
      { root: null, threshold: 0.05 }
    );
  }

  function memoryOkay() {
    if (!cfg.memoryGuard?.enable) return true;
    if (loadedCount.value >= (cfg.memoryGuard.maxIframes ?? 3)) return false;
    const mem = performance && performance.memory;
    if (mem && cfg.memoryGuard.maxHeapMB) {
      const usedMB = mem.usedJSHeapSize / (1024 * 1024);
      if (usedMB > cfg.memoryGuard.maxHeapMB) return false;
    }
    return true;
  }

  function register(panelId, el, shouldLoadRef) {
    if (items[panelId]) return items[panelId];
    ensureIO();
    if (el) io.observe(el);

    const state = reactive({
      id: panelId,
      el,
      shouldLoadRef,
      status: 'idle', // idle | queued | loading | loaded | error
      retries: 0,
      error: null,
      priority: 2,
      activated: false,
      visible: false,
      startedAt: 0,
      finishedAt: 0,
      timeoutHandle: null,
    });
    items[panelId] = state;
    order.value.push(panelId);
    // 初始不入队，等待用户点击激活后再入队
    state.status = 'idle';
    scheduleSoon();
    return state;
  }

  function setElement(panelId, el) {
    const it = items[panelId];
    if (!it) return;
    if (it.el) io && io.unobserve(it.el);
    it.el = el;
    if (el) io && io.observe(el);
  }

  function activate(panelId) {
    const it = items[panelId];
    if (!it) return;
    it.activated = true;
    it.priority = 0;
    if (it.status === 'idle' || it.status === 'error') it.status = 'queued';
    scheduleSoon();
  }

  function markVisible(panelId, v) {
    const it = items[panelId];
    if (!it) return;
    it.visible = v;
    if (!it.activated && (it.status === 'idle' || it.status === 'queued')) {
      it.priority = v ? 1 : 2;
      scheduleSoon();
    }
  }

  function notifyLoaded(panelId) {
    const it = items[panelId];
    if (!it) return;
    it.status = 'loaded';
    it.finishedAt = performance.now();
    loadedCount.value++;
    activeLoads.value = Math.max(0, activeLoads.value - 1);
    if (it.timeoutHandle) {
      clearTimeout(it.timeoutHandle);
      it.timeoutHandle = null;
    }
    scheduleSoon();
  }

  function notifyError(panelId, err) {
    const it = items[panelId];
    if (!it) return;
    it.status = 'error';
    it.error = err || 'Load timeout';
    activeLoads.value = Math.max(0, activeLoads.value - 1);
    if (it.timeoutHandle) {
      clearTimeout(it.timeoutHandle);
      it.timeoutHandle = null;
    }
    scheduleSoon();
  }

  function retry(panelId) {
    const it = items[panelId];
    if (!it) return;
    if (it.retries >= cfg.maxRetries) return;
    const backoff = Math.min(2000, 300 * Math.pow(2, it.retries));
    it.retries++;
    it.status = 'queued';
    setTimeout(schedule, backoff);
  }

  function scheduleSoon() {
    if (!running.value) return;
    if (scheduleTimer) return;
    scheduleTimer = setTimeout(() => {
      scheduleTimer = null;
      schedule();
    }, 0);
  }

  function schedule() {
    if (!running.value) return;
    // Fill capacity
    while (activeLoads.value < cfg.maxConcurrency) {
      if (!memoryOkay()) break;
      const nextId = pickNext();
      if (!nextId) break;
      startLoad(nextId);
    }
    // If there are queued items and we're blocked by memory, try again later
    if (Object.values(items).some((i) => i.status === 'queued')) {
      scheduleTimer = setTimeout(() => {
        scheduleTimer = null;
        schedule();
      }, cfg.loadIntervalMs);
    }
  }

  function pickNext() {
    const candidates = Object.values(items)
      .filter((i) => i.status === 'queued')
      .sort((a, b) => a.priority - b.priority || order.value.indexOf(a.id) - order.value.indexOf(b.id));
    return candidates[0]?.id || null;
  }

  function startLoad(panelId) {
    const it = items[panelId];
    if (!it || it.status !== 'queued') return;
    it.status = 'loading';
    it.startedAt = performance.now();
    activeLoads.value++;
    if (it.shouldLoadRef) {
      if (typeof it.shouldLoadRef === 'object' && 'value' in it.shouldLoadRef) {
        it.shouldLoadRef.value = true;
      } else if (typeof it.shouldLoadRef === 'function') {
        it.shouldLoadRef(true);
      }
    }
    // Timeout protection
    it.timeoutHandle = setTimeout(() => {
      notifyError(panelId, 'Load timeout');
    }, cfg.timeoutMs);
  }

  function start() {
    running.value = true;
    scheduleSoon();
  }

  function stop() {
    running.value = false;
    if (scheduleTimer) {
      clearTimeout(scheduleTimer);
      scheduleTimer = null;
    }
  }

  onMounted(() => start());
  onBeforeUnmount(() => {
    stop();
    if (io) {
      for (const k of Object.keys(items)) {
        if (items[k].el) io.unobserve(items[k].el);
      }
      io.disconnect();
      io = null;
    }
  });

  return {
    cfg,
    items,
    order,
    activeLoads,
    loadedCount,
    running,
    register,
    setElement,
    activate,
    markVisible,
    notifyLoaded,
    notifyError,
    retry,
    start,
    stop,
  };
}