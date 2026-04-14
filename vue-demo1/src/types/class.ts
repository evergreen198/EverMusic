import {
  Graphics,
  BitmapText,
  Container,
  Rectangle
} from "pixi.js";
import * as Tone from 'tone'
import { instrumentSampleConfigs } from '@/utils/materials'
import {
  noteNameToMidi,
  midiToNoteName
} from '@/utils/noteToMidi'
import type { InstrumentId } from '@/utils/materials'
// const TRACK_TOP = 40
const TRACK_HEIGHT = 30

const instrumentSelect = document.getElementById('instrument') as HTMLSelectElement | null

export const instrumentId = (instrumentSelect?.value || 'piano') as InstrumentId

export class ClipInteraction {
  static activeClip: Clip | null = null
}
export class Track {
  id: number
  midiChannel: number
  volume: number = 100
  container: Container
  ev: Graphics
  clips: Array<Clip> = []

  constructor(trackId: number) {
    this.id = trackId
    this.midiChannel = trackId
    this.container = new Container()
    this.ev = new Graphics()
    this.container.addChild(this.ev)
    this.container.eventMode = 'static'
    // this.drawTrack()
    this.bindEvents()
  }

  bindEvents() {
    this.container.on('drop', this.addClip)
  }
  drawTrack = () => {
    this.ev
      .rect(0, 70 + (this.id - 1) * TRACK_HEIGHT, 9000, TRACK_HEIGHT)
      .fill({ color: 0x4a5c6a }) // Fill with red
      .stroke({ width: 1, color: 0x5a6c7a });
  }
  addClip = () => {
    console.log('track');
    this.clips.push(ClipInteraction.activeClip as Clip)
  }
  removeClip = () => {
    const index = this.clips.indexOf(ClipInteraction.activeClip as Clip)
    if (index != -1) {
      this.clips.splice(index, 1)
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
        const startTime = `+${clip.startsecond}` // 相对于当前时间的开始时间

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
              sampler.triggerAttackRelease(notes as any, '12n', + Tone.Time('12n'))
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
      ? Math.max(...this.clips.map(c => c.startsecond + c.durationsecond)) + 2
      : 4
    Tone.getTransport().stop(`+${duration}`)
  }
}
export const trackMap: Map<number, Track> = new Map<number, Track>(); // 存放所有轨道

export class Clip {
  // 全局自增的 clip 唯一标识
  static nextClipId = 0
  clipId: number
  //0.1s=3px
  startsecond: number//开始时间 以像素表示 1px=1/30s
  durationsecond: number//时长
  instrumentId: InstrumentId
  rhythmId: string
  isChord: boolean
  notes: string[]
  container: Container
  ev: Graphics
  label: BitmapText
  deleteButton: Graphics
  content: string
  deleteCallback: (clipId: number, trackId: number, alreadyDeleted: boolean) => void

  itemWidth = 119
  itemHeight = 30

  resizing = false
  resizeDir: 'left' | 'right' | null = null
  startX = 0
  startWidth = 0

  constructor(text: string, x: number, y: number, instrumentId: InstrumentId, rhythmId: string, deleteCallback?: (clipId: number, trackId: number, alreadyDeleted: boolean) => void) {
    // 生成唯一 clipId
    this.clipId = Clip.nextClipId++

    this.instrumentId = instrumentId
    this.rhythmId = rhythmId
    this.deleteCallback = deleteCallback || (() => { })

    // 判断是单音还是和弦：Basic Key（如 C4）带有数字，其它（如 Cmaj7）视为和弦
    this.isChord = !/\d/.test(text)
    this.notes = this.isChord ? buildChordNotes(text) : [text]

    this.container = new Container()
    this.ev = new Graphics()
    this.content = text
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
    this.startsecond = x
    this.container.eventMode = 'static'
    this.container.cursor = 'pointer'
    this.container.hitArea = new Rectangle(0, 0, this.itemWidth, this.itemHeight)
    this.startsecond = x / 30
    this.durationsecond = 4
    console.log(this.startsecond);
    this.redraw()
    this.bindEvents()
  }
  //绘画
  redraw() {
    this.ev.clear()
    this.deleteButton.clear()
    this.setupDeleteButton()

    this.ev.rect(0, 0, this.itemWidth, this.itemHeight)
    this.ev.fill(0xFA9C61)
    this.ev.alpha = 0.5
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
      .circle(this.itemWidth - 10, 5, 8)
      .fill(0xcccc)
    this.deleteButton
      .moveTo(this.itemWidth - 13, 2)
      .lineTo(this.itemWidth - 7, 8)
      .moveTo(this.itemWidth - 7, 2)
      .lineTo(this.itemWidth - 13, 8)
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
    let trackId = -1
    trackMap.forEach((track, id) => {
      const index = track.clips.indexOf(this)
      if (index !== -1) {
        trackId = id
        track.clips.splice(index, 1)
      }
      if (!track.clips.length) {
        trackMap.delete(id)
      }
    })
    this.container.parent?.removeChild(this.container)
    if (trackId !== -1) {
      // 传递true表示clip已经在本地删除了
      this.deleteCallback(this.clipId, trackId, true)
    }
  }
  onPointerOver = () => {
    this.deleteButton.visible = true
  }
  onPointerOut = () => {
    this.deleteButton.visible = false
  }
  changeLocation = () => { }
  onPointerMove = (e: any) => {
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
