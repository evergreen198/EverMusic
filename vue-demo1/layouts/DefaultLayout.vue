<template>
    <div class="app-layout">
      <!-- 导入作品弹窗 -->
      <div v-if="showImportModal" class="modal-overlay" @click="closeImportModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>导入作品</h3>
            <button class="modal-close" @click="closeImportModal">×</button>
          </div>
          <div class="modal-body">
            <button class="modal-option-btn" @click="handleViewHistory">
              <span class="btn-icon">📁</span>
              <span class="btn-text">查看历史作品</span>
            </button>
            <button class="modal-option-btn" @click="handleJoinCollaboration">
              <span class="btn-icon">🤝</span>
              <span class="btn-text">加入协作</span>
            </button>
            <button class="modal-option-btn" @click="handleImportMidi">
              <span class="btn-icon">🎵</span>
              <span class="btn-text">导入MIDI文件</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 加入协作弹窗 -->
      <div v-if="showJoinModal" class="modal-overlay" @click="closeJoinModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>加入协作</h3>
            <button class="modal-close" @click="closeJoinModal">×</button>
          </div>
          <div class="modal-body">
            <div class="join-input-container">
              <p class="join-label">请输入邀请码</p>
              <input
                type="text"
                v-model="inviteCodeInput"
                class="join-input"
                placeholder="输入10位邀请码"
                maxlength="10"
                @keyup.enter="confirmJoinCollaboration"
              />
              <p class="join-tip">输入邀请码后点击确认加入协作项目</p>
            </div>
            <button class="modal-action-btn" @click="confirmJoinCollaboration">
              <span class="btn-icon">✓</span>
              <span class="btn-text">确认加入</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 项目信息确认弹窗 -->
      <div v-if="showProjectConfirmModal" class="modal-overlay" @click="closeProjectConfirmModal">
        <div class="modal-content project-confirm-modal" @click.stop>
          <div class="modal-header">
            <h3>确认加入项目</h3>
            <button class="modal-close" @click="closeProjectConfirmModal">×</button>
          </div>
          <div class="modal-body">
            <div class="project-confirm-info">
              <div class="confirm-item">
                <span class="confirm-label">项目标题：</span>
                <span class="confirm-value">{{ pendingProjectInfo.title }}</span>
              </div>
              <div class="confirm-item">
                <span class="confirm-label">创建者ID：</span>
                <span class="confirm-value">{{ pendingProjectInfo.creator_id }}</span>
              </div>
              <div class="confirm-item">
                <span class="confirm-label">项目时长：</span>
                <span class="confirm-value">{{ formatDuration(pendingProjectInfo.duration_second) }}</span>
              </div>
              <div class="confirm-item">
                <span class="confirm-label">项目描述：</span>
                <span class="confirm-value">{{ pendingProjectInfo.description || '暂无描述' }}</span>
              </div>
            </div>
            <p class="confirm-question">是否加入此项目进行协作？</p>
            <div class="confirm-actions">
              <button class="modal-action-btn secondary" @click="closeProjectConfirmModal">
                <span class="btn-text">取消</span>
              </button>
              <button class="modal-action-btn primary" @click="confirmJoinProject">
                <span class="btn-text">确认加入</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 导入MIDI文件弹窗 -->
      <div v-if="showImportMidiModal" class="modal-overlay" @click="closeImportMidiModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>导入MIDI文件</h3>
            <button class="modal-close" @click="closeImportMidiModal">×</button>
          </div>
          <div class="modal-body">
            <div class="midi-upload-container">
              <div
                class="upload-zone"
                :class="{ 'drag-over': isDragOver }"
                @dragover.prevent="handleDragOver"
                @dragleave.prevent="handleDragLeave"
                @drop.prevent="handleDrop"
                @click="triggerFileInput"
              >
                <input
                  type="file"
                  ref="midiFileInput"
                  accept=".mid,.midi"
                  @change="handleFileSelect"
                  style="display: none;"
                />
                <div class="upload-icon">📁</div>
                <p class="upload-text">点击或拖拽MIDI文件到此处</p>
                <p class="upload-hint">支持 .mid 和 .midi 格式文件</p>
              </div>
              <div v-if="selectedMidiFile" class="file-info">
                <p class="file-name">{{ selectedMidiFile.name }}</p>
                <p class="file-size">{{ formatFileSize(selectedMidiFile.size) }}</p>
              </div>
            </div>
            <button
              class="modal-action-btn"
              @click="confirmImportMidi"
              :disabled="!selectedMidiFile"
            >
              <span class="btn-icon">📥</span>
              <span class="btn-text">确认导入</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 导出作品弹窗 -->
      <div v-if="showExportModal" class="modal-overlay" @click="closeExportModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>导出作品</h3>
            <button class="modal-close" @click="closeExportModal">×</button>
          </div>
          <div class="modal-body">
            <button class="modal-option-btn" @click="handleExportWav">
              <span class="btn-icon">🔊</span>
              <span class="btn-text">导出为WAV文件</span>
            </button>
            <button class="modal-option-btn" @click="handleExportMidi">
              <span class="btn-icon">🎵</span>
              <span class="btn-text">导出为MIDI文件</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 邀请协作弹窗 -->
      <div v-if="showInviteModal" class="modal-overlay" @click="closeInviteModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>邀请协作</h3>
            <button class="modal-close" @click="closeInviteModal">×</button>
          </div>
          <div class="modal-body">
            <div class="invite-code-container">
              <p class="invite-label">邀请码</p>
              <div class="invite-code-display">
                {{ inviteCode }}
              </div>
              <p class="invite-tip">分享此邀请码给其他用户，邀请他们协作编辑此项目</p>
            </div>
            <button class="modal-action-btn" @click="copyInviteCode">
              <span class="btn-icon">📋</span>
              <span class="btn-text">复制邀请码</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 历史作品列表弹窗 -->
      <div v-if="showHistoryModal" class="modal-overlay" @click="closeHistoryModal">
        <div class="modal-content history-modal" @click.stop>
          <div class="modal-header">
            <h3>历史作品</h3>
            <button class="modal-close" @click="closeHistoryModal">×</button>
          </div>
          <div class="modal-body">
            <div v-if="loadingHistory" class="loading-text">加载中...</div>
            <div v-else-if="historyError" class="error-text">{{ historyError }}</div>
            <div v-else-if="projectList.length === 0" class="empty-text">暂无历史作品</div>
            <div v-else class="project-list">
              <div
                v-for="project in projectList"
                :key="project.id"
                class="project-item"
                @click="loadProject(project.id)"
              >
                <div class="project-info">
                  <h4 class="project-title">{{ project.title }}</h4>
                  <div class="project-details">
                    <span class="detail-item">
                      <span class="detail-label">BPM:</span>
                      <span class="detail-value">{{ project.bpm }}</span>
                    </span>
                    <span class="detail-item">
                      <span class="detail-label">时长:</span>
                      <span class="detail-value">{{ formatDuration(project.duration_second) }}</span>
                    </span>
                    <span class="detail-item">
                      <span class="detail-label">更新:</span>
                      <span class="detail-value">{{ formatDate(project.updated_at) }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Aside @loaded="(msg)=>{asideLoaded=msg}" class="inline-block"></Aside>
    <section class="right">
      <div class="main">
        <nav class="nav">
            <div class="nav-info">
              <div class="editable-field">
                <span v-if="!isEditingTitle" @click="isEditingTitle = true" class="field-text title-text">{{ projectTitle || '点击输入标题' }}</span>
                <input v-else id="title" v-model="projectTitle" type="text" placeholder="标题" @blur="isEditingTitle = false" @keyup.enter="isEditingTitle = false" ref="titleInput">
              </div>
              <div class="editable-field">
                <span v-if="!isEditingBrief" @click="isEditingBrief = true" class="field-text brief-text">{{ projectBrief || '点击输入简介' }}</span>
                <input v-else id="brief" v-model="projectBrief" type="text" placeholder="简介" @blur="isEditingBrief = false" @keyup.enter="isEditingBrief = false" ref="briefInput">
              </div>
            </div>
            <div class="co-editer">
              <div><span>正在编辑：</span></div>
              <div>
                <ul class="editer-list">

                </ul>
              </div>
            </div>
            <div class="user">
            <div>
                <router-link to="/User" class="user-name inline-block">{{ currentUser?.username || 'username' }}</router-link>
                <img :src="currentUser?.avatar_url || '/img/pexels-ecaterina-susu-1790735746-29779303.jpg'" alt="">
            </div>
            <div class="user-detail">
              <ul>
                <li>
                  <router-link to="/User">个人中心</router-link>
                </li>

                <li>
                  <router-link to="/User" @click="handleLogout">退出登录</router-link>
                </li>
              </ul>
            </div>
            </div>
        </nav>
          <section class="piano" :style="{'width':pianoWidth+'px'}">
      <!--canvas钢琴卷帘-->
            <PianoRoll v-if="asideLoaded"
            class="canvas-piano"
            :style="{width:'100%'}"
            :isMultiUser="isMultiUserProject"
            :projectId="currentProjectId"></PianoRoll>
            <!-- 子路由内容 -->
            <!-- <router-view v-if="asideLoaded" class="sub-content"></router-view> -->
          </section>
        <footer class="function">
          <div class="function-action">
            <h3 class="function-play" @click="playBtn">播放</h3>
            <h3 class="function-pause">暂停</h3>
            <h3 class="function-bpm">速度</h3>
            <BpmSlider style="display: inline-block;"
            :projectId="currentProjectId"
            :isMultiUser="isMultiUserProject"
            @update:bpm="(bpmFromSlider)=>{bpmValue=bpmFromSlider}"></BpmSlider >
          </div>
          <div class="function-react">
            <button id="function-import">
              导入作品
            </button>
            <button id="function-save">
              保存作品
            </button>
            <button id="function-invite" @click="openInviteModal">
              邀请协作
            </button>
            <button id="function-export" @click="openExportModal">
              导出作品
            </button>
          </div>
        </footer>
      </div>
      <section class="material">
        <div class="tone">
          <div class="select-wrapper">
            <label class="select-label">乐器</label>
            <div class="custom-select">
              <select name="instrument" id="instrument">
                <option value="piano">钢琴</option>
                <option value="guitar">吉他</option>
                <option value="bass">贝斯</option>
                <option value="drum">鼓</option>
                <option value="string">弦乐</option>
                <option value="管乐">管乐</option>
                <option value="打击乐">打击乐</option>
              </select>
              <span class="select-arrow">▼</span>
            </div>
          </div>
        </div>

        <!-- 乐器
        从乐器库获取乐器列表
        乐器列表中包含乐器名称、乐器类型、乐器音色
        乐器类型包含钢琴、吉他、贝斯、鼓、弦乐、管乐、打击乐 -->

        <div class="material-container">
         <div class="material-main" v-for="item in materialTriggers" :key="item.id">
           <h3 class="material-item"  @dblclick="handleSwitchUnfold(item.id)">
             <i class="material-item-icon"></i>
             <span class="material-item-title">{{item.type}}</span>
           </h3>
           <Transition><!--素材库下拉菜单-->
             <ul v-if="isMaterialUnfold.includes(item.id as never)">
               <li v-for="lilitem in item.content" :key="lilitem" class="material-list" draggable="true" @dblclick="StartPlay">
                <i class="material-list-icon"></i>
                <span class="material-item-title">
                 {{lilitem}}
                </span>
               </li>
             </ul>
           </Transition>
         </div>
        </div>
        <footer class="mode">
          <div class="select-wrapper">
            <label class="select-label">节奏</label>
            <div class="custom-select">
              <select name="tempo" id="tempo">
                <option value="whole">全音符 1/1</option>
                <option value="half">二分音符 1/2</option>
                <option value="quarter">四分音符 1/4</option>
                <option value="eighth">八分音符 1/8</option>
                <option value="sixteenth">十六分音符 1/16</option>
                <option value="dottedhalf">附点二分音符 1/2+1/4</option>
                <option value="dottedquarter">附点四分音符 1/4+1/8</option>
                <option value="dottedeighthnote">小附点 1/8+1/8+1/16</option>
                <option value="dottedquarternote">大附点 1/4+1/4+1/8</option>
                <option value="syncopationLarge">大切分 1/8+1/4+1/8</option>
                <option value="syncopationSmall">小切分 1/16+1/8+1/16</option>
                <option value="eighthTriplet">八分三连音 1/12+1/12+1/12</option>
                <option value="frontEighthBackSixteenth">前八后十六 1/8+1/16+1/16</option>
                <option value="frontSixteenthBackEighth">前十六后八 1/16+1/16+1/8</option>
              </select>
              <span class="select-arrow">▼</span>
            </div>
          </div>
        </footer>
      </section>
    </section>
    </div>

</template>

<script setup lang="ts">
import PianoRoll from '../src/components/PianoRoll.vue';
import Aside from '../src/components/Aside.vue'
import BpmSlider from '@/components/BpmSlider.vue';

import { ref, watch, onMounted, onUnmounted,watchEffect,computed,nextTick } from 'vue'
import  { StartPlay } from '@/data/musicMaterials';
import { Midi } from '@tonejs/midi';
import * as Tone from "tone"
import {Track,Clip} from "../src/types/class.ts"
import {createProject,updateProject,
        getProjectList,getProject,
        sendInvitaion,confirmInvitation,
        addCollaborator } from '../src/utils/api.js';
import router from '@/router/index.js';
import socket from '@/utils/socket.ts';
import { collaborativeEventsDefault,
         registerSocketListenersDefault,
         unregisterSocketListenersDefault } from '@/utils/socketEvents.ts';



//协作状态：是否多人
const collaborators = ref<unknown[]>([]);
// 项目保存相关
const currentProjectId = ref<number | null>(null);
const projectVersion = ref<number>(1);
const bpmValue = ref<number>(120);

// 项目标题和简介编辑状态
const projectTitle = ref<string>('');
const projectBrief = ref<string>('');
const isEditingTitle = ref<boolean>(false);
const isEditingBrief = ref<boolean>(false);
const titleInput = ref<HTMLInputElement | null>(null);
const briefInput = ref<HTMLInputElement | null>(null);

// 访问trackMap
// 导入作品弹窗控制
const showImportModal = ref<boolean>(false);

// 历史作品弹窗控制
const showHistoryModal = ref<boolean>(false);
const projectList = ref<unknown[]>([]);
const loadingHistory = ref<boolean>(false);
const historyError = ref<string>('');

// 导出作品弹窗控制
const showExportModal = ref<boolean>(false);

// 邀请协作弹窗控制
const showInviteModal = ref<boolean>(false);
const inviteCode = ref<string>('');

// 加入协作弹窗控制
const showJoinModal = ref<boolean>(false);
const inviteCodeInput = ref<string>('');

// 项目信息确认弹窗控制
const showProjectConfirmModal = ref<boolean>(false);
const pendingProjectInfo = ref<unknown>({});
const pendingProjectId = ref<number | null>(null);

// 导入MIDI文件弹窗控制
const showImportMidiModal = ref<boolean>(false);
const selectedMidiFile = ref<File | null>(null);
const isDragOver = ref<boolean>(false);
const midiFileInput = ref<HTMLInputElement | null>(null);

//computed isMultiUserProject的值取决于collaborators.value长度是否大于1
const isMultiUserProject = computed(() => {
  return collaborators.value.length > 1;
});

// 添加标志位，用于区分本地修改和远程更新
const isLocalOperation = ref(false);


//根据是否多人项目挂载/取消挂载socket事件
watch(isMultiUserProject,(newVal)=>{
  if(newVal){
    registerSocketListenersDefault(
      {onTitleUpdated: (data) => {
        console.log('title-updated:', data);
        projectTitle.value = data.title;
      },
      onDescriptionUpdated: (data) => {
        console.log('description-updated:', data);
        projectBrief.value = data.description;
      }}
    )
  }else{
    unregisterSocketListenersDefault()
  }
})

  // 监听编辑状态变化，自动聚焦输入框(本地操作)
watch(isEditingTitle, async (newValue) => {
  if (newValue) {
    await nextTick();
    titleInput.value?.focus();
    isLocalOperation.value = true;
    if(isMultiUserProject.value&&!isLocalOperation.value){
      collaborativeEventsDefault.editTitle(currentProjectId.value!, projectTitle.value || '');
    }
  }
});

watch(isEditingBrief, async (newValue) => {
  if (newValue) {
    await nextTick();
    briefInput.value?.focus();
      isLocalOperation.value = true;
    if(isMultiUserProject.value&&!isLocalOperation.value){
      collaborativeEventsDefault.editDescription(currentProjectId.value!, projectBrief.value || '');
    }
  }
});





// 打开导出作品弹窗
const openExportModal = () => {
  showExportModal.value = true;
};

// 关闭导出作品弹窗
const closeExportModal = () => {
  showExportModal.value = false;
};

const ensureProjectExist=()=>{
  if(!currentProjectId.value){
    //正在创建项目
   return  saveProject().then((res)=>{
      console.log('res:',res);
      currentProjectId.value=res.id
      console.log('check over');
    })
  }
  return Promise.resolve()
}

// 打开邀请协作弹窗
async function openInviteModal() {
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const userId = currentUser?.id || null;
  inviteCode.value = generateRandomCode();

  await ensureProjectExist();
  const inviteData={
    projectId:currentProjectId.value,
    invite_code:inviteCode.value,
    inviter_id:userId,
    role:"editor",
    max_uses:5
  }
  console.log(inviteData);
  console.log(currentProjectId.value);
  sendInvitaion(inviteData)
  showInviteModal.value = true;
  socket.emit('host-project',currentProjectId.value)
};

// 关闭邀请协作弹窗
const closeInviteModal = () => {
  showInviteModal.value = false;
};

// 复制邀请码
const copyInviteCode = () => {
  navigator.clipboard.writeText(inviteCode.value).then(() => {
    alert('邀请码已复制到剪贴板');
  }).catch(() => {
    // 如果clipboard API不可用，使用传统方法
    const textarea = document.createElement('textarea');
    textarea.value = inviteCode.value;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('邀请码已复制到剪贴板');
  });
};

// 导出为WAV文件
const handleExportWav =() => {

  console.log('导出为WAV文件');
  const pianoLayout = document.querySelector('.piano-layout') as any;
  const exportAsWAV = pianoLayout.exportAsWAV;
  exportAsWAV()

  closeExportModal();
};


function handleLogout() {
  // 删除localStorage中的认证信息
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  // 重定向到登录页面
  router.push('/auth')
}

const handleExportMidi = () => {
  const pianoLayout = document.querySelector('.piano-layout')!;
  // @ts-expect-error 未定义属性 trackMap
  const trackMap = pianoLayout.trackMap;

  const midi=new Midi()

  midi.header.setTempo(bpmValue.value)

  trackMap.forEach((track:Track)=>{
    const midiTrack=midi.addTrack()
    midiTrack.channel=track.midiChannel
    //TODO:乐器分轨道
    midiTrack.instrument.number=0
    //midiTrack.instrument=instrumentToMidiMap[track.instrument]
    track.clips.forEach((clip:Clip)=>{
      if(!clip.isChord){
        midiTrack.addNote({
        time: clip.startsecond,
        name: clip.content,
        duration: clip.durationsecond,
        velocity: 1
      })
      }else{
        clip.notes.forEach((note:string)=>{
          midiTrack.addNote({
            time: clip.startsecond,
            name: note,
            duration: clip.durationsecond,
            velocity: 1,
          })
        })
      }

    })

  })

// 浏览器下载
// 生成二进制数据
const midiData = midi.toArray()

// 转成 Blob
const blob = new Blob([midiData], { type: "audio/midi" })

// 生成下载链接
const url = URL.createObjectURL(blob)

// 创建隐藏 a 标签触发下载
const a = document.createElement("a")
a.href = url
a.download = "export.mid"
document.body.appendChild(a)
a.click()

// 清理
document.body.removeChild(a)
URL.revokeObjectURL(url)
}

// 打开导入作品弹窗
const openImportModal = () => {
  showImportModal.value = true;

};

// 关闭导入作品弹窗
const closeImportModal = () => {
  showImportModal.value = false;
};

// 关闭历史作品弹窗
const closeHistoryModal = () => {
  showHistoryModal.value = false;
};

// 格式化时长（秒 -> 分:秒）
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 查看历史作品
const handleViewHistory = async () => {
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const userId = currentUser?.id || null;

  if (!userId) {
    alert('请先登录');
    return;
  }

  try {
    loadingHistory.value = true;
    historyError.value = '';

    const response = await getProjectList(userId);
    projectList.value = response || [];

    closeImportModal();
    showHistoryModal.value = true;
  } catch (error) {
    console.error('获取历史作品失败:', error);
    historyError.value = '获取历史作品失败，请重试';
  } finally {
    loadingHistory.value = false;
  }
};

// 加载项目到编辑器
const loadProject = async (projectId: number) => {
  try {
    const response = await getProject(projectId);
    console.log('加载项目:', response);

    // 获取项目数据
    const projectData = response.data || response;

    if (!projectData.project_json) {
      alert('项目数据格式错误');
      return;
    }

    // 解析project_json
    let projectJson;
    if (typeof projectData.project_json === 'string') {
      projectJson = JSON.parse(projectData.project_json);
    } else {
      projectJson = projectData.project_json;
    }

    // 获取PianoRoll组件实例
    const pianoLayout = document.querySelector('.piano-layout') as any;

    if (pianoLayout && pianoLayout.importTrackMapFromJSON) {
      // 调用PianoRoll的导入函数
      pianoLayout.importTrackMapFromJSON(projectJson);

      // 更新当前项目ID
      currentProjectId.value = projectId;

      // 更新项目信息
      projectTitle.value = projectData.title || '';
      projectBrief.value = projectData.description || '';

      closeHistoryModal();
      alert('项目加载成功！');
    } else {
      alert('无法访问编辑器，请刷新页面后重试');
    }
  } catch (error) {
    console.error('加载项目失败:', error);
    alert('加载项目失败，请重试');
  }
};

// 检查AI生成的音乐数据
const checkAIGeneratedMusic = () => {
  setTimeout(() => {
try {
    const projectData = (sessionStorage.getItem('aiGeneratedMusic'));
    if (projectData) {
      const projectDataJson=JSON.parse(projectData);
          const pianoLayout = document.querySelector('.piano-layout') as any;
      if (projectDataJson &&pianoLayout && pianoLayout.importTrackMapFromJSON) {
        // 加载音乐数据到编辑器
        pianoLayout.importTrackMapFromJSON(projectDataJson);
        sessionStorage.removeItem('aiGeneratedMusic');
        alert('AI 生成的音乐已加载到编辑器！');
      }
    }
  } catch (error) {
    console.error('检查AI生成音乐失败:', error);
  }
  }, 2000);

};

// 加入协作
const handleJoinCollaboration = () => {
  inviteCodeInput.value = '';
  showJoinModal.value = true;
  closeImportModal();
};

// 关闭加入协作弹窗
const closeJoinModal = () => {
  showJoinModal.value = false;
  inviteCodeInput.value = '';
};

// 确认加入协作
const confirmJoinCollaboration = () => {
  const code = inviteCodeInput.value.trim();

  if (!code) {
    alert('请输入邀请码');
    return;
  }

  if (code.length !== 10) {
    alert('邀请码格式错误，应为10位字符');
    return;
  }

  console.log('加入协作，邀请码:', code);

  confirmInvitation({ inviteCode: code })
    .then(response => {
      if (response.error) {
        alert(response.error);
        return;
      }
      //加入项目房间，并提供自己的数据
      socket.emit('join-project', response.project_id,collaborators.value[0]);
      getProject(response.project_id)
        .then(projectResponse => {
          const projectData = projectResponse.data || projectResponse;
          // 存储项目信息
          pendingProjectId.value = response.project_id;
          pendingProjectInfo.value = {
            title: projectData.title,
            creator_id: projectData.creator_id,
            duration_second: projectData.duration_second,
            description: projectData.description
          };
          // 关闭输入弹窗，显示确认弹窗
          closeJoinModal();
          showProjectConfirmModal.value = true;
        })
        .catch(error => {
          console.error('获取项目信息失败:', error);
          alert('获取项目信息失败，请重试');
        });
    })
    .catch(error => {
      console.error('确认邀请失败:', error);
      alert('确认邀请失败，请重试');
    });
};

// 关闭项目信息确认弹窗
const closeProjectConfirmModal = () => {
  showProjectConfirmModal.value = false;
  pendingProjectInfo.value = {};
  pendingProjectId.value = null;
};

// 确认加入项目
const confirmJoinProject = async () => {
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const user_id = currentUser?.id || null;

  if (!pendingProjectId.value) {
    return;
  }

  try {
    await addCollaborator({
      projectId: pendingProjectId.value,
      user_id,
      role: "editor",
      permissions: {"edit": true},
      title: pendingProjectInfo.value.title,
      duration_second: pendingProjectInfo.value.duration_second,
    });

    await loadProject(pendingProjectId.value);
    closeProjectConfirmModal();
  } catch (error) {
    console.error('加入项目失败:', error);
    alert('加入项目失败，请重试');
  }
};

// 导入MIDI文件
const handleImportMidi = () => {
  selectedMidiFile.value = null;
  isDragOver.value = false;
  showImportMidiModal.value = true;
  closeImportModal();
};

// 关闭导入MIDI文件弹窗
const closeImportMidiModal = () => {
  showImportMidiModal.value = false;
  selectedMidiFile.value = null;
  isDragOver.value = false;
};

// 触发文件选择
const triggerFileInput = () => {
  if (midiFileInput.value) {
    midiFileInput.value.click();
  }
};

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    selectedMidiFile.value = files[0];
  }
};

