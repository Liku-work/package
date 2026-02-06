import socket
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Preferred ports
PORT_PRIMARY = 4000
PORT_FALLBACK = 3960

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

# Select port
if is_port_in_use(PORT_PRIMARY):
    print(f"Port {PORT_PRIMARY} is in use.")
    if is_port_in_use(PORT_FALLBACK):
        print(f"Port {PORT_FALLBACK} is also in use.")
        print("No available ports.")
        sys.exit(1)
    else:
        PORT = PORT_FALLBACK
else:
    PORT = PORT_PRIMARY

print(f"Server starting on port {PORT}")

# Start a simple static server
server_address = ('', PORT)
httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
httpd.serve_forever()
