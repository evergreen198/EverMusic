<template>
  <div class="piano-layout">
  </div>
</template>

<script setup lang="ts">
import { onMounted,
         ref,
         reactive,
         nextTick,
         watch} from "vue";
import {Application,
        Graphics,
        BitmapText,
        BitmapFont,
        Container,
      } from "pixi.js";
import * as Tone from 'tone'
// import { Midi } from '@tonejs/midi'
import toWav from "audiobuffer-to-wav"
// import socket from '@/utils/socket'
import { collaborativeEvents,
         registerSocketListeners,
         unregisterSocketListeners} from '@/utils/socketEvents'
import { trackMap,Clip,Track,ClipInteraction} from "@/types/class"
import type { InstrumentId } from '@/utils/materials'
import type { Frequency } from "tone/build/esm/core/type/Units";
// import boardcastAdd from '@/server.js'
let fatherWidth:number = 0;
let lastX = 0;

const TRACK_TOP = 40
const TRACK_HEIGHT = 30
const props = defineProps({
projectId: {
  type: Number,
  default: 0
},
isMultiUser: {
  type: Boolean,
  default: false
}
});
interface toExportClipData {
  clip_id: number,        // 或 clip_id，建议统一命名
  startsecond: number,
  durationsecond: number,
  instrumentId: string,  // 你代码里是 InstrumentId 类型
  rhythmId: string,      // 你代码里是 string
  isChord: boolean,
  notes: string[],
  content: string,
  itemWidth: number,
  itemHeight: number,
}

interface toExportTrackData{
    track_id:number,
    midiChannel:number,
    volume:number,
    clips: toExportClipData[]
  }


//！响应式canvas
const pianoCanvas = ref<HTMLCanvasElement | null>(null);
// 使用reactive对象来存储位置，确保响应性
const positionState = reactive({
  translateX: 0
});
//设置字体
BitmapFont.install({
  name:'myfont',
  style:{
    fontFamily:'Arial'
  }
})

