var connection = new WebSocket("ws://10.37.122.104:25555");
connection.onopen = function(){
    console.log("connected to server");
}
connection.onmessage = function(message){
    console.log(message);
}