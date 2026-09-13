from functools import wraps

from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt


def role_required(*allowed_roles):
    def decorator(func):
        @wraps(func)
        @jwt_required()
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            user_role = claims.get("role")

            if user_role not in allowed_roles:
                return jsonify({
                    "status": "error",
                    "message": "Access denied"
                }), 403

            return func(*args, **kwargs)

        return wrapper

    return decorator