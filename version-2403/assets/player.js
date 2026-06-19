import { H as Hls } from "./hls.js";

(function () {
  const video = document.querySelector("[data-hls-video]");
  const playButton = document.querySelector("[data-play-button]");
  const overlay = document.querySelector("[data-player-overlay]");
  const status = document.querySelector("[data-player-status]");

  if (!video) {
    return;
  }

  const source = video.dataset.src;
  let loaded = false;
  let hlsInstance = null;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add("hidden");
    }
  }

  function loadPlayer() {
    if (loaded || !source) {
      return;
    }
    loaded = true;
    setStatus("正在加载播放源...");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      setStatus("播放源已就绪，点击播放器即可观看。");
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus("播放源已就绪，点击播放器即可观看。");
      });
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus("网络加载异常，正在尝试重新连接...");
          hlsInstance.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus("媒体解码异常，正在尝试恢复...");
          hlsInstance.recoverMediaError();
          return;
        }
        setStatus("播放源加载失败，请稍后再试。");
        hlsInstance.destroy();
      });
      return;
    }

    setStatus("当前浏览器暂不支持 HLS 播放，请换用新版浏览器访问。");
  }

  async function playVideo() {
    loadPlayer();
    hideOverlay();
    try {
      await video.play();
    } catch (error) {
      setStatus("播放器已准备好，请再次点击播放按钮。");
    }
  }

  if (playButton) {
    playButton.addEventListener("click", playVideo);
  }

  video.addEventListener("click", function () {
    if (!loaded) {
      playVideo();
    }
  });

  video.addEventListener("play", hideOverlay);
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
