var timeout_id = 0;
var interval_id = 0;

set_timeout_button.onclick = function() {
	timeout_id = setTimeout(function foo() {
		console.log('setTimeout');
	}, 1000);
};

set_interval_button.onclick = function() {
	interval_id = setInterval(function foo() {
		console.log('setInterval');
	}, 1000);
};

clear_timeout_button.onclick = function() {
	clearTimeout(timeout_id);
};

clear_interval_button.onclick = function() {
	clearInterval(interval_id);
};
