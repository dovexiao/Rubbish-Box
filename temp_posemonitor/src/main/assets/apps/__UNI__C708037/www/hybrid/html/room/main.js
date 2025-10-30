// 修改socket初始化
const socket = io('https://192.168.31.178:3000', {
  transports: ['websocket', 'polling'],
  secure: true,
  rejectUnauthorized: false
});

// 全局变量
let localStream = null;
let peers = {};
let slots = Array(6).fill(null); // 只保留6个视频位置
let roomInput, joinBtn, leaveBtn, roomListSection, videoGrid;
let inRoom = false;
let peerStreams = new Map(); // 用于跟踪每个peer的流，避免重复

// 隐藏加载遮罩
function hideLoading() {
  const loadingMask = document.getElementById('loading-mask');
  if (loadingMask) {
    loadingMask.style.display = 'none';
  }
}

// 渲染视频槽
function renderSlots() {
  console.log("渲染视频槽，当前slots:", slots.map(s => s ? s.id : null));
  
  const videoGrid = document.getElementById('video-grid');
  if (!videoGrid) return;
  
  // 清空现有视频槽内容，但保留槽本身
  document.querySelectorAll('.video-slot').forEach(slot => {
    // 保留槽，清空内容
    while (slot.firstChild) {
      slot.removeChild(slot.firstChild);
    }
    
    // 添加占位符
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    placeholder.textContent = '无视频';
    slot.appendChild(placeholder);
  });
  
  // 填充视频
  slots.forEach((slotData, index) => {
    if (!slotData) return;
    
    const slotElement = document.getElementById(`slot-${index}`);
    if (!slotElement) return;
    
    // 清空槽
    while (slotElement.firstChild) {
      slotElement.removeChild(slotElement.firstChild);
    }
    
    // 添加视频元素
    const videoElement = document.createElement('video');
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    
    // 如果是本地视频，设置静音
    if (slotData.isLocal) {
      videoElement.muted = true;
      slotElement.classList.add('local');
    } else {
      slotElement.classList.remove('local');
    }
    
    // 设置视频源
    videoElement.srcObject = slotData.stream;
    
    // 添加用户标签
    const userLabel = document.createElement('div');
    userLabel.className = 'user-label';
    userLabel.textContent = slotData.isLocal ? '我' : `用户 ${slotData.id.substring(0, 5)}`;
    
    // 添加控制按钮
    const controlButtons = document.createElement('div');
    controlButtons.className = 'control-buttons';
    
    // 麦克风控制
    const micButton = document.createElement('button');
    micButton.className = `control-button ${slotData.micMuted ? 'muted' : ''}`;
    micButton.textContent = slotData.micMuted ? '🔇' : '🎤';
    micButton.title = slotData.micMuted ? '取消静音' : '静音';
    
    // 扬声器控制
    const speakerButton = document.createElement('button');
    speakerButton.className = `control-button ${slotData.speakerMuted ? 'muted' : ''}`;
    speakerButton.textContent = slotData.speakerMuted ? '🔈' : '🔊';
    speakerButton.title = slotData.speakerMuted ? '取消静音' : '静音';
    
    // 绑定麦克风控制事件
    micButton.onclick = (e) => {
      e.stopPropagation();
      if (slotData.isLocal) {
        // 本地麦克风控制
        const audioTracks = slotData.stream.getAudioTracks();
        audioTracks.forEach(track => {
          track.enabled = slotData.micMuted;
        });
        slotData.micMuted = !slotData.micMuted;
        micButton.textContent = slotData.micMuted ? '🔇' : '🎤';
        micButton.title = slotData.micMuted ? '取消静音' : '静音';
        micButton.className = `control-button ${slotData.micMuted ? 'muted' : ''}`;
      }
    };
    
    // 绑定扬声器控制事件
    speakerButton.onclick = (e) => {
      e.stopPropagation();
      if (!slotData.isLocal) {
        // 远程音频控制
        videoElement.muted = !slotData.speakerMuted;
        slotData.speakerMuted = !slotData.speakerMuted;
        speakerButton.textContent = slotData.speakerMuted ? '🔈' : '🔊';
        speakerButton.title = slotData.speakerMuted ? '取消静音' : '静音';
        speakerButton.className = `control-button ${slotData.speakerMuted ? 'muted' : ''}`;
      }
    };
    
    // 添加按钮到控制区
    controlButtons.appendChild(micButton);
    if (!slotData.isLocal) {
      controlButtons.appendChild(speakerButton);
    }
    
    // 添加所有元素到槽
    slotElement.appendChild(videoElement);
    slotElement.appendChild(userLabel);
    slotElement.appendChild(controlButtons);
  });
  
  // 显示视频网格
  videoGrid.style.display = 'grid';
}

