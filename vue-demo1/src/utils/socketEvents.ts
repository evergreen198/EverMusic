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
  editClip: (projectId: number, operation: unknown) => {
    console.log('发送远程编辑操作:', operation);
    socket.emit('remote-edit-clip', projectId, {
      projectId,
      userId: getCurrentUserId(),
      operation,
      timestamp: Date.now()
    });
  },

  // 添加片段
  addClip: (projectId: number, clip: unknown) => {
    socket.emit('remote-add-clip', projectId, {
      projectId,
      userId: getCurrentUserId(),
      clip,
      timestamp: Date.now()
    });
  },

  // 删除片段
  deleteClip: (projectId: number, trackId: number, clipId: number) => {
    console.log('socketEvent发送');

    socket.emit('remote-delete-clip', projectId, {
      projectId,
      userId: getCurrentUserId(),
      trackId,
      clipId,
      timestamp: Date.now()
    });
  },

};

export const collaborativeEventsDefault = {
  // 编辑项目标题
  editTitle: (projectId: number, title: string) => {
    socket.emit('remote-edit-title', projectId, {
      projectId,
      userId: getCurrentUserId(),
      title,
      timestamp: Date.now()
    });
  },
  // 编辑项目描述
  editDescription: (projectId: number, description: string) => {
    socket.emit('remote-edit-description', projectId, {
      projectId,
      userId: getCurrentUserId(),
      description,
      timestamp: Date.now()
    });
  }

}

export const collaborativeEventsBpmSlider = {
  // 编辑项目速度
  editBpm: (projectId: number, bpm: number) => {
    console.log('像后端发送远程编辑项目速度:', bpm);
    socket.emit('remote-edit-bpm', projectId, {
      projectId,
      userId: getCurrentUserId(),
      bpm,
      timestamp: Date.now()
    });
  }
}
/**
 * 注册所有 Socket.IO 监听事件——远程监听
ٍٍ */
export function registerSocketListeners(callbacks: {
  onClipUpdated: (data: unknown) => void;
  onClipAdded: (data: unknown) => void;
  onClipDeleted: (data: unknown) => void;
  onRemoteUserEdit: (data: unknown) => void;
  onUserJoined: (data: unknown) => void;
  onUserLeft: (data: unknown) => void;
}) {
  // 监听片段更新
  socket.on('clip-updated', (data) => {
    console.log('收到片段更新:', data);
    callbacks.onClipUpdated(data);
  });

  // 监听片段添加
  socket.on('clip-added', (data) => {
    console.log('收到新片段:', data);
    callbacks.onClipAdded(data);
  });

  // 监听片段删除
  socket.on('clip-deleted', (data) => {
    console.log('片段已删除:', data);
    callbacks.onClipDeleted(data);
  });

  // 监听远程用户编辑
  socket.on('user-edit', (data) => {
    console.log('用户编辑:', data);
    callbacks.onRemoteUserEdit(data);
  });


  // 监听用户加入
  socket.on('user-joined', (data) => {
    console.log('用户加入项目:', data);
    callbacks.onUserJoined(data);
  });

  // 监听用户离开
  socket.on('user-left', (data) => {
    console.log('用户离开项目:', data);
    callbacks.onUserLeft(data);
  });
}
export function registerSocketListenersDefault(callbacks: {
  onTitleUpdated: (data: unknown) => void;
  onDescriptionUpdated: (data: unknown) => void;

}) {
  // 监听项目标题更新
  socket.on('title-updated', (data) => {
    console.log('收到项目标题更新:', data);
    callbacks.onTitleUpdated(data);
  });

  // 监听项目描述更新
  socket.on('description-updated', (data) => {
    console.log('收到项目描述更新:', data);
    callbacks.onDescriptionUpdated(data);
  });


}
export function registerSocketListenersBpmSlider(callbacks: {
  onBpmUpdated: (data: unknown) => void;
}) {
  // 监听项目速度更新
  socket.on('bpm-updated', (data) => {
    console.log('从远处收到项目速度更新:', data);
    callbacks.onBpmUpdated(data);
  });
}
/**
 * 清理所有 Socket.IO 监听事件
 */
export function unregisterSocketListeners() {
  socket.off('clip-updated');
  socket.off('clip-added');
  socket.off('clip-deleted');
  socket.off('user-edit');
  socket.off('user-joined');
  socket.off('user-left');
  socket.off('title-updated');
  socket.off('description-updated');
  socket.off('bpm-updated');
}

export function unregisterSocketListenersDefault() {
  socket.off('title-updated');
  socket.off('description-updated');
}
export function unregisterSocketListenersBpmSlider() {
  socket.off('bpm-updated');
}
/**
 * 获取当前用户ID
 */
export function getCurrentUserId(): number | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.id || null;
  } catch {
    return null;
  }
}
