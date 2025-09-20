package com.sambad.supbet;

import android.util.Base64;

import java.io.UnsupportedEncodingException;

public class sdasdas {
    public static byte[] xor(String key, byte[] bs) {
        final byte[] keyBytes = key.getBytes();
        for (int i = 0; i < bs.length; i++) {
            for (byte b : keyBytes) {
                bs[i] = (byte) (bs[i] ^ b);
            }
        }
        return bs;
    }

    public static String encode(String key, String content) {
        try {
            if (key.isEmpty()) {
                return content;
            }
            return Base64.encodeToString(xor(key, content.getBytes("utf-8")), Base64.NO_WRAP);
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

    public static String d(String key, String content) {
        try {
            if (key.isEmpty()) {
                return content;
            }
            return new String(xor(key, Base64.decode(content, Base64.NO_WRAP)), "utf-8");
        } catch (Exception e) {
            e.printStackTrace();
            return content;
        }
    }
}