// 查找空闲槽
function findEmptySlot() {
  for (let i = 0; i < slots.length; i++) {
    if (!slots[i]) return i;
  }
  return -1;
}

// 查找指定ID的槽位
function findSlotById(userId) {
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] && slots[i].id === userId) {
      return i;
    }
  }
  return -1;
}

// 移除用户视频
function removeUserVideo(userId) {
  console.log(`移除用户视频: ${userId}`);
  
  // 从peerStreams中移除
  if (peerStreams.has(userId)) {
    peerStreams.delete(userId);
  }
  
  // 从slots中移除
  const idx = findSlotById(userId);
  if (idx !== -1) {
    slots[idx] = null;
    renderSlots();
  }
}

// 获取本地媒体流
async function getLocalStream() {
  try {
    // 移动端优先使用前置摄像头
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: {
        facingMode: "user", // 前置摄像头
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 15 }
      }
    });
    return localStream;
  } catch (err) {
    console.error('获取媒体流失败:', err);
    if (err.name === 'NotAllowedError') {
      alert('请允许访问摄像头和麦克风');
    } else if (err.name === 'NotFoundError') {
      alert('未找到摄像头或麦克风设备');
    } else {
      alert('获取媒体设备失败: ' + err.message);
    }
    throw err;
  }
}

// 加入本地视频到第一个空位
async function getLocalStreamAndSlot() {
  try {
    localStream = await getLocalStream();
    const idx = findEmptySlot();
    if (idx === -1) {
      throw new Error('没有可用的视频格子');
    }
    
    slots[idx] = {
      id: 'local',
      stream: localStream,
      isLocal: true,
      micMuted: false,
      speakerMuted: false
    };
    
    renderSlots();
    return true;
  } catch (err) {
    console.error('设置本地视频失败:', err);
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    throw err;
  }
}

// 创建WebRTC连接
function createPeerConnection(peerId, isInitiator = false) {
  console.log(`创建PeerConnection: ${peerId}, isInitiator: ${isInitiator}`);
  
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  });
  
  // 添加本地流
  if (localStream) {
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });
  }
  
  // 处理远程流
  pc.ontrack = (event) => {
    const stream = event.streams[0];
    
    // 检查是否已经有这个流
    if (peerStreams.has(peerId)) {
      console.log(`已存在的流，跳过: ${peerId}`);
      return;
    }
    
    console.log(`收到远程流: ${peerId}`);
    peerStreams.set(peerId, stream);
    
    // 检查是否已经有这个用户的槽位
    let idx = findSlotById(peerId);
    if (idx === -1) {
      idx = findEmptySlot();
    }
    
    if (idx !== -1) {
      slots[idx] = { 
        id: peerId, 
        stream, 
        isLocal: false, 
        micMuted: false, 
        speakerMuted: false 
      };
      renderSlots();
    } else {
      console.warn('没有可用的视频槽位');
    }
  };
  
  // 处理ICE候选
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('signal', {
        to: peerId,
        data: { candidate: event.candidate }
      });
    }
  };
  
  // 连接状态变化
  pc.oniceconnectionstatechange = () => {
    console.log(`ICE连接状态变化: ${pc.iceConnectionState}, peer: ${peerId}`);
    if (pc.iceConnectionState === 'disconnected' || 
        pc.iceConnectionState === 'failed' || 
        pc.iceConnectionState === 'closed') {
      removeUserVideo(peerId);
    }
  };
  
  // 如果是发起方，创建offer
  if (isInitiator) {
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .then(() => {
        socket.emit('signal', {
          to: peerId,
          data: { offer: pc.localDescription }
        });
      })
      .catch(err => console.error('创建offer失败:', err));
  }
  
  return pc;
}

