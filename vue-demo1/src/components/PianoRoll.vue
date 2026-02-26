<template>
    <div class="piano-layout">
    </div>
  </template>

  <script setup lang="ts">
  import { onMounted, ref, reactive, nextTick, TrackOpTypes } from "vue";
  import { Application,Graphics,BitmapText, BitmapFont,Container, Rectangle} from "pixi.js";
  import * as Tone from 'tone'
  import { Midi } from '@tonejs/midi'
  import { instrumentSampleConfigs } from '@/utils/materials'
  import type { InstrumentId } from '@/utils/materials'
  import { noteNameToMidi, midiToNoteName } from '@/utils/noteToMidi'

  let fatherWidth:number = 0;
  const TRACK_TOP = 40
  const TRACK_HEIGHT = 30

  // 根据和弦符号（如 C, Cm, C7, Cmaj7, Cmin7...）生成和弦音名列表（默认根音在 4 组）
  function buildChordNotes(symbol: string): string[] {
    const raw = symbol.trim()
    const match = raw.match(/^([A-Ga-g][#b]?)(.*)$/)
    if (!match) return []

    const rootLetter = (match[1] || '').toUpperCase()
    let quality = (match[2] || '').toLowerCase()

    // 兼容 Cm / Cmin 之类写法
    if (quality === 'm') quality = 'min'

    const rootNoteName = `${rootLetter}4`
    const rootMidi = noteNameToMidi(rootNoteName)
    if (rootMidi == null) return [rootNoteName]

    let intervals: number[] = []

    switch (quality) {
      case '':
        intervals = [0, 4, 7] // 大三和弦
        break
      case 'm':
      case 'min':
        intervals = [0, 3, 7] // 小三和弦
        break
      case '7':
        intervals = [0, 4, 7, 10] // 属七
        break
      case 'maj7':
        intervals = [0, 4, 7, 11] // 大七
        break
      case 'min7':
        intervals = [0, 3, 7, 10] // 小七
        break
      case 'maj9':
        intervals = [0, 4, 7, 11, 14] // 大九
        break
      case 'min9':
        intervals = [0, 3, 7, 10, 14] // 小九
        break
      case 'maj11':
        intervals = [0, 4, 7, 11, 14, 17] // 大十一
        break
      case 'min11':
        intervals = [0, 3, 7, 10, 14, 17] // 小十一
        break
      case 'maj13':
        intervals = [0, 4, 7, 11, 14, 17, 21] // 大十三
        break
      case 'min13':
        intervals = [0, 3, 7, 10, 14, 17, 21] // 小十三
        break
      default:
        // 其它暂时按大三和弦处理
        intervals = [0, 4, 7]
    }

    return intervals
      .map((offset) => midiToNoteName(rootMidi + offset))
      .filter((name): name is string => !!name)
  }
  class ClipInteraction {
  static activeClip: Clip | null = null
}
class Track{
  id:number
  midiChannel:number
  volume:number=100
  container:Container
  ev:Graphics
  clips:Array<Clip>=[]

  constructor(trackId:number){
    this.id=trackId
    this.midiChannel=trackId
    this.container=new Container()
    this.ev=new Graphics()
    this.container.addChild(this.ev)
    this.container.eventMode='static'
    this.drawTrack()
    this.bindEvents()
  }
  bindEvents() {
    this.container.on('drop',this.addClip)
  }
  drawTrack=()=>{
    this.ev
      .rect(0, 70 + (this.id - 1) * TRACK_HEIGHT, 9000, TRACK_HEIGHT)
      .fill({ color:0x4a5c6a }) // Fill with red
      .stroke({ width: 1, color: 0x5a6c7a });
  }
  addClip=()=>{
    console.log('track');
    this.clips.push(ClipInteraction.activeClip as Clip)
  }
  removeClip=()=>{
    const index=this.clips.indexOf(ClipInteraction.activeClip as Clip)
    if(index != -1){
      this.clips.splice(index,1)
    }
  }
  play = async () => {
  // 读取当前 BPM
  const bpmInput = document.querySelector('#volume') as HTMLInputElement | null
  const bpm = bpmInput ? Number(bpmInput.value) || 120 : 120
  Tone.getTransport().bpm.value = bpm

  // 启动 Tone.js 音频上下文
  await Tone.start()

  this.clips.forEach(clip => {
    const instrumentId = clip.instrumentId
    const config = instrumentSampleConfigs[instrumentId]
    const sampler = new Tone.Sampler({
      urls: config.urls,
      release: 1,
      baseUrl: config.baseUrl
    }).toDestination()

    Tone.loaded().then(() => {
      const notes = clip.notes.length === 1 ? clip.notes[0] : clip.notes
      const startTime = `+${clip.startTick}` // 相对于当前时间的开始时间

      // 根据 rhythmId 处理不同的节奏型
      switch (clip.rhythmId) {
        case 'whole':
          Tone.getTransport().scheduleRepeat((time) => {
            sampler.triggerAttackRelease(notes as any, '1n', time)
          }, '1n', startTime)
          break

        case 'half':
          Tone.getTransport().scheduleRepeat((time) => {
            sampler.triggerAttackRelease(notes as any, '2n', time)
          }, '2n', startTime)
          break

        case 'quarter':
          Tone.getTransport().scheduleRepeat((time) => {
            sampler.triggerAttackRelease(notes as any, '4n', time)
          }, '4n', startTime)
          break

        case 'eighth':
          Tone.getTransport().scheduleRepeat((time) => {
            sampler.triggerAttackRelease(notes as any, '8n', time)
          }, '8n', startTime)
          break

        case 'sixteenth':
          Tone.getTransport().scheduleRepeat((time) => {
            sampler.triggerAttackRelease(notes as any, '16n', time)
          }, '16n', startTime)
          break

        case 'dottedhalf':
          // 附点二分音符：1/2 + 1/4 = 3/4
          Tone.getTransport().scheduleRepeat((time) => {
            sampler.triggerAttackRelease(notes as any, '2n', time)
            sampler.triggerAttackRelease(
              notes as any,
              '4n',
              time + Tone.Time('2n')
            )
          }, '2n.', startTime)
          break

        case 'dottedquarter':
          // 附点四分音符：1/4 + 1/8 = 3/8
          Tone.getTransport().scheduleRepeat((time) => {
            sampler.triggerAttackRelease(notes as any, '4n', time)
            sampler.triggerAttackRelease(
              notes as any,
              '8n',
              time + Tone.Time('4n')
            )
          }, '4n.', startTime)
          break

        case 'dottedquarternote':
          // 大附点：1/4 + 1/4 + 1/8
          Tone.getTransport().scheduleRepeat((time) => {
            sampler.triggerAttackRelease(notes as any, '4n', time)
            sampler.triggerAttackRelease(
              notes as any,
              '4n',
              time + Tone.Time('4n')
            )
            sampler.triggerAttackRelease(
              notes as any,
              '8n',
              time + Tone.Time('4n') + Tone.Time('4n')
            )
          }, '2n', startTime)
          break

        case 'syncopationLarge':
          // 大切分：1/8 + 1/4 + 1/8
          Tone.getTransport().scheduleRepeat((time) => {
            sampler.triggerAttackRelease(notes as any, '8n', time)
            sampler.triggerAttackRelease(
              notes as any,
              '4n',
              time + Tone.Time('8n')
            )
            sampler.triggerAttackRelease(
              notes as any,
              '8n',
              time + Tone.Time('8n') + Tone.Time('4n')
            )
          }, '4n', startTime)
          break

        case 'syncopationSmall':
          // 小切分：1/16 + 1/8 + 1/16
          Tone.getTransport().scheduleRepeat((time) => {
            sampler.triggerAttackRelease(notes as any, '16n', time)
            sampler.triggerAttackRelease(
              notes as any,
              '8n',
              time + Tone.Time('16n')
            )
            sampler.triggerAttackRelease(
              notes as any,
              '16n',
              time + Tone.Time('16n') + Tone.Time('8n')
            )
          }, '4n', startTime)
          break

        case 'eighthTriplet':
          // 八分三连音：1/12 + 1/12 + 1/12
          Tone.getTransport().scheduleRepeat((time) => {
            sampler.triggerAttackRelease(notes as any, '12n', time)
            sampler.triggerAttackRelease(notes as any, '12n',  + Tone.Time('12n'))
            sampler.triggerAttackRelease(notes as any, '12n', time + Tone.Time('12n') * 2)
          }, '4n', startTime)
          break

        case 'frontEighthBackSixteenth':
          // 前八后十六：1/8 + 1/16 + 1/16
          Tone.getTransport().scheduleRepeat((time) => {
            sampler.triggerAttackRelease(notes as any, '8n', time)
            sampler.triggerAttackRelease(
              notes as any,
              '16n',
              time + Tone.Time('8n')
            )
            sampler.triggerAttackRelease(
              notes as any,
              '16n',
              time + Tone.Time('8n') + Tone.Time('16n')
            )
          }, '4n', startTime)
          break

        case 'frontSixteenthBackEighth':
          // 前十六后八：1/16 + 1/16 + 1/8
          Tone.getTransport().scheduleRepeat((time) => {
            sampler.triggerAttackRelease(notes as any, '16n', time)
            sampler.triggerAttackRelease(
              notes as any,
              '16n',
              time + Tone.Time('16n')
            )
            sampler.triggerAttackRelease(
              notes as any,
              '8n',
              time + Tone.Time('16n') * 2
            )
          }, '4n', startTime)
          break

        default:
          Tone.getTransport().scheduleRepeat((time) => {
            sampler.triggerAttackRelease(notes as any, '4n', time)
          }, '4n', startTime)
      }
    })
  })

  // 启动播放并设置持续时长
  Tone.getTransport().start()
  const duration = this.clips.length > 0
    ? Math.max(...this.clips.map(c => c.startTick + c.durationTick)) + 2
    : 4
  Tone.getTransport().stop(`+${duration}`)
}
}
const trackMap: Map<number, Track> = new Map<number, Track>(); // 存放所有轨道
class Clip {
  // 全局自增的 clip 唯一标识
  static nextClipId = 0

  clipId: number
  //0.1s=3px

  startTick:number//开始时间 以像素表示 1px=1/30s
  durationTick:number//时长
  instrumentId: InstrumentId
  rhythmId: string
  isChord: boolean
  notes: string[]
  container: Container
  ev: Graphics
  label: BitmapText
  deleteButton: Graphics
  content:string


  itemWidth =119
  itemHeight = 30

  resizing = false
  resizeDir: 'left' | 'right' | null = null
  startX = 0
  startWidth = 0

  constructor(text: string, x: number, y: number, instrumentId: InstrumentId, rhythmId: string) {
    // 生成唯一 clipId
    this.clipId = Clip.nextClipId++

    this.instrumentId = instrumentId
    this.rhythmId = rhythmId

    // 判断是单音还是和弦：Basic Key（如 C4）带有数字，其它（如 Cmaj7）视为和弦
    this.isChord = !/\d/.test(text)
    this.notes = this.isChord ? buildChordNotes(text) : [text]

    this.container = new Container()
    this.ev = new Graphics()
    this.content=text
    this.deleteButton = new Graphics()
    this.label = new BitmapText({
      text,
      style: {
        fontFamily: 'myfont',
        fontSize: 16,
        fill: 0xcccccc
      }
    })

    this.label.x = 30
    this.label.y = 0

    this.setupDeleteButton()
    this.container.addChild(this.ev, this.label, this.deleteButton)
    this.container.x = x
    this.container.y = y
    this.startTick=x
    this.container.eventMode = 'static'
    this.container.cursor = 'pointer'
    this.container.hitArea = new Rectangle(0, 0, this.itemWidth, this.itemHeight)
    this.startTick=x/30
    this.durationTick=4
    console.log(this.startTick);
    this.redraw()
    this.bindEvents()
    }
    //绘画
    redraw() {
    this.ev.clear()
    this.ev.rect(0, 0, this.itemWidth, this.itemHeight)
    this.ev.fill(0xccc)

    this.container.hitArea = new Rectangle(
      0,
      0,
      this.itemWidth,
      this.itemHeight
      )
      console.log(this);

    }
    bindEvents() {
      this.container.on('pointerdown', this.onPointerDown)
      this.container.on('pointermove', this.onPointerMove)
      this.container.on('pointerover', this.onPointerOver)
      this.container.on('pointerout', this.onPointerOut)
    }
    setupDeleteButton = () => {
      this.deleteButton.clear()
      this.deleteButton
        .circle(110, 5, 8)
        .fill(0xcccc)
      this.deleteButton
        .moveTo(107, 2)
        .lineTo(113, 8)
        .moveTo(113, 2)
        .lineTo(107, 8)
        .stroke({ width: 1.5, color: 0xffffff })
      this.deleteButton.visible = false
      this.deleteButton.eventMode = 'static'
      this.deleteButton.cursor = 'pointer'
      this.deleteButton.on('pointerdown', (e: any) => {
        e.stopPropagation()
      })
      this.deleteButton.on('pointertap', (e: any) => {
        e.stopPropagation()
        this.delete()
      })
    }
    delete = () => {
      trackMap.forEach((track, trackId) => {
        const index = track.clips.indexOf(this)
        if (index !== -1) {
          track.clips.splice(index, 1)
        }
        if (!track.clips.length) {
          trackMap.delete(trackId)
        }
      })
      this.container.parent?.removeChild(this.container)
    }
    onPointerOver = () => {
      this.deleteButton.visible = true
    }
    onPointerOut = () => {
      this.deleteButton.visible = false
    }
    changeLocation=()=>{}
    onPointerMove=(e:any)=>{
        const local = e.getLocalPosition(this.container)
        if (local.x < 6 || local.x > this.itemWidth - 6) {
          this.container.cursor = 'ew-resize'
        } else {
          this.container.cursor = 'pointer'
        }
}
    onPointerDown = (e: any) => {
      e.stopPropagation()

      const local = e.getLocalPosition(this.container)
      this.startX = e.global.x
      this.startWidth = this.itemWidth

      if (local.x < 6) {
        this.resizeDir = 'left'
      } else if (local.x > this.itemWidth - 6) {
        this.resizeDir = 'right'
      } else {
        this.resizeDir = null
      }
      ClipInteraction.activeClip = this
    }

  }


  //！响应式canvas
  const pianoCanvas = ref<HTMLCanvasElement | null>(null);
  // 使用reactive对象来存储位置，确保响应性
  const positionState = reactive({
    translateX: 0
  });
  //设置字体
  BitmapFont.install({
        name:'mufont',
        style:{
          fontFamily:'Arial'
        }
      })
  onMounted(

    async () => {
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

    if(pianoCanvas.value){
    // 初始化时设置为0，而不是从marginLeft获取
      positionState.translateX = 0;
    }
    // 使用nextTick确保所有DOM元素都已渲染完成
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
          const newTrack=new Track(i)
          const graphics=new Graphics()
          graphics
          .rect(0, 70 + (i - 1) * TRACK_HEIGHT, 9000, TRACK_HEIGHT)
          .fill({ color:0x4a5c6a }) // Fill with red
          .stroke({ width: 1, color: 0x5a6c7a });
          pixiApp.stage.addChild(graphics)

          // trackArray.push(newTrack)
        }
        pixiApp.stage.addChild(musicTrackLine,musicTrack)
      }
      //时间导轨区域
      const timeTrack=new Graphics()
      const timeColumn=new Graphics()
      const timeColumnx=new Graphics()
      const ruler=new Container()
      // const fontStyle = { fontName: 'Arial', fontSize: 16, tint: 0xffffff };

      if(timeTrack&&parent){
        timeTrack
          .rect(0,0,width,TRACK_TOP)
          .fill({color:0x253745})
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
                fill:0xcccccc,
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
    pianoCanvas.value?.addEventListener('drop',e=>{
      if(!pianoCanvas.value)return
      const itemText=e.dataTransfer?.getData('text/plain') as string
      const rect=pianoCanvas.value.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1;
      const trackId=Math.floor((e.clientY-rect.top-TRACK_TOP)/TRACK_HEIGHT)
      const x=(e.clientX-rect.left)*dpr
      const y=trackId*TRACK_HEIGHT+TRACK_TOP

      // 从 DefaultLayout 的下拉框中读取当前选中的音色和节奏
      const instrumentSelect = document.getElementById('instrument') as HTMLSelectElement | null
      const tempoSelect = document.getElementById('tempo') as HTMLSelectElement | null
      const instrumentId = (instrumentSelect?.value || 'piano') as InstrumentId
      const rhythmId = tempoSelect?.value || 'quarter'

      const newClip=new Clip(itemText,x,y,instrumentId,rhythmId)
      newClip.redraw()
      // trackArray[trackId]?.clips.push(newClip)
      if(!trackMap.get(trackId)){
        const newTrack=new Track(trackId)
        newTrack.clips.push(newClip)
        trackMap.set(trackId,newTrack)
      } else {
        trackMap.get(trackId)?.clips.push(newClip)
      }
      console.log(trackMap);

      pixiApp.stage.addChild(newClip.container)
    })

    pixiApp.stage.eventMode = 'static'
    let lastX = 0, lastY = 0;
    pixiApp.stage.on('pointermove', (e) => {
      const clip = ClipInteraction.activeClip
      if (!clip||!pianoCanvas.value) return
      const dx = e.global.x - clip.startX
      if (clip.resizeDir === 'right') {
        clip.itemWidth = Math.max(40, clip.startWidth + dx)
        clip.durationTick=clip.itemWidth/30

      }

      if (clip.resizeDir === 'left') {
        const newWidth = Math.max(40, clip.startWidth - dx)
        const diff = newWidth - clip.itemWidth
        clip.itemWidth = newWidth
        clip.container.x -= diff
        clip.startTick-=diff/30
        // clip.durationTick+=diff/30
        clip.durationTick=clip.itemWidth/30

      }
      //非换方向-移动
      if (!clip.resizeDir) {
        const rect=pianoCanvas.value.getBoundingClientRect()
        let dx2
        if (lastX) {
          dx2 = e.clientX - lastX
          clip.container.x += dx2
          clip.startTick+=dx2/30
          // clip.durationTick+=dx2/30
          clip.durationTick=clip.itemWidth/30

        }
        // 计算轨道
        const mouseY = e.clientY
        const trackIndex = Math.floor(
          (mouseY-rect.top - TRACK_TOP) / 30
        )
        if(trackIndex>=0){
          clip.container.y = TRACK_TOP + trackIndex * 30
        }
        lastX = e.clientX
      }
      clip.redraw()
    })

    pixiApp.stage.on('pointerup', () => {
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
  lastY = 0;
});

      document.querySelector('.function-play')?.addEventListener('click',()=>{
        trackMap.forEach(item=>{
          if(item.clips.length)item.play()
        })
      })
      }
    );

  function throttle(fn:Function, delay:number) {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      (fn as any)(...args);
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
