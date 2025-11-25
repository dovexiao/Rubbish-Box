import {
  Image,
  ImageBackground,
  Modal,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Platform,
} from "react-native"
import { useState, useRef, useEffect } from "react"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons"
import { Audio } from "expo-av"
import * as ScreenOrientation from "expo-screen-orientation"
// import * as Speech from 'expo-speech' // 已替换为 Edge TTS

import { StatusBar } from "../../../components/StatusBar"
import { NavBar } from "../../../components/NavBar"
import { createStyles, rpx } from "../../../utils/rpxStyleSheet"
import { Images } from "../../../constants/Assets"
import { edgeTTS } from "../../../services/edgeTTS"

// 消息类型
interface Message {
  id: string
  text: string
  textZh?: string
  sender: "ai" | "user"
  audioUrl?: string
  timestamp: number
}

// 任务类型
interface Task {
  id: string
  title: string
  completed: boolean
  desc: string
  descEn: string
}

/**
 * AI练口语 - 练习页面
 */
export default function AiSpeakingPracticeScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const flatListRef = useRef<FlatList>(null)

  // 状态管理
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)
  const [endModalVisible, setEndModalVisible] = useState(false)
  const [reportVisible, setReportVisible] = useState(false)
  
  // 录音相关
  const [recording, setRecording] = useState<Audio.Recording>()
  const [permissionResponse, requestPermission] = Audio.usePermissions()
  const [sound, setSound] = useState<Audio.Sound>()
  
  // 模拟任务列表
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "介绍自己的家乡", desc: "介绍自己的家乡", descEn: "I live in...", completed: false },
    { id: "2", title: "介绍自己的姓名", desc: "介绍自己的姓名", descEn: "My name is...", completed: false },
    { id: "3", title: "介绍自己的年龄", desc: "介绍自己的年龄", descEn: "I'm...years old", completed: false },
  ])

  // TTS 是否可用
  const [ttsAvailable, setTtsAvailable] = useState(true)

  // 检查 TTS 支持（使用 Edge TTS）
  const checkTTSSupport = async () => {
    console.log('📢 TTS 已启用（使用 Edge TTS - 微软神经网络语音）')
    setTtsAvailable(true)
    return true
  }

  // 初始化对话
  useEffect(() => {
    // 锁定横屏
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
    
    // 检查 TTS 支持
    checkTTSSupport()
    
    const initialMessage: Message = {
      id: "init-1",
      text: "Hello! How are you today? I'm Xiao He, your English practice partner. What's your name?",
      textZh: "你好！你今天好吗？我是小褐同学你的英语练习伙伴。你叫什么名字？",
      sender: "ai",
      timestamp: Date.now(),
    }
    setMessages([initialMessage])
    
    // 延迟播放欢迎语，等待 TTS 检查完成
    setTimeout(() => {
      if (ttsAvailable) {
        speakText(initialMessage.text, 'en-US')
      }
    }, 1000)

    return () => {
      // 清理音频资源
      if (sound) {
        sound.unloadAsync()
      }
      // 清理 TTS 缓存
      edgeTTS.clearCache()
    }
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  // 开始录音
  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync( 
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsListening(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert("错误", "无法启动录音，请检查权限设置。");
    }
  }

  // 停止录音
  async function stopRecording() {
    console.log('Stopping recording..');
    setIsListening(false);
    setRecording(undefined);
    
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    
    if (uri) {
      processUserAudio(uri);
    }
  }

  // 处理用户录音
  const processUserAudio = (uri: string) => {
    // 根据当前对话状态模拟回复
    const userMsgCount = messages.filter(m => m.sender === "user").length
    let newUserText = ""
    let newAiText = ""
    let newAiTextZh = ""

    if (userMsgCount === 0) {
      newUserText = "My name is Alice"
      newAiText = "Wow, nice to meet you, Alice! How old are you?"
      newAiTextZh = "哇，很高兴见到你，爱丽丝！你多大了？"
      
      // 更新任务状态
      setTasks(prev => prev.map(t => t.id === "2" ? { ...t, completed: true } : t))
    } else if (userMsgCount === 1) {
      newUserText = "I am ten years old"
      newAiText = "That's great! Where do you live?"
      newAiTextZh = "太棒了！你住在哪里？"
      
      // 更新任务状态
      setTasks(prev => prev.map(t => t.id === "3" ? { ...t, completed: true } : t))
    } else {
      newUserText = "I live in Beijing."
      newAiText = "Beijing is a beautiful city! I love it too."
      newAiTextZh = "北京是一个美丽的城市！我也很喜欢。"
      
      // 更新任务状态
      setTasks(prev => prev.map(t => t.id === "1" ? { ...t, completed: true } : t))
    }

    const newUserMsg: Message = {
      id: `user-${Date.now()}`,
      text: newUserText,
      sender: "user",
      audioUrl: uri, // 使用真实录音地址
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, newUserMsg])

    // AI 回复延迟
    setTimeout(() => {
      const newAiMsg: Message = {
        id: `ai-${Date.now()}`,
        text: newAiText,
        textZh: newAiTextZh,
        sender: "ai",
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, newAiMsg])
      
      // 自动播放 AI 语音
      setTimeout(() => {
        speakText(newAiText, 'en-US')
      }, 300)
    }, 1000)
  }

  // 播放音频（录音）
  async function playAudio(uri: string) {
    try {
      console.log('Loading Sound', uri);
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: uri },
        { shouldPlay: true }
      );
      setSound(newSound);
      console.log('Playing Sound');
      await newSound.playAsync();
    } catch (error) {
      console.error("Failed to play sound", error);
      // Alert.alert("提示", "无法播放音频");
    }
  }

  // 使用在线 TTS 播放英文文本
  async function speakText(text: string, language: string = 'en-US') {
    // 如果 TTS 不可用，直接返回
    if (!ttsAvailable) {
      console.log('⚠️ TTS 不可用，跳过播放')
      return
    }

    try {
      // 停止当前播放
      if (sound) {
        await sound.stopAsync()
        await sound.unloadAsync()
        setSound(undefined)
      }

      console.log('🔊 TTS 播放:', text.substring(0, 50) + (text.length > 50 ? '...' : ''))

      // 使用百度翻译 TTS（免费，国内最稳定，无需 API Key）
      // lan=en: 英语
      // spd=5: 语速（0-9，5为正常）
      // pit=5: 音调（0-9，5为正常）
      // vol=5: 音量（0-15，5为正常）
      // per=4: 发音人（0=女声，1=男声，3=情感男声，4=情感女声）
      const baiduTtsUrl = `https://fanyi.baidu.com/gettts?lan=en&text=${encodeURIComponent(text)}&spd=4&source=web`

      console.log('📡 使用百度 TTS 服务...')
      
      // 直接播放在线音频 URL
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: baiduTtsUrl },
        { shouldPlay: true, volume: 1.0 }
      )
      
      setSound(newSound)
      
      // 监听播放完成
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('  ✓ TTS 播放完成')
          newSound.unloadAsync()
          setSound(undefined)
        } else if (status.isLoaded === false && (status as any).error) {
          console.error('  ❌ 播放错误:', (status as any).error)
        }
      })

      console.log('  ✓ TTS 开始播放')
    } catch (error) {
      console.error("❌ TTS 播放失败:", error)
      Alert.alert('语音播放失败', '在线 TTS 服务暂时不可用')
    }
  }

  // 处理点击说话
  const handleSpeakPress = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  // 处理返回/结束对话
  const handleBack = () => {
    if (isListening) {
        stopRecording();
    }
    setEndModalVisible(true)
  }

  // 确认结束对话 -> 显示报告
  const confirmEnd = () => {
    setEndModalVisible(false)
    setReportVisible(true)
  }

  // 退出练习
  const exitPractice = () => {
    setReportVisible(false)
    router.back()
  }

  // 再练一个
  const restartPractice = () => {
    setReportVisible(false)
    setMessages([])
    // 重置任务等...
    router.replace({
      pathname: "/ai/speaking/practice",
      params: { ...params, reload: Date.now() }
    })
  }

  // 渲染消息项
  const renderMessage = ({ item }: { item: Message }) => {
    const isAi = item.sender === "ai"
    return (
      <View style={[styles.messageRow, isAi ? styles.messageRowAi : styles.messageRowUser]}>
        {isAi && (
           <View style={styles.aiAvatarSmallContainer}>
             <Image source={Images.aiSpeaking3} style={styles.aiAvatarSmall} />
           </View>
        )}
        
        <View style={[styles.messageBubble, isAi ? styles.messageBubbleAi : styles.messageBubbleUser]}>
          <Text style={[styles.messageText, isAi ? styles.messageTextAi : styles.messageTextUser]}>
            {item.text}
          </Text>
          {isAi && showTranslation && item.textZh && (
            <Text style={styles.translationText}>{item.textZh}</Text>
          )}
        </View>

        {/* 只有AI消息有操作栏 */}
        {isAi && (
          <View style={styles.messageActions}>
            <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => {
                    // 使用 TTS 播放 AI 的英文文本
                    speakText(item.text, 'en-US')
                }}
            >
               <Ionicons name="volume-medium" size={18} color="#5482FF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowTranslation(!showTranslation)}>
               <MaterialIcons name="translate" size={18} color="#5482FF" />
            </TouchableOpacity>
          </View>
        )}

        {!isAi && (
             <TouchableOpacity onPress={() => item.audioUrl && playAudio(item.audioUrl)}>
                 <Image source={Images.userAvatar} style={styles.userAvatar} />
                 {item.audioUrl && (
                     <View style={styles.playIconOverlay}>
                         <Ionicons name="play" size={12} color="#FFF" />
                     </View>
                 )}
             </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <LinearGradient
      colors={["#CDF7FF", "#E5F5FF", "#FDFEFF", "#E5F5FF"]}
      style={styles.container}
    >
      <StatusBar theme="dark" />
      <NavBar 
        title="AI练口语" 
        onBackPress={handleBack}
      />

      <View style={styles.contentContainer}>
        {/* 左侧：人物形象 */}
        <View style={styles.leftSide}>
             <Image source={Images.aiSpeaking3} style={styles.characterImage} resizeMode="contain" />
             <View style={styles.characterNameContainer}>
               <Text style={styles.characterName}>Xiao he</Text>
               <View style={styles.tagsContainer}>
                 <View style={styles.tag}><Text style={styles.tagText}>美</Text></View>
                 <View style={styles.tag}><Text style={styles.tagText}>英</Text></View>
               </View>
             </View>
        </View>

        {/* 右侧：交互区域 */}
        <View style={styles.rightSide}>
          {/* 任务卡片 */}
          <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Image source={Images.studyBg21} style={styles.taskIcon} />
              <Text style={styles.taskTitle}>对话小任务</Text>
              <Text style={styles.taskSubtitle}>可以跟小褐分享一下这些信息呀~</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.taskList}>
              {tasks.map((task) => (
                <View key={task.id} style={[styles.taskItem, task.completed && styles.taskItemCompleted]}>
                  <View style={styles.taskDot} />
                  <Text style={styles.taskItemTitle}>{task.title}</Text>
                  <Text style={styles.taskItemDesc}>{task.descEn}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 聊天记录 */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.chatList}
            contentContainerStyle={styles.chatListContent}
            showsVerticalScrollIndicator={false}
          />

          {/* 底部控制栏 */}
          <View style={styles.bottomControls}>
             <TouchableOpacity style={styles.controlButtonSmall}>
               <Ionicons name="bulb-outline" size={24} color="#5482FF" />
               <Text style={styles.controlTextSmall}>提示</Text>
             </TouchableOpacity>

             <TouchableOpacity 
               style={[styles.speakButton, isListening && styles.speakButtonActive]}
               activeOpacity={0.8}
               onPress={handleSpeakPress}
             >
               {isListening ? (
                 <View style={styles.recordingIndicator}>
                   <View style={styles.wave} />
                   <View style={[styles.wave, { height: 20 }]} />
                   <View style={[styles.wave, { height: 30 }]} />
                   <View style={[styles.wave, { height: 20 }]} />
                   <View style={styles.wave} />
                   <Text style={{color: '#FFF', marginLeft: 10, fontWeight: '600'}}>点击停止</Text>
                 </View>
               ) : (
                 <>
                   <Ionicons name="mic" size={30} color="#FFFFFF" />
                   <Text style={styles.speakButtonText}>点击说话</Text>
                 </>
               )}
             </TouchableOpacity>

             <TouchableOpacity style={styles.controlButtonSmall} onPress={handleBack}>
               <Ionicons name="power-outline" size={24} color="#FF6B6B" />
               <Text style={[styles.controlTextSmall, { color: "#FF6B6B" }]}>结束对话</Text>
             </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 结束确认弹窗 */}
      <Modal
        visible={endModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.endModalContent}>
             {/* 弹窗装饰图 */}
             <View style={styles.modalHeaderDecor}>
                <Image source={Images.studyBg21} style={{width: 60, height: 60, resizeMode: 'contain'}} />
             </View>
             
             <Text style={styles.endModalTitle}>坚持就是胜利！</Text>
             
             <TouchableOpacity style={styles.endModalButtonPrimary} onPress={() => setEndModalVisible(false)}>
               <Text style={styles.endModalButtonTextPrimary}>再练一下</Text>
             </TouchableOpacity>
             
             <TouchableOpacity style={styles.endModalButtonSecondary} onPress={confirmEnd}>
               <Text style={styles.endModalButtonTextSecondary}>查看报告</Text>
             </TouchableOpacity>

             <TouchableOpacity style={styles.endModalClose} onPress={exitPractice}>
                <Text style={styles.endModalCloseText}>直接退出</Text>
             </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 报告弹窗/页面 */}
      <Modal
        visible={reportVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.reportContainer}>
            <View style={styles.reportContent}>
               <View style={styles.reportHeader}>
                 <ImageBackground 
                   source={Images.aiResultTitleBg}
                   style={styles.reportBadge}
                 >
                   <Text style={styles.reportGrade}>Good!</Text>
                 </ImageBackground>
               </View>
               
               <View style={styles.scoresContainer}>
                  <View style={styles.scoreItem}>
                    <View style={styles.scoreIconBox}>
                       <Ionicons name="mic" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.scoreLabel}>发音评分</Text>
                    <Text style={styles.scoreValue}>88</Text>
                  </View>
                  <View style={styles.scoreItem}>
                    <View style={[styles.scoreIconBox, { backgroundColor: "#5482FF" }]}>
                       <Text style={{color: "white", fontSize: 12}}>文</Text>
                    </View>
                    <Text style={styles.scoreLabel}>语法评分</Text>
                    <Text style={styles.scoreValue}>90</Text>
                  </View>
               </View>
               
               <View style={styles.statRow}>
                 <View style={styles.statItem}>
                    <View style={styles.statIconSmall}>
                        <Ionicons name="chatbubbles" size={12} color="#FFFFFF" />
                    </View>
                    <Text style={styles.statLabel}>开口次数</Text>
                    <Text style={styles.statValue}>{messages.filter(m => m.sender === 'user').length}</Text>
                 </View>
               </View>

               <View style={styles.reportChatHistory}>
                  <Text style={styles.historyTitle}>对话回顾</Text>
                  <FlatList
                    data={messages}
                    renderItem={({ item }) => (
                        <View style={styles.historyItem}>
                             <Image source={item.sender === 'ai' ? Images.aiSpeaking3 : Images.userAvatar} style={styles.historyAvatar} />
                             <View style={styles.historyMsgBox}>
                                <Text style={styles.historyMsgText}>{item.text}</Text>
                                {item.textZh && <Text style={styles.historyMsgSub}>{item.textZh}</Text>}
                             </View>
                             <TouchableOpacity 
                                 onPress={() => {
                                     if (item.audioUrl) {
                                         playAudio(item.audioUrl)
                                     } else {
                                         speakText(item.text, item.sender === 'ai' ? 'en-US' : 'en-US')
                                     }
                                 }} 
                                 style={{justifyContent: 'center'}}
                             >
                                 <Ionicons name="volume-high-outline" size={16} color="#5482FF" />
                             </TouchableOpacity>
                        </View>
                    )}
                    keyExtractor={item => item.id}
                  />
               </View>

               <View style={styles.reportButtons}>
                   <TouchableOpacity style={styles.reportBtnSecondary} onPress={restartPractice}>
                      <Text style={styles.reportBtnTextSecondary}>重并对话</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.reportBtnPrimary} onPress={exitPractice}>
                      <Text style={styles.reportBtnTextPrimary}>再练一个</Text>
                   </TouchableOpacity>
               </View>
            </View>
        </View>
      </Modal>
    </LinearGradient>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row" as const,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  leftSide: {
    width: 150,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  characterImage: {
    width: 120,
    height: 300,
  },
  characterNameContainer: {
    alignItems: "center" as const,
    marginTop: 10,
  },
  characterName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#5482FF",
    marginBottom: 5,
  },
  tagsContainer: {
    flexDirection: "row" as const,
    gap: 5,
  },
  tag: {
    backgroundColor: "#5482FF",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    color: "white",
    fontSize: 10,
  },
  rightSide: {
    flex: 1,
    marginLeft: 20,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 20,
    padding: 15,
  },
  taskCard: {
    backgroundColor: "#E8F3FF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  taskHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  taskIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
    resizeMode: 'contain' as const,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1571FC",
    marginRight: 10,
  },
  taskSubtitle: {
    fontSize: 12,
    color: "#8E9AAF",
  },
  taskList: {
    flexDirection: "row" as const,
  },
  taskItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginRight: 15,
  },
  taskItemCompleted: {
    opacity: 0.5,
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#5482FF",
    marginRight: 5,
  },
  taskItemTitle: {
    fontSize: 12,
    color: "#1571FC",
    marginRight: 5,
  },
  taskItemDesc: {
    fontSize: 12,
    color: "#8E9AAF",
  },
  
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingVertical: 10,
  },
  messageRow: {
    flexDirection: "row" as const,
    marginBottom: 15,
    alignItems: "flex-end" as const,
  },
  messageRowAi: {
    justifyContent: "flex-start" as const,
  },
  messageRowUser: {
    justifyContent: "flex-end" as const,
  },
  aiAvatarSmallContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: "hidden" as const,
    marginRight: 8,
    backgroundColor: "#E8F3FF",
  },
  aiAvatarSmall: {
    width: "100%" as any,
    height: "100%" as any,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 8,
  },
  playIconOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  messageBubble: {
    maxWidth: "70%" as any,
    padding: 12,
    borderRadius: 12,
  },
  messageBubbleAi: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 2,
  },
  messageBubbleUser: {
    backgroundColor: "#5482FF",
    borderTopRightRadius: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextAi: {
    color: "#1C2A33",
  },
  messageTextUser: {
    color: "#FFFFFF",
  },
  translationText: {
    marginTop: 5,
    fontSize: 12,
    color: "#8E9AAF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 5,
  },
  messageActions: {
    flexDirection: "row" as const,
    marginLeft: 5,
    marginBottom: 5,
  },
  actionButton: {
    padding: 4,
  },
  
  bottomControls: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.5)",
  },
  controlButtonSmall: {
    alignItems: "center" as const,
    width: 60,
  },
  controlTextSmall: {
    fontSize: 10,
    marginTop: 4,
    color: "#5482FF",
  },
  speakButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#5482FF",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 30,
    flex: 1,
    marginHorizontal: 20,
    shadowColor: "#5482FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  speakButtonActive: {
    backgroundColor: "#FF6B6B",
  },
  speakButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
    marginLeft: 10,
  },
  recordingIndicator: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    height: 30,
    gap: 4,
  },
  wave: {
    width: 4,
    height: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },

  // End Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  endModalContent: {
    width: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center" as const,
    overflow: "visible" as const,
  },
  modalHeaderDecor: {
    height: 60,
    marginBottom: 10,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  endModalTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#5482FF",
    marginBottom: 20,
  },
  endModalButtonPrimary: {
    width: "100%" as any,
    backgroundColor: "#5482FF",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center" as const,
    marginBottom: 10,
  },
  endModalButtonTextPrimary: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  endModalButtonSecondary: {
    width: "100%" as any,
    backgroundColor: "#E8F3FF",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center" as const,
    marginBottom: 15,
  },
  endModalButtonTextSecondary: {
    color: "#5482FF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  endModalClose: {
    position: "absolute" as const,
    top: 10,
    right: 10,
  },
  endModalCloseText: {
    color: "#8E9AAF",
    fontSize: 12,
  },

  // Report
  reportContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  reportContent: {
    flex: 1,
    alignItems: "center" as const,
  },
  reportHeader: {
    marginTop: 40,
    marginBottom: 20,
  },
  reportBadge: {
    width: 120,
    height: 100,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  reportGrade: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#FFAA00",
    marginTop: 20,
  },
  scoresContainer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    gap: 20,
    marginBottom: 20,
  },
  scoreItem: {
    width: 100,
    height: 100,
    backgroundColor: "#E8F3FF",
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  scoreIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#8FB5FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 12,
    color: "#1C2A33",
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#1C2A33",
  },
  statRow: {
    flexDirection: "row" as const,
    marginBottom: 20,
    width: "100%" as any,
    paddingHorizontal: 20,
  },
  statItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#F5F7FA",
    padding: 10,
    borderRadius: 10,
    flex: 1,
  },
  statIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D488FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 10,
  },
  statLabel: {
    fontSize: 12,
    color: "#1C2A33",
    marginRight: "auto" as any,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#1C2A33",
  },
  reportChatHistory: {
    flex: 1,
    width: "100%" as any,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "bold" as const,
    marginBottom: 10,
    color: "#1C2A33",
  },
  historyItem: {
    flexDirection: "row" as const,
    marginBottom: 10,
  },
  historyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  historyMsgBox: {
    flex: 1,
  },
  historyMsgText: {
    fontSize: 12,
    color: "#1C2A33",
  },
  historyMsgSub: {
    fontSize: 10,
    color: "#8E9AAF",
    marginTop: 2,
  },
  reportButtons: {
    flexDirection: "row" as const,
    gap: 20,
    marginBottom: 20,
  },
  reportBtnSecondary: {
    width: 120,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F3FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  reportBtnTextSecondary: {
    color: "#5482FF",
    fontWeight: "600" as const,
  },
  reportBtnPrimary: {
    width: 120,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#5482FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  reportBtnTextPrimary: {
    color: "#FFFFFF",
    fontWeight: "600" as const,
  },
})
