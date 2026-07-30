// src/stores/layout.ts
import { defineStore } from 'pinia'
import { store } from '@/stores'

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    sidebarVisible: true
  }),
  actions: {
    showSidebar() {
      this.sidebarVisible = true
    },
    hideSidebar() {
      this.sidebarVisible = false
    },
    setSidebarVisibility(visible: boolean) {
      this.sidebarVisible = visible
    }
  }
})


export function useLayoutStoreHook() {
  return useLayoutStore(store)
}