// 处理拖拽悬停
const handleDragOver = () => {
  isDragOver.value = true;
};

// 处理拖拽离开
const handleDragLeave = () => {
  isDragOver.value = false;
};

// 处理文件拖放
const handleDrop = (event: DragEvent) => {
  isDragOver.value = false;
  const files = event.dataTransfer!.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file.name.endsWith('.mid') || file.name.endsWith('.midi')) {
      selectedMidiFile.value = file;
    } else {
      alert('请选择 .mid 或 .midi 格式的文件');
    }
  }
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// 确认导入MIDI文件
const confirmImportMidi = () => {
  if (!selectedMidiFile.value) {
    alert('请选择MIDI文件');
    return;
  }

  const file = selectedMidiFile.value;
  const reader = new FileReader();

  reader.onload = (event) => {
    const arrayBuffer = event.target?.result as ArrayBuffer;
    if (arrayBuffer) {
      // TODO: 解析MIDI文件并导入到编辑器
      console.log('MIDI文件已加载:', arrayBuffer);
      const midi=new Midi(arrayBuffer);
      console.log(JSON.stringify(midi.tracks));

      // 这里需要调用MIDI解析库（如@tonejs/midi）解析文件
      // 然后将数据转换为trackMap格式并导入

      alert('MIDI文件导入功能待实现');
      closeImportMidiModal();
    }
  };

  reader.onerror = () => {
    alert('读取MIDI文件失败');
  };

  reader.readAsArrayBuffer(file);
};

