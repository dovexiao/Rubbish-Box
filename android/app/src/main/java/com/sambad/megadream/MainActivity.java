package com.sambad.supbetgame;

import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.ViewGroup;
import android.widget.Toast;
import android.view.View;
import android.widget.LinearLayout;
import android.webkit.WebView;
import android.content.Intent;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.sdk.sun.salesmartyplugin.index.SaleSmartyInit;

import java.util.Map;

public class MainActivity extends ReactActivity {
  private Handler handler;
  private ViewGroup contentView;
  private WebView webView;
  private LinearLayout saleSmartyView;

  @Override
  protected String getMainComponentName() {
    return "singam";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
      this,
      getMainComponentName(),
      DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);

    SaleSmartyInit.initSaleSmartyView(this);

    // ✅ 初始化 contentView，避免 NullPointerException
    contentView = findViewById(android.R.id.content);

    handler = new Handler();

    // 可选延迟逻辑，确保在主线程执行
    handler.postDelayed(() -> runOnUiThread(() -> {
      getWindow().setBackgroundDrawableResource(android.R.color.transparent);
    }), 5000);
  }

  private void showCustomerView() {
    if (contentView != null) {
      if (saleSmartyView == null) {
        runOnUiThread(() -> {
          saleSmartyView = new LinearLayout(this);
          ViewGroup.LayoutParams params = new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
          );

          contentView.addView(saleSmartyView, params);
          saleSmartyView.setBackgroundColor(getResources().getColor(android.R.color.transparent));

          webView = SaleSmartyInit.addSaleSmartyView(saleSmartyView);
          if (webView != null) {
            webView.setBackgroundColor(getResources().getColor(android.R.color.transparent));
            webView.setLayerType(WebView.LAYER_TYPE_SOFTWARE, null);
          }

          SaleSmartyInit.setOnCloseSaleSmartyViewListener(() -> runOnUiThread(() -> {
            saleSmartyView.setVisibility(View.GONE);
            if (webView != null) {
              webView.setVisibility(View.GONE);
            }
          }));
        });
      } else {
        runOnUiThread(() -> {
          saleSmartyView.setVisibility(View.VISIBLE);
          if (webView != null) {
            webView.setVisibility(View.VISIBLE);
          }
          SaleSmartyInit.openSaleSmartyView();
        });
      }
    }
  }

  public void performNativeAction(String action, Map<String, Object> map) {
    Log.d("MainActivity", "performNativeAction: " + action);
    switch (action) {
      case "showToast":
        runOnUiThread(() ->
          Toast.makeText(this, "来自 RN 的消息", Toast.LENGTH_SHORT).show()
        );
        break;

      case "openSaleSmarty":
        showCustomerView();
        if (contentView != null) {
          handler.postDelayed(() -> {
            String userId   = String.valueOf(map.getOrDefault("userId", "AA123"));
            String username = String.valueOf(map.getOrDefault("username", "username123"));
            String language = String.valueOf(map.getOrDefault("language", "en"));
            String phone    = String.valueOf(map.getOrDefault("phone", "userphone"));
            String email    = String.valueOf(map.getOrDefault("email", "email"));
            String desc     = String.valueOf(map.getOrDefault("desc", "desc"));
            String[] labels = {"test"};
            // Object labelsObj = map.get("labels");
            // if (labelsObj instanceof List) {
            //   @SuppressWarnings("unchecked")
            //   List<String> labelsList = (List<String>) labelsObj;
            //   labels = labelsList.toArray(new String[0]);
            // } else if (labelsObj instanceof String) {
            //   labels = new String[]{(String) labelsObj};
            // }
            
            Log.d("MainActivity", "performNativeAction---------: " + userId + " " + username + " " + language + " " + phone + " " + email + " " + desc + " ");
            SaleSmartyInit.uploadUserMessage(
                userId,
                username,
                language,
                phone,
                email,
                desc,
                labels
            );
        }, 500);
        }
        break;

      case "claseSaleSmarty":
        runOnUiThread(() -> SaleSmartyInit.closeSaleSmartyView());
        break;
    }
  }
  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent intent) {
    super.onActivityResult(requestCode, resultCode, intent);
    //不管是否选中文件，都执行回调
    SaleSmartyInit.upLoadFiles(requestCode,intent);
  }
}
