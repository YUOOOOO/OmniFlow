import { defineStore } from 'pinia';
import type { CanvasState } from '@/types/canvas';

export const useCanvasStore = defineStore('canvas', {
  state: (): CanvasState => ({
    transform: {
      zoom: 1,
      offset: { x: 0, y: 0 }
    },
    grid: {
      enabled: true,
      size: 20
    },
    background: '#1a1a1a'
  }),

  actions: {
    setZoom(zoom: number) {
      this.transform.zoom = Math.max(0.1, Math.min(5, zoom));
    },

    zoom(delta: number, center?: { x: number; y: number }) {
      const oldZoom = this.transform.zoom;
      const newZoom = Math.max(0.1, Math.min(5, oldZoom + delta));
      
      if (center) {
        // 以鼠标位置为中心缩放
        const scale = newZoom / oldZoom;
        this.transform.offset.x = center.x - (center.x - this.transform.offset.x) * scale;
        this.transform.offset.y = center.y - (center.y - this.transform.offset.y) * scale;
      }
      
      this.transform.zoom = newZoom;
    },

    pan(deltaX: number, deltaY: number) {
      this.transform.offset.x += deltaX;
      this.transform.offset.y += deltaY;
    },

    resetTransform() {
      this.transform.zoom = 1;
      this.transform.offset = { x: 0, y: 0 };
    },

    toggleGrid() {
      this.grid.enabled = !this.grid.enabled;
    }
  }
});