// 获取BPM值


// 创建保存项目的数据体
function createProjectSaveData(): any {
  // 获取当前登录用户信息
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const userId = currentUser?.id || null;

  // 获取项目基本信息
  const title = projectTitle.value?.trim() || '未命名项目';
  const description = projectBrief.value?.trim() || '';
  const bpm = bpmValue.value;

  // 获取PianoRoll组件实例（通过DOM访问绑定的函数）
  const pianoLayout = document.querySelector('.piano-layout') as any;

  // 获取项目JSON数据
  let projectJson = { tracks: [] };
  let durationSecond = 4;

  if (pianoLayout && pianoLayout.exportTrackMapToJSON) {
    projectJson = pianoLayout.exportTrackMapToJSON();
    durationSecond = pianoLayout.calculateSongDuration();
  }

  // TODO: 非首次保存的version计算
  // 如果是更新操作，应该从后端获取当前version并+1
  const version = currentProjectId.value ? projectVersion.value : 1;

  // 构建保存数据
  const saveData = {
    creator_id: userId,
    title: title,
    bpm: bpm,
    duration_second: durationSecond,
    project_json: JSON.stringify(projectJson),
    version: version,
    last_edited_by: userId,
    description: description,
    created_at: currentProjectId.value ? undefined : new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return saveData;
}

// 保存项目函数
async function saveProject(): Promise<void> {
  try {
    // 创建保存数据
    const data = createProjectSaveData();
    // 验证必要字段
    if (!data.creator_id) {
      alert('请先登录后再保存项目');
      return;
    }
    if (!data.title) {
      alert('请输入项目标题');
      return;
    }
    // 调用后端API保存项目
    let response;
    if (currentProjectId.value) {
      // 更新现有项目
      response = await updateProject(currentProjectId.value, data);
      console.log('项目更新成功:', response);
      alert('项目更新成功！');
    } else {
      // 创建新项目
      response = await createProject(data);
      console.log('项目创建成功:', response);
      alert('项目创建成功！');

      // 保存新项目ID
      if (response.data && response.data.id) {
        currentProjectId.value = response.data.id;
        // if (isMultiUserProject.value) {
        //   initializeCollaborativeMode();
        // }
      }
    }

    // 更新版本号
    projectVersion.value++;
    return response
  } catch (error) {
    console.error('保存项目失败:', error);
    alert('保存项目失败，请重试');
  }
}

// 用户信息管理
const currentUser = ref<any>(null);

// 从localStorage获取用户信息
const loadUserInfo = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      currentUser.value = JSON.parse(userStr);
    } catch (error) {
      console.error('解析用户信息失败:', error);
      currentUser.value = null;
    }
  }
};

