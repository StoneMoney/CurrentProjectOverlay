console.log("Running CurrentProjectOverlay v1 [@ngiano]! Close this window or press Ctrl+C when you are finished");
const http = require('http'),
	WebSocket = require('ws'),
	path = require("path"),
	fs = require('fs-extra'),
	opn = require("opn"),
	glob = require("glob")
const wss = new WebSocket.Server({ port: 8082 });
var controller = path.join(__dirname, '/controller.html')
var loadModule = path.join(__dirname, '/loadproject.html')
var newModule = path.join(__dirname, '/newproject.html')
var overlay = path.join(__dirname, '/overlay.html')
var projectTemplate = path.join(__dirname, '/project-template.json')
var globalConfig = path.join(__dirname, '/global-config-default.json')
const baseFolder = process.env.APPDATA+'\\CurrentProjectOverlay';
const projectFolder = process.env.APPDATA+'\\CurrentProjectOverlay\\projects';
if (!fs.existsSync(baseFolder)){
    fs.mkdirSync(baseFolder);
}
if (!fs.existsSync(projectFolder)){
    fs.mkdirSync(projectFolder);
}
if (!fs.existsSync(baseFolder+"\\global-config.json")){
    fs.copySync(globalConfig,baseFolder+"\\global-config.json");
}
function restoreToDefault() {
	fs.copySync(globalConfig,baseFolder+"\\global-config.json");
}
fs.copySync(overlay,baseFolder+"\\overlay.html");
fs.copySync(loadModule,baseFolder+"\\loadproject.html");
fs.copySync(newModule,baseFolder+"\\newproject.html");
fs.copySync(controller,baseFolder+"\\controller.html");
opn(baseFolder+"\\controller.html");
var pattern1 = "^saveproject (.*)";
var re1 = new RegExp(pattern1,'i');
var pattern2 = "^saveprojectandload (.*)";
var re2 = new RegExp(pattern2,'i');
var pattern3 = "^setcurrentproject (.*)"
var re3 = new RegExp(pattern3, 'i');
var pattern4 = "^saveglobalconfig (.*)"
var re4 = new RegExp(pattern4, 'i');
var pattern5 = "^deleteproject (.*)"
var re5 = RegExp(pattern5, 'i');
wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
		if(message == "opendatafolder") {
			opn(projectFolder);
		}
		if(message == "dash-requesting-config") {
			fs.readFile(baseFolder+"/global-config.json", function (err, jsonFile) {
				if(!err) {
					var parsedFile = JSON.parse(jsonFile);
					var stringFile = JSON.stringify(parsedFile);
					wss.clients.forEach(function each(client) {
						client.send("loadglobalconfigdash "+stringFile);
					});
				}
			});
		}
		if(message == "dash-requesting") {
			fs.readFile(baseFolder+"/global-config.json", function (err, jsonFile) {
				if(!err) {
					var parsedFile = JSON.parse(jsonFile);
					var stringFile = JSON.stringify(parsedFile);
					wss.clients.forEach(function each(client) {
						client.send("loadglobalconfigdash "+stringFile);
						client.send("location "+baseFolder);
					});
				}
			});
			glob(projectFolder+"/*.json", function (er, files) {
				files.forEach(function(matchingFile) {
						fs.readFile(matchingFile, 'utf8', function(err, data){
							if(!err) {
								if(isProperJSON(data)) {
									var parseFile = JSON.parse(data);
									wss.clients.forEach(function each(client) {
										client.send("existingproject "+parseFile['filename']);
									});
								}
								function isProperJSON(str) {
									try {
										JSON.parse(data);
									} catch(err) {
										return false
									}
									return true;
								}
							}
						});
				});
			});
		}
		if(message == "overlay-requesting") {
			fs.readFile(baseFolder+"/global-config.json", function (err, jsonFile) {
				if(!err) {
					var parsedFile = JSON.parse(jsonFile);
					var stringFile = JSON.stringify(parsedFile);
					wss.clients.forEach(function each(client) {
						client.send("loadglobalconfigoverlay "+stringFile);
					});
				}
			});
			fs.readFile(projectFolder+"/current-project.star", function (err, jsonFile) {
				if(!err) {
					var parsedFile = JSON.parse(jsonFile);
					var stringFile = JSON.stringify(parsedFile);
					wss.clients.forEach(function each(client) {
						client.send("loadprojectoverlay "+stringFile);
					});
				}
			});
		}
		if(message == "module-requesting") {
			fs.readFile(projectFolder+"/current-project.star", function (err, jsonFile) {
				if(!err) {
					var parsedFile = JSON.parse(jsonFile);
					var stringFile = JSON.stringify(parsedFile);
					wss.clients.forEach(function each(client) {
						client.send("loadprojectmodule "+stringFile);
					});
				}
			});
		}
		if(message == "restoretodefault") {
			restoreToDefault();
			wss.clients.forEach(function each(client) {
				client.send("reload");
			});
		}
		if(re1.test(message)) {
			var matches = message.match(pattern1);
			var projectJSON = JSON.parse(matches[1]);
			fs.writeFile(projectFolder+'/'+projectJSON['filename'], JSON.stringify(projectJSON), function (err) {
				if (err)  console.log('Error: ', err);
			});
		}
		if(re2.test(message)) {
			var matches = message.match(pattern2);
			var projectJSON = JSON.parse(matches[1]);
			fs.writeFile(projectFolder+'/'+projectJSON['filename'], JSON.stringify(projectJSON), function (err) {
				if (err)  console.log('Error: saveandload to project file', err);
			});
			fs.writeFile(projectFolder+'/current-project.star', JSON.stringify(projectJSON), function (err) {
				if (err)  console.log('Error saveandload to current project: ', err);
			});
			wss.clients.forEach(function each(client) {
				client.send("reload");
				client.send("loadprojectmodule");
			});
		}
		if(re3.test(message)) {
			var matches = message.match(pattern3);
			fs.readFile(projectFolder+"/"+matches[1]+".json", function (err, jsonFile) {
				if(!err) {
					var parsedFile = JSON.parse(jsonFile);
					var stringFile = JSON.stringify(parsedFile);
					fs.writeFile(projectFolder+"/current-project.star", stringFile, function (err) {
						if (err) console.log("err:", err);
						wss.clients.forEach(function each(client) {
							client.send("reload");
						});
					});
				}
			});
		}
		if(re4.test(message)) {
			var matches = message.match(pattern4);
			var projectJSON = JSON.parse(matches[1]);
			fs.writeFile(baseFolder+'/global-config.json', JSON.stringify(projectJSON), function (err) {
				if (err)  console.log('Error save global config: ', err);
			});
			wss.clients.forEach(function each(client) {
				client.send("reload");
			});
		}
		if(re5.test(message)) {
			var matches = message.match(pattern5);
			fs.unlink(projectFolder+'/'+matches[1], function (err) {
				if (err)  console.log('Error deleting project:', err);
			});
			fs.copySync(projectTemplate,projectFolder+"/current-project.star")
			wss.clients.forEach(function each(client) {
				client.send("reload");
				client.send("resetmodule");
			});
		}
	});
});