import tornado.ioloop
import tornado.web
import tornado.websocket
import os.path

import json

from tornado.options import define, options


define("port", default=80, help="run on the given port", type=int)


clients = []

class IndexHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(request):
        request.render("index.html")

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        clients.append(self)
        
    def on_message(self, message):
        if len(message) > 1000:
            error = """{"author":"[SYSTEM]","message":"Message to long!"}"""
            self.write_message(error)
            return
        for client in clients:
            client.write_message(message)
    
    def on_close(self):
        clients.remove(self)

def main():
    handlers = [
        (r'/chat', WebSocketHandler),
        (r'/', IndexHandler)
    ]
    settings = dict(
        template_path=os.path.join(os.path.dirname(__file__), "templates"),
        static_path=os.path.join(os.path.dirname(__file__), "static"),
    )
    app = tornado.web.Application(handlers, **settings)
    app.listen(options.port)
    
    try:
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        print "\nServer stopped"

if __name__ == "__main__":
    main()