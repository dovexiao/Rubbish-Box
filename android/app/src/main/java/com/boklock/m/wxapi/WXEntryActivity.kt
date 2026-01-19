package com.boklock.m.wxapi

import android.app.Activity
import android.os.Bundle
import com.wechatlib.WeChatLibModule

class WXEntryActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    WeChatLibModule.handleIntent(intent)
    finish()
  }
}