chrome.devtools.panels.create("Timers",
	"icon.svg",
	"setInterval-sniffer.html",
	function(panel) {
		var shown = false;
		panel.onShown.addListener(function(w) {
			if (shown) return;
			shown = true;
			initialize(w);
		});
	}
);


function initialize(w) {
	var port = null;
	var doc = w.document;

	onStop(doc);

	doc.getElementById('start_button').addEventListener('click', function(e) {
		if (e.target.disabled) {
			return;
		}
		port = chrome.runtime.connect({name: "devtools"});

		port.onMessage.addListener(function(msg) {

			if (msg.from !== 'contentscript') {
				console.log('Devtools from contentscript', msg);
				return;
			}

			var data = msg.data;
			if (data.functionName === 'setTimeout' || data.functionName === 'setInterval') {
				var div = doc.createElement('div');
				div.className = 'item';
				var name = data.functionName === 'setTimeout' ? 'timeout' : 'interval';
				div.id = constructId(name, data.id);
				div.textContent = data.functionName + '(' + data.fn + ', ' + data.time + ') -> ' + data.id;
				var out = doc.getElementById('out');
				out.appendChild(div);

				if (data.functionName === 'setTimeout') {
					setTimeout(function() {
						div.classList.add('cleared');
					}, data.time);
				}

			} else {
				var name = data.functionName === 'clearTimeout' ? 'timeout' : 'interval';
				var div = doc.getElementById(constructId(name, data.id));
				if (div) {
					div.classList.add('cleared');
				} else {
					console.warn('%i is not captured', data.id);
				}
			}

		});

		port.postMessage({
			from: 'devtools',
			action: 'start',
			tabId: chrome.devtools.inspectedWindow.tabId
		});
		onStart(doc);

		port.onDisconnect.addListener(function() {
			onStop(doc);
		});

	}, false);

	doc.getElementById('stop_button').addEventListener('click', function() {
		port.postMessage({
			from: 'devtools',
			action: 'stop',
			tabId: chrome.devtools.inspectedWindow.tabId
		});
		onStop(doc);
	}, false);

	doc.getElementById('clear_button').addEventListener('click', function() {
		doc.getElementById('out').textContent = '';
	}, false);

}

function constructId(name, id) {
	return name + '_' + id;
}

var isRunning = true;

function onStart(doc) {
	if (isRunning) {
		return;
	}
	isRunning = true;
	doc.body.classList.add('started');
	doc.getElementById('start_button').textContent = 'Started';
	doc.getElementById('start_button').disabled = true;
}

function onStop(doc) {
	if (!isRunning) {
		return;
	}
	isRunning = false;
	doc.body.classList.remove('started');
	doc.getElementById('start_button').textContent = 'Start';
	doc.getElementById('start_button').disabled = false;

	var hr = doc.createElement('hr');
	doc.getElementById('out').appendChild(hr);
}
