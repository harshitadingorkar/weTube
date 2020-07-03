// CONNECTION TO SERVER
var socket = io.connect('http://localhost:3000');

// GLOBAL VARIABLES
var player;
var currentPlaybackTime;
var videoId;

// GET URL PARAMS AND SET INITIAL VIDEOID
var urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('vid')) {
    var url = urlParams.get('vid');
    var vidQuery = matchYoutubeVidID(url);
    videoId = vidQuery[1];
    if (videoId == null || videoId == "") {
        alert('Not a valid Youtube URL');
        videoId = 'XqjWidsMhvM';
    }
} else {
    videoId = "XqjWidsMhvM";
}

// YOUTUBE API FUNCTIONS
function onPlayerReady(event) {
    // event.target.playVideo(0);
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: $('#player-container').height(),
        width: $('#player-container').width(),
        videoId: videoId,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.BUFFERING) {
        currentPlaybackTime = player.getCurrentTime();
        socket.emit('video', {
            message: "buffering",
            timeStamp: parseInt(currentPlaybackTime),
            videoId: videoId
        });
    }
}

// SYNCHRONOUS PLAY BUTTON
$('#btn-play').click(function () {
    if (player.getPlayerState() == 1) {
        pauseVideo();
        currentPlaybackTime = player.getCurrentTime();
        sendPauseToServer();
    } else {
        currentPlaybackTime = player.getCurrentTime();
        playVideo(currentPlaybackTime);
        sendPlayToServer();
    }
});

// CHANGE THE VIDEO ID FOR ALL CLIENTS SYNCHRONOUSLY
$('#btn-url-submit').click(function () {
    var videoURL = $('#video-url').val().trim();
    if (videoURL != "") {
        var vidQuery = matchYoutubeVidID(videoURL);
        if (videoId != vidQuery[1]) {
            videoId = vidQuery[1];
            player.loadVideoById(videoId);
            sendPlayToServer();
        } else {
            alert("This video is currently streaming");
        }
    } else {
        alert("This is not a valid Youtube URL (maybe it contains a timestamp at the end)");
    }
});

// CHAT
$('#btn-chat-send').click(function () {
    sendMessageToServer();
});
$('#chat-message').keypress(function (e) {
    if (e.keyCode == 13) { // if ENTER is pressed
        sendMessageToServer();
    } else {
        sendTypingEventToServer();
    }
});

// LISTENING TO EVENTS
var feedback = document.getElementById('typing-feedback');
socket.on('typing', function (data) {
    displayTypingEvent(data)
});

socket.on('chat', function (data) {
    feedback.innerHTML = ""; // clear typing feedback
    addTextMessageToChatBox(data);
});

socket.on('video', function (data) {
    if (data.message == "play") {
        $('#btn-play-icon').attr('class', "glyphicon glyphicon-pause");
        if (videoId != data.videoId) {
            videoId = data.videoId;
            player.loadVideoById(videoId);
        }
        currentPlaybackTime = data.timeStamp;
        playVideo(currentPlaybackTime);
    }
    else if (data.message == "pause") {
        $('#btn-play-icon').attr('class', "glyphicon glyphicon-play");
        videoId = data.videoId;
        currentPlaybackTime = data.timeStamp;
        pauseVideo();
    }
    else if (data.message == "buffering") {
        videoId = data.videoId;
        currentPlaybackTime = data.timeStamp;
        player.seekTo(currentPlaybackTime);
    }
});

// HELPERS
function playVideo(currentTime) {
    player.playVideo();
    player.seekTo(currentTime);
}

function pauseVideo() {
    player.pauseVideo();
}

function stopVideo() {
    player.stopVideo();
}

function scrollToBottom() {
    var height = 0;
    $('div p').each(function (i, value) {
        height += parseInt($(this).height());
    });
    height += '';
    $('div').animate({ scrollTop: height });
}

function sendMessageToServer() {
    chatMessage = $('#chat-message').val();
    if (chatMessage != '') {
        socket.emit('chat', {
            message: $('#chat-message').val(),
            username: $('#username').val()
        });
    }
    document.getElementById('chat-message').value = '';
}

function sendPauseToServer() {
    socket.emit('video', {
        message: "pause",
        timeStamp: parseInt(currentPlaybackTime),
        videoId: videoId
    });
}

function sendPlayToServer() {
    socket.emit('video', {
        message: "play",
        timeStamp: parseInt(currentPlaybackTime),
        videoId: videoId
    });
}

function displayTypingEvent(username) {
    feedback.innerHTML = '<p><em>' + username + ' is typing...</em></p>';
}

function addTextMessageToChatBox(data) {
    var chatField = document.getElementById('chat-field');
    chatField.innerHTML += '<p><strong>' + data.username + ': </strong> ' + data.message + '</p>';
    scrollToBottom();
}

function sendTypingEventToServer() {
    socket.emit('typing', $('#username').val());
}

function matchYoutubeVidID(videoURL) {
    return videoURL.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
}
