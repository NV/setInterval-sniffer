if (!window.__setInterval_sniffer_initialized) {
	window.__setInterval_sniffer_initialized = true;
	console.log('setInterval-content-script.js initialized');

	var port = chrome.runtime.connect({name: "contentscript"});
	window.addEventListener('message', function(event) {
		if (event.data && event.data.setInterval_sniffer) {
			delete event.data.setInterval_sniffer;
			port.postMessage({
				from: 'contentscript',
				data: event.data
			});
		}
	}, false);

	port.onMessage.addListener(function(msg) {
		if (msg.from === 'devtools') {
			console.info('from devtools', msg);
			window.postMessage({
				from: 'setInterval sniffer content script ',
				action: msg.action
			}, '*');
		} else {
			console.warn('wrong args');
		}
	});

	port.onDisconnect.addListener(function() {
		window.postMessage({
			from: 'setInterval sniffer content script ',
			action: 'stop'
		}, '*');
	});

	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = chrome.extension.getURL('setInterval-sniffer.js');
	(document.head || document.documentElement).appendChild(script);

}

//@ sourceURL=setInterval-content-script.js