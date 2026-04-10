<template>
  <div class="auth-hero-artwork">
    <AnimatedBlobStage
      class="auth-hero-artwork__stage"
      @mask-visible="$emit('maskVisible')"
      @entrance-almost-complete="$emit('entranceAlmostComplete')"
      @entrance-complete="$emit('entranceComplete')"
    />
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  maskVisible: []
  entranceAlmostComplete: []
  entranceComplete: []
}>()
</script>

<style scoped>
.auth-hero-artwork {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.auth-hero-artwork__stage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>
