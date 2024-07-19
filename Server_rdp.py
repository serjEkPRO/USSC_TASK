import json
import asyncio
import websockets
from twisted.internet import reactor, protocol
from twisted.python import log
from rdpy3.protocol.rdp import rdp
import sys
import base64

# Enable logging for twisted
log.startLogging(sys.stdout)

class MyRDPObserver(rdp.RDPClientObserver):
    def __init__(self, controller, ws):
        self._controller = controller
        self.ws = ws

    async def onReady(self):
        log.msg("RDP session ready")
        await self.ws.send(json.dumps({"type": "connected"}))

    async def onUpdate(self, destLeft, destTop, destRight, destBottom, width, height, bitsPerPixel, isCompress, data):
        log.msg(f"Received bitmap update: {len(data)} bytes")
        # Base64 encode the bitmap data
        encoded_data = base64.b64encode(data).decode('ascii')
        await self.ws.send(json.dumps({"type": "bitmap", "data": encoded_data}))

    async def onSessionReady(self):
        log.msg("Windows session is ready")
        await self.ws.send(json.dumps({"type": "session_ready"}))

    async def onClose(self):
        log.msg("RDP session closed")
        await self.ws.send(json.dumps({"type": "disconnected"}))

class MyRDPFactory(rdp.ClientFactory):
    def __init__(self, ws, config):
        self.ws = ws
        self.config = config

    def clientConnectionLost(self, connector, reason):
        log.msg(f"Connection lost: {reason}")
        reactor.callFromThread(reactor.stop)

    def clientConnectionFailed(self, connector, reason):
        log.msg(f"Connection failed: {reason}")
        reactor.callFromThread(reactor.stop)

    def buildObserver(self, controller, addr):
        return MyRDPObserver(controller, self.ws)

    def buildProtocol(self, addr):
        try:
            log.msg(f"Before encoding: {self.config}")

            # Ensure all strings are correctly encoded as UTF-16LE
            self.config['userName'] = self.config['userName'].encode('utf-16le') if isinstance(self.config['userName'], str) else self.config['userName']
            self.config['password'] = self.config['password'].encode('utf-16le') if isinstance(self.config['password'], str) else self.config['password']
            if 'domain' in self.config:
                self.config['domain'] = self.config['domain'].encode('utf-16le') if isinstance(self.config['domain'], str) else self.config['domain']
            else:
                self.config['domain'] = ''.encode('utf-16le')

            log.msg(f"After encoding: {self.config}")
        except AttributeError as e:
            log.msg(f"AttributeError in buildProtocol: {e}")
            raise

        return super().buildProtocol(addr)

async def handle_connection(ws, path):
    try:
        async for message in ws:
            config = json.loads(message)
            log.msg(f"Attempting to connect to {config['host']}:{config['port']} with user {config['userName']}")
            # Ensure the config parameters are in the correct format
            try:
                log.msg(f"Before encoding in handle_connection: {config}")

                config['userName'] = config['userName'].encode('utf-16le') if isinstance(config['userName'], str) else config['userName']
                config['password'] = config['password'].encode('utf-16le') if isinstance(config['password'], str) else config['password']
                if 'domain' in config:
                    config['domain'] = config['domain'].encode('utf-16le') if isinstance(config['domain'], str) else config['domain']
                else:
                    config['domain'] = ''.encode('utf-16le')

                log.msg(f"After encoding in handle_connection: {config}")
            except AttributeError as e:
                log.msg(f"AttributeError in handle_connection: {e}")
                raise
            factory = MyRDPFactory(ws, config)
            reactor.callFromThread(reactor.connectTCP, config['host'], config['port'], factory)
    except websockets.ConnectionClosed:
        log.msg("WebSocket connection closed")
        pass

async def main():
    async with websockets.serve(handle_connection, "localhost", 8080):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    # Run Twisted reactor in a separate thread
    from threading import Thread
    reactor_thread = Thread(target=reactor.run, kwargs={'installSignalHandlers': 0})
    reactor_thread.start()

    # Run asyncio event loop
    asyncio.run(main())
