import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.io.File;
import java.nio.file.Files;
import java.net.InetSocketAddress;

public class FaceDetectionServer {
    public static void main(String[] args) throws IOException {
        int port = 8000;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        
        // Serve static files from current directory
        server.createContext("/", new StaticFileHandler());
        
        server.setExecutor(null); // creates a default executor
        System.out.println("Java Server started on port " + port);
        System.out.println("Open http://localhost:" + port + " in your browser.");
        server.start();
    }

    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException {
            String root = ".";
            String uri = t.getRequestURI().getPath();
            if (uri.equals("/")) uri = "/index.html";
            
            File file = new File(root + uri).getCanonicalFile();
            
            // Security check to prevent directory traversal
            if (!file.getPath().startsWith(new File(root).getCanonicalPath())) {
                String response = "403 (Forbidden)\n";
                t.sendResponseHeaders(403, response.length());
                OutputStream os = t.getResponseBody();
                os.write(response.getBytes());
                os.close();
                return;
            }

            if (!file.isFile()) {
                String response = "404 (Not Found)\n";
                t.sendResponseHeaders(404, response.length());
                OutputStream os = t.getResponseBody();
                os.write(response.getBytes());
                os.close();
            } else {
                // Set content type
                String mime = "text/plain";
                if (uri.endsWith(".html")) mime = "text/html";
                else if (uri.endsWith(".css")) mime = "text/css";
                else if (uri.endsWith(".js")) mime = "application/javascript";
                
                t.getResponseHeaders().set("Content-Type", mime);
                t.sendResponseHeaders(200, file.length());
                OutputStream os = t.getResponseBody();
                Files.copy(file.toPath(), os);
                os.close();
            }
        }
    }
}
