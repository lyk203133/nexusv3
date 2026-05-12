<template>
  <div class="relative flex-1 h-52 overflow-hidden" ref="colRef">
    <!-- Selection highlight band -->
    <div class="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-slate-700/60 rounded-lg z-10" />

    <!-- Fade top -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-800 to-transparent z-20" />
    <!-- Fade bottom -->
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-800 to-transparent z-20" />

    <!-- Scrollable list -->
    <div
      ref="listRef"
      class="absolute inset-0 overflow-y-scroll no-scrollbar"
      @scroll.passive="onScroll"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <!-- Top padding so first item centres -->
      <div :style="{ height: paddingPx + 'px' }" />

      <div
        v-for="item in items"
        :key="item.value"
        class="flex items-center justify-center h-10 text-base transition-all duration-150 cursor-pointer"
        :class="item.value === selected
          ? 'text-white font-semibold scale-110'
          : 'text-slate-500'"
        @click="selectItem(item.value)"
      >
        {{ item.label }}
      </div>

      <!-- Bottom padding -->
      <div :style="{ height: paddingPx + 'px' }" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'

const ITEM_H = 40   // px, matches h-10
const VISIBLE = 5   // number of visible rows
const paddingPx = ITEM_H * Math.floor(VISIBLE / 2)  // 80px top/bottom padding

const props = defineProps({
  items: Array,          // [{ label, value }]
  selected: [Number, String],
})
const emit = defineEmits(['update:selected'])

const listRef = ref(null)
let isScrolling = false
let scrollTimer = null

// ── scroll to selected ────────────────────────────────────
function indexOfSelected() {
  return props.items.findIndex(i => i.value === props.selected)
}

function scrollToIndex(idx, smooth = false) {
  if (!listRef.value) return
  listRef.value.scrollTo({
    top: idx * ITEM_H,
    behavior: smooth ? 'smooth' : 'instant',
  })
}

onMounted(() => {
  nextTick(() => scrollToIndex(indexOfSelected(), false))
})

watch(() => props.selected, () => {
  if (!isScrolling) {
    nextTick(() => scrollToIndex(indexOfSelected(), true))
  }
})

watch(() => props.items, () => {
  nextTick(() => scrollToIndex(indexOfSelected(), false))
})

// ── snap on scroll end ────────────────────────────────────
function onScroll() {
  isScrolling = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    isScrolling = false
    snapToNearest()
  }, 120)
}

function snapToNearest() {
  if (!listRef.value) return
  const rawIdx = listRef.value.scrollTop / ITEM_H
  const idx = Math.round(rawIdx)
  const clamped = Math.max(0, Math.min(idx, props.items.length - 1))
  scrollToIndex(clamped, true)
  emit('update:selected', props.items[clamped].value)
}

// ── touch velocity snap ───────────────────────────────────
let touchStartY = 0
let touchStartScroll = 0

function onTouchStart(e) {
  touchStartY = e.touches[0].clientY
  touchStartScroll = listRef.value?.scrollTop ?? 0
}

function onTouchEnd() {
  // snapToNearest handles it via onScroll debounce
}

// ── click select ──────────────────────────────────────────
function selectItem(value) {
  const idx = props.items.findIndex(i => i.value === value)
  scrollToIndex(idx, true)
  emit('update:selected', value)
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
