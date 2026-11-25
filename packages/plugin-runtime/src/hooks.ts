import { inject, computed, type Ref } from 'vue';
import type { Node } from './types';

// 节点上下文注入 key
export const NODE_CONTEXT_KEY = Symbol('node-context');

export interface NodeContext {
  nodeId: string;
  node: Ref<Node>;
}

/**
 * 在插件节点组件中使用，获取节点上下文
 */
export function useNode() {
  const context = inject<NodeContext>(NODE_CONTEXT_KEY);
  
  if (!context) {
    throw new Error('useNode must be called within a node component');
  }
  
  return {
    nodeId: context.nodeId,
    node: context.node,
    data: computed({
      get: () => context.node.value.data,
      set: (value) => {
        context.node.value.data = value;
      }
    }),
    position: computed({
      get: () => context.node.value.position,
      set: (value) => {
        context.node.value.position = value;
      }
    }),
    size: computed({
      get: () => context.node.value.size,
      set: (value) => {
        context.node.value.size = value;
      }
    }),
    selected: computed(() => context.node.value.selected),
    updateData: (updates: Record<string, any>) => {
      context.node.value.data = {
        ...context.node.value.data,
        ...updates
      };
    }
  };
}
