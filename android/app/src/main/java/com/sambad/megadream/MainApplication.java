package com.sambad.megadream;

import android.app.Application;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;
import com.sambad.megadream.Chat.FreshChatPackage;
import com.moengage.core.DataCenter;
import com.moengage.core.LogLevel;
import com.moengage.core.MoEngage;
import com.moengage.core.config.LogConfig;
import com.moengage.core.config.NotificationConfig;
//import com.moengage.core.internal.lifecycle.ApplicationLifecycleObserver;
import com.moengage.pushbase.MoEPushHelper;
import com.moengage.react.MoEInitializer;
import com.sambad.megadream.Upipay.EasyUpiPaymentPackage;
import com.microsoft.codepush.react.CodePush;

import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
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
          return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }

        @Override
        protected Boolean isHermesEnabled() {
          return BuildConfig.IS_HERMES_ENABLED;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load();
    }
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
