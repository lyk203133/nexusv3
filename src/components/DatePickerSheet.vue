<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <Transition name="backdrop">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/60 z-40"
        @click="cancel"
      />
    </Transition>

    <!-- Bottom Sheet -->
    <Transition name="sheet">
      <div
        v-if="modelValue"
        class="fixed bottom-0 left-0 right-0 z-50 bg-slate-800 rounded-t-2xl pb-safe"
      >
        <!-- Handle bar -->
        <div class="flex justify-center pt-3 pb-1">
          <div class="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        <!-- Title -->
        <div class="flex items-center justify-between px-5 py-3 border-b border-slate-700">
          <button class="text-slate-400 text-sm" @click="cancel">取消</button>
          <span class="text-white font-semibold text-sm">{{ title }}</span>
          <button class="text-emerald-400 text-sm font-semibold" @click="confirm">確認</button>
        </div>

        <!-- Picker columns -->
        <div class="flex justify-center items-center gap-0 px-4 py-2 select-none">
          <!-- Year -->
          <PickerColumn
            :items="years"
            :selected="draft.year"
            @update:selected="draft.year = $event"
          />
          <span class="text-slate-400 text-sm mx-1">年</span>

          <!-- Month -->
          <PickerColumn
            :items="months"
            :selected="draft.month"
            @update:selected="draft.month = $event"
          />
          <span class="text-slate-400 text-sm mx-1">月</span>

          <!-- Day -->
          <PickerColumn
            :items="days"
            :selected="draft.day"
            @update:selected="draft.day = $event"
          />
          <span class="text-slate-400 text-sm mx-1">日</span>
        </div>

        <!-- Safe area spacer for iPhone home bar -->
        <div class="h-4" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PickerColumn from './PickerColumn.vue'

const props = defineProps({
  modelValue: Boolean,       // v-model: open/close
  date: String,              // 'YYYY-MM-DD'
  title: { type: String, default: '選擇日期' },
  minDate: String,
  maxDate: String,
})

const emit = defineEmits(['update:modelValue', 'confirm'])

// ── helpers ──────────────────────────────────────────────
function parseDate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return { year: y, month: m, day: d }
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function pad(n) {
  return String(n).padStart(2, '0')
}

// ── draft state ──────────────────────────────────────────
const today = new Date()
const initDate = parseDate(props.date) || {
  year: today.getFullYear(),
  month: today.getMonth() + 1,
  day: today.getDate(),
}
const draft = ref({ ...initDate })

// Sync draft when sheet opens or date prop changes
watch(() => props.modelValue, (open) => {
  if (open) {
    const d = parseDate(props.date) || {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    }
    draft.value = { ...d }
  }
})

// ── column data ──────────────────────────────────────────
const minYear = computed(() => {
  const p = parseDate(props.minDate)
  return p ? p.year : today.getFullYear() - 3
})
const maxYear = computed(() => {
  const p = parseDate(props.maxDate)
  return p ? p.year : today.getFullYear()
})

const years = computed(() => {
  const arr = []
  for (let y = maxYear.value; y >= minYear.value; y--) {
    arr.push({ label: String(y), value: y })
  }
  return arr.reverse()
})

const months = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({
    label: pad(i + 1),
    value: i + 1,
  }))
)

const days = computed(() => {
  const max = daysInMonth(draft.value.year, draft.value.month)
  return Array.from({ length: max }, (_, i) => ({
    label: pad(i + 1),
    value: i + 1,
  }))
})

// Clamp day when month/year changes
watch([() => draft.value.year, () => draft.value.month], () => {
  const max = daysInMonth(draft.value.year, draft.value.month)
  if (draft.value.day > max) draft.value.day = max
})

// ── actions ──────────────────────────────────────────────
function confirm() {
  const { year, month, day } = draft.value
  emit('confirm', `${year}-${pad(month)}-${pad(day)}`)
  emit('update:modelValue', false)
}

function cancel() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
/* Backdrop transition */
.backdrop-enter-active,
.backdrop-leave-active { transition: opacity 0.25s ease; }
.backdrop-enter-from,
.backdrop-leave-to { opacity: 0; }

/* Sheet slide-up transition */
.sheet-enter-active,
.sheet-leave-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-enter-from,
.sheet-leave-to { transform: translateY(100%); }

/* iPhone safe area */
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
</style>
