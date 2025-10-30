const video = document.getElementById('webcam')
const canvas = document.getElementById('output')
const statusDiv = document.getElementById('status')
const container = document.getElementById('container')
const startButton = document.getElementById('startButton')
const ctx = canvas.getContext('2d')

let detector
let videoWidth, videoHeight
let isRunning = false
let lastFrameTime = 0
const TARGET_FPS = 3 // 目标帧率
const FRAME_INTERVAL = 1000 / TARGET_FPS // 帧间隔时间

let postureStatus = '等待启动...'
let incorrectFrames = 0
let correctFrames = 0
let previousPostureStatus = postureStatus
const INCORRECT_THRESHOLD = 10

function isShoulderLevel(leftShoulder, rightShoulder, thresholdRatio = 0.05) {
  const threshold = videoHeight * thresholdRatio
  return Math.abs(leftShoulder.y - rightShoulder.y) < threshold
}

function isHeadStraight(nose, leftShoulder, rightShoulder, thresholdRatio = 0.08) {
  const shoulderMidPointX = (leftShoulder.x + rightShoulder.x) / 2
  const threshold = videoWidth * thresholdRatio
  return Math.abs(nose.x - shoulderMidPointX) < threshold
}

function isHeadUp(nose, leftShoulder, rightShoulder, thresholdRatio = 0.2) {
  const shoulderMidPointY = (leftShoulder.y + rightShoulder.y) / 2
  const verticalDistance = shoulderMidPointY - nose.y

  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x)

  const threshold = shoulderWidth * thresholdRatio

  return verticalDistance > threshold
}

function isHeadAlignedVertically(
  leftEar,
  rightEar,
  leftShoulder,
  rightShoulder,
  thresholdRatio = 0.12,
) {
  const earMidPointX = (leftEar.x + rightEar.x) / 2

  const shoulderMidPointX = (leftShoulder.x + rightShoulder.x) / 2

  const threshold = videoWidth * thresholdRatio

  return Math.abs(earMidPointX - shoulderMidPointX) < threshold
}

function updateStatus(statusText, statusClass) {
  statusDiv.textContent = statusText
  statusDiv.className = statusClass

  // 发送状态更新到父组件
  try {
    console.log('Sending posture status:', statusText)
    if (window.uni && window.uni.postMessage) {
      window.uni.postMessage({
        data: [
          {
            type: 'postureStatus',
            status: statusText,
          },
        ],
      })
    } else {
      console.warn('window.uni is not available')
    }
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

function speak(text) {
  if ('speechSynthesis' in window) {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 1.2
    window.speechSynthesis.speak(utterance)
  } else {
    console.warn('浏览器不支持语音合成.')
  }
}

async function setupWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: window.innerWidth },
        height: { ideal: window.innerHeight },
        facingMode: 'user',
      },
      audio: false,
    })
    video.srcObject = stream
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        videoWidth = video.videoWidth
        videoHeight = video.videoHeight
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        resolve(video)
      }
    })
    video.play()
    console.log('摄像头已启动')
    updateStatus('加载模型', 'detecting')
    return true
  } catch (err) {
    console.error('无法访问摄像头: ', err)
    updateStatus('无法访问摄像头', 'incorrect')
    return false
  }
}

async function loadPoseDetector() {
  try {
    const model = poseDetection.SupportedModels.MoveNet
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    }
    detector = await poseDetection.createDetector(model, detectorConfig)
    console.log('姿态检测模型已加载')
    updateStatus('检测中', 'detecting')
    return true
  } catch (err) {
    console.error('加载姿态检测模型失败: ', err)
    updateStatus('模型加载失败', 'incorrect')
    return false
  }
}

