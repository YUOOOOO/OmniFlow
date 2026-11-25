import { ref, Ref } from 'vue';

/**
 * 拖拽功能 Composable
 */
export function useDraggable(elementRef: Ref<HTMLElement | undefined>) {
  const position = ref({ x: 0, y: 0 });
  const isDragging = ref(false);

  function startDrag(e: MouseEvent) {
    isDragging.value = true;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...position.value };

    function onMouseMove(e: MouseEvent) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      position.value = {
        x: startPos.x + deltaX,
        y: startPos.y + deltaY
      };
    }

    function onMouseUp() {
      isDragging.value = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  return {
    position,
    isDragging,
    startDrag
  };
}

/**
 * 窗口拖拽功能（带边界限制）
 */
export function useWindowDrag() {
  const position = ref({ x: 0, y: 0 });
  const isDragging = ref(false);

  function startDrag(e: MouseEvent) {
    isDragging.value = true;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...position.value };

    function onMouseMove(e: MouseEvent) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newX = startPos.x + deltaX;
      let newY = startPos.y + deltaY;

      // 边界限制
      const maxX = window.innerWidth - 380; // 窗口宽度
      const maxY = window.innerHeight - 580; // 窗口高度
      
      newX = Math.max(-maxX, Math.min(0, newX));
      newY = Math.max(-maxY, Math.min(0, newY));
      
      position.value = { x: newX, y: newY };
    }

    function onMouseUp() {
      isDragging.value = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  return {
    position,
    isDragging,
    startDrag
  };
}