onMounted(async () => {
  console.log('PianoRoll组件挂载，isMultiUser:', props.isMultiUser);

  const pianoLayout = document.querySelector('.piano-layout');
  if (pianoLayout) {
    // (pianoLayout as HTMLElement & { calculateSongDuration: () => number }).calculateSongDuration = calculateSongDuration;
    //@ts-expect-error piano导出函数
    (pianoLayout).exportTrackMapToJSON = exportTrackMapToJSON;
    //@ts-expect-error piano导出函数
    (pianoLayout).calculateSongDuration = calculateSongDuration;
    //@ts-expect-error piano导出函数
    (pianoLayout).importTrackMapFromJSON = importTrackMapFromJSON;
    //@ts-expect-error piano导出函数
    (pianoLayout).trackMap = trackMap;
    //@ts-expect-error piano导出函数
    (pianoLayout).exportAsWAV = exportAsWAV;
  }
    //挂载pixi-canvas
  const pixiApp = new Application()
  await pixiApp.init({
    width: 9000,
    height: 1600,
    backgroundColor: 0xffffff,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  })
  //ref
  pianoCanvas.value=pixiApp.canvas
  pixiApp.canvas.className='canvas-piano'
  pixiApp.canvas.style.width=9000+'px'
  pixiApp.canvas.style.height=1600+'px'
  document.querySelector('.piano-layout')?.appendChild(pixiApp.canvas)

  function importTrackMapFromJSON(projectData): void {
// 清空现有trackMap
trackMap.forEach(track => {
  track.clips.forEach(clip => {
    clip.container.parent?.removeChild(clip.container);
  });
});
trackMap.clear();

// 重置clip ID计数器
Clip.nextClipId = 0;

// 导入tracks
if (projectData.tracks && Array.isArray(projectData.tracks)) {
  projectData.tracks.forEach((trackData) => {
    const track = new Track(trackData.track_id);
    track.midiChannel = trackData.midiChannel;
    track.volume = trackData.volume;

    // 导入clips
    if (trackData.clips && Array.isArray(trackData.clips)) {
      trackData.clips.forEach((clipData) => {
        // 计算位置
        const x = clipData.startsecond * 30; // tick转像素
        const y = TRACK_TOP + (trackData.track_id) * TRACK_HEIGHT;

        // 创建clip
        const clip = new Clip(
          clipData.content,
          x,
          y,
          clipData.instrumentId,
          clipData.rhythmId,
          (clipId, trackId, alreadyDeleted) => {
            applyOperation({
              type: 'delete',
              trackId,
              clipId,
              alreadyDeleted
            }, false);
          }
        );

        // 设置clip属性
        clip.clipId = clipData.clip_id;
        clip.startsecond = clipData.startsecond;
        clip.durationsecond = clipData.durationsecond;
        clip.isChord = clipData.isChord;
        clip.notes = clipData.notes;
        clip.itemWidth = clipData.itemWidth || 119;
        clip.itemHeight = clipData.itemHeight || 30;

        // 更新clip显示
        clip.redraw();

        // 添加到track
        track.clips.push(clip);

        // 添加到舞台
        pixiApp.stage.addChild(clip.container);
      });
    }

    // 添加到trackMap
    trackMap.set(trackData.track_id, track);
  });
}

console.log('项目数据导入成功');
  }

  function reconstructClip(clipData): Clip {
  const clip = new Clip(
    clipData.content,
    clipData.startsecond * 30,
    TRACK_TOP + clipData.track_id * TRACK_HEIGHT,
    clipData.instrumentId,
    clipData.rhythmId,
    (clipId, trackId, alreadyDeleted) => {
      applyOperation({
        type: 'delete',
        trackId,
        clipId,
        alreadyDeleted
      }, false);
    }
  );
  clip.clipId = clipData.clipId || clipData.clip_id;
  clip.startsecond = clipData.startsecond;
  clip.durationsecond = clipData.durationsecond;
  clip.isChord = clipData.isChord;
  clip.notes = clipData.notes;
  clip.itemWidth = clipData.itemWidth;
  return clip;
}
  function addClipLocal(clip: Clip, trackId: number) {
  if (!trackMap.get(trackId)) {
    const newTrack = new Track(trackId);
    trackMap.set(trackId, newTrack);
  }
  trackMap.get(trackId)?.clips.push(clip);
  pixiApp.stage.addChild(clip.container);
}

/**
 * 删除片段（本地）
 */
function deleteClipLocal(trackId: number, clipId: number) {
  const track = trackMap.get(trackId);
  if (track) {
    const clip = track.clips.find(c => c.clipId === clipId);
    if (clip) {
      clip.container.parent?.removeChild(clip.container);
      track.clips = track.clips.filter(c => c.clipId !== clipId);
    }
    if (track.clips.length === 0) {
      trackMap.delete(trackId);
    }
  }
}

/**
 * 移动片段（本地）
 */
function moveClipLocal(clipId: number, fromTrackId: number, toTrackId: number, newX: number, newY: number) {
  const fromTrack = trackMap.get(fromTrackId);
  if (!fromTrack) return;

  const clip = fromTrack.clips.find(c => c.clipId === clipId);
  if (!clip) return;

  // 从原轨道移除
  fromTrack.clips = fromTrack.clips.filter(c => c.clipId !== clipId);
  if (fromTrack.clips.length === 0) {
    trackMap.delete(fromTrackId);
  }

  // 添加到新轨道
  if (!trackMap.get(toTrackId)) {
    const newTrack = new Track(toTrackId);
    trackMap.set(toTrackId, newTrack);
  }
  trackMap.get(toTrackId)?.clips.push(clip);

  // 更新位置
  clip.container.x = newX;
  clip.container.y = newY;
  clip.startsecond = newX / 30;
  clip.redraw();
}

/**
 * 调整片段大小（本地）
 */
function resizeClipLocal(clipId: number, trackId: number, newWidth: number, direction: 'left' | 'right') {
  const track = trackMap.get(trackId);
  if (!track) return;
  const clip = track.clips.find(c => c.clipId === clipId);
  if (!clip) return;

  if (direction === 'right') {
    clip.itemWidth = Math.max(40, newWidth);
  }else if (direction === 'left') {
    const diff = newWidth - clip.itemWidth;
    clip.itemWidth=newWidth
    clip.container.x -= diff;
    clip.startsecond -= diff / 30;
  }
  clip.durationsecond = clip.itemWidth / 30;

  clip.redraw();
}



//根据是否为多人项目注册或取消远程监听
watch(()=>props.isMultiUser,async (ismulti)=>{
  console.log('多人');

  if(ismulti){
    console.log('挂载');

    registerSocketListeners({
      //远程接受修改数据的处理
      onClipUpdated: (data) => {
        applyOperation(data,true)
      },
      onClipAdded: (data) => {
        applyOperation(data,true)
      },
      onClipDeleted: (data) => {
        applyOperation(data,true)
      },
      onRemoteUserEdit: (data) => {
        applyOperation(data,true)
      },
      onUserJoined: (data) => {
        console.log('用户加入事件:', data);
        // 用户加入事件不需要调用 applyOperation
      },
      onUserLeft: (data) => {
        console.log('用户离开事件:', data);
        // 用户离开事件不需要调用 applyOperation
      },
    })
  }else{
    unregisterSocketListeners()
  }
})

function getCurrentTrackId(clip: Clip): number {
  for (const [trackId, track] of trackMap.entries()) {
    if (track.clips.includes(clip)) {
      return trackId;
    }
  }
  return -1;
}


/**
 * 统一的操作处理函数
 * 本地操作：执行本地 + 发送 Socket
 * 远程操作：仅执行本地（Socket 已处理）
 * @param operation 操作对象
 * @param isRemote 是否为远程操作
 */
 function applyOperation(operation, isRemote: boolean) {
  const { type, trackId, clipId, clip, updates, newTrackId, position } = operation;

  switch (type) {
    case 'add':
      // 如果是远程操作，需要先重建 Clip 对象
      const clipToAdd = isRemote ? reconstructClip({
        ...clip,
        clip_id: clip.clipId,
        track_id: trackId
      }) : clip;
      addClipLocal(clipToAdd, trackId);
      //如果不是远程操作（即本地操作），且是多用户模式
      // 需要在本地更改，并且发送到服务器，通知其他用户


      if (!isRemote && props.isMultiUser) {
        console.log('不是远程操作（即本地操作），且是多用户模式');

        collaborativeEvents.addClip(props.projectId, {
          clipId: clip.clipId,
          startsecond: clip.startsecond,
          durationsecond: clip.durationsecond,
          instrumentId: clip.instrumentId,
          rhythmId: clip.rhythmId,
          isChord: clip.isChord,
          notes: clip.notes,
          itemWidth: clip.itemWidth,
          itemHeight: clip.itemHeight,
          content: clip.content,
          track_id: trackId
        });
      }
      break;

    case 'delete':
      if (isRemote) {
        // 远程操作：只删除本地，不发送socket
        deleteClipLocal(trackId, clipId);
      } else {
        // 本地操作：clip已经在Clip.delete()中删除了，只发送socket事件
        if (props.isMultiUser) {
          console.log('本地操作且多人项目，通过collaborativeEvent发送删除事件');
          console.log(props.projectId, trackId, clipId);
          collaborativeEvents.deleteClip(props.projectId, trackId, clipId);
        }
      }
      break;

    case 'move':
      moveClipLocal(clipId, trackId, newTrackId, position.x, position.y);
      if (!isRemote && props.isMultiUser) {
        collaborativeEvents.editClip(props.projectId, {
          type: 'move',
          clipId,
          trackId,
          newTrackId,
          position
        });
      }
      break;

    case 'resize':
      resizeClipLocal(clipId, trackId, updates.newWidth, updates.direction);
      if (!isRemote && props.isMultiUser) {
        collaborativeEvents.editClip(props.projectId, {
          type: 'resize',
          clipId,
          trackId,
          updates: {
            newWidth: updates.newWidth,
            direction: updates.direction,
            // durationsecond: updates.newWidth / 30,
            // startsecond: updates.startsecond
          }
        });
      }
      break;
  }
}

if(pianoCanvas.value){
  console.log('hello world');

// 初始化时设置为0，而不是从marginLeft获取
  positionState.translateX = 0;
}
// 使用nextsecond确保所有DOM元素都已渲染完成
await nextTick();
// 正确获取父元素 - 使用组件实例的parentElement
const parent = pianoCanvas.value?.parentElement?.parentElement ||
              document.querySelector('.piano') ||
              document.querySelector('.app-layout');
// 存储父元素宽度
fatherWidth = parent?.clientWidth || 0;
// 获取父元素尺寸
let parentWidth = 0;
let parentHeight = 0;
if (parent) {
  parentWidth = 9000; // 保持画布宽度为9000
  parentHeight = 1600;
}
//开始绘画
if( pianoCanvas.value) {
  const musicTrackLine = new Graphics();
  const musicTrack = new Graphics();
  const width = pianoCanvas.value.width = parentWidth; // 设置 canvas 宽度
  const height = pianoCanvas.value.height = parentHeight; // 设置 canvas 高度
  if(musicTrackLine&&parent){
    for (let i = 0; i <= (height/TRACK_HEIGHT); i++) {
      // const newTrack=new Track(i)
      const graphics=new Graphics()
      graphics
      .rect(0, 70 + (i - 1) * TRACK_HEIGHT, 9000, TRACK_HEIGHT)
      .fill({ color:0x253745}) 
      .stroke({ width: 1, color: 0x5a6c7a });
      pixiApp.stage.addChild(graphics)
    }
    pixiApp.stage.addChild(musicTrackLine,musicTrack)
  }
  //时间导轨区域
  const timeTrack=new Graphics()
  const timeColumn=new Graphics()
  const timeColumnx=new Graphics()
  const ruler=new Container()
  if(timeTrack&&parent){
    timeTrack
      .rect(0,0,width,TRACK_TOP)
      .fill({color:0x4a5c6a})
      for (let i = 0; i <= width; i += 30){
        timeColumn
          .moveTo(i,0)
        .lineTo(i, parentHeight)
          .stroke({width:1,alpha:0.4})
        timeColumnx
          .moveTo(i+6,TRACK_HEIGHT)
          .lineTo(i+6,parentHeight)
          .moveTo(i+12,TRACK_HEIGHT)
          .lineTo(i+12,parentHeight)
          .moveTo(i+18,TRACK_HEIGHT)
          .lineTo(i+18,parentHeight)
          .moveTo(i+24,TRACK_HEIGHT)
          .lineTo(i+24,parentHeight)
          .stroke({width:1,alpha:0.1})
        const lable=new BitmapText({
          text:`${i/30}`,
          style:{
            fontFamily:'myfont',
            fontSize:8,
            fill:'#cccccc',
            // fill:0xcccccc,
            align:'center'
          }
        })
        lable.x=i+6
        lable.y=5
        ruler.addChild(lable)
      }
  }
  pixiApp.stage.addChild(timeTrack,timeColumn,timeColumnx,ruler)
  }
  // if (props.isMultiUser) {
  //   registerRemoteOperations();
  // }
  pixiApp.stage.eventMode = 'static'
  //clip移动、换方向操作
  pianoCanvas.value?.addEventListener('drop', (e) => {
    const itemText = e.dataTransfer?.getData('text/plain') as string;
    const rect = pianoCanvas.value?.getBoundingClientRect();
    if (!rect) return;

    const trackId = Math.floor((e.clientY - rect.top - TRACK_TOP) / TRACK_HEIGHT);
    const x = (e.clientX - rect.left) * (window.devicePixelRatio || 1);
    const y = trackId * TRACK_HEIGHT + TRACK_TOP;

    const instrumentSelect = document.getElementById('instrument') as HTMLSelectElement | null;
    const tempoSelect = document.getElementById('tempo') as HTMLSelectElement | null;
    const instrumentId = (instrumentSelect?.value || 'piano') as InstrumentId;
    const rhythmId = tempoSelect?.value || 'quarter';

    const newClip = new Clip(itemText, x, y, instrumentId, rhythmId, (clipId, trackId, alreadyDeleted) => {
      applyOperation({
        type: 'delete',
        trackId,
        clipId,
        alreadyDeleted
      }, false);
    });
    newClip.redraw();

    applyOperation({
      type: 'add',
      trackId,
      clip: newClip
    }, false);

  });

  //拉伸，移动
  pixiApp.stage.on('pointermove', (e) => {
    const clip = ClipInteraction.activeClip;
    if (!clip || !pianoCanvas.value) return;

    const dx = e.global.x - clip.startX;

    if (clip.resizeDir === 'right') {
      const newWidth = Math.max(40, clip.startWidth + dx);
      applyOperation({
        type: 'resize',
        trackId: getCurrentTrackId(clip),
        clipId: clip.clipId,
        updates: {
          newWidth: newWidth,
          direction: 'right',
          startsecond: clip.startsecond,
          durationsecond: newWidth / 30
        }
      }, false);
    } else if (clip.resizeDir === 'left') {
      const newWidth = Math.max(40, clip.startWidth - dx);
      applyOperation({
        type: 'resize',
        trackId: getCurrentTrackId(clip),
        clipId: clip.clipId,
        updates: {
          newWidth: newWidth,
          direction: 'left'
        }
      }, false);
    } else if (!clip.resizeDir) {
      // 移动逻辑
      const rect = pianoCanvas.value.getBoundingClientRect();
      const trackIndex = Math.floor((e.clientY - rect.top - TRACK_TOP) / 30);
      const dx2 = e.clientX - lastX;

      if (lastX && trackIndex >= 0) {
        const currentTrackId = getCurrentTrackId(clip);
        applyOperation({
          type: 'move',
          trackId: currentTrackId,
          newTrackId: trackIndex,
          clipId: clip.clipId,
          position: {
            x: Math.max(clip.container.x + dx2,0),
            y: TRACK_TOP + trackIndex * 30
          }
        }, false);
      }

      lastX = e.clientX;
    }
  });

  //移动完成后的轨道处理
  pixiApp.stage.on('pointerup',clipTrackHandle);
    }
  );

