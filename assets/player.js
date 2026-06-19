import { H as Hls } from './hls-dru42stk.js';

function showMessage(container, message) {
  const messageBox = container.querySelector('[data-player-message]');

  if (!messageBox) {
    return;
  }

  messageBox.textContent = message;
  messageBox.classList.add('is-visible');
}

function attachSource(video, sourceUrl) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = sourceUrl;
    return Promise.resolve();
  }

  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90
    });

    hls.loadSource(sourceUrl);
    hls.attachMedia(video);

    return new Promise((resolve, reject) => {
      hls.on(Hls.Events.MANIFEST_PARSED, () => resolve());
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data && data.fatal) {
          reject(new Error(data.details || '播放源加载失败'));
        }
      });
    });
  }

  return Promise.reject(new Error('当前浏览器不支持 HLS 播放'));
}

function setupPlayer(container) {
  const video = container.querySelector('video');
  const button = container.querySelector('[data-player-button]');
  const sourceUrl = container.getAttribute('data-video-url');
  let prepared = false;

  if (!video || !button || !sourceUrl) {
    return;
  }

  async function startPlayback() {
    try {
      if (!prepared) {
        showMessage(container, '正在加载播放源...');
        await attachSource(video, sourceUrl);
        prepared = true;
      }

      await video.play();
      container.classList.add('is-playing');
      showMessage(container, '播放已开始，可使用播放器控制栏调整进度和音量。');
    } catch (error) {
      showMessage(container, error.message || '播放时出现错误，请稍后重试。');
    }
  }

  button.addEventListener('click', startPlayback);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-player]').forEach(setupPlayer);
});
