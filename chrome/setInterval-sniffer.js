(function() {

	var originalSetTimeout = window.setTimeout;
	var originalSetInterval = window.setInterval;
	var originalClearInterval = window.clearInterval;
	var originalClearTimeout = window.clearTimeout;

	function post(data) {
		data.timer_watcher = true;
		window.postMessage(data, '*');
	}


	function enable() {
		window.setTimeout = function(fn, time) {
			var id = originalSetTimeout(fn, time);
			post({
				functionName: 'setTimeout',
				fn: fn.toString(),
				id: id,
				time: time
			});
			return id;
		};

		window.setInterval = function(fn, time) {
			var id = originalSetInterval(fn, time);
			post({
				functionName: 'setInterval',
				fn: fn.toString(),
				id: id,
				time: time
			});
			return id;
		};

		window.clearInterval = function(id) {
			var result = originalClearInterval(id);
			post({
				functionName: 'clearInterval',
				id: id
			});
			return result;
		};

		window.clearTimeout = function(id) {
			var result = originalClearTimeout(id);
			post({
				functionName: 'clearTimeout',
				id: id
			});
			return result;
		}
	}



	function disable() {
		window.setTimeout = originalSetTimeout;
		window.setInterval = originalSetInterval;
		window.clearInterval = originalClearInterval;
		window.clearTimeout = originalClearTimeout;
	}


	function prettyStackTrace(callSites) {
		var result = [];
		for (var i = 0; i < callSites.length; i++) {
			var item = callSites[i];
			var fn = item.getFunction();
			var last = {
				function: fn.toString() || '',
				args: [].slice.call(fn.arguments, 0),
				methodName: item.getMethodName() || '',
				functionName: item.getFunctionName() || '',
				name: fn.name,
				fileName: item.getFileName() || (item.isEval() ? item.getEvalOrigin() : item.isNative() ? 'native' : 'unknown'),
				lineNumber: item.getLineNumber() - 1,
				columnNumber: item.getColumnNumber()
			};
			result.push(last);
			if (!last.fileName) {
				debugger;
			}
		}
		return result;
	}


	function prepareStack(constructor) {
		var _Error_prepareStackTrace = Error.prepareStackTrace;
		Error.prepareStackTrace = function(error, stack) {
			return stack;
		};
		var error = new Error();
		Error.captureStackTrace(error, constructor);
		Error.prepareStackTrace = _Error_prepareStackTrace;
		var stack = prettyStackTrace(error.stack);
		stack.unshift({
			isTop: true,
			functionName: constructor.name,
			data: Date.now()
		});
		return stack;
	}


	window.addEventListener('message', function(e) {
		var data = e.data;
		if (data && data.from === 'Timer Watcher Content Script') {
			console.info(data.action);
			if (data.action === 'start') {
				enable();
			} else if (data.action === 'stop') {
				disable();
			}
		}
	}, false);


})();
