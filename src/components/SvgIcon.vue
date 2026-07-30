<template>
    <svg :class="className" :style="wrapperStyle">
      <use :xlink:href="iconName"></use>
    </svg>
  </template>
  
  <script setup lang="ts">
  import { computed } from "vue";
  const props = defineProps({
    name: { type: String, require: true },
    height: {
      type: [Number, String],
      default: 24
    },
    width: {
      type: [Number, String],
      default: 24
    },
    className: { type: String },
  });
  const wrapperStyle = computed(() => ({
    width: `${props.width}px`,
    height: `${props.height}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }))
  const iconName = computed(() => {
    return `#${props.name}`;
  });
  </script>
  
  <style lang="scss" scoped></style>