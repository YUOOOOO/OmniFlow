// 画布类型定义

export interface CanvasTransform {
  zoom: number;
  offset: {
    x: number;
    y: number;
  };
}

export interface CanvasState {
  transform: CanvasTransform;
  grid: {
    enabled: boolean;
    size: number;
  };
  background: string;
}

export interface Workspace {
  id: string;
  name: string;
  canvas: CanvasState;
  createdAt: string;
  updatedAt: string;
}
