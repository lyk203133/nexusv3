<template>
  <div class="flex flex-col h-full bg-slate-900">
    <div class="p-4 flex items-center bg-slate-800 shadow-lg z-10">
      <button @click="$router.push('/security-center')" class="p-2 mr-2">
        <ArrowLeft class="text-white" />
      </button>
      <div>
        <h2 class="text-white font-bold text-lg">{{ t.security.changePin }}</h2>
      </div>
    </div>
    <div class="flex-1 p-5 space-y-6">
      <div class="space-y-4">
        <InputField 
          :icon="Key" 
          :isSecure="true" 
          :label="t.security.oldPin" 
          v-model="oldPin"
        />
        <InputField 
          :icon="Key" 
          :isSecure="true" 
          :label="t.security.newPin" 
          :subLabel="t.security.pinHint"
          v-model="newPin"
        />
        <InputField 
          :icon="Key" 
          :isSecure="true" 
          :label="t.security.confirmPin" 
          v-model="confirmPin"
        />
      </div>
      <NeonButton variant="blue" fullWidth @click="handleSave">{{ t.common.save }}</NeonButton>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Key } from 'lucide-vue-next'
import InputField from '@/components/InputField.vue'
import NeonButton from '@/components/NeonButton.vue'
import { useTranslation } from '@/composables/useTranslation'
import { post } from '@/utils/api'

const router = useRouter()
const { t } = useTranslation()

const oldPin = ref('')
const newPin = ref('')
const confirmPin = ref('')

async function handleSave() {
  if (!oldPin.value || !newPin.value || !confirmPin.value) return
  if (newPin.value !== confirmPin.value) return alert(t.value.security.errorMismatch)

  try {
    const response = await post('/user/reset-transaction-password',{
      oldPin: oldPin.value,
      newPin: newPin.value,
      confirmPin: confirmPin.value
    })

    console.log(response)
    if (response.data.success) {
      alert(t.value.security.successMsg)
      router.push('/security-center')
    }
  } catch (err) {
    alert(err.response?.data?.message);
  }
}
</script>