// 监听localStorage变化，实时更新用户信息
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'user') {
    loadUserInfo();
  }
};

const asideLoaded=ref(false)
const isMaterialUnfold=ref([])
const pianoWidth=ref(0)
let materialItem=document.querySelectorAll('.material-list')
//计算钢琴卷帘宽度
function calculatePianoWidth(){
  const viewportWidth=window.innerWidth
  const asideElement = document.querySelector('.aside') as HTMLElement
  const asideWidth = asideElement ? asideElement.offsetWidth : 0
  const materialElement = document.querySelector('.material') as HTMLElement
  const materialWidth = materialElement ? materialElement.offsetWidth : 0
  const isAsideClose=document.querySelector('.aside-btn')?.classList.contains('close')
  pianoWidth.value = viewportWidth - materialWidth - (isAsideClose ? asideWidth: 0)
}
const playBtn = async () => {
try {
  console.log("开始播放");
  // 1. 等待 Tone.js 初始化
  await Tone.start()
  // 2. 获取 PianoRoll 组件
  const pianoLayout = document.querySelector('.piano-layout');
  // 检查组件是否存在
  //@ts-expect-error 未定义属性 trackMap
  if (!pianoLayout || !pianoLayout.trackMap) {
    alert('编辑器未加载，请稍后重试');
    return;
  }
  //@ts-expect-error 未定义属性 trackMap
  const trackMap = pianoLayout.trackMap;
  // 3. 检查是否有内容
  // if (trackMap.length === 0 || !trackMap.forEach(t => t.clips.length > 0)) {
  if (trackMap.length === 0) {
    alert('请先添加音乐片段');
    return;
  }
  // 4. 停止之前的播放
  Tone.getTransport().cancel()
  Tone.getTransport().stop()

  // 5. 使用当前BPM值
    Tone.getTransport().bpm.value = bpmValue.value
  console.log(trackMap);
  // 6. 逐个轨道播放
  trackMap.forEach(item => {
    if (item.clips && item.clips.length > 0) {
      item.play()
    }
  })
  console.log("播放成功");

 } catch (error) {
   console.error('播放失败:', error);
   alert('播放失败: ' + (error as Error).message);
 }
}




