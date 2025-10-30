<template>
// ... existing code ...
<pane :size="sizes.top">
  <div ref="panel2ContainerRef" class="relative w-full h-full">
    <PanelFrame 
      panel-id="panel2"
      label="Eagle 预览 2"
      src="/extensions/eagle/index.html" 
      :loaded="panel2LoadedComputed"
      :should-load="shouldLoadPanel2"
      :hide-until-loaded="true"
      :show-skeleton="false"
      variant="secondary"
      @load="onPanel2Loaded"
    />
    <transition name="fade300">
      <PanelPlaceholder
        v-if="panel2Status !== 'loaded'"
        :panel-id="'panel2'"
        :label="'Eagle 预览 2'"
        :status="panel2Status"
        :mode="placeholderMode"
        :blur-radius="placeholderBlur"
        @activate="activatePanel('panel2')"
      />
    </transition>
  </div>
</pane>
// ... existing code ...
<pane :size="sizes.bottom">
  <div ref="panel3ContainerRef" class="relative w-full h-full">
    <PanelFrame 
      panel-id="panel3"
      label="Eagle 预览 3"
      src="/extensions/eagle/index.html" 
      :loaded="panel3LoadedComputed"
      :should-load="shouldLoadPanel3"
      :hide-until-loaded="true"
      :show-skeleton="false"
      variant="tertiary"
      @load="onPanel3Loaded"
    />
    <transition name="fade300">
      <PanelPlaceholder
        v-if="panel3Status !== 'loaded'"
        :panel-id="'panel3'"
        :label="'Eagle 预览 3'"
        :status="panel3Status"
        :mode="placeholderMode"
        :blur-radius="placeholderBlur"
        @activate="activatePanel('panel3')"
      />
    </transition>
  </div>
</pane>
// ... existing code ...
</template>