import { defineStore } from 'pinia';
import type { Panel, PanelState } from '@/types/panel';

export const usePanelStore = defineStore('panel', {
  state: (): PanelState => ({
    panels: [],
    activePanel: null,
    nextZIndex: 1
  }),

  getters: {
    getPanelById: (state) => (id: string) => {
      return state.panels.find(p => p.id === id);
    },
    
    activePanelData: (state) => {
      if (!state.activePanel) return null;
      return state.panels.find(p => p.id === state.activePanel);
    }
  },

  actions: {
    addPanel(panel: Omit<Panel, 'id' | 'zIndex'>) {
      const newPanel: Panel = {
        ...panel,
        id: `panel-${Date.now()}`,
        zIndex: this.nextZIndex++
      };
      this.panels.push(newPanel);
      this.activePanel = newPanel.id;
      return newPanel.id;
    },

    removePanel(id: string) {
      const index = this.panels.findIndex(p => p.id === id);
      if (index !== -1) {
        this.panels.splice(index, 1);
        if (this.activePanel === id) {
          this.activePanel = this.panels[0]?.id || null;
        }
      }
    },

    updatePanel(id: string, updates: Partial<Panel>) {
      const panel = this.panels.find(p => p.id === id);
      if (panel) {
        Object.assign(panel, updates);
      }
    },

    setActivePanel(id: string) {
      this.activePanel = id;
      const panel = this.panels.find(p => p.id === id);
      if (panel) {
        panel.zIndex = this.nextZIndex++;
      }
    },

    bringToFront(id: string) {
      const panel = this.panels.find(p => p.id === id);
      if (panel) {
        panel.zIndex = this.nextZIndex++;
      }
    }
  }
});
