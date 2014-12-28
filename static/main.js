var ws, WebSocketURL = "ws://" + location.hostname+(location.port ? ':'+location.port: '') + "/chat";

var entityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
};

function escapeHtml(string) {
	return String(string).replace(/[&<>"'\/]/g, function(s) {
		return entityMap[s];
	});
}

function appandChatBox(from, text) {
	$(document).ready(function() {
		var html = "<b>" + from + "</b> " + text + "<br>"
		$('#chatbox').append(html);
		$('#chatbox').scrollTop($('#chatbox')[0].scrollHeight);
	});
}

function openWS() {
	$(document).ready(function() {
		ws = new WebSocket(WebSocketURL);
		ws.onmessage = function(e) {
			var data = JSON.parse(e.data);
			appandChatBox(escapeHtml(data.author), escapeHtml(data.message))
			if (data.author != $('#username').val()) {
				document.getElementsByTagName("audio")[0].play();
			}
		};
		ws.onclose = function(e) {
			setTimeout(function() {
				openWS()
			}, 2000);
		};
	});
}

function sendMessage() {
	$(document).ready(function() {
		var data = {
			author: $('#username').val(),
			message: $('#message').val()
		};
		if (data.author && data.message) {
			ws.send(JSON.stringify(data));
			$("#message").val("");
		}
	});
}
window.onload = function() {
	if ("WebSocket" in window) {
		appandChatBox("[SYSTEM]", "Pick a username and start sending out messages.")
		openWS();
	} else {
		appandChatBox("[SYSTEM]", "<span style='color:red;'>Websockets are NOT supported from your Browser!!!</span>")
	}
}
