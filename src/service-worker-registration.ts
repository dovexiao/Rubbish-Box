export function register(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker 注册成功:', registration);
        })
        .catch(error => {
          console.error('Service Worker 注册失败:', error);
        });
    });
  }
}
