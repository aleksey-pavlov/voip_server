var pm2 = require('pm2');


pm2.connect(function(err) {
  

      pm2.sendDataToProcessId(0, {
          type : 'process:msg',
          data : {
            some : 'data',
            hello : true
          },
          topic: "my topic" 
        },
        function(err, res) {
          console.log(err);
          console.log("message sent");

        });

        pm2.launchBus(function(err, bus) {
          bus.on('process:msg', function(packet) {
            
            console.log(packet);
            
            pm2.disconnect();
          });
        });
  });
