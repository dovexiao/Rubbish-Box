import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { showLoginModal, requireLogin, withLogin, loginActions } from '../utils/loginUtils'
import { createStyles } from '../utils/rpxStyleSheet'

/**
 * 登录弹窗使用示例
 * 展示如何在任何地方调用登录弹窗
 */
export function LoginUsageExample() {
  // 示例1：直接显示登录弹窗
  const handleDirectLogin = () => {
    showLoginModal({
      onSuccess: () => {
        console.log('登录成功，可以执行后续操作')
      },
      onCancel: () => {
        console.log('用户取消登录')
      },
    })
  }

  // 示例2：需要登录的操作
  const handleFavoriteAction = () => {
    loginActions.favorite('item123')
  }

  const handleCommentAction = () => {
    loginActions.comment('这是一条评论', 'item456')
  }

  // 示例3：使用requireLogin包装函数
  const handlePurchase = requireLogin((productId: string) => {
    console.log('执行购买操作:', productId)
    // 实际的购买逻辑
  })

  // 示例4：使用withLogin异步操作
  const handleAsyncAction = async () => {
    const result = await withLogin(async () => {
      console.log('执行异步操作')
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 1000))
      return '操作完成'
    })

    if (result) {
      console.log('异步操作结果:', result)
    } else {
      console.log('用户取消登录，操作未执行')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>登录弹窗使用示例</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleDirectLogin}>
        <Text style={styles.buttonText}>直接显示登录弹窗</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleFavoriteAction}>
        <Text style={styles.buttonText}>收藏操作（需要登录）</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleCommentAction}>
        <Text style={styles.buttonText}>评论操作（需要登录）</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => handlePurchase('product789')}>
        <Text style={styles.buttonText}>购买操作（需要登录）</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleAsyncAction}>
        <Text style={styles.buttonText}>异步操作（需要登录）</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
})
