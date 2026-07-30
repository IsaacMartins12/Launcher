"""Application entrypoint.

This module creates the Flask app using the application factory pattern.
Used by Flask CLI (flask run) and direct execution.
"""

from flaskr import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=2500)
