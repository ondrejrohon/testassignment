## Requirements

- Ubuntu 22 machine

## Installation & running prod version

1. Install Node 18 by running: `curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -` following `sudo apt install nodejs -y`
2. Clone this repo, make sure node 18 is installed
3. Run `npm install`
4. Run `npm run server` to start server app
5. Run `npm run client` to start as many clients app as you want
6. Follow instructions on screen

## Using IPC

- run server or client with USE_SOCKET=1 env variable to use unix socket instead of port
- for example `USE_SOCKET=1 npm run server`

## How to develop

1. insall dependencies same as in previous section
2. run `npm run dev:client` to start client in watch mode
3. run `npm run dev:server` to start server in watch mode