onMounted(() => {
  // 加载用户信息
  loadUserInfo();
  collaborators.value.push({
    id: currentUser.value.id||null,
    name: currentUser.value?.username || null,
    avatar_url: currentUser.value?.avatar_url || null,
    socketId: socket.id||null,
  })
  // 加入项目
  //是不是多人
  if (isMultiUserProject.value && currentProjectId.value) {
  // initializeCollaborativeMode();
}
  // 监听localStorage变化
  window.addEventListener('storage', handleStorageChange);
  // 绑定保存按钮点击事件
  const saveBtn = document.getElementById('function-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveProject);
  }
  // 绑定导入按钮点击事件
  const importBtn = document.getElementById('function-import');
  if (importBtn) {
    importBtn.addEventListener('click', openImportModal);
  }
  const pianoCanvas=document.querySelector('.piano') as HTMLElement
  //放下元素位置的事件监听
  pianoCanvas?.addEventListener('dragover',(e)=>{
    e.preventDefault()

  })
  pianoCanvas.addEventListener('drop',(e)=>{
    e.preventDefault()
  })
  calculatePianoWidth(); // 初加载计算钢琴边框
  window.addEventListener('resize',calculatePianoWidth);
  const observeAsideChanges = () => {
  const asideElement = document.querySelector('.aside');
  if (asideElement) {
    const observer = new MutationObserver(() => {
      // 获取当前的 margin-left 值
      // const computedStyle = getComputedStyle(asideElement);
      // const marginLeft = computedStyle.marginLeft;


      // 根据 margin-left 的变化重新计算钢琴卷帘宽度
      calculatePianoWidth();
    });

    // 监听子节点和属性的变化
    observer.observe(asideElement, {
      attributes: true, // 监听属性变化
      childList: false, // 不监听子节点变化
      subtree: false,   // 不监听后代节点
    });

    // 在组件卸载时清理 observer
    onUnmounted(() => {
      observer.disconnect();
    });
  }
};

observeAsideChanges();
//TODO：token验证
watchEffect(() => {
  // 每次组件更新时读取最新的 state
  const projectId = history.state.projectId
  console.log(projectId)
  if (projectId) {
    loadProject(projectId)
  }
})
    checkAIGeneratedMusic();

    }
);

  //卸载
