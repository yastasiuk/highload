from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

from .settings import DATABASE_URI, DEBUG, HOST, PORT

print('DATABASE_URI', DATABASE_URI)

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class Request(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500))
    method = db.Column(db.String(10))
    user_agent = db.Column(db.String(500))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

@app.route('/statistics')
def get_statistics():
    all_requests = Request.query.all()
    return jsonify([request.as_dict() for request in all_requests])


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def add_request(path):
    if not request.full_path.startswith('/favicon.ico'):
        request_entry = Request(
            url=request.full_path,
            method=request.method,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(request_entry)
        db.session.commit()
    return '', 200

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=DEBUG, host=HOST, port=PORT)