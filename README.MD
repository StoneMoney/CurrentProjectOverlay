# CurrentProjectTracker
Node.js/websocket based overlay controller for use with displaying information about your current project such as name, recipient, ETA. For use by creative & other twitch streamers.

## Getting started

Dependencies:
* Node.js & npm (6 recc)
* [npm ws](https://www.npmjs.com/package/ws)
* [npm glob](https://www.npmjs.com/package/glob)
* [npm opn](https://www.npmjs.com/package/opn)
* [npm fs-extra](https://www.npmjs.com/package/fs-extra)
Just use ``npm install`` to get everything needed.

controller.html is the controller where you can add, remove, spin, and view the prompts.

overlay.html is front-end visual graphics of the wheel including sound and animations.

Server.js is the websocket server which passes along the strings, and also stores them locally. Runs default on port 8080

To start the server run ``node main.js`` or ``npm start``

To compile the server into an exe: ``pkg --output CurrentProjectTracker.exe --targets node6-win-x86 main.js``

## Todo & Future features
* Active counting timer
* macOS & Linux support
