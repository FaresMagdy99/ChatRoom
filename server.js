const express = require('express');
const path = require('path');
const http = require('http');
var SocketIOFileUpload = require('socketio-file-upload');
const socketio = require('socket.io');
const formatMsg = require('./functions/msgFormat');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./functions/users');
const multer = require('multer');
const req = require('express/lib/request');
const uuid = require('uuid').v4;
const fs = require('fs');
const mongoose=require('mongoose');
const Msg=require('./models/messages');
const moment = require('moment');
const mongoDB='mongodb+srv://abdelrahman:mohamed1234@cluster0.lfhcr.mongodb.net/message-database?retryWrites=true&w=majority';

var latestVoice;
var msgs = [];
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        const { originalname } = file;
        latestVoice = originalname
        // fs.open(`./uploads/${originalname}`, 'w', function (err, file) {
        //     if (err) throw err;
        //     console.log('Saved!');
        //   });
        cb(null, `${originalname}`);

    }
});

const upload = multer({ storage });



const app = express();
const server = http.createServer(app);
const io = socketio(server);

var latestIMG;


// middleware as an entry point to __dirname/frontend/index.html using PATH
app.use(SocketIOFileUpload.router).use(express.static(path.join(__dirname, 'frontend')));

mongoose.connect(mongoDB).then(()=>{

    console.log("connected")
}).catch(err=>console.log(err))


io.on('connection', socket => {
    //console.log("New client is connected...");

    Msg.find().then(result=>{
        socket.emit('output-message',result)
    })

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        socket.emit('message', formatMsg('Bot', 'Welcom to CC431'));
        socket.broadcast.to(user.room).emit('message', formatMsg('Bot', `${user.username} joined`));
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });


    socket.on('chatMessage', msg => {
        //console.log(msg);
        const user = getCurrentUser(socket.id);

        


        const message=new Msg({msg:msg,U_user:user.username,time:moment().format('h:mm a')})
        message.save().then(()=>{
            io.to(user.room).emit('message', formatMsg(user.username, msg));
        })
        msgs.push(formatMsg(user.username, msg));
        console.log(msgs);


    });

    socket.on('voiceSent', msg => {
        //console.log(msg);
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('file', formatMsg(user.username, msg));


    });

    var uploader = new SocketIOFileUpload();
    uploader.dir = "./uploads";
    uploader.listen(socket);

    uploader.on("saved", function (event) {
        console.log(event.file);
        event.file.clientDetail.name = event.file.name;
        latestIMG = event.file.name
        socket.broadcast.emit('file', formatMsg('Bot', `${event.file.name}`));
    });

    // Error handler:
    uploader.on("error", function (event) {
        console.log("Error from uploader", event);
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {  //////////////////
            io.to(user.room).emit('message', formatMsg('Bot', `${user.username} has left the room`));
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

    });

});


app.get('/downloadi', function (req, res) {

    var img = fs.readFileSync(`${__dirname}/uploads/${latestIMG}`, 'base64');
    res.end(img);

});
app.get('/downloadtxt', function (req, res) {

    const file = `${__dirname}/uploads/${latestIMG}`;
    res.download(file);
});
app.get('/downloadvc', function (req, res) {

    var img = fs.readFileSync(`${__dirname}/uploads/${latestVoice}`, 'base64');
    
    res.end(img);
    
});
app.get('/downloadvideo', function (req, res) {

    var vid = fs.readFileSync(`${__dirname}/uploads/${latestIMG}`, 'base64');
    res.end(vid);

});
app.post('/', upload.single('audio_data'), (req, res) => {

    return res.json({ status: 'OK', filename: `${latestVoice}` });

});



const PORT = 8080;
server.listen(PORT, () => console.log(`Server running in port ${PORT}`));