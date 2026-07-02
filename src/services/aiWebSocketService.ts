export interface WSMessage {
  type: string;
  content?: string;
  data?: any;
  conversationId?: string;
  sessionId?: string;
  [key: string]: any;
}

export interface WSConfig {
  url: string;
  chatKey: string;
  onMessage: (message: WSMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: any) => void;
}

class AIWebSocketService {
  private socket: WebSocket | null = null;
  private config: WSConfig | null = null;
  private connected = false;

  connect(config: WSConfig) {
    this.config = config;
    this.connected = false;

    try {
      const socket = new WebSocket(config.url);
      this.socket = socket;

      socket.onopen = () => {
        this.connected = true;
        this.send({ chatKey: config.chatKey });
        config.onOpen?.();
      };

      socket.onmessage = event => {
        try {
          const message = JSON.parse(String(event.data)) as WSMessage;
          config.onMessage(message);
        } catch (error) {
          console.error('解析 WebSocket 消息失败:', error);
        }
      };

      socket.onerror = error => {
        this.connected = false;
        config.onError?.(error);
      };

      socket.onclose = () => {
        this.connected = false;
        this.socket = null;
        config.onClose?.();
      };
    } catch (error) {
      console.error('创建 WebSocket 失败:', error);
      config.onError?.(error);
    }
  }

  send(data: any) {
    if (this.socket && this.connected) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.socket.send(message);
    }
  }

  close() {
    this.connected = false;
    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        // ignore close errors
      }
      this.socket = null;
    }
    this.config = null;
  }

  isConnected() {
    return this.connected;
  }
}

export const aiWebSocketService = new AIWebSocketService();
