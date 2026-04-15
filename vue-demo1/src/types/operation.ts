
export interface ClipOperation {
  type: 'add' | 'delete' | 'update' | 'move';
  trackId: number;
  clip?: Clip;
  clipId?: number;
  updates?: UpdateData;
}
interface UpdateData{
  newWidth:number,
  direction:'left'|'right',
  startsecond?:number,
  durationsecond?:number
}
import {Clip} from "@/types/class.ts"
export interface TrackOperation {
  projectId: number;
  userId: number;
  operation: ClipOperation;
  timestamp: number;
}


