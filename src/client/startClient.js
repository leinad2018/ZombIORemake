var connection = new WebSocket("ws://127.0.0.1:25555");
connection.onopen = function(){
    console.log("connected to server");
}