package server.networking;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class ServerThread {
    private Socket socket;
    private Server mainServer;
    public ServerThread(Socket socket, Server mainServer){
        this.socket=socket;
        this.mainServer=mainServer;
        new Thread(null, null, "Server thread", 1<<18) {
            public void run() {
                runClient();
            }
        }.start();
    }

    public void runClient(){
        try {
            PrintWriter toClient=new PrintWriter(socket.getOutputStream());
            BufferedReader fromClient=new BufferedReader(new InputStreamReader(socket.getInputStream()));
            while (!mainServer.serverClosing()) {
                //TODO: read input from client

                //TODO: send data to client

            }
        }
        catch(Exception e) {
            e.printStackTrace();
        }
        finally {
            //TODO: Close socket stuff
            try {
                socket.close();
            } catch (IOException e) {
                System.out.println("Could not close socket...");
                e.printStackTrace();
            }
        }
    }
}
