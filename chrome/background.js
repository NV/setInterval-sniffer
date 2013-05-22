var tabs2devtools = {};
var devtools2tabs = {};

var contentScriptPortByTabId = {};

function connect(devtoolsPort, tabId) {
	devtools2tabs[devtoolsPort.portId_] = tabId;
	tabs2devtools[tabId] = devtoolsPort;
}
function removeByTabId(tabId) {
	console.info('removeByTabId', tabId);
	var port = tabs2devtools[tabId];
	tabs2devtools[tabId] = null;
	devtools2tabs[port.portId_] = null;
	port.disconnect();
}

chrome.runtime.onConnect.addListener(function(port) {
	console.log('port.name %s', port.name);
	if (port.name === 'devtools') {
		port.onMessage.addListener(function(msg, port) {
			if (msg.from === 'devtools' && msg.tabId) {
				if (msg.action === 'start') {
					connect(port, msg.tabId);
					if (contentScriptPortByTabId[msg.tabId]) {
						done();
					} else {
						chrome.tabs.executeScript(msg.tabId, {
							file: 'setInterval-sniffer-content-script.js'
						}, done);
					}
					function done() {
						csPort = contentScriptPortByTabId[msg.tabId];
						csPort.postMessage(msg);
					}
				} else if (msg.action === 'stop') {
					var csPort = contentScriptPortByTabId[msg.tabId];
					if (csPort) {
						csPort.postMessage(msg);
					} else {
						console.warn('No csPort');
					}
				}
			} else {
				console.error(msg);
				throw new Error('wtf?');
			}
		});

		port.onDisconnect.addListener(function(port) {
			console.info('disconnect devtools port');
			var tabId = devtools2tabs[port.portId_];
			var csPort = contentScriptPortByTabId[tabId];
			csPort.postMessage({
				from: 'devtools',
				action: 'stop'
			});

//			csPort.disconnect();

			cleanup(tabId);
		});

	} else if (port.name === 'contentscript') {

		contentScriptPortByTabId[port.sender.tab.id] = port;

		port.onMessage.addListener(function(msg, port) {
			if (msg.from !== 'contentscript') {
				console.error(msg);
				throw new Error('Where is this coming from?');
			}
			if (msg.data) {
				var tabId = port.sender.tab.id;
				var devtoolsPort = tabs2devtools[tabId];
				devtoolsPort.postMessage(msg);
			}

		});

		port.onDisconnect.addListener(function(port) {
			console.info('disconnect contentscript port');
			var tabId = port.sender.tab.id;
			var devtoolsPort = tabs2devtools[tabId];
			devtoolsPort.disconnect();
			cleanup(tabId);
		});

	}
});

function cleanup(tabId) {
	var devToolsPortId = tabs2devtools[tabId].portId_;
	delete devtools2tabs[devToolsPortId];

	contentScriptPortByTabId[tabId] = null;
	tabs2devtools[tabId] = null;
}