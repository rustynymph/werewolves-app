var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var connectedUsers = [];
var minimumUsers = 4;
var gameReady = false;
var roles = ["seer", "werewolf", "werewolf"]

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('name entered', function(msg){
    var newUser = new Player(msg, socket.request.connection.remoteAddress);
    connectedUsers.push(newUser);
    console.log(connectedUsers);
    io.emit('new user', msg);
    if (connectedUsers.length >= minimumUsers) {
      assignRoles();
      gameReady = true;
      io.emit('ready', msg);
  }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function assignRoles() {
  var unassignedUsers = connectedUsers; 
  var seerIndex = Math.floor(Math.random() * unassignedUsers.length);
  unassignedUsers[seerIndex].setRole("seer");
  unassignedUsers.splice(seerIndex, 1);
  var werewolf1Index = Math.floor(Math.random() * unassignedUsers.length);
  unassignedUsers[werewolf1Index].setRole("werewolf");
  unassignedUsers.splice(werewolf1Index, 1);
  var werewolf2Index = Math.floor(Math.random() * unassignedUsers.length);
  unassignedUsers[werewolf2Index].setRole("werewolf");
  unassignedUsers.splice(werewolf2Index, 1);
  for (var i = 0; i < unassignedUsers.length; i++){
    unassignedUsers[i].setRole("villager");
  }
  unassignedUsers = [];
  for (var p = 0; p < connectedUsers.length; p++) {
    console.log(connectedUsers[p].role)
  }
}

function Player(name, address) {
  this.name = name;
  this.address = address;
  this.role = null;
  this.alive = true;

  this.setRole = function (role) {
    this.role = role;
  };
}