// 处理信令消息
async function handleSignal(from, data) {
  console.log(`收到信令消息，来自: ${from}`, data);
  
  let pc = peers[from];
  if (!pc) {
    pc = createPeerConnection(from, false);
    peers[from] = pc;
  }
  
  try {
    if (data.offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('signal', { to: from, data: { answer: pc.localDescription } });
    } else if (data.answer) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  } catch (err) {
    console.error('信令处理错误:', err);
  }
}

// 渲染房间列表
async function renderRoomList(roomIds) {
  const roomListSection = document.getElementById('room-list-section');
  if (!roomListSection) return;

  roomListSection.innerHTML = '';

  // 渲染新版房间卡片
  if (roomIds && roomIds.length > 0) {
    roomIds.forEach((roomId, idx) => {
      const card = document.createElement('div');
      card.className = 'room-card';
      card.innerHTML = `
        <div class="room-card-header">自习室${String(idx+1).padStart(2, '0')}</div>
        <div class="room-card-online">● 11个人在线</div>
        <div class="room-card-avatars">
          <span class="room-card-avatar"></span>
          <span class="room-card-avatar"></span>
          <span class="room-card-avatar"></span>
          <span class="room-card-avatar"></span>
          <span class="room-card-avatar"></span>
        </div>
        <button class="room-card-btn">进入&nbsp;→</button>
      `;
      card.querySelector('.room-card-btn').onclick = () => joinRoom(roomId);
      roomListSection.appendChild(card);
    });
  }
}

// 加入房间函数
async function joinRoom(roomId) {
  if (!roomId) {
    roomId = roomInput?.value.trim();
  }
  
  if (!roomId) {
    alert('请输入房间号');
    return;
  }
  
  try {
    console.log('准备加入房间:', roomId);
    
    // 先检查是否支持所需API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('您的浏览器不支持音视频功能');
    }
    
    // 清空现有状态
    resetRoomState();
    
    // 获取本地流
    await getLocalStreamAndSlot();
    socket.emit('join', roomId);
    
    if (joinBtn) joinBtn.disabled = true;
    if (roomInput) roomInput.disabled = true;
    hideRoomList();
    if (leaveBtn) leaveBtn.style.display = '';
    
    setRoomInUrl(roomId);
    inRoom = true;
  } catch (err) {
    console.error('加入房间失败:', err);
    alert('加入房间失败: ' + err.message);
    
    // 清理资源
    resetRoomState();
    
    // 重置UI状态
    if (joinBtn) joinBtn.disabled = false;
    if (roomInput) roomInput.disabled = false;
  }
}

// 重置房间状态
function resetRoomState() {
  // 关闭所有对等连接
  Object.values(peers).forEach(pc => pc.close());
  peers = {};
  
  // 停止本地流
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  
  // 清空流跟踪
  peerStreams.clear();
  
  // 重置视频槽
  slots = Array(6).fill(null);
  renderSlots();
}

// 离开房间函数
function leaveRoom() {
  socket.emit('leave');
  
  // 清理资源
  resetRoomState();
  
  // 重置UI状态
  if (joinBtn) joinBtn.disabled = false;
  if (roomInput) {
    roomInput.disabled = false;
    roomInput.value = '';
  }
  if (leaveBtn) leaveBtn.style.display = 'none';
  
  // 显示房间列表
  showRoomList();
  
  // 清除URL中的房间ID
  clearRoomInUrl();
  inRoom = false;
}

// 显示房间列表
function showRoomList() {
  if (roomListSection) {
    roomListSection.style.display = 'grid';
  }
  if (videoGrid) {
    videoGrid.style.display = 'none';
  }
  if (document.getElementById('global-controls')) {
    document.getElementById('global-controls').style.display = 'none';
  }
  // 开始定期刷新房间列表
  startFetchingRooms();
}

// 隐藏房间列表
function hideRoomList() {
  if (roomListSection) {
    roomListSection.style.display = 'none';
  }
  if (videoGrid) {
    videoGrid.style.display = 'grid';
  }
  if (document.getElementById('global-controls')) {
    document.getElementById('global-controls').style.display = 'flex';
  }
  // 停止定期刷新房间列表
  stopFetchingRooms();
}

let fetchRoomsInterval;

// 开始定期获取房间列表
function startFetchingRooms() {
  // 立即获取一次
  fetchRooms();
  // 每5秒更新一次
  fetchRoomsInterval = setInterval(fetchRooms, 5000);
}

