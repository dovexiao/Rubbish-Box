package com.sambad.supbet;

import android.app.Application;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;
import com.sambad.supbetgame.Chat.FreshChatPackage;
import com.moengage.core.DataCenter;
import com.moengage.core.LogLevel;
import com.moengage.core.MoEngage;
import com.moengage.core.config.LogConfig;
import com.moengage.core.config.NotificationConfig;
import com.moengage.pushbase.MoEPushHelper;
import com.moengage.react.MoEInitializer;
import com.sambad.supbetgame.R;
import com.sambad.supbetgame.ReactNativeFlipper;
import com.sambad.supbetgame.Upipay.EasyUpiPaymentPackage;
import com.microsoft.codepush.react.CodePush;
import com.sdk.sun.salesmartyplugin.index.SaleSmartyInit;

import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return false;
        }

        @Override
        protected String getJSBundleFile() {
          return CodePush.getJSBundleFile();
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          packages.add(new EasyUpiPaymentPackage());
          packages.add(new FreshChatPackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected boolean isNewArchEnabled() {
          return true;
        }

        @Override
        protected Boolean isHermesEnabled() {
          return true;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }
  // private void initAdjust() {
  //       // 1. 获取App Token（从meta-data中读取或直接硬编码）
  //       String appToken = "3meh2m59zif4";

  //       // 2. 设置环境（测试：SANDBOX / 生产：PRODUCTION）
  //       // String environment = AdjustConfig.ENVIRONMENT_SANDBOX; // 测试环境
  //       String environment = AdjustConfig.ENVIRONMENT_PRODUCTION; // 生产环境

  //       // 3. 创建配置对象
  //       AdjustConfig config = new AdjustConfig(this, appToken, environment);

  //       // 4. 配置高级选项（可选）
  //       config.setLogLevel(com.adjust.sdk.LogLevel.VERBOSE); // 开启详细日志（测试环境用）
  //       // config.setUrlStrategy(AdjustConfig.URL_STRATEGY_CN); // 中国区数据驻留
  //       // config.setSendInBackground(true); // 后台发送数据

  //       // 5. 初始化SDK
  //       Adjust.initSdk(config);
  // }

  @Override
  public void onCreate() {
    super.onCreate();
    // initAdjust();
    SaleSmartyInit.init(this,"https://plugin-code.salesmartly.com/js/project_149638_449536_1756301810.js");

    SoLoader.init(this, /* native exopackage */ false);
//    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load();
//    }
      // Configure MoEngage SDK
      MoEngage.Builder moEngage =
              new MoEngage.Builder(this, "Q60RICPHDSGXDX7PXH3NCE7K", DataCenter.DATA_CENTER_1 /* [YOUR_DATA_CENTER] */)
                      .configureLogs(new LogConfig(LogLevel.VERBOSE))
                      .configureNotificationMetaData(
                              new NotificationConfig(
                                      R.drawable.s_logo, /* Small Icon */
                                      R.drawable.s_logo, /* Large Icon */
                                      R.color.notification_color, /* Notification Color */
                                      true, /* True, to show multiple notification in notification drawer */
                                      true, /* True, to synthesize back-stack for the notification's click action */
                                      true /* True, to show notification large icon on Lollipop and above devices */
                              ));

      // Initialize MoEngage SDK
      MoEInitializer.INSTANCE.initializeDefaultInstance(
              getApplicationContext(),
              moEngage,
              false);

//      ProcessLifecycleOwner.get()
//              .getLifecycle()
//              .addObserver(new ApplicationLifecycleObserver(this.getApplicationContext()));

      MoEPushHelper.getInstance().setUpNotificationChannels(this.getApplicationContext());


    ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }
}
