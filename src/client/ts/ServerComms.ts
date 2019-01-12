declare function io();

export class ZIRServerCommunications{
    public registerServerListener() {
        var socket = io();
        socket.emit('login');
        socket.on('message', function(data) {
            console.log(data);
        });
    }
}