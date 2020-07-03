// DEPENDENCIES
var express = require("express"); // loading dependency (express) from node_modules
var socket = require("socket.io")

// SETUP APP AND SERVER
var app = express(); // App setup
var server = app.listen(3000, function () {
  console.log('Live and listening to requests on Port 3000');
});

// ROUTING AND PATH DEFINITION
var router = express.Router(); // built-in middle layer ExpressJS Routing service
var path = __dirname + '/public/';

// STATIC FILES
app.use(express.static('public')); // app will serve anything that is in this static folder to the client (browser)

// SOCKET SETUP
var io = socket(server);

// LISTENING TO INCOMING EVENTS
io.on('connection', function (socket) {
  console.log("Socket connection established. Socket ID: ", socket.id);
  socket.on('video', function(data) {
    io.sockets.emit('video', data); // sockets referring to all connected sockets
  });
  socket.on('chat', function(data) {
    io.sockets.emit('chat', data); // send to all clients and to the source client as well
  });
  socket.on('typing', function(data) {
    socket.broadcast.emit('typing', data); // broadcast to all other clients 
  });
});

// MIDDLE LAYER / ROUTER HANDLER
router.use(function (req, res, next) {
  // console.log("/" + req.method);
  next(); // once the middle layer is defined, execute the next router
});

// HOMEVIEW
router.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html"); // send files to web browser via built-in ExpressJS function
});

// SEARCH FOR YOUTUBE VIDEOS
router.get("/search", function (req, res) {
  function searchListByKeyword(auth, requestData) {
    var service = google.youtube('v3');
    var parameters = removeEmptyParameters(requestData['params']);
    parameters['auth'] = auth;
    service.search.list(parameters, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      console.log(response);
      res.send(response);
    });
  }
  
  //See full code sample for authorize() function code.
  authorize(JSON.parse(content), {'params': {'maxResults': '25',
                   'part': 'snippet',
                   'q': 'surfing',
                   'type': ''}}, searchListByKeyword);
});

// DEPRECATED POST REQUEST
router.post("/play", function (req, res) {
  // post to all clients here
  res.send("success");
});

// APP HANDLER
app.use("/", router); // tell ExpressJS to use the routers we have defined above

// the routers are assigned in order so we can catch here all incoming requests but will not catch any of the above defined ones
app.use("*", function (req, res) {
  res.sendFile(path + "404.html"); // if incoming request is not matching any route
});