// utils/socketEvents.ts
import socket from './socket'

/**
 * 协作编辑相关事件 - 发送端
 */
export const collaborativeEvents = {
  // 加入项目
  joinProject: (projectId: number) => {
    socket.emit('join-project', projectId);
    console.log(`加入项目: ${projectId}`);
  },

  // 离开项目
  leaveProject: (projectId: number) => {
    socket.emit('leave-project', projectId);
    console.log(`离开项目: ${projectId}`);
  },

  // 编辑片段
  editClip: (projectId: number, operation: any) => {
    socket.emit('clip-edited', {
      projectId,
      userId: getCurrentUserId(),
      operation,
      timestamp: Date.now()
    });
  },

  // 添加片段
  addClip: (projectId: number, clip: any) => {
    socket.emit('clip-added', {
      projectId,
      userId: getCurrentUserId(),
      clip,
      timestamp: Date.now()
    });
  },

  // 删除片段
  deleteClip: (projectId: number, trackId: number, clipId: number) => {
    socket.emit('clip-deleted', {
      projectId,
      userId: getCurrentUserId(),
      trackId,
      clipId,
      timestamp: Date.now()
    });
  },
};

/**
 * 注册所有 Socket.IO 监听事件
 */
export function registerSocketListeners(callbacks: {
  onClipUpdated?: (data: any) => void;
  onClipAdded?: (data: any) => void;
  onClipDeleted?: (data: any) => void;
  onRemoteUserEdit?: (data: any) => void;
  onUserJoined?: (data: any) => void;
  onUserLeft?: (data: any) => void;
}) {
  // 监听片段更新
  socket.on('clip-updated', (data) => {
    console.log('收到片段更新:', data);
    callbacks.onClipUpdated?.(data);
  });

  // 监听片段添加
  socket.on('clip-created', (data) => {
    console.log('收到新片段:', data);
    callbacks.onClipAdded?.(data);
  });

  // 监听片段删除
  socket.on('clip-removed', (data) => {
    console.log('片段已删除:', data);
    callbacks.onClipDeleted?.(data);
  });

  // 监听远程用户编辑
  socket.on('user-edit', (data) => {
    console.log('用户编辑:', data);
    callbacks.onRemoteUserEdit?.(data);
  });


  // 监听用户加入
  socket.on('user-joined', (data) => {
    console.log('用户加入项目:', data);
    callbacks.onUserJoined?.(data);
  });

  // 监听用户离开
  socket.on('user-left', (data) => {
    console.log('用户离开项目:', data);
    callbacks.onUserLeft?.(data);
  });
}

/**
 * 清理所有 Socket.IO 监听事件
 */
export function unregisterSocketListeners() {
  socket.off('clip-updated');
  socket.off('clip-created');
  socket.off('clip-removed');
  socket.off('user-edit');
  socket.off('user-joined');
  socket.off('user-left');
}

/**
 * 获取当前用户ID
 */
function getCurrentUserId(): number | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.id || null;
  } catch {
    return null;
  }
}