onUnmounted(() => {
  // 清理事件监听，防止内存泄漏
  window.removeEventListener('resize', calculatePianoWidth);
  window.removeEventListener('storage', handleStorageChange);
  const asideBtn = document.querySelector('.aside-btn');
  if (asideBtn) {
    asideBtn.removeEventListener('click', calculatePianoWidth);
  }

  // 清理materialItem的事件监听器
  cleanupMaterialItemEventListeners();
});

//素材库双击展开关闭函数
function handleSwitchUnfold(materialId:number){
  const index = isMaterialUnfold.value.indexOf(materialId as never)
  if(index>-1){
    isMaterialUnfold.value.splice(index,1)
  }else{
    isMaterialUnfold.value.push(materialId as never)
  }
}
//素材库数组
const materialTriggers=ref([
  {
    id:0,
    type:'Basic Key',
    name:'Basic Key',
    content:['C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4']
  },
  {
    id:1,
    type:'C',
    name:'C',
    content:['C','Cm','C7','Cmaj7','Cmin7','Cmaj9','Cmin9','Cmaj11','Cmin11','Cmaj13','Cmin13']
  },
  {
    id:2,
    type:'C#',
    name:'C#',
    content:['C#','C#m','C#7','C#maj7','C#min7','C#maj9','C#min9','C#maj11','C#min11','C#maj13','C#min13']
  },
  {
    id:3,
    type:'D',
    name:'D',
    content:['D','Dm','D7','Dmaj7','Dmin7','Dmaj9','Dmin9','Dmaj11','Dmin11','Dmaj13','Dmin13']
  },
  {
    id:4,
    type:'D#',
    name:'D#',
    content:['D#','D#m','D#7','D#maj7','D#min7','D#maj9','D#min9','D#maj11','D#min11','D#maj13','D#min13']
  },
  {
    id:5,
    type:'E',
    name:'E',
    content:['E','Em','E7','Emaj7','Emin7','Emaj9','Emin9','Emaj11','Emin11','Emaj13','Emin13']
  },
  {
    id:6,
    type:'F',
    name:'F',
    content:['F','Fm','F7','Fmaj7','Fmin7','Fmaj9','Fmin9','Fmaj11','Fmin11','Fmaj13','Fmin13']
  },
  {
    id:7,
    type:'F#',
    name:'F#',
    content:['F#','F#m','F#7','F#maj7','F#min7','F#maj9','F#min9','F#maj11','F#min11','F#maj13','F#min13']
  },
  {
    id:8,
    type:'G',
    name:'G',
    content:['G','Gm','G7','Gmaj7','Gmin7','Gmaj9','Gmin9','Gmaj11','Gmin11','Gmaj13','Gmin13']
  },
  {
    id:9,
    type:'G#',
    name:'G#',
    content:['G#','G#m','G#7','G#maj7','G#min7','G#maj9','G#min9','G#maj11','G#min11','G#maj13','G#min13']
  },
  {
    id:10,
    type:'A',
    name:'A',
    content:['A','Am','A7','Amaj7','Amin7','Amaj9','Amin9','Amaj11','Amin11','Amaj13','Amin13']
  },
  {
    id:11,
    type:'A#',
    name:'A#',
    content:['A#','A#m','A#7','A#maj7','A#min7','A#maj9','A#min9','A#maj11','A#min11','A#maj13','A#min13']
  },
  {
    id:12,
    type:'B',
    name:'B',
    content:['B','Bm','B7','Bmaj7','Bmin7','Bmaj9','Bmin9','Bmaj11','Bmin11','Bmaj13','Bmin13']
  },
  {
    id:13,
    type:'B#',
    name:'B#',
    content:['B#','B#m','B#7','B#maj7','B#min7','B#maj9','B#min9','B#maj11','B#min11','B#maj13','B#min13']
  }
])

// 存储当前的事件处理器，以便在需要时移除
//也就是目前material-item上的事件监测
const eventHandlers = new WeakMap();

// 正确处理materialItem的事件监听
function setupMaterialItemEventListeners() {
  // 获取最新的materialItem元素
  materialItem = document.querySelectorAll('.material-list');
  materialItem.forEach(item => {
    // 如果已有事件处理器，先移除
    if (eventHandlers.has(item)) {
      const handlers = eventHandlers.get(item);
      item.removeEventListener('dragstart', handlers.dragstart);
      item.removeEventListener('drag', handlers.drag);
      item.removeEventListener('dragend', handlers.dragend);
    }
    // 创建新的事件处理器
    const dragstartHandler = (e:any) => {
      e.dataTransfer.effectAllowed='move'
      e.dataTransfer.setData('text/plain',`${e.toElement.querySelector('.material-item-title').textContent}`)
    };
    const dragHandler = () => {
    };
    const dragEndHandler = (e:any) => {
    };

    // 添加新的事件监听器
    //item不再被引用时直接消失
    item.addEventListener('dragstart', dragstartHandler);
    item.addEventListener('drag', dragHandler);
    item.addEventListener('dragend', dragEndHandler);
    // 存储事件处理器以便后续移除
    eventHandlers.set(item, {
      dragstart: dragstartHandler,
      drag: dragHandler,
      dragend: dragEndHandler
    });
  });
}

// 清理所有materialItem的事件监听器
function cleanupMaterialItemEventListeners() {
  materialItem.forEach(item => {
    if (eventHandlers.has(item)) {
      const handlers = eventHandlers.get(item);
      item.removeEventListener('dragstart', handlers.dragstart);
      item.removeEventListener('drag', handlers.drag);
      item.removeEventListener('click', handlers.click);
      eventHandlers.delete(item);
    }
  });
}

