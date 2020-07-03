# WeTube
Node Application which allows to share videos from Youtube and watch them synchronously with remote controls across all clients using the concept of Sockets. Contains real-time chatroom to enable various clients to interact with each other while watching the video.
### Prerequisites

- Make sure [Node.js](https://nodejs.org/en/ "Node JS Homepage") is installed

### Installing/Compilation

Clone the project or unzip it on your local machine. After that navigate to the folder

`cd WeTube`

and start the node application with

`npm start`

You can read in the log 
> Live and listening to requests on Port 3000

and open the client application from your browser by typing 

`localhost:3000`

## Usage

You can do the following actions synchronously over all connected clients:

- Using the Progressbar on the embedded Youtube iFrame to fast forward to a specific point in the video
- Clicking the Play/Pause button on the left sidebar to remotely play/pause the video across all clients
- Submitting a new Youtube video by pasting the URL of this particular video into the input field at the top of the sidebar and clicking the Submit-Button
- Submitting a new Youtube video by passing it as URL parameter like this `localhost:3000/?vid=<URL here>`

