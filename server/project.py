import socket
import sys
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
import argparse

# Default ports
PORT_PRIMARY = 4000
PORT_FALLBACK = 3960

def is_port_in_use(port):
    """Check if a TCP port is in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def find_available_port():
    """Return first available port (primary or fallback)"""
    if not is_port_in_use(PORT_PRIMARY):
        return PORT_PRIMARY
    elif not is_port_in_use(PORT_FALLBACK):
        return PORT_FALLBACK
    else:
        return None

def run_server(path, port):
    """Run a simple static HTTP server serving the specified path"""
    os.chdir(path)
    print(f"Serving '{path}' on port {port}")
    server = HTTPServer(('', port), SimpleHTTPRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped by user")
        server.server_close()

def main():
    parser = argparse.ArgumentParser(description="Run a frontend project locally")
    parser.add_argument('project_path', nargs='?', default='.', help="Path to the project folder")
    args = parser.parse_args()

    path = os.path.abspath(args.project_path)
    if not os.path.isdir(path):
        print(f"Error: '{path}' is not a valid directory.")
        sys.exit(1)

    port = find_available_port()
    if port is None:
        print("Error: Both ports are in use. Cannot start server.")
        sys.exit(1)

    run_server(path, port)

if __name__ == "__main__":
    main()
