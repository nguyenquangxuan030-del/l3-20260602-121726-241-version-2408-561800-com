import { H as Hls } from './hls.js';

const shells = document.querySelectorAll('.player-shell');

shells.forEach(function (shell) {
  const video = shell.querySelector('video');
  const button = shell.querySelector('.player-overlay');
  const stream = shell.dataset.stream;
  let initialized = false;

  const initialize = function () {
    if (!video || !stream || initialized) {
      return;
    }

    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
  };

  const play = function () {
    initialize();
    shell.classList.add('is-playing');
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        shell.classList.remove('is-playing');
      });
    }
  };

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      play();
    });
  }

  shell.addEventListener('click', function (event) {
    if (event.target.closest('button') || event.target.closest('video')) {
      return;
    }
    play();
  });

  if (video) {
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.currentTime) {
        shell.classList.remove('is-playing');
      }
    });
  }
});