async function detectPose() {
  if (!detector) return

  const currentTime = performance.now()
  const timeSinceLastFrame = currentTime - lastFrameTime

  // 控制帧率
  if (timeSinceLastFrame < FRAME_INTERVAL) {
    requestAnimationFrame(detectPose)
    return
  }

  lastFrameTime = currentTime

  try {
    const poses = await detector.estimatePoses(video, { flipHorizontal: false })

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (poses && poses.length > 0) {
      const keypoints = poses[0].keypoints

      const nose = keypoints.find((k) => k.name === 'nose' && k.score > 0.3)
      const leftShoulder = keypoints.find((k) => k.name === 'left_shoulder' && k.score > 0.3)
      const rightShoulder = keypoints.find((k) => k.name === 'right_shoulder' && k.score > 0.3)
      const leftEar = keypoints.find((k) => k.name === 'left_ear' && k.score > 0.3)
      const rightEar = keypoints.find((k) => k.name === 'right_ear' && k.score > 0.3)

      if (nose && leftShoulder && rightShoulder && leftEar && rightEar) {
        // 计算缩放比例
        const scaleX = canvas.width / videoWidth
        const scaleY = canvas.height / videoHeight

        // 缩放关键点坐标
        const scaledKeypoints = {
          nose: { x: nose.x * scaleX, y: nose.y * scaleY },
          leftShoulder: { x: leftShoulder.x * scaleX, y: leftShoulder.y * scaleY },
          rightShoulder: { x: rightShoulder.x * scaleX, y: rightShoulder.y * scaleY },
          leftEar: { x: leftEar.x * scaleX, y: leftEar.y * scaleY },
          rightEar: { x: rightEar.x * scaleX, y: rightEar.y * scaleY },
        }

        const shouldersLevel = isShoulderLevel(
          scaledKeypoints.leftShoulder,
          scaledKeypoints.rightShoulder,
        )
        const headLevel = isHeadStraight(
          scaledKeypoints.nose,
          scaledKeypoints.leftShoulder,
          scaledKeypoints.rightShoulder,
        )
        const headUp = isHeadUp(
          scaledKeypoints.nose,
          scaledKeypoints.leftShoulder,
          scaledKeypoints.rightShoulder,
        )
        const headAligned = isHeadAlignedVertically(
          scaledKeypoints.leftEar,
          scaledKeypoints.rightEar,
          scaledKeypoints.leftShoulder,
          scaledKeypoints.rightShoulder,
        )

        let currentStatus = ''
        let currentClass = ''

        if (shouldersLevel && headLevel && headUp && headAligned) {
          currentStatus = '坐姿标准'
          currentClass = 'correct'
          correctFrames++
          incorrectFrames = 0
        } else {
          incorrectFrames++
          correctFrames = 0
          if (incorrectFrames > INCORRECT_THRESHOLD) {
            currentStatus = '坐姿不标准'
            currentClass = 'incorrect'
          } else {
            currentStatus = '检测中'
            currentClass = 'detecting'
          }
        }

        // 更新状态显示和发送消息
        updateStatus(currentStatus, currentClass)
        postureStatus = currentStatus

        if (postureStatus !== previousPostureStatus) {
          if (postureStatus === '坐姿标准' || postureStatus === '坐姿不标准') {
            speak(postureStatus)
          }
          previousPostureStatus = postureStatus
        }

        // 绘制关键点和连线
        ctx.fillStyle = 'red'
        Object.values(scaledKeypoints).forEach((kp) => {
          ctx.beginPath()
          ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI)
          ctx.fill()
        })

        ctx.strokeStyle = 'lime'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(scaledKeypoints.leftShoulder.x, scaledKeypoints.leftShoulder.y)
        ctx.lineTo(scaledKeypoints.rightShoulder.x, scaledKeypoints.rightShoulder.y)
        ctx.stroke()

        const shoulderMidPointX =
          (scaledKeypoints.leftShoulder.x + scaledKeypoints.rightShoulder.x) / 2
        const shoulderMidPointY =
          (scaledKeypoints.leftShoulder.y + scaledKeypoints.rightShoulder.y) / 2
        ctx.strokeStyle = 'aqua'
        ctx.beginPath()
        ctx.moveTo(scaledKeypoints.nose.x, scaledKeypoints.nose.y)
        ctx.lineTo(shoulderMidPointX, shoulderMidPointY)
        ctx.stroke()

        ctx.strokeStyle = 'yellow'
        ctx.beginPath()
        ctx.moveTo(scaledKeypoints.leftEar.x, scaledKeypoints.leftEar.y)
        ctx.lineTo(scaledKeypoints.leftShoulder.x, scaledKeypoints.leftShoulder.y)
        ctx.moveTo(scaledKeypoints.rightEar.x, scaledKeypoints.rightEar.y)
        ctx.lineTo(scaledKeypoints.rightShoulder.x, scaledKeypoints.rightShoulder.y)
        ctx.stroke()
      } else {
        postureStatus = '未完整检测到面部或肩部'
        updateStatus(postureStatus, 'detecting')

        if (previousPostureStatus === '坐姿标准' || previousPostureStatus === '坐姿不标准') {
          previousPostureStatus = postureStatus
        }
      }
    } else {
      postureStatus = '未检测到人体'
      updateStatus(postureStatus, 'detecting')

      if (previousPostureStatus === '坐姿标准' || previousPostureStatus === '坐姿不标准') {
        previousPostureStatus = postureStatus
      }
    }
  } catch (error) {
    console.error('检测出错:', error)
    updateStatus('检测出错', 'incorrect')
  }

  requestAnimationFrame(detectPose)
}

async function startDetection() {
  if (isRunning) return

  startButton.disabled = true
  container.style.display = 'block'

  const webcamReady = await setupWebcam()
  if (!webcamReady) {
    startButton.disabled = false
    return
  }

  const detectorReady = await loadPoseDetector()
  if (!detectorReady) {
    startButton.disabled = false
    return
  }

  isRunning = true
  detectPose()
}

function stopDetection() {
  isRunning = false
  if (video.srcObject) {
    const tracks = video.srcObject.getTracks()
    tracks.forEach((track) => track.stop())
  }
  video.srcObject = null
  container.style.display = 'none'
  startButton.disabled = false
  updateStatus('等待启动...', 'detecting')
}

// 监听来自 uni-app 的消息
window.addEventListener('message', function (event) {
  const data = event.data
  if (data.type === 'start') {
    startDetection()
  } else if (data.type === 'stop') {
    stopDetection()
  }
})

// 监听启动按钮点击
startButton.addEventListener('click', startDetection)

// 初始化
async function main() {
  updateStatus('等待启动...', 'detecting')
  // 延迟100ms后自动触发按钮点击
  setTimeout(() => {
    startButton.click()
  }, 100)
}

main()
