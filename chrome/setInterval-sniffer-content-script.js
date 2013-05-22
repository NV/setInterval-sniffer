if (!window.__setInterval_sniffer_initialized) {
	window.__setInterval_sniffer_initialized = true;
	console.log('inject.js initialized');

	var port = chrome.runtime.connect({name: "contentscript"});
	window.addEventListener('message', function(event) {
		if (event.data && event.data.timer_watcher) {
			delete event.data.timer_watcher;
			port.postMessage({
				from: 'contentscript',
				data: event.data
			});
		}
	}, false);

//	window.addEventListener('unload', function() {
//		console.warn('window unload!!');
//		port.postMessage({
//			from: 'contentscript',
//			action: 'unload'
//		});
//	}, false);

	port.onMessage.addListener(function(msg) {
		if (msg.from === 'devtools') {
			console.info('from devtools', msg);
			window.postMessage({
				from: 'Timer Watcher Content Script',
				action: msg.action
			}, '*');
		} else {
			console.warn('wrong args');
		}
	});

	port.onDisconnect.addListener(function() {
		window.postMessage({
			from: 'Timer Watcher Content Script',
			action: 'stop'
		}, '*');
	});

	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = chrome.extension.getURL('setInterval-sniffer.js');
	(document.head || document.documentElement).appendChild(script);

}

//@ sourceURL=setInterval-content-script.js