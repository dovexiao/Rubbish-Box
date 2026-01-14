package com.boklock.m.wxapi

import android.app.Activity
import android.content.Intent
import android.os.Bundle
// import com.theweflex.react.WeChatModule

class WXPayEntryActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    // WeChatModule.handleIntent(intent)
    finish()
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    // WeChatModule.handleIntent(intent)
    finish()
  }
}

