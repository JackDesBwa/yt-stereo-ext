function sizeof_fmt(num, suffix = 'B') {
	const multiples = ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi'];
	for (var unit in multiples) {
		if (Math.abs(num) < 1024.0) {
			return num.toFixed(1) + ' ' + multiples[unit] + suffix
		}
		num /= 1024.0;
	}
	return '-';
}

function ts2str(unix_timestamp) {
	var date = new Date(unix_timestamp / 1000);
	var y = date.getYear() + 1900;
	var m = "0" + date.getMonth();
	var d = "0" + date.getDay();
	var hours = "0" + date.getHours();
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();
	return y + '-' + m.substr(-2) + '-' + d.substr(-2) + ' ' + hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}

function dur2str(d) {
	d = Math.round(d / 1000);
	var str = (d % 60) + 's';
	if (d > 60) {
		d = Math.floor(d / 60);
		str = (d % 60) + 'm ' + str;
		if (d > 60) {
			d = Math.floor(d / 60);
			str = (d % 24) + 'h ' + str;
			if (d > 24) {
				d = Math.floor(d / 24);
				str = d + 'j ' + str;
			}
		}
	}
	return str;
}

function parseQs(str) {
	str = str || '';
	return str
		.split('&')
		.reduce(function (acc, param) {
			if (param === '') return acc;
			var pair = param.split('=');
			acc[pair[0]] = decodeURIComponent(pair[1]);
			return acc;
		}, {});
}

function video_to_tr(table, f) {
	/* Example:
	{
		"itag": 242,
		"url": "https://...",
		"mimeType": "video/webm;+codecs=\"vp9\"",
		"bitrate": 54336,
		"width": 426,
		"height": 240,
		"initRange": {
			"start": "0",
			"end": "217"
		},
		"indexRange": {
			"start": "218",
			"end": "1123"
		},
		"lastModified": "1563358879101899",
		"contentLength": "1120717",
		"quality": "small",
		"fps": 24,
		"qualityLabel": "240p",
		"projectionType": "RECTANGULAR",
		"averageBitrate": 31253,
		"colorInfo": {
			"primaries": "COLOR_PRIMARIES_BT709",
			"transferCharacteristics": "COLOR_TRANSFER_CHARACTERISTICS_BT709",
			"matrixCoefficients": "COLOR_MATRIX_COEFFICIENTS_BT709"
		},
		"approxDurationMs": "286875"
	}
	*/
	const tr = document.createElement("tr");
	table.appendChild(tr);

	const table2 = document.createElement("table");
	table2.classList.add("tableDetails");
	const tr2 = document.createElement("tr");
	table2.appendChild(tr2);

	let url = f['url'];
	if (!url) url = parseQs(f['cipher'])['url'];
	if (url) {
		d = document.createElement("img");
		d.src = '../icons/web.png';
		c = document.createElement("a");
		c.title = 'Link'
		c.href = url;
		c.appendChild(d); d = c;
		c = document.createElement("td");
		c.appendChild(d); d = c;
		tr.appendChild(d);

		if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
			d = document.createElement("img");
			d.src = '../icons/phone.png';
			c = document.createElement("a");
			c.title = 'Intent'
			c.href = 'intent://' + url.replace('https://', '') + '#Intent;action=android.intent.action.VIEW;scheme=https;type=video/mp4;end'
			c.appendChild(d); d = c;
			c = document.createElement("td");
			c.appendChild(d); d = c;
			tr.appendChild(d);
		}
	} else {
		c = document.createElement("td");
		tr.appendChild(c);
		c = document.createElement("td");
		tr.appendChild(c);
	}

	let name = f['quality']
	if ('qualityLabel' in f)
		name = f['qualityLabel']

	d = document.createTextNode(name);
	c = document.createElement("td");
	c.title = 'name';
	c.appendChild(d); d = c;
	tr.appendChild(d);

	d = document.createTextNode(f['mimeType'].split(';')[0]);
	c = document.createElement("td");
	c.title = 'mimeType:' + f['mimeType'];
	c.style.width = '100%';
	c.appendChild(d); d = c;
	c.appendChild(table2);
	tr.appendChild(d);

	d = document.createTextNode(sizeof_fmt(Number(f['contentLength']), 'B'));
	c = document.createElement("td");
	c.title = 'download size';
	c.appendChild(d); d = c;
	tr.appendChild(d);

	d = document.createTextNode((f['width'] || '') + '×' + (f['height'] || ''));
	c = document.createElement("td");
	c.title = 'image size';
	c.appendChild(d); d = c;
	tr2.appendChild(d);

	d = document.createTextNode(sizeof_fmt(Number(f['bitrate']), 'B/s'));
	c = document.createElement("td");
	c.title = 'bitrate';
	c.appendChild(d); d = c;
	tr2.appendChild(d);
	d = document.createTextNode(sizeof_fmt(Number(f['averageBitrate']), 'B/s'));
	c = document.createElement("td");
	c.title = 'average bitrate';
	c.appendChild(d); d = c;
	tr2.appendChild(d);

	d = document.createTextNode(f['fps'] ? f['fps'] + 'fps' : '');
	c = document.createElement("td");
	c.title = 'fps';
	c.appendChild(d); d = c;
	tr2.appendChild(d);

	d = document.createTextNode(f['approxDurationMs'] ? dur2str(Number(f['approxDurationMs'])) : '');
	c = document.createElement("td");
	c.title = 'duration';
	c.appendChild(d); d = c;
	tr2.appendChild(d);

	d = document.createTextNode(ts2str(Number(f['lastModified'])));
	c = document.createElement("td");
	c.title = 'last modified';
	c.appendChild(d); d = c;
	tr2.appendChild(d);

	d = document.createTextNode('Tag ' + f['itag']);
	c = document.createElement("td");
	c.title = 'tag';
	c.appendChild(d); d = c;
	tr2.appendChild(d);
}