// 停止获取房间列表
function stopFetchingRooms() {
  if (fetchRoomsInterval) {
    clearInterval(fetchRoomsInterval);
    fetchRoomsInterval = null;
  }
}

// 获取房间列表
async function fetchRooms() {
  if (inRoom) return; // 如果已在房间内，不获取列表
  
  try {
    const response = await fetch('/api/rooms');
    const rooms = await response.json();
    renderRoomList(rooms);
  } catch (err) {
    console.error('获取房间列表失败:', err);
  }
}

// 设置URL中的房间ID
function setRoomInUrl(roomId) {
  const url = new URL(window.location.href);
  url.searchParams.set('room', roomId);
  window.history.replaceState({}, '', url);
}

// 清除URL中的房间ID
function clearRoomInUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('room');
  window.history.replaceState({}, '', url);
}

// 初始化页面
function initializePage() {
  hideLoading();
  
  // 获取DOM元素
  roomInput = document.getElementById('room-input');
  joinBtn = document.getElementById('join-btn');
  leaveBtn = document.getElementById('leave-btn');
  roomListSection = document.getElementById('room-list-section');
  videoGrid = document.getElementById('video-grid');
  
  // 绑定按钮事件
  if (joinBtn) {
    joinBtn.onclick = () => {
      const roomId = roomInput?.value.trim() || (Math.floor(Math.random() * 9000) + 1000).toString();
      joinRoom(roomId);
    };
  }
  
  if (leaveBtn) {
    leaveBtn.onclick = () => leaveRoom();
  }
  
  // 初始化全局控制按钮
  const globalControls = document.getElementById('global-controls');
  if (globalControls) {
    // 一键闭麦
    document.getElementById('mute-all-mic')?.addEventListener('click', () => {
      if (localStream) {
        localStream.getAudioTracks().forEach(track => track.enabled = false);
        for (let i = 0; i < slots.length; i++) {
          if (slots[i] && slots[i].isLocal) {
            slots[i].micMuted = true;
          }
        }
        renderSlots();
      }
    });
    
    // 一键开麦
    document.getElementById('unmute-all-mic')?.addEventListener('click', () => {
      if (localStream) {
        localStream.getAudioTracks().forEach(track => track.enabled = true);
        for (let i = 0; i < slots.length; i++) {
          if (slots[i] && slots[i].isLocal) {
            slots[i].micMuted = false;
          }
        }
        renderSlots();
      }
    });
    
    // 一键关闭所有人声音
    document.getElementById('mute-all-speaker')?.addEventListener('click', () => {
      for (let i = 0; i < slots.length; i++) {
        if (slots[i] && !slots[i].isLocal) {
          slots[i].speakerMuted = true;
        }
      }
      renderSlots();
    });
    
    // 一键开启所有人声音
    document.getElementById('unmute-all-speaker')?.addEventListener('click', () => {
      for (let i = 0; i < slots.length; i++) {
        if (slots[i] && !slots[i].isLocal) {
          slots[i].speakerMuted = false;
        }
      }
      renderSlots();
    });
    
    // 默认隐藏全局控制按钮
    globalControls.style.display = 'none';
  }
  
  // 从URL中获取房间ID
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room');
  
  if (roomId) {
    // 如果URL中有房间ID，直接加入该房间
    if (roomInput) roomInput.value = roomId;
    joinRoom(roomId);
  } else {
    // 否则显示房间列表
    showRoomList();
  }
}

// Socket.IO 事件处理
socket.on('connect', () => {
  console.log('Socket连接成功');
});

socket.on('connect_error', (error) => {
  console.error('Socket连接错误:', error);
});

socket.on('users', (users) => {
  console.log('收到房间用户列表:', users);
  users.forEach(userId => {
    if (!peers[userId]) {
      const pc = createPeerConnection(userId, true);
      peers[userId] = pc;
    }
  });
});

socket.on('user-joined', (userId) => {
  console.log('用户加入:', userId);
  if (!peers[userId]) {
    const pc = createPeerConnection(userId, false);
    peers[userId] = pc;
  }
});

socket.on('user-left', (userId) => {
  console.log('用户离开:', userId);
  if (peers[userId]) {
    peers[userId].close();
    delete peers[userId];
  }
  removeUserVideo(userId);
});

socket.on('signal', ({ from, data }) => {
  handleSignal(from, data);
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage); 