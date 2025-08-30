from . import create_app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
# from flask import Flask, jsonify, send_from_directory, send_file
# from flask_cors import CORS
# import os
# from .config import Config
# from .routers import auth_verify, chat, health, logs, assessment, reminders

# def create_app():
#     app = Flask(__name__, static_folder='../static', static_url_path='')
#     app.config.from_object(Config)

#     # CORS configuration
#     CORS(app, resources={
#         r"/api/*": {
#             "origins": Config.ALLOWED_ORIGINS.split(','),
#             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
#             "allow_headers": ["Content-Type", "Authorization"],
#             "supports_credentials": True
#         }
#     })

#     # Register blueprints
#     app.register_blueprint(auth_verify.router, url_prefix='/api')
#     app.register_blueprint(chat.router, url_prefix='/api')
#     app.register_blueprint(health.router, url_prefix='/api')
#     app.register_blueprint(logs.router, url_prefix='/api')
#     app.register_blueprint(assessment.router, url_prefix='/api')
#     app.register_blueprint(reminders.router, url_prefix='/api')

#     # Serve React app
#     @app.route('/')
#     def serve_react_app():
#         return send_file(os.path.join(app.static_folder, 'index.html'))

#     @app.route('/<path:path>')
#     def serve_static_files(path):
#         if path.startswith('api/'):
#             return jsonify({'error': 'API endpoint not found'}), 404

#         file_path = os.path.join(app.static_folder, path)
#         if os.path.exists(file_path):
#             return send_from_directory(app.static_folder, path)
#         else:
#             # For React Router - serve index.html for client-side routing
#             return send_file(os.path.join(app.static_folder, 'index.html'))

#     return app

# app = create_app()

# if __name__ == '__main__':
#     app.run(host='127.0.0.1', port=8000, debug=True)