function decode_video_info(info) {
	results = document.getElementById('res');
	results.textContent = '';
	if (info.startsWith('<html>') || info == '' || info == false) {
		let c, d;
		d = document.createTextNode("YouTube probably detected bad behavior");
		c = document.createElement("i");
		c.appendChild(d); d = c;
		c = document.createElement("p");
		c.appendChild(d); d = c;
		results.appendChild(d);
		return;
	}
	const pr = JSON.parse(parseQs(info)['player_response']);

	let c, d;
	d = document.createTextNode(decodeURIComponent(pr['videoDetails']['title'].replace(/\+/g, ' ')));
	c = document.createElement("h1");
	c.appendChild(d); d = c;
	results.appendChild(d);

	if (pr.streamingData) {
		const dashManifestUrl = pr.streamingData.dashManifestUrl;
		if (dashManifestUrl) {
			const tabledash = document.createElement("table");
			tabledash.classList.add("tableList");
			results.appendChild(tabledash);
			const table = document.createElement("table");
			table.classList.add("tableList");
			results.appendChild(table);
			const trdash = document.createElement('tr');
			tabledash.appendChild(trdash);
			d = document.createElement("img");
			d.src = '../icons/web.png';
			c = document.createElement("a");
			c.title = 'Link'
			c.href = dashManifestUrl;
			c.appendChild(d); d = c;
			c = document.createElement("td");
			c.appendChild(d); d = c;
			trdash.appendChild(d);
			if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
				d = document.createElement("img");
				d.src = '../icons/phone.png';
				c = document.createElement("a");
				c.title = 'Intent'
				c.href = 'intent://' + dashManifestUrl.replace('https://', '') + '#Intent;action=android.intent.action.VIEW;scheme=https;type=video/mp4;end'
				c.appendChild(d); d = c;
				c = document.createElement("td");
				c.appendrChild(d); d = c;
				trdash.appendChild(d);
			}
			c = document.createElement('td');
			c.appendChild(document.createTextNode('DASH manifest'));
			c.style.width = '100%';
			trdash.appendChild(c);

			const formats = pr.streamingData.adaptiveFormats;
			for (const i in formats) {
				video_to_tr(table, formats[i]);
			}
		}

		const table = document.createElement("table");
		table.classList.add("tableList");
		results.appendChild(table);
		const formats = pr.streamingData.formats;
		for (const i in formats) {
			video_to_tr(table, formats[i]);
		}
	} else {
		results.appendChild(document.createTextNode('No stream information found.'));
	}
}

const testres = ``;

if (testres)
	decode_video_info(testres)
else
	browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
		const tab_url = tabs[0].url;
		const yt_regexp = /^https?\:\/\/(?:www\.youtube(?:\-nocookie)?\.com\/|m\.youtube\.com\/|youtube\.com\/)?(?:ytscreeningroom\?vi?=|youtu\.be\/|vi?\/|user\/.+\/u\/\w{1,2}\/|embed\/|watch\?(?:.*\&)?vi?=|\&vi?=|\?(?:.*\&)?vi?=)([^#\&\?\n\/<>"']*)/i;
		const yt_match = tab_url.match(yt_regexp);
		const vid = (yt_match && yt_match[1].length == 11) ? yt_match[1] : false;
		if (vid) {
			browser.tabs.executeScript(null, { file: "/src/yt-stereo-inject.js" })
			res = document.getElementById('res');
			c = document.createElement('div');
			c.classList.add('simplemsg')
			c.appendChild(document.createTextNode(`Loading ${vid}...`));
			res.textContent = '';
			res.appendChild(c);
			browser.tabs.sendMessage(tabs[0].id, { 'do': 'decode', 'vid': vid }).then((s) => {
				if (s) {
					decode_video_info(s);
				} else {
					c = document.createElement('div');
					c.classList.add('simplemsg')
					c.appendChild(document.createTextNode(`Error while loading ${vid}.`));
					res.textContent = '';
					res.appendChild(c);
				}
			});
		}
	});