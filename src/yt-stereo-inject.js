(() => {
	if (window.yt_stereo_ext_cache !== undefined) return;
	window.yt_stereo_ext_cache = {};

	function video_info_loaded() {
		const r = this.resolve;
		window.yt_stereo_ext_cache[this.vid] = this.responseText;
		if (r) r(this.responseText);
	}

	function perform_url_decode(resolve, vid) {
		if ('vid' in window.yt_stereo_ext_cache) {
			resolve(window.yt_stereo_ext_cache['vid']);
		}
		if (vid) {
			const req = new XMLHttpRequest();
			req.onload = video_info_loaded;
			req.onerror = (e) => { console.log('yt-stereo-ext: Error while loading video info', e); resolve(false); };
			req.open("GET", "https://youtube.com/get_video_info?video_id=" + vid, true);
			req.resolve = resolve;
			req.vid = vid;
			req.send();
		}
	}

	function on_message(message, sender, sendResponse) {
		return new Promise(resolve => {
			if (message && message.do == 'decode') perform_url_decode(resolve, message.vid);
		});
	}

	browser.runtime.onMessage.addListener(on_message);
})();
