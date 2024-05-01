/**
 * port:  port server
 * host: host server
 * username: username for authentication
 * password: username's password for authentication
 * events: this parameter determines whether events are emited.
 **/
var manager = require('asterisk-manager');

var ami = new manager(9039, 'localhost', 'user', 'password', true);

// In case of any connectiviy problems we got you coverd.
ami.keepConnected();

let events = ['OriginateResponse', 'Hangup', 'DialEnd', 'DialBegin'];
ami.on("hangup", (event) => {
  if (events.indexOf(event.event) >= 0) {
    console.log(Date.now() / 1000);
    console.log(event);
    console.log("#############################################");
  }
});

ami.action({
  'action': 'originate',
  'channel': 'SIP/undefined_t2/03+7XXXXXXXXXX',
  'context': 'default',
  'exten': 's',
  'priority': 1,
  'callerid': "+7XXXXXXXXXX",
  'account': '2',
  'async': 'true',
  'variable': {
    "soundfile": "004b3cbff1e4ac40f58b2ef88fd25891"
  }
}, (err, res) => {
  console.log("originate:");
  console.error(err);
  console.log(res);
});