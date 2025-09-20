package com.sambad.supbet;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.sambad.supbetgame.R;
import android.content.pm.PackageManager;
import android.Manifest;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.core.app.ActivityCompat;

import com.sdk.sun.salesmartyplugin.index.SaleSmartyInit;


public class MainActivity extends ReactActivity {
  RelativeLayout parent;
  TextView textView;
  EditText user_id;
  EditText user_name;
  EditText language;
  EditText phone;
  EditText email;
  EditText description;
  LinearLayout upload_view;
  private static final String TAG = "MainActivity";


  private Handler handler;

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
    setContentView(R.layout.activity_main);
    asbdasdas();

    parent = findViewById(R.id.parent);
    upload_view = findViewById(R.id.upload_view);
    textView = findViewById(R.id.un_read_num);
    user_id = findViewById(R.id.user_id);
    user_name = findViewById(R.id.user_name);
    language = findViewById(R.id.language);
    phone = findViewById(R.id.phone);
    email = findViewById(R.id.email);
    description = findViewById(R.id.description);
    //初始化浏览器
    SaleSmartyInit.initSaleSmartyView(this);
    //添加浏览器到某个viewgroup
    SaleSmartyInit.addSaleSmartyView(parent);


//展示上传用户信息页面和关闭上传用户信息页面
    findViewById(R.id.upload).setOnClickListener(v -> {
      if (upload_view.getVisibility() == View.VISIBLE) {
        upload_view.setVisibility(View.GONE);
      } else {
        upload_view.setVisibility(View.VISIBLE);
      }
    });
    //上传用户信息
    findViewById(R.id.start_upload).setOnClickListener(v -> {
      String[] labels = {"test"};
      SaleSmartyInit.uploadUserMessage(
        "AA123",
        "username123",
       "en",
        "userphone",
        "email",
        "desc",
        labels);
      Toast.makeText(MainActivity.this, "上传信息成功", Toast.LENGTH_SHORT).show();
      if (upload_view.getVisibility() == View.VISIBLE) {
        upload_view.setVisibility(View.GONE);
      } else {
        upload_view.setVisibility(View.VISIBLE);
      }
    });
    //关闭窗口
    findViewById(R.id.show).setOnClickListener(v -> SaleSmartyInit.openSaleSmartyView());
    //打开窗口
    findViewById(R.id.close).setOnClickListener(v -> SaleSmartyInit.closeSaleSmartyView());
    //获得未读信息数
    SaleSmartyInit.setUnReadMessagesListener(num -> textView.setText("未读消息" + num));

    SaleSmartyInit.setOnOpenSaleSmartyViewListener(() -> Toast.makeText(MainActivity.this, "打开了窗口", Toast.LENGTH_SHORT).show());
    SaleSmartyInit.setOnCloseSaleSmartyViewListener(() -> Toast.makeText(MainActivity.this, "关闭了窗口", Toast.LENGTH_SHORT).show());

    getPermission();



    handler = new Handler();
    handler.postDelayed(new Runnable() {
        @Override
        public void run() {
            getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }
    }, 5000);
  }

  private boolean getPermission() {
    if (ActivityCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED) {
      return true;
    } else {
      ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, 100);
      return false;
    }
  }

  private void asbdasdas() {
    String encode = com.sambad.supbet.sdasdas.encode("qrcodepro", "{\n" +
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

    Log.i(TAG, "asbdasdas: \n" + encode);
  }
}
