import { getStaffList } from "@/services";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";

const Mine = () => {
  const [totol, setTotal] = useState(0);
  const [info, setInfo] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTotal = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== 开始请求 getStaffList ===');
      console.log('请求参数:', { offset: 0, pageSize: 20 });

      const res = await getStaffList({
        offset: 0,
        pageSize: 20,
      });

      console.log('=== 请求成功 ===');
      console.log('响应数据:', JSON.stringify(res, null, 2));
      console.log('响应类型:', typeof res);
      console.log('响应是否为数组:', Array.isArray(res));

      if (res && typeof res === 'object') {
        if ('total' in res) {
          setTotal(res.total as number);
          console.log('设置 total:', res.total);
        } else {
          console.warn('响应中没有 total 字段，完整响应:', res);
          setTotal(0);
        }
      } else {
        console.warn('响应数据格式异常:', res);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('=== 请求失败 ===');
      console.error('错误信息:', err);
      console.error('错误堆栈:', err?.stack);
      console.error('错误详情:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
      });

      setError(err?.message || '请求失败');
      setTotal(0);
    } finally {
      setLoading(false);
      console.log('=== 请求完成 ===');
    }
  }

  useFocusEffect(useCallback(() => {
    console.log('=== Mine 页面获得焦点，开始请求 ===');
    getTotal();
  }, []));

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Mine</Text>

      {loading && (
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10 }}>加载中...</Text>
        </View>
      )}

      {error && (
        <View style={{ backgroundColor: '#ffebee', padding: 10, borderRadius: 5, marginBottom: 10 }}>
          <Text style={{ color: '#c62828' }}>错误: {error}</Text>
        </View>
      )}

      <Text style={{ fontSize: 16, marginTop: 10 }}>
        总数: {totol}
      </Text>

      <Text style={{ fontSize: 14, color: '#666', marginTop: 10 }}>
        未读消息: {unreadCount}
      </Text>
    </View>
  );
}

export default Mine;