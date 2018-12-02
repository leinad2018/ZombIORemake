package server.networking;

import java.net.ServerSocket;
import java.net.Socket;

public class Server {
    private static final int SERVER_PORT = 25555;

    private int maxPlayers;
    private volatile int curPlayers;
    private ServerSocket serverSocket;
    private boolean shouldClose;

    public Server(int playerMax){
        maxPlayers = playerMax;
        curPlayers = 0;
        shouldClose = false;
        new Thread(null,null, "Server Connection Thread", 1<<18){
            public void run(){
                runServer();
            }
        }.start();
    }

    /**
     * Creates a new thread for every client that connects to the server
     */
    private void runServer(){
        try {
            System.out.println("Starting server on port "+SERVER_PORT+"...");
            serverSocket=new ServerSocket(SERVER_PORT);
            while (!shouldClose) {
                if (curPlayers>=maxPlayers) {
                    Thread.sleep(100);
                }
                else {
                    System.out.println("Waiting for client to join...");
                    Socket socket=serverSocket.accept();
                    System.out.println("Someone joined!");
                    ServerThread newThread=new ServerThread(socket, this);
                    curPlayers++;
                }
            }
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    public boolean serverClosing(){
        return shouldClose;
    }
}
