var start = Date.now();


process.on('message', function(packet) {
    console.log("got message from mr. Rabbit");
    process.send({
      type : 'process:msg',
      data : {
        success : true
      }
  });
});