
const socket = io();
const chatform = document.getElementById('chat-form');
const chatMsg = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

//console.log(username,room);

var sendvoice = document.getElementById('sendvoice');
socket.emit('joinRoom', { username, room });

socket.on('roomUsers', ({ room, users }) => {

    room_out_dom(room);
    user_out_dom(users);

});

socket.on('message', message => {
    console.log(message);
    msg_out_domm(message);

    //scroll down
    chatMsg.scrollTop = chatMsg.scrollHeight;
});

socket.on('output-message', message => {
    console.log(message);

    var len = message.length;
    console.log(len);

    if (len) {
        message.forEach(e => {
            msg_out_dom(e)
        });
    }
    chatMsg.scrollTop = chatMsg.scrollHeight;

});

socket.on('file', message => {
    console.log(message);
    file_msg_out_dom(message);

    //scroll down
    chatMsg.scrollTop = chatMsg.scrollHeight;
});

chatform.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    //console.log(msg);
    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

function voiceSent() {
    console.log('hi from vs');
    var msg = 'voice';
    socket.emit('voiceSent', msg);

}


function msg_out_dom(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.U_user} <span>${message.time}</span></p>
     <p class="text">
         ${message.msg}
     </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}


function msg_out_domm(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
     <p class="text">
         ${message.text}
     </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

function file_msg_out_dom(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    var msgstr = message.text;
    var x = msgstr.substring(msgstr.length - 4);

    if (x == ".jpg" || x == ".png" || x == "jpeg") {
        div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">
            ${message.text}
        </p> 
        <br>
        <button id="downloadbtn"
        onclick="downi();">Download</button> `;
        document.querySelector('.chat-messages').appendChild(div);
    }
    else if (x == ".mp4") {
        div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">
            ${message.text}
        </p> 
        <br>
        <button id="downloadbtn"
        onclick="downvid();">Download</button> `;
        document.querySelector('.chat-messages').appendChild(div);
    }
    else if (x == ".txt") {
        div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">
            ${message.text}
        </p>
        <br>
        <button id="downloadbtn"
        onclick="downtxt();">Download</button> `;
        document.querySelector('.chat-messages').appendChild(div);
    }
    else {
        div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">
            ${message.text}
        </p> 
        <br>
        <button id="downloadbtn"
        onclick="downvc();">Download</button> `;
        document.querySelector('.chat-messages').appendChild(div);
    }
    // div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    // <p class="text">
    //     ${message.text}
    // </p> <button id="downloadbtn"
    // onclick="downi();">Download image</button> <button id="txtdownloadbtn"
    // onclick="downtxt();">Download txt file</button> <button id="vcdownloadbtn"
    // onclick="downvc();">Download voice msg</button> <button id="vddownloadbtn"
    // onclick="downvid();">Download vid</button>`;
    // document.querySelector('.chat-messages').appendChild(div);
}
// var downloadExists = !!document.getElementById("downloadbtn");
// if (downloadExists) {
//     var downloadbtn = document.getElementById("downloadbtn");
//     downloadbtn.addEventListener("click", down);
// }

function downi() {

    var xhr = new XMLHttpRequest();
    xhr.onload = function (e) {
        if (this.readyState === 4) {
            console.log("Server returned: ", e.target.responseText);

            ////////////
            const div = document.createElement('div');
            div.classList.add('message');
            img = document.createElement('img');
            img.src = "data:image/png;base64," + xhr.responseText;
            img.setAttribute("style", "width:300px;height:300px");
            div.appendChild(img);
            document.querySelector('.chat-messages').appendChild(div);
            chatMsg.scrollTop = chatMsg.scrollHeight;
        }
    };

    xhr.open("GET", "/downloadi", true);
    xhr.send();
    console.log('hi from down');
}

function downtxt() {

    var xhr = new XMLHttpRequest();
    xhr.onload = function (e) {
        if (this.readyState === 4) {
            console.log("Server returned: ", e.target.responseText);

            ////////////
            const div = document.createElement('div');
            div.classList.add('message');
            div.innerHTML = `${xhr.responseText}`
            document.querySelector('.chat-messages').appendChild(div);
            chatMsg.scrollTop = chatMsg.scrollHeight;
        }
    };

    xhr.open("GET", "/downloadtxt", true);
    xhr.send();
    console.log('hi from down');
}

function downvc() {

    var xhr = new XMLHttpRequest();
    xhr.onload = function (e) {
        if (this.readyState === 4) {
            console.log("Server returned: ", e.target);

            ////////////
            const div = document.createElement('div');
            div.classList.add('message');
            div.innerHTML = ` <audio controls>
            <source src="data:audio/wav;base64,${xhr.responseText}" type="audio/wav">
            
          Your browser does not support the audio element.
          </audio>`
            document.querySelector('.chat-messages').appendChild(div);
            chatMsg.scrollTop = chatMsg.scrollHeight;
        }
    };



    xhr.open("GET", "/downloadvc", true);
    xhr.send();
    console.log('hi from down');
}

function downvid() {

    var xhr = new XMLHttpRequest();
    xhr.onload = function (e) {
        if (this.readyState === 4) {
            console.log("Server returned: ", e.target);

            ////////////
            const div = document.createElement('div');
            div.classList.add('message');
            div.innerHTML = ` <video width="320" height="240" controls>
            <source src="data:video/mp4;base64,${xhr.responseText}" type="video/mp4">
            
            Your browser does not support the video tag.
          </video>`
            document.querySelector('.chat-messages').appendChild(div);
            chatMsg.scrollTop = chatMsg.scrollHeight;
        }
    };



    xhr.open("GET", "/downloadvideo", true);
    xhr.send();
    console.log('hi from down');
}


function room_out_dom(room) {

    roomName.innerText = room;

}

function user_out_dom(users) {

    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;

}