const clipTrackHandle=()=>{
  if (ClipInteraction.activeClip) {
    const clip = ClipInteraction.activeClip;
    // 计算最终轨道索引
    const rect = pianoCanvas.value?.getBoundingClientRect();
    if (rect) {
      const finalTrackIndex = Math.floor(
        (clip.container.y - TRACK_TOP) / TRACK_HEIGHT
      );
      // 确保轨道索引合法
      if (finalTrackIndex >= 0 && finalTrackIndex <52&&!trackMap.get(finalTrackIndex)) {
        // 从原轨道移除 clip
        trackMap.forEach((track) => {
          const index = track.clips.indexOf(clip);
          if (index !== -1) {
            track.clips.splice(index, 1);
          }
          const newTrack=new Track(finalTrackIndex)
          newTrack.clips.push(clip)
          trackMap.set(finalTrackIndex,newTrack)
        });

        console.log(`Clip moved to track ${finalTrackIndex}`);
        console.log(trackMap);
      }
    }

    // 重置拖动状态
    clip.resizeDir = null;
    ClipInteraction.activeClip = null;
  }
lastX = 0;
  }

function throttle(fn, delay:number) {
let lastCall = 0;
return function (...args) {
  const now = Date.now();
  if (now - lastCall >= delay) {
    lastCall = now;
    (fn)(...args);
  }
};
}

