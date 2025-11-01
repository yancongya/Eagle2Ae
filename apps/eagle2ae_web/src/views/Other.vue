<template>
  <main class="bg-white dark:bg-gray-900 min-h-[calc(100vh-var(--navbar-height,0px))] flex flex-col pt-14 sm:pt-18">
    <section class="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <header class="mb-6 sm:mb-8">
        <h1 ref="titleRef" class="font-bold text-gray-900 dark:text-gray-100 text-[clamp(1.75rem,4vw,2.5rem)]">{{ t('other.title') }}</h1>
        <p ref="subtitleRef" class="text-gray-600 dark:text-gray-400 text-[clamp(0.9rem,2.2vw,1.1rem)]">{{ t('other.subtitle') }}</p>
      </header>

      <!-- 分类组列表（以组为单位：标题+卡片一起入场） -->
      <div v-for="(group, gi) in groups" :key="group.id" :ref="setGroupRef" :data-group-index="gi" class="mb-8 sm:mb-12">
        <div class="mb-2 sm:mb-3" data-group-header>
          <h2 class="font-semibold text-gray-800 dark:text-gray-200 text-[clamp(1rem,2.6vw,1.25rem)]">{{ getLocalized(group.name) }}</h2>
          <p class="text-gray-600 dark:text-gray-400 text-[clamp(0.8rem,2vw,0.95rem)]">{{ getLocalized(group.note) }}</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-[clamp(0.75rem,2.2vw,1.25rem)]">
          <TagCard
            v-for="(tag, idx) in group.tags"
            :key="idx"
            :title="tag.title"
            :desc="tag.note"
            :link="tag.link"
            :hover-desc="tag.hover_desc"
            :icon="tag.icon"
            default-icon="/home.svg"
          />
        </div>
      </div>
    </section>

    <!-- 固定底部页脚：复用现有组件 -->
    <Footer class="mt-auto" />
  </main>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import TagCard from '../components/TagCard.vue';
import Footer from '../components/Footer.vue';
import { groupFadeIn } from '../utils/gsapAnimations';
import { gsap } from 'gsap';

const { t, locale } = useI18n();

// 原型数据（硬编码 2 个组）
const groups = ref([
  {
    id: 'friends',
    order: 1,
    name: { 'zh-CN': '友链', 'en-US': 'Friends' },
    note: { 'zh-CN': '社区与伙伴项目', 'en-US': 'Community and partner projects' },
    tags: [
      { title: { 'zh-CN': 'LinkStack', 'en-US': 'LinkStack' }, note: { 'zh-CN': '开源链接聚合', 'en-US': 'Open-source link hub' }, link: 'https://linkstack.org/' },
      { title: { 'zh-CN': 'Flare', 'en-US': 'Flare' }, note: { 'zh-CN': '轻量链接页', 'en-US': 'Lightweight link page' }, link: 'https://github.com/Flare-Empower/flare' }
    ]
  },
  {
    id: 'resources',
    order: 2,
    name: { 'zh-CN': '资源', 'en-US': 'Resources' },
    note: { 'zh-CN': '常用工具与文档', 'en-US': 'Useful tools and docs' },
    tags: [
      { title: { 'zh-CN': 'GSAP', 'en-US': 'GSAP' }, note: { 'zh-CN': '动画库', 'en-US': 'Animation library' }, link: 'https://greensock.com/gsap/' },
      { title: { 'zh-CN': 'Tailwind', 'en-US': 'Tailwind' }, note: { 'zh-CN': '实用类样式', 'en-US': 'Utility-first CSS' }, link: 'https://tailwindcss.com/' }
    ]
  }
]);

// 动态化：根据 /config/links/groups.json 解析各组文件
async function loadGroups() {
  try {
    // 允许浏览器缓存命中，减少二次访问的网络往返
    const indexRes = await fetch('/config/links/groups.json');
    if (!indexRes.ok) return;
    const indexJson = await indexRes.json();
    const files = Array.isArray(indexJson.groups) ? indexJson.groups.map(g => g.file).filter(Boolean) : [];
    const loaded = [];
    for (const fn of files) {
      try {
        const res = await fetch(`/config/links/${fn}`);
        if (!res.ok) continue;
        const data = await res.json();
        const info = data.group_info || {};
        const tags = Array.isArray(data.tag_list) ? data.tag_list : [];
        loaded.push({
          id: fn.replace(/\.json$/i, ''),
          order: typeof info.order === 'number' ? info.order : 999,
          name: info.name || '',
          note: info.note || '',
          tags: tags.map(t => ({
            title: t.title,
            note: t.note,
            link: t.link,
            hover_desc: t.hover_desc,
            icon: t.icon
          }))
        });
      } catch {}
    }
    if (loaded.length) {
      loaded.sort((a, b) => a.order - b.order);
      groups.value = loaded;
    }
  } catch {}
}

// 统一双语选择
const getLocalized = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    const loc = locale.value;
    if (typeof val[loc] === 'string') return val[loc];
    if (typeof val['en-US'] === 'string') return val['en-US'];
    if (typeof val['zh-CN'] === 'string') return val['zh-CN'];
    const first = Object.values(val).find(v => typeof v === 'string');
    return typeof first === 'string' ? first : '';
  }
  return '';
};

// 渐入动画：每个组内容进入视口时触发
const groupRefs = [];
const setGroupRef = (el) => { if (el) groupRefs.push(el); };
const titleRef = ref(null);
const subtitleRef = ref(null);

onMounted(async () => {
  await loadGroups();
  await nextTick();
  gsap.from([titleRef.value, subtitleRef.value], { opacity: 0, y: 24, duration: 0.6, ease: 'power3.out', stagger: 0.12 });
  const baseDelay = 0.2; // 标题先行后分组再跟进
  const groupGap = 0.1;  // 参考下载页的节奏：每组相隔约 0.1s
  const dur = 0.5;       // 每组淡入时长与下载页一致
  // 主时间线：严格顺序，但通过重叠让每组仅相隔 ~0.1s 开始
  const master = gsap.timeline({ delay: baseDelay });
  groupRefs.forEach((el, idx) => {
    const tl = groupFadeIn(el, { useScrollTrigger: false, groupIndex: idx, groupDelay: 0, duration: dur });
    const pos = idx === 0 ? 0 : `-=${dur - groupGap}`; // 在上一个组尚未结束时开始，形成 0.1s 间隔
    master.add(tl, pos);
  });
});
</script>

<style scoped>
/* 保持与现有页面统一的动效节奏与样式 */
</style>