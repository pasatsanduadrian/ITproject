# deploy.py
import os
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer

from dotenv import load_dotenv
from pyngrok import ngrok, conf

def main():
    load_dotenv()               # reads variables from .env
    port = 8000

    os.chdir(os.path.dirname(__file__))  # serve files from repo root
    httpd = TCPServer(("", port), SimpleHTTPRequestHandler)

    # Configure ngrok
    ngrok_token = os.getenv("NGROK_TOKEN")
    stable_host = os.getenv("NGROK_HOSTNAME")  # e.g. stable-xxxxx-xxxxx.ngrok-free.app
    if ngrok_token:
        conf.get_default().auth_token = ngrok_token

    if stable_host:
        tunnel = ngrok.connect(addr=port, hostname=stable_host, bind_tls=True)
    else:
        tunnel = ngrok.connect(addr=port, bind_tls=True)

    print("Public URL:", tunnel.public_url)
    httpd.serve_forever()

if __name__ == "__main__":
    main()