// 监听isMaterialUnfold的变化，重新设置事件监听器
watch(
  () => isMaterialUnfold.value,
  () => {
    // 先清理旧的事件监听器
    cleanupMaterialItemEventListeners();
    // 在下一个DOM更新周期设置新的事件监听器
    setTimeout(() => {
      setupMaterialItemEventListeners();
    }, 0);
  },
  { deep: true }
)

function generateRandomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

socket.on('user-joined', (data: any) => {
  collaborators.value.push(data);
  // console.log(collaborators.value);
  console.log(`用户 ${data.name} 加入项目`);
});

socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
    collaborators.value=collaborators.value.filter(u=>u.socketId!==socket.id)
});

</script >

<style scoped>
.inline-block{
  display: inline-block;
}
.app-layout{
  width:100vw;
  height: 100vh;
  display:flex;

  overflow: hidden; /* 防止内容溢出 */
}

.right{
  flex:1;
max-height: 100vh;
max-width: 100%;
display: flex;
}

.function{
  display: inline-block;
  height: 100px; /* 固定高度 */
  min-height: 100px; /* 确保最小高度 */
  max-height: 100px; /* 确保最大高度 */
  position: relative; /* 确保定位稳定 */
  transform: scale(1); /* 防止缩放 */
  transform-origin: bottom left; /* 缩放原点 */
  background-color:#0e0e0e;
}

.function-action{
  float: left;
  height: 80px;
  line-height: 80px;
}

.function-action h3{
  display: inline-block;
}

.function-react{
  float: right;
  height: 80px;
  line-height: 80px;
}

.function-play::before{
  content: '';
  font-family: icomoon;
}
.function-pause::before{
  content: '';
  font-family: icomoon;
}

.function-react button{
  margin-right: 20px;
  height: 33px;
  width: 80px;
  border: 1px solid rgba(255,255,255,0.2);
  background-color: rgba(255,255,255,0.05);
  color: #e2e8f0;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.function-react button:hover{
  background-color: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.function-react button:active{
  transform: translateY(0);
}

.material{
  background-color:#202020;
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
  width: 250px;
  min-width: 250px;
  max-width: 250px;
  position: relative;
  transform: scale(1);
  transform-origin: top left;
  overflow: hidden;
  z-index: 1000;
}

.tone{
  height:130px;  /* 固定高度 */
  min-height:130px; /* 确保最小高度 */
  max-height:130px; /* 确保最大高度 */
  min-width: 250px;
  background-color:#202020;

}
.material-container{
  flex:1;
  max-width: 100%;
  overflow-y: scroll;
  box-sizing: border-box;
}
.material-main ul{
max-width: 100%;
height: auto;
}
.material-item{
  z-index: 1000;
  color: #CCD0CF;
  box-sizing: border-box;
  height: 38px;
  line-height: 38px;
  padding: 0 0 0 15px;
}
.material-item:hover{
  cursor: pointer;
  background-color: #414141;
}
.material-item i{
  font-family: 'icomoon';
  font-size: 18px;
  font-style: none ;

}
i::before{
  font-style: none ;
  content: "\e92f";
}

.material-list{
  color: rgb(229, 232, 235);
  box-sizing: border-box;
  height: 35px;
  line-height: 35px;
  padding: 0 0 0 30px;
  font-size: 18px;
}
.material-list:hover{
  background-color: #414141;
  cursor: pointer;
}

.material-list-icon{
  font-family: 'icomoon';
  font-style: none;

}
.material-list-icon::before{
  content: "\e912";
}

.material-item-title{
  margin-left: 15px;
  font-size: 18px;
}
.mode{
  /* position: absolute;
  bottom: 0; */
  width: 250px;
    height: 100px; /* 固定高度 */
  min-height: 100px; /* 确保最小高度 */
  max-height: 100px; /* 确保最大高度 */
  background-color:#11212D;
}

.main{
    flex:1;
    min-width: 0;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #11212D;
}
.nav{
  z-index: 1000;
  box-sizing: border-box;
  height:130px;  /* 固定高度 */
  min-height:130px; /* 确保最小高度 */
  max-height:130px; /* 确保最大高度 */
  position: relative; /* 确保定位稳定 */
  transform: scale(1); /* 防止缩放 */
  transform-origin: top left; /* 缩放原点 */
  background-color: #11212D;
  padding: 25px 15px 0 15px;
  width: 100%; /* 确保宽度充满 */
  font-size: 20px;
}
.nav-info{
    float: left;
    width: 220px;
}

.editable-field{
  margin-bottom: 8px;
}

.field-text{
  display: inline-block;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #9fb2c1;
  font-size: 14px;
}

.field-text:hover{
  background-color: #253745;
  color: #ffffff;
}

.title-text{
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
}

.brief-text{
  font-size: 14px;
  color: #9fb2c1;
}

.nav-info input{
  width: 180px;
  padding: 6px 12px;
  border: 1px solid #2a4a5c;
  border-radius: 4px;
  background-color: #253745;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.nav-info input:focus{
  border-color: #9fb2c1;
  background-color: #1a2d3d;
}

.nav-info input#title{
  font-size: 18px;
  font-weight: bold;
}

.nav-info input#brief{
  font-size: 14px;
}

/* 自定义下拉框样式 */
.select-wrapper{
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 5px;
}