document.querySelector('.piano')?.addEventListener('wheel',throttle((e:WheelEvent)=>{
// 直接更新translateX值，不再依赖字符串解析
if((-9000+fatherWidth)>=positionState.translateX&&e.deltaX>0){
positionState.translateX = -9000+fatherWidth;
}else if(0<=positionState.translateX&&e.deltaX<0){
positionState.translateX = 0;
}else if(pianoCanvas.value&&-9000+fatherWidth<=positionState.translateX&&positionState.translateX<=0) {
positionState.translateX -= e.deltaX;
// 直接使用数值设置transform
pianoCanvas.value.style.transform = `translateX(${positionState.translateX}px)`;
}
},5),{passive:false})

// 导出trackMap为JSON格式
function exportTrackMapToJSON() {
const tracks:toExportTrackData[] = [];

trackMap.forEach((track) => {
  tracks.push({
    track_id: track.id,
    midiChannel: track.midiChannel,
    volume: track.volume,
    clips: track.clips.map(clip => ({
      clip_id: clip.clipId,
      startsecond: clip.startsecond,
      durationsecond: clip.durationsecond,
      instrumentId: clip.instrumentId,
      rhythmId: clip.rhythmId,
      isChord: clip.isChord,
      notes: clip.notes,
      content: clip.content,
      itemWidth: clip.itemWidth,
      itemHeight: clip.itemHeight
    }))
  });
});

return { tracks };
}
// 计算歌曲时长（秒）
function calculateSongDuration(): number {
if (trackMap.size === 0) {
  return 4; // 默认4秒
}


let maxEndTime = 0;

trackMap.forEach(track => {
  track.clips.forEach(clip => {
    const endTime = clip.startsecond + clip.durationsecond;
    if (endTime > maxEndTime) {
      maxEndTime = endTime;
    }
  });
});

// 加上2秒缓冲时间
return Math.ceil((maxEndTime ) + 2);
}



