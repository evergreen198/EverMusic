
export interface ClipOperation {
  type: 'add' | 'delete' | 'update' | 'move';
  trackId: number;
  clip?: any;
  clipId?: number;
  updates?: Record<string, any>;
}

export interface TrackOperation {
  projectId: number;
  userId: number;
  operation: ClipOperation;
  timestamp: number;
}