.select-label{
  font-size: 14px;
  color: #9fb2c1;
  margin-bottom: 0.5px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.custom-select{
  position: relative;
  display: inline-block;
}

.custom-select select{
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding: 0.8vh 2.5vh 0.8vh 1vh;
  font-size: 1.3vh;
  border: 1px solid #2a4a5c;
  border-radius: 6px;
  background-color: #253745;
  color: #ffffff;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  min-width: 100px;
}

.custom-select select:hover{
  background-color: #2a4a5c;
  border-color: #9fb2c1;
}

.custom-select select:focus{
  background-color: #1a2d3d;
  border-color: #9fb2c1;
  box-shadow: 0 0 0 2px rgba(159, 178, 193, 0.2);
}

.select-arrow{
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  color: #9fb2c1;
  font-size: 10px;
  pointer-events: none;
  transition: transform 0.3s ease;
}

.custom-select:hover .select-arrow{
  color: #ffffff;
}

.custom-select select:focus + .select-arrow{
  transform: translateY(-50%) rotate(180deg);
}

/* 下拉选项样式 */
.custom-select select option{
  background-color: #253745;
  color: #ffffff;
  padding: 0.5px;
}

.co-editer{
  box-sizing: border-box;
  float: left;
  padding: 0 0 0 10px;
  border-left: 1px solid #2a4a5c;
  height: 90px;
  font-size: 20px;
}

.user{
    height: 130px;
    float: right;
    justify-content: center;
    position: relative;
}
.user-name{
  height:70px;
  line-height:70px;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.user-name:hover{
  color: #ccc;
}

nav img{
  margin-left: 20px;
  height: 70px;
  width: 70px;
  border-radius: 50%;
  vertical-align: top;
  object-fit: cover;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

nav img:hover{
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.user:hover .user-detail{
  display: block;
  z-index: 999;
}

.user-detail{
  z-index: 999;
  display: none;
  position: absolute;
  top: 130px;
  right: 20px;
  float: right;
  background-color: #fff;
  height: 110px;
  width: 180px;
  padding: 10px 0 10px 25px;
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  font-size: 20px;
  border: 1px solid #f0f0f0;
  backdrop-filter: blur(8px);
}

.user-detail ul{
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-detail li{
  margin-bottom: 5px;
  transition: all 0.3s ease;
}

.user-detail li:hover{
  transform: translateX(8px);
}

.user-detail a{
  display: block;
  color: #333;
  text-decoration: none;
  padding: 8px 0;
  transition: color 0.3s ease;
}

.user-detail a:hover{
  color: #64748b;
}

.piano{
    z-index: 0;
    flex: 1;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    transition: 0.4s all;
}

.canvas-piano{
  z-index: 0;
  min-width: 0;
  min-height: 0;
  max-width: 100%;
  height: auto;
  overflow: hidden;
}

/* 导入作品弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: #1e3a4c;
  border-radius: 12px;
  padding: 24px;
  min-width: 350px;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #2a4a5c;
}

.modal-header h3 {
  color: #CCD0CF;
  font-size: 18px;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #CCD0CF;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background-color: #2a4a5c;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: #253745;
  border: 1px solid #2a4a5c;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.modal-option-btn:hover {
  background-color: #2a4a5c;
  border-color: #3a5a6c;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 24px;
}

.btn-text {
  color: #CCD0CF;
  font-size: 14px;
  font-weight: 500;
}

/* 历史作品弹窗样式 */
.history-modal {
  max-width: 600px;
}

.loading-text,
.error-text,
.empty-text {
  text-align: center;
  padding: 40px 20px;
  color: #CCD0CF;
  font-size: 14px;
}

.error-text {
  color: #ff6b6b;
}

.project-list {
  padding: 0 5px 0 5px;
  max-height: 450px;
  overflow-y: auto;
  display: flex;
  flex-direction:column;
  gap: 12px;
}

.project-item {
  z-index: 999;
  background-color: #253745;
  border: 1px solid #2a4a5c;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.project-item:hover {
  background-color: #2a4a5c;
  border-color: #3a5a6c;
  transform: translateX(4px);
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-title {
  color: #CCD0CF;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.project-details {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-label {
  color: #8b9bb4;
  font-size: 12px;
}

.detail-value {
  color: #CCD0CF;
  font-size: 12px;
  font-weight: 500;
}

/* 邀请协作弹窗样式 */
.invite-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.invite-label {
  color: #CCD0CF;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.invite-code-display {
  background-color: #1a2a3a;
  border: 2px solid #2a4a5c;
  border-radius: 8px;
  padding: 20px 40px;
  font-size: 28px;
  font-weight: 600;
  color: #4a9eff;
  letter-spacing: 4px;
  font-family: 'Courier New', monospace;
  text-align: center;
  min-width: 280px;
}

.invite-tip {
  color: #8b9bb4;
  font-size: 12px;
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.modal-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 24px;
  background-color: #2a4a5c;
  border: none;
  border-radius: 8px;
  color: #CCD0CF;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-action-btn:hover {
  background-color: #3a5a6c;
  transform: translateY(-2px);
}

.modal-action-btn .btn-icon {
  font-size: 20px;
}

.modal-action-btn .btn-text {
  color: #CCD0CF;
  font-size: 14px;
  font-weight: 500;
}

/* 加入协作弹窗样式 */
.join-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.join-label {
  color: #CCD0CF;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.join-input {
  width: 100%;
  max-width: 300px;
  padding: 12px 16px;
  background-color: #1a2a3a;
  border: 2px solid #2a4a5c;
  border-radius: 8px;
  color: #CCD0CF;
  font-size: 16px;
  font-family: 'Courier New', monospace;
  letter-spacing: 4px;
  text-align: center;
  outline: none;
  transition: all 0.2s;
}

.join-input:focus {
  border-color: #4a9eff;
  box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
}

.join-input::placeholder {
  color: #8b9bb4;
  letter-spacing: normal;
}

.join-tip {
  color: #8b9bb4;
  font-size: 12px;
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

/* 项目信息确认弹窗样式 */
.project-confirm-modal {
  max-width: 450px;
}

.project-confirm-info {
  background-color: #1a2a3a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.confirm-item {
  display: flex;
  margin-bottom: 12px;
}

.confirm-item:last-child {
  margin-bottom: 0;
}

.confirm-label {
  color: #8b9bb4;
  font-size: 14px;
  min-width: 80px;
  flex-shrink: 0;
}

.confirm-value {
  color: #CCD0CF;
  font-size: 14px;
  flex: 1;
  word-break: break-word;
}

.confirm-question {
  color: #CCD0CF;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  margin: 20px 0;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-actions .modal-action-btn {
  flex: 1;
  max-width: 150px;
}

.confirm-actions .modal-action-btn.secondary {
  background-color: #253745;
}

.confirm-actions .modal-action-btn.secondary:hover {
  background-color: #2a4a5c;
}

.confirm-actions .modal-action-btn.primary {
  background-color: #4a9eff;
}

.confirm-actions .modal-action-btn.primary:hover {
  background-color: #3a8eef;
}

/* 导入MIDI文件弹窗样式 */
.midi-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.upload-zone {
  width: 100%;
  max-width: 400px;
  min-height: 200px;
  border: 2px dashed #2a4a5c;
  border-radius: 8px;
  background-color: #1a2a3a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-zone:hover,
.upload-zone.drag-over {
  border-color: #4a9eff;
  background-color: rgba(74, 158, 255, 0.05);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.upload-text {
  color: #CCD0CF;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.upload-hint {
  color: #8b9bb4;
  font-size: 12px;
  margin: 0;
}

.file-info {
  width: 100%;
  max-width: 400px;
  background-color: #1a2a3a;
  border: 1px solid #2a4a5c;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  color: #CCD0CF;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  word-break: break-all;
}

.file-size {
  color: #8b9bb4;
  font-size: 12px;
  margin: 0;
}

.modal-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-action-btn:disabled:hover {
  background-color: #2a4a5c;
  transform: none;
}
</style>
