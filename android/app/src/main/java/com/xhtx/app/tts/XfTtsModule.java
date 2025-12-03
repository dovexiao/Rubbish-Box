package com.xhtx.app.tts;

import android.content.Context;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * 讯飞TTS模块 - 支持系统TTS引擎（包括科大讯飞离线引擎）
 * 提供更丰富的发音人选择和参数控制
 */
public class XfTtsModule extends ReactContextBaseJavaModule implements TextToSpeech.OnInitListener {
    private static final String TAG = "XfTtsModule";
    private static final String MODULE_NAME = "XfTts";
    
    private TextToSpeech tts;
    private boolean isInitialized = false;
    private Promise initPromise;
    private String currentUtteranceId;
    
    // TTS参数
    private float speechRate = 1.0f;    // 语速 0.1-2.0
    private float pitch = 1.0f;         // 音调 0.5-2.0
    private String currentVoice = null; // 当前发音人
    
    public XfTtsModule(ReactApplicationContext reactContext) {
        super(reactContext);
        initTts();
    }
    
    @Override
    public String getName() {
        return MODULE_NAME;
    }
    
    private void initTts() {
        Context context = getReactApplicationContext();
        tts = new TextToSpeech(context, this);
    }
    
    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            isInitialized = true;
            // 默认设置为英语
            int result = tts.setLanguage(Locale.US);
            
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.e(TAG, "英语语言不支持");
            }
            
            // 设置回调监听
            tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override
                public void onStart(String utteranceId) {
                    sendEvent("ttsStart", utteranceId);
                }
                
                @Override
                public void onDone(String utteranceId) {
                    sendEvent("ttsDone", utteranceId);
                }
                
                @Override
                public void onError(String utteranceId) {
                    sendEvent("ttsError", utteranceId);
                }
            });
            
            Log.i(TAG, "TTS初始化成功");
            
            if (initPromise != null) {
                initPromise.resolve(true);
                initPromise = null;
            }
        } else {
            Log.e(TAG, "TTS初始化失败: " + status);
            isInitialized = false;
            
            if (initPromise != null) {
                initPromise.reject("TTS_INIT_ERROR", "TTS初始化失败");
                initPromise = null;
            }
        }
    }
    
    /**
     * 获取所有可用的语音列表
     */
    @ReactMethod
    public void getVoices(Promise promise) {
        if (!isInitialized || tts == null) {
            promise.reject("TTS_NOT_INITIALIZED", "TTS未初始化");
            return;
        }
        
        try {
            WritableArray voiceArray = Arguments.createArray();
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                Set<Voice> voices = tts.getVoices();
                if (voices != null) {
                    for (Voice voice : voices) {
                        WritableMap voiceMap = Arguments.createMap();
                        voiceMap.putString("id", voice.getName());
                        voiceMap.putString("name", voice.getName());
                        voiceMap.putString("language", voice.getLocale().toString());
                        voiceMap.putString("country", voice.getLocale().getCountry());
                        voiceMap.putInt("quality", voice.getQuality());
                        voiceMap.putBoolean("networkRequired", voice.isNetworkConnectionRequired());
                        
                        // 判断是否是英语语音
                        boolean isEnglish = voice.getLocale().getLanguage().equals("en");
                        voiceMap.putBoolean("isEnglish", isEnglish);
                        
                        voiceArray.pushMap(voiceMap);
                    }
                }
            }
            
            promise.resolve(voiceArray);
        } catch (Exception e) {
            promise.reject("GET_VOICES_ERROR", e.getMessage());
        }
    }
    
    /**
     * 获取推荐的英语发音人列表（更自然的语音）
     */
    @ReactMethod
    public void getRecommendedEnglishVoices(Promise promise) {
        if (!isInitialized || tts == null) {
            promise.reject("TTS_NOT_INITIALIZED", "TTS未初始化");
            return;
        }
        
        try {
            WritableArray voiceArray = Arguments.createArray();
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                Set<Voice> voices = tts.getVoices();
                if (voices != null) {
                    for (Voice voice : voices) {
                        // 只筛选英语语音
                        if (!voice.getLocale().getLanguage().equals("en")) {
                            continue;
                        }
                        
                        // 过滤掉需要网络的和低质量的
                        if (voice.isNetworkConnectionRequired()) {
                            continue;
                        }
                        
                        WritableMap voiceMap = Arguments.createMap();
                        voiceMap.putString("id", voice.getName());
                        voiceMap.putString("name", formatVoiceName(voice.getName()));
                        voiceMap.putString("language", voice.getLocale().toString());
                        voiceMap.putString("country", voice.getLocale().getCountry());
                        voiceMap.putInt("quality", voice.getQuality());
                        
                        // 根据名称判断性别
                        String gender = guessGender(voice.getName());
                        voiceMap.putString("gender", gender);
                        
                        voiceArray.pushMap(voiceMap);
                    }
                }
            }
            
            promise.resolve(voiceArray);
        } catch (Exception e) {
            promise.reject("GET_VOICES_ERROR", e.getMessage());
        }
    }
    
    /**
     * 设置发音人
     */
    @ReactMethod
    public void setVoice(String voiceId, Promise promise) {
        if (!isInitialized || tts == null) {
            promise.reject("TTS_NOT_INITIALIZED", "TTS未初始化");
            return;
        }
        
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                Set<Voice> voices = tts.getVoices();
                if (voices != null) {
                    for (Voice voice : voices) {
                        if (voice.getName().equals(voiceId)) {
                            int result = tts.setVoice(voice);
                            if (result == TextToSpeech.SUCCESS) {
                                currentVoice = voiceId;
                                promise.resolve(true);
                                return;
                            }
                        }
                    }
                }
            }
            promise.reject("VOICE_NOT_FOUND", "找不到指定的发音人: " + voiceId);
        } catch (Exception e) {
            promise.reject("SET_VOICE_ERROR", e.getMessage());
        }
    }
    
    /**
     * 设置语速
     * @param rate 0.1 - 2.0，1.0为正常
     */
    @ReactMethod
    public void setSpeechRate(float rate, Promise promise) {
        if (!isInitialized || tts == null) {
            promise.reject("TTS_NOT_INITIALIZED", "TTS未初始化");
            return;
        }
        
        try {
            speechRate = Math.max(0.1f, Math.min(2.0f, rate));
            int result = tts.setSpeechRate(speechRate);
            promise.resolve(result == TextToSpeech.SUCCESS);
        } catch (Exception e) {
            promise.reject("SET_RATE_ERROR", e.getMessage());
        }
    }
    
    /**
     * 设置音调
     * @param pitchValue 0.5 - 2.0，1.0为正常
     */
    @ReactMethod
    public void setPitch(float pitchValue, Promise promise) {
        if (!isInitialized || tts == null) {
            promise.reject("TTS_NOT_INITIALIZED", "TTS未初始化");
            return;
        }
        
        try {
            pitch = Math.max(0.5f, Math.min(2.0f, pitchValue));
            int result = tts.setPitch(pitch);
            promise.resolve(result == TextToSpeech.SUCCESS);
        } catch (Exception e) {
            promise.reject("SET_PITCH_ERROR", e.getMessage());
        }
    }
    
    /**
     * 播放文本
     */
    @ReactMethod
    public void speak(String text, ReadableMap options, Promise promise) {
        if (!isInitialized || tts == null) {
            promise.reject("TTS_NOT_INITIALIZED", "TTS未初始化");
            return;
        }
        
        try {
            // 先停止当前播放
            if (tts.isSpeaking()) {
                tts.stop();
            }
            
            // 解析选项
            if (options != null) {
                if (options.hasKey("rate")) {
                    speechRate = (float) options.getDouble("rate");
                    tts.setSpeechRate(speechRate);
                }
                if (options.hasKey("pitch")) {
                    pitch = (float) options.getDouble("pitch");
                    tts.setPitch(pitch);
                }
                if (options.hasKey("language")) {
                    String lang = options.getString("language");
                    if (lang != null) {
                        setLanguage(lang);
                    }
                }
            }
            
            // 生成utteranceId
            currentUtteranceId = UUID.randomUUID().toString();
            
            Bundle params = new Bundle();
            params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, currentUtteranceId);
            
            int result = tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, currentUtteranceId);
            
            if (result == TextToSpeech.SUCCESS) {
                promise.resolve(currentUtteranceId);
            } else {
                promise.reject("SPEAK_ERROR", "语音合成失败");
            }
        } catch (Exception e) {
            promise.reject("SPEAK_ERROR", e.getMessage());
        }
    }
    
    /**
     * 停止播放
     */
    @ReactMethod
    public void stop(Promise promise) {
        if (tts != null) {
            tts.stop();
        }
        promise.resolve(true);
    }
    
    /**
     * 检查是否正在播放
     */
    @ReactMethod
    public void isSpeaking(Promise promise) {
        if (tts != null) {
            promise.resolve(tts.isSpeaking());
        } else {
            promise.resolve(false);
        }
    }
    
    /**
     * 设置语言
     */
    private void setLanguage(String language) {
        Locale locale;
        switch (language) {
            case "en-US":
                locale = Locale.US;
                break;
            case "en-GB":
                locale = Locale.UK;
                break;
            case "zh-CN":
                locale = Locale.SIMPLIFIED_CHINESE;
                break;
            default:
                locale = new Locale(language);
        }
        tts.setLanguage(locale);
    }
    
    /**
     * 格式化发音人名称
     */
    private String formatVoiceName(String voiceId) {
        // 将技术名称转换为友好名称
        if (voiceId.contains("female") || voiceId.contains("Female")) {
            return "女声 - " + voiceId;
        } else if (voiceId.contains("male") || voiceId.contains("Male")) {
            return "男声 - " + voiceId;
        }
        return voiceId;
    }
    
    /**
     * 猜测发音人性别
     */
    private String guessGender(String voiceId) {
        String lower = voiceId.toLowerCase();
        if (lower.contains("female") || lower.contains("woman") || 
            lower.contains("girl") || lower.contains("她")) {
            return "female";
        } else if (lower.contains("male") || lower.contains("man") || 
                   lower.contains("boy") || lower.contains("他")) {
            return "male";
        }
        return "unknown";
    }
    
    /**
     * 发送事件到JS
     */
    private void sendEvent(String eventName, String utteranceId) {
        WritableMap params = Arguments.createMap();
        params.putString("utteranceId", utteranceId);
        
        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }
    
    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        if (tts != null) {
            tts.stop();
            tts.shutdown();
            tts = null;
        }
    }
}

