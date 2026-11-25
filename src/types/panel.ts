// 面板类型定义

export type PanelType = 'terminal' | 'editor' | 'browser' | 'chat' | 'custom';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

export interface Panel {
  id: string;
  type: PanelType;
  title: string;
  position: Position;
  size: Size;
  zIndex: number;
  minimized: boolean;
  data?: any;
}

export interface PanelState {
  panels: Panel[];
  activePanel: string | null;
  nextZIndex: number;
}
