import functools,os
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user,AnonymousUserMixin
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
from werkzeug.security import check_password_hash, generate_password_hash
from flaskr.db import get_db
from flask_sqlalchemy import SQLAlchemy



bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'

        if error is None:
            try:
                db.execute(
                    "INSERT INTO user (username, password) VALUES (?, ?)",
                    (username, generate_password_hash(password)),
                )
                db.commit()
            except db.IntegrityError:
                error = f"User {username} is already registered."
            else:
                return redirect(url_for("auth.login"))

        flash(error)

    return render_template('auth/register.html')


@bp.route('/login', methods=['GET', 'POST'])

def login():
   
    if request.method == 'POST':
        
       if request.is_json:
            data = request.get_json()

            user = Users.query.filter_by(username=data['username'], password=data['password']).first()
            if user:
               
               #login_user(user)

               access_token = create_access_token(identity={'username': data['username']})
               resp = jsonify({'login': True})
              # return jsonify(access_token=access_token), 200
               set_access_cookies(resp, access_token)

               print(access_token)
       
               session_db = Session()

               session['username'] = data['username']  # Armazene o nome de usuário na sessão
               
               session_db.close()

               app.config['UPLOAD_FOLDER'] = os.path.join('./uploads',  session['username'])
             
               if user.is_admin == 1:
                    return jsonify({"is_Logged": True,
                            "is_Admin": True,
                            'token': access_token}),200
               else:
                    return jsonify({"is_Logged":True,
                        "is_Admin":False,
                        'token': access_token}),200
               
            else:

                return jsonify({
                        "is_Logged":False,
                        "is_Admin":False,
                        'token':''}),401
       else :  
           return {"error": "Invalid JSON request"}, 400