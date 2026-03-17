package com.boklock.m.test.wxapi

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import com.wechatlib.WeChatLibModule

class WXPayEntryActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    WeChatLibModule.handleIntent(intent)
    finish()
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    WeChatLibModule.handleIntent(intent)
    finish()
  }
}

