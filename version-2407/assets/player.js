(function () {
    function setupPlayer(box) {
        var video = box.querySelector('video');
        var source = box.getAttribute('data-src');
        var message = box.querySelector('[data-player-message]');
        var buttons = Array.prototype.slice.call(box.querySelectorAll('[data-player-action]'));
        var hls = null;
        if (!video || !source) {
            return;
        }

        function setMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.hidden = !text;
        }

        function load() {
            if (box.getAttribute('data-ready') === '1') {
                return;
            }
            box.setAttribute('data-ready', '1');
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            setMessage('播放暂时不可用，请稍后再试。');
                        }
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                setMessage('播放暂时不可用，请稍后再试。');
            }
        }

        function playPause() {
            load();
            if (video.paused) {
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        setMessage('点击播放按钮即可继续观看。');
                        window.setTimeout(function () {
                            setMessage('');
                        }, 1800);
                    });
                }
            } else {
                video.pause();
            }
        }

        function mute() {
            video.muted = !video.muted;
        }

        function fullscreen() {
            var target = video.requestFullscreen ? video : box;
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (target.requestFullscreen) {
                target.requestFullscreen();
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var action = button.getAttribute('data-player-action');
                if (action === 'play') {
                    playPause();
                }
                if (action === 'mute') {
                    mute();
                }
                if (action === 'fullscreen') {
                    fullscreen();
                }
            });
        });

        video.addEventListener('click', playPause);
        video.addEventListener('play', function () {
            box.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            box.classList.remove('is-playing');
        });
        video.addEventListener('error', function () {
            setMessage('播放暂时不可用，请稍后再试。');
        });
        load();
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(setupPlayer);
    });
})();
