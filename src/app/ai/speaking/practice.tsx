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
import * as Speech from 'expo-speech'

import { StatusBar } from "../../../components/StatusBar"
import { NavBar } from "../../../components/NavBar"
import { createStyles, rpx } from "../../../utils/rpxStyleSheet"
import { Images } from "../../../constants/Assets"
import { xfTts, VoiceInfo } from "../../../services/xfTts"
import { sherpaOnnxTts, SherpaModel } from "../../../services/sherpaOnnxTts"

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
  // 可用的TTS语音列表（原生模块）
  const [availableVoices, setAvailableVoices] = useState<VoiceInfo[]>([])
  // 当前选中的发音人
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null)
  // 发音人选择弹窗
  const [voiceModalVisible, setVoiceModalVisible] = useState(false)
  // 语速设置
  const [speechRate, setSpeechRate] = useState(0.9)
  // 使用原生TTS模块
  const useNativeTts = Platform.OS === 'android' && xfTts.isModuleAvailable()
  // 使用 Sherpa-ONNX
  const useSherpa = Platform.OS === 'android' && sherpaOnnxTts.isModuleAvailable()
  // TTS引擎选择：'system' | 'sherpa' - 如果Sherpa可用，优先使用
  const [ttsEngine, setTtsEngine] = useState<'system' | 'sherpa'>(useSherpa ? 'sherpa' : 'system')
  // Sherpa-ONNX 模型列表
  const [sherpaModels, setSherpaModels] = useState<SherpaModel[]>([])

  // 检查 TTS 支持
  const checkTTSSupport = async () => {
    try {
      // 检查 Sherpa-ONNX 是否可用（已经在Android模块启动时自动初始化）
      if (useSherpa) {
        console.log('📢 检测到 Sherpa-ONNX')
        const models = await sherpaOnnxTts.getAvailableModels()
        setSherpaModels(models)
        
        const downloadedModels = models.filter(m => m.isDownloaded)
        if (downloadedModels.length > 0) {
          console.log('✅ 找到已下载的 Sherpa 模型:', downloadedModels.length, downloadedModels.map(m => m.name))
          // Android模块已在启动时自动初始化，无需再次初始化
          setTtsAvailable(true)
          console.log('✅ Sherpa-ONNX 已就绪，使用模型:', downloadedModels[0].name)
          return true
        } else {
          console.log('⚠️ 未找到已下载的 Sherpa 模型，使用系统TTS')
          setTtsEngine('system')
        }
      }
      
      // 使用系统TTS（科大讯飞或expo-speech）
      if (useNativeTts) {
        console.log('📢 使用原生TTS模块（科大讯飞引擎）')
        
        // 获取可用的英语发音人
        const voices = await xfTts.getRecommendedEnglishVoices()
        console.log('📢 可用英语发音人:', voices.length)
        voices.forEach((voice, index) => {
          console.log(`  ${index + 1}. ${voice.name} (${voice.language}) - ${voice.gender}`)
        })
        
        setAvailableVoices(voices)
        
        // 如果有可用语音，默认选择第一个
        if (voices.length > 0) {
          setSelectedVoice(voices[0].id)
          await xfTts.setVoice(voices[0].id)
        }
        
        // 设置默认语速
        await xfTts.setSpeechRate(speechRate)
      } else {
        // iOS或原生模块不可用时，使用expo-speech
        console.log('📢 使用expo-speech')
        const voices = await Speech.getAvailableVoicesAsync()
        const englishVoices = voices.filter(v => v.language.startsWith('en'))
        console.log('✅ 找到英语语音:', englishVoices.length)
      }
      
      setTtsAvailable(true)
      return true
    } catch (error) {
      console.error('❌ TTS 检查失败:', error)
      setTtsAvailable(false)
      return false
    }
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
      // 停止TTS播放
      if (useNativeTts) {
        xfTts.stop()
      } else {
        Speech.stop()
      }
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

  // 切换发音人
  const handleVoiceChange = async (voiceId: string) => {
    setSelectedVoice(voiceId)
    
    if (useNativeTts) {
      await xfTts.setVoice(voiceId)
    }
    
    setVoiceModalVisible(false)
    
    // 播放测试语音
    speakText("Hello! This is my voice.", 'en-US')
  }

  // 使用TTS播放英文文本（支持 Sherpa-ONNX / 科大讯飞 / expo-speech）
  async function speakText(text: string, language: string = 'en-US') {
    // 如果 TTS 不可用，直接返回
    if (!ttsAvailable) {
      console.log('⚠️ TTS 不可用，跳过播放')
      return
    }

    try {
      console.log('🔊 TTS 播放:', text.substring(0, 50) + (text.length > 50 ? '...' : ''))

      // 优先使用 Sherpa-ONNX（音质最好）
      if (ttsEngine === 'sherpa' && useSherpa) {
        console.log('📢 使用 Sherpa-ONNX 播放...')
        
        // 停止当前播放
        await sherpaOnnxTts.stop()
        
        // 使用 Sherpa-ONNX 合成并播放
        await sherpaOnnxTts.speak(text, {
          speed: speechRate,
          speakerId: 0,
        })
      } 
      // 使用科大讯飞系统TTS
      else if (useNativeTts) {
        // 先停止当前播放
        const isSpeaking = await xfTts.isSpeaking()
        if (isSpeaking) {
          await xfTts.stop()
        }

        console.log('📢 使用原生TTS模块（科大讯飞）播放...')
        
        // 使用原生TTS播放
        await xfTts.speak(text, {
          rate: speechRate,
          pitch: 1.0,
          language: language,
        })
      } 
      // iOS或原生模块不可用时，使用expo-speech
      else {
        const isSpeaking = await Speech.isSpeakingAsync()
        if (isSpeaking) {
          await Speech.stop()
        }

        console.log('📢 使用expo-speech播放...')
        
        Speech.speak(text, {
          language: language,
          pitch: 1.0,
          rate: speechRate,
          onStart: () => {
            console.log('  ✓ TTS 开始播放')
          },
          onDone: () => {
            console.log('  ✓ TTS 播放完成')
          },
          onError: (error) => {
            console.error('  ❌ TTS 播放错误:', error)
          },
        })
      }
    } catch (error) {
      console.error("❌ TTS 播放失败:", error)
      Alert.alert('语音播放失败', 'TTS服务暂时不可用')
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

             {/* 发音人选择按钮 */}
             <TouchableOpacity 
               style={styles.controlButtonSmall} 
               onPress={() => setVoiceModalVisible(true)}
             >
               <Ionicons name="person-circle-outline" size={24} color="#5482FF" />
               <Text style={styles.controlTextSmall}>发音人</Text>
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

      {/* 发音人选择弹窗 */}
      <Modal
        visible={voiceModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.voiceModalContent}>
            <View style={styles.voiceModalHeader}>
              <Text style={styles.voiceModalTitle}>选择发音人</Text>
              <TouchableOpacity onPress={() => setVoiceModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* 语速调节 */}
            <View style={styles.voiceSettingRow}>
              <Text style={styles.voiceSettingLabel}>语速</Text>
              <View style={styles.voiceRateButtons}>
                {[0.7, 0.9, 1.0, 1.2].map((rate) => (
                  <TouchableOpacity
                    key={rate}
                    style={[
                      styles.voiceRateBtn,
                      speechRate === rate && styles.voiceRateBtnActive
                    ]}
                    onPress={async () => {
                      setSpeechRate(rate)
                      if (useNativeTts) {
                        await xfTts.setSpeechRate(rate)
                      }
                    }}
                  >
                    <Text style={[
                      styles.voiceRateBtnText,
                      speechRate === rate && styles.voiceRateBtnTextActive
                    ]}>
                      {rate === 0.7 ? '慢' : rate === 0.9 ? '适中' : rate === 1.0 ? '正常' : '快'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.voiceSectionTitle}>可用发音人</Text>
            
            {availableVoices.length === 0 ? (
              <View style={styles.noVoicesContainer}>
                <Ionicons name="warning-outline" size={40} color="#FFB800" />
                <Text style={styles.noVoicesText}>暂无可用发音人</Text>
                <Text style={styles.noVoicesHint}>
                  请在系统设置中安装科大讯飞语音引擎，{'\n'}
                  并下载英语语音包
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.voiceList}>
                {availableVoices.map((voice) => (
                  <TouchableOpacity
                    key={voice.id}
                    style={[
                      styles.voiceItem,
                      selectedVoice === voice.id && styles.voiceItemSelected
                    ]}
                    onPress={() => handleVoiceChange(voice.id)}
                  >
                    <View style={styles.voiceItemLeft}>
                      <View style={[
                        styles.voiceGenderIcon,
                        { backgroundColor: voice.gender === 'female' ? '#FF69B4' : '#4169E1' }
                      ]}>
                        <Ionicons 
                          name={voice.gender === 'female' ? 'female' : 'male'} 
                          size={14} 
                          color="#FFF" 
                        />
                      </View>
                      <View>
                        <Text style={styles.voiceName}>{voice.name}</Text>
                        <Text style={styles.voiceLanguage}>{voice.language}</Text>
                      </View>
                    </View>
                    {selectedVoice === voice.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#5482FF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={styles.voiceModalCloseBtn}
              onPress={() => setVoiceModalVisible(false)}
            >
              <Text style={styles.voiceModalCloseBtnText}>确定</Text>
            </TouchableOpacity>
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
  
  // 发音人选择弹窗样式
  voiceModalContent: {
    width: 350,
    maxHeight: "80%" as any,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  voiceModalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 15,
  },
  voiceModalTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#1C2A33",
  },
  voiceSettingRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  voiceSettingLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 15,
  },
  voiceRateButtons: {
    flexDirection: "row" as const,
    flex: 1,
    gap: 8,
  },
  voiceRateBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 15,
    alignItems: "center" as const,
  },
  voiceRateBtnActive: {
    backgroundColor: "#5482FF",
  },
  voiceRateBtnText: {
    fontSize: 12,
    color: "#666",
  },
  voiceRateBtnTextActive: {
    color: "#FFFFFF",
  },
  voiceSectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1C2A33",
    marginBottom: 10,
  },
  noVoicesContainer: {
    alignItems: "center" as const,
    paddingVertical: 30,
  },
  noVoicesText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  noVoicesHint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center" as const,
    marginTop: 8,
    lineHeight: 18,
  },
  voiceList: {
    maxHeight: 250,
  },
  voiceItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    marginBottom: 8,
  },
  voiceItemSelected: {
    backgroundColor: "#E8F3FF",
    borderWidth: 1,
    borderColor: "#5482FF",
  },
  voiceItemLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  voiceGenderIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  voiceName: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#1C2A33",
  },
  voiceLanguage: {
    fontSize: 11,
    color: "#8E9AAF",
    marginTop: 2,
  },
  voiceModalCloseBtn: {
    marginTop: 15,
    backgroundColor: "#5482FF",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center" as const,
  },
  voiceModalCloseBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
})
