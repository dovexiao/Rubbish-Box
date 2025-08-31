package com.sambad.supbet001game.Upipay;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.module.annotations.ReactModule;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;


@ReactModule(name = EasyUpiPaymentModule.NAME)
public class EasyUpiPaymentModule extends ReactContextBaseJavaModule implements ActivityEventListener{

    private static final int PAYMENT_REQUEST = 4400;

    public final Context mContext;

    private Promise mPromise;
    private Callback successHandler;
    private Callback failureHandler;
    public static ReactContext sReactContext;

    final private static String FAILED = "FAILED";
    final private static String SUCCESS = "SUCCESS";
    public static final String NAME = "EasyUpiPayment";


    public EasyUpiPaymentModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext.getApplicationContext();
        sReactContext = reactContext;
        reactContext.addActivityEventListener(this);
    }

    @NonNull
    @Override
    public String getName() {
        return NAME;
    }

    private boolean isCallable(Intent intent, Context context) {
        List<ResolveInfo> list = context.getPackageManager().queryIntentActivities(intent,
                PackageManager.MATCH_DEFAULT_ONLY);
        return list.size() > 0;
    }
    Uri uri = Uri.parse("upi://pay");

    @ReactMethod
    public void intialPayment(
            ReadableMap config, Callback success, Callback failure
    ) {
        this.successHandler = success;
        this.failureHandler = failure;
        Uri data = uri.buildUpon().appendQueryParameter("pa", config.getString("payeeName"))
                .appendQueryParameter("pn", config.getString("payeeName"))
                .appendQueryParameter("tid", config.getString("transactionId"))
                .appendQueryParameter("mc", config.getString("merchantCode"))
                .appendQueryParameter("tr", config.getString("transactionRefId"))
                .appendQueryParameter("tn", config.getString("description"))
                .appendQueryParameter("am", config.getString("amount"))
                .appendQueryParameter("cu", "INR")
                .build();

        Intent upiPaymentIntent = new Intent(Intent.ACTION_VIEW);

        upiPaymentIntent.setData(data);

        if (config.getString("targetPackage").length() != 0) {
            try {
                upiPaymentIntent.setPackage(config.getString("targetPackage"));
                getCurrentActivity().startActivityForResult(upiPaymentIntent, PAYMENT_REQUEST);
            } catch (Exception e) {
                e.printStackTrace();
                WritableNativeMap message = new WritableNativeMap();
                message.putString("status", FAILED);
                message.putString("message", "No Apps Found for the upi payment");
                this.failureHandler.invoke(message);
            }
        } else {
            Intent chooser = Intent.createChooser(upiPaymentIntent, config.getString("chooserText"));
            if (null != chooser.resolveActivity(Objects.requireNonNull(getCurrentActivity()).getPackageManager())) {
                getCurrentActivity().startActivityForResult(chooser, PAYMENT_REQUEST);
            } else {
                WritableNativeMap message = new WritableNativeMap();
                message.putString("status", FAILED);
                message.putString("message", "No Apps Found for the upi payment");
                this.failureHandler.invoke(message);
            }
        }

    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        WritableNativeMap response = new WritableNativeMap();
        try {
            if (data == null) {
                response.putString("status", FAILED);
                response.putString("message", "No Action Taken");
                this.failureHandler.invoke(response);
                return;
            }
            if (requestCode == PAYMENT_REQUEST) {
                if (data.getStringExtra("Status").trim().equalsIgnoreCase(SUCCESS)) {
                    String res = data.getStringExtra("response");
                    // TODO response
                    Map<String, String> map = getMapFromQuery(res);
                    response.putString("status", SUCCESS);
                    response.putString("txnId", data.getStringExtra("txnId"));
                    response.putString("code", data.getStringExtra("responseCode"));
                    response.putString("approvalRefNo", data.getStringExtra("ApprovalRefNo"));
                    this.successHandler.invoke(response);

                } else {
                    response.putString("status", FAILED);
                    response.putString("message", "Payment was not done!");
                    this.failureHandler.invoke(response);
                }
            } else {
                response.putString("status", FAILED);
                response.putString("message", "Request code mismatched ");
                this.failureHandler.invoke(response);
            }
        } catch (Exception e) {
            Log.e("Easyupi", "Error");
            e.printStackTrace();
        }

    }


    public Map<String, String> getMapFromQuery(String queryString) {
        Map<String, String> map = new HashMap<>();
        String[] keyValuePairs = queryString.split("&");

        for (String param : keyValuePairs) {
            String[] pair = param.split("=");
            if (pair.length == 2) {
                map.put(pair[0], pair[1]);
            }
        }

        return map;
    }

    @ReactMethod
    public WritableNativeArray getInstalledUPIApps() {
        WritableNativeArray upiList = new WritableNativeArray();
        Uri uri = Uri.parse(String.format("%s://%s", "upi", "pay"));
        Intent upiUriIntent = new Intent();
        upiUriIntent.setData(uri);
        List<ResolveInfo> list = sReactContext.getPackageManager().queryIntentActivities(upiUriIntent,
                PackageManager.MATCH_DEFAULT_ONLY);
        if (list.size() > 0) {
            for (ResolveInfo resolveInfo: list) {
                upiList.pushString(resolveInfo.activityInfo.packageName);
            }

        }
        return upiList;
    }

    @Override
    public void onNewIntent(Intent intent) {

    }

}
