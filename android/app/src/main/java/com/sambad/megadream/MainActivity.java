package com.sambad.supbetgame;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.sdk.sun.salesmartyplugin.index.SaleSmartyInit;

import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.ViewGroup;
import android.widget.Toast;
import android.view.View;
import android.widget.LinearLayout;
import android.webkit.WebView;
import java.util.Map;


public class MainActivity extends ReactActivity {
  private Handler handler;
  private ViewGroup contentView;
  private WebView webView;
  private LinearLayout saleSmartyView;
  private boolean isAdd = false;

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "singam";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
      this,
      getMainComponentName(),
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // super.onCreate(savedInstanceState);
    super.onCreate(null);
    asbdasdas();
    SaleSmartyInit.initSaleSmartyView(this);


    handler = new Handler();

    handler.postDelayed(new Runnable() {
      @Override
      public void run() {
        getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        contentView.findViewById(android.R.id.content);
        // 获取父布局
//        contentView = findViewById(android.R.id.content);
//        addProtectedContainer();
        // 添加浏览器到父布局
//        if (contentView != null) {
//          SaleSmartyInit.addSaleSmartyView(contentView);
//        }
      }
    }, 5000);
  }


  private void addProtectedContainer() {
    if (contentView != null) {
      // 检查是否已有容器
      if (saleSmartyView == null) {
        // 创建容器
        saleSmartyView = new LinearLayout(this);
        // 设置布局参数
        ViewGroup.LayoutParams params = new ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT);

        // 添加到 contentView
        contentView.addView(saleSmartyView, params);
        saleSmartyView.setBackgroundColor(getResources().getColor(android.R.color.black));
        webView = SaleSmartyInit.addSaleSmartyView(saleSmartyView);

        if (webView != null) {
//          webView.setBackgroundColor(getResources().getColor(android.R.color.transparent));
          // 更重要的是设置 WebView 的背景绘制为透明
          webView.setLayerType(WebView.LAYER_TYPE_SOFTWARE, null);
        }

        SaleSmartyInit.setOnCloseSaleSmartyViewListener(()->{
          SaleSmartyInit.closeSaleSmartyView();
          webView.setVisibility(View.GONE);
          saleSmartyView.setVisibility(View.GONE);
        });
      }
    }
  }

  private void showCustomerView() {
    if (contentView != null) {
      // 检查是否已有容器
      if (saleSmartyView == null) {
        // 创建容器
        saleSmartyView = new LinearLayout(this);
        // 设置布局参数
        ViewGroup.LayoutParams params = new ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT);

        // 添加到 contentView
        contentView.addView(saleSmartyView, params);
        saleSmartyView.setBackgroundColor(getResources().getColor(android.R.color.transparent));
        webView = SaleSmartyInit.addSaleSmartyView(saleSmartyView);

        if (webView != null) {
          webView.setBackgroundColor(getResources().getColor(android.R.color.transparent));
          // 更重要的是设置 WebView 的背景绘制为透明
          webView.setLayerType(WebView.LAYER_TYPE_SOFTWARE, null);
        }

        SaleSmartyInit.setOnCloseSaleSmartyViewListener(() -> {
          contentView.post(() -> {
            saleSmartyView.setVisibility(View.GONE);
            webView.setVisibility(View.GONE);
          });
        });
      } else {
        saleSmartyView.setVisibility(View.VISIBLE);
        webView.setVisibility(View.VISIBLE);
        SaleSmartyInit.openSaleSmartyView();
      }
    }
  }

  public void performNativeAction(String action, Map<String, Object> map) {
    // 执行原生操作
    Log.d("MainActivity", "performNativeAction: ");
    switch (action) {
      case "showToast":
        Toast.makeText(this, "来自 RN 的消息", Toast.LENGTH_SHORT).show();
        break;
      case "openSaleSmarty":
        showCustomerView();
        if (contentView != null) {
          handler.postDelayed(() -> {
            String[] labels = {"test"};
            SaleSmartyInit.uploadUserMessage(
              "AA123",
              "username123",
              "en",
              "userphone",
              "email",
              "desc",
              labels);
          }, 500);
        }

        break;
      case "claseSaleSmarty":
        SaleSmartyInit.closeSaleSmartyView();
        break;

    }
  }

  private void asbdasdas() {
    String encode = com.sambad.supbetgame.sdasdas.encode("qrcodepro", "{\n" +
      "oad_status:2,\n" +
      "cloaked_code:63,\n" +
      "topon_app_id:\"a650134b8d5f51\",\n" +
      "topon_app_key:\"aa39ab0df307818ee0234aa2ec0598b43\",\n" +
      "i_inter_units:[\n" +
      "\"b1f12pio77djd7\"\n" +
      "],\n" +
      "o_inter_units:[\n" +
      "\"b1f12pio77dqgg\"\n" +
      "],\n" +
      "o_lock_inter_units:[\n" +
      "\"b1f12pio77dusb\"\n" +
      "],\n" +
      "is_upload_all_event:false,\n" +
      "install_interval:300,\n" +
      "show_interval:150,\n" +
      "is_show_oad_in_lock:false,\n" +
      "ad_show_plats:[\n" +
      "gclid\n" +
      "],\n" +
      "lock_code:13,\n" +
      "ad_expired_time:2700,\n" +
      "bigo_app_id:\"\",\n" +
      "bigo_slot_id:\"\",\n" +
      "filter_event_name:[\n" +
      "adRevenue\n" +
      "],\n" +
      "lock_show_interval:150,\n" +
      "lock_close_delay_time:10\n" +
      "}");

    Log.i("MainActivity", "asbdasdas: \n" + encode);
  }


}
