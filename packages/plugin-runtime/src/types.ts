import type { Component } from 'vue';

// ========== 插件清单 ==========
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  main: string;
  permissions?: Permission[];
  icon?: string;
}

export type Permission = 
  | 'filesystem:read'
  | 'filesystem:write'
  | 'network'
  | 'clipboard'
  | 'shell';

// ========== 插件实例 ==========
export interface Plugin {
  activate(api: PluginAPI): void | Promise<void>;
  deactivate?(): void | Promise<void>;
}

// ========== 节点相关 ==========
export interface NodeTypeConfig {
  type: string;
  component: Component;
  defaultSize: { w: number; h: number };
  icon: string;
  label: string;
  resizable?: boolean;
  deletable?: boolean;
}

export interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  data: Record<string, any>;
  selected?: boolean;
}

export interface CreateNodeOptions {
  type: string;
  position?: { x: number; y: number };
  size?: { w: number; h: number };
  data?: Record<string, any>;
}

// ========== UI 扩展 ==========
export interface MenuItemConfig {
  id: string;
  label: string;
  position: 'file' | 'edit' | 'view' | 'plugins';
  submenu?: MenuItem[];
  onClick?: () => void;
}

export interface MenuItem {
  label: string;
  onClick?: () => void;
  submenu?: MenuItem[];
  separator?: boolean;
}

export interface SidebarPanelConfig {
  id: string;
  title: string;
  icon: string;
  component: Component;
  position: 'left' | 'right';
}

export interface ToolbarButtonConfig {
  id: string;
  icon: string;
  tooltip: string;
  onClick: () => void;
  position?: 'left' | 'right';
}

export interface StatusBarItemConfig {
  id: string;
  component: Component;
  position?: 'left' | 'right';
}

export interface PageConfig {
  component: Component;
  fullscreen?: boolean;
  modal?: boolean;
}

// ========== 插件 API ==========
export interface PluginAPI {
  // 画布节点
  registerNodeType(config: NodeTypeConfig): void;
  createNode(options: CreateNodeOptions): string;
  getNode(id: string): Node | undefined;
  updateNode(id: string, data: Partial<Node>): void;
  deleteNode(id: string): void;
  focusNode(id: string): void;
  getNodes(filter?: { type?: string }): Node[];
  
  // 外层 UI
  registerMenuItem(config: MenuItemConfig): void;
  registerSidebarPanel(config: SidebarPanelConfig): void;
  registerToolbarButton(config: ToolbarButtonConfig): void;
  registerStatusBarItem(config: StatusBarItemConfig): void;
  
  // 页面/模态框
  openPage(config: PageConfig): void;
  closePage(): void;
  
  // 数据持久化
  storage: StorageAPI;
  
  // 事件通信
  events: EventBusAPI;
  
  // 文件系统（需权限）
  fs?: FileSystemAPI;
  
  // 通知
  showNotification(message: string, type?: 'info' | 'success' | 'error' | 'warning'): void;
}

// ========== Storage API ==========
export interface StorageAPI {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// ========== Event Bus API ==========
export interface EventBusAPI {
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}

// ========== File System API ==========
export interface FileSystemAPI {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  readDir(path: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string): Promise<void>;
  unlink(path: string): Promise<void>;
}