// 暴露给父组件使用
defineExpose({
exportTrackMapToJSON,
calculateSongDuration,
trackMap
});

//导出为 WAV
async function exportAsWAV() {
await Tone.loaded()
const duration = calculateSongDuration()

// 离线渲染音频
const audioBuffer = await Tone.Offline(async () => {
  // 读取 BPM
  const bpmInput = document.querySelector('#volume') as HTMLInputElement | null
  const bpm = bpmInput ? Number(bpmInput.value) || 120 : 120
  Tone.getTransport().bpm.value = bpm

  // 遍历所有轨道和片段
  trackMap.forEach(track => {
    track.clips.forEach(clip => {
      // const config = instrumentSampleConfigs[clip.instrumentId]
      const poly = new Tone.PolySynth(Tone.Synth).toDestination()

      const notes = clip.notes.length === 1 ? clip.notes[0] : clip.notes

      // 简化：按 rhythmId 处理（参考你的 play 函数）
      switch (clip.rhythmId) {
        case 'whole':
          poly.triggerAttackRelease(notes as Frequency, '1n', clip.startsecond)
          break
        case 'half':
          poly.triggerAttackRelease(notes as Frequency, '2n', clip.startsecond)
          break
        case 'quarter':
          poly.triggerAttackRelease(notes as Frequency, '4n', clip.startsecond)
          break
        default:
          poly.triggerAttackRelease(notes as Frequency, '4n', clip.startsecond)
      }
    })
  })

  Tone.getTransport().start()
}, duration)

// 下载 WAV
const wavData=toWav(audioBuffer.get() as AudioBuffer)
const blob=new Blob([wavData],{type:"audio/wav"})
const url = URL.createObjectURL(blob)

const a = document.createElement("a")
a.href = url
a.download = "export.wav"
a.click()

URL.revokeObjectURL(url)

}

</script>

<style scoped>
.piano-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
  background-color: #eaeaea;
  position: relative;
  overflow-y: hidden;
  overflow-x: scroll;
  min-width: 100%;
}


.canvas-piano {
  min-width: 100%;
  height: auto;
  background-color: #fff;
}
</style>
