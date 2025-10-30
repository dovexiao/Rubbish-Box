import os
import requests
import tensorflow as tf
import ssl

def download_model():
    # 禁用SSL验证警告
    ssl._create_default_https_context = ssl._create_unverified_context
    
    # 模型URL - 使用 MediaPipe Pose 模型
    model_url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.tflite"
    
    # 确保assets目录存在
    assets_dir = "src/main/assets"
    os.makedirs(assets_dir, exist_ok=True)
    
    # 下载模型
    print("Downloading model...")
    try:
        response = requests.get(model_url, verify=False)
        response.raise_for_status()  # 检查响应状态
        
        # 保存模型文件
        model_path = os.path.join(assets_dir, "pose_model.tflite")
        with open(model_path, "wb") as f:
            f.write(response.content)
        
        print(f"Model saved to {model_path}")
        
        # 验证文件大小
        file_size = os.path.getsize(model_path)
        print(f"Model file size: {file_size} bytes")
        
        if file_size < 1000:  # 如果文件太小，可能下载失败
            raise Exception("Downloaded file is too small")
            
    except Exception as e:
        print(f"Error downloading model: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = download_model()
    if success:
        print("Model download successful!")
    else:
        print("Model download failed!") 