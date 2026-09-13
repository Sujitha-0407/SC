import os
from app import create_app

app = create_app()

@app.route("/", methods=["GET"])
def index():
    return {
        "status": "success",
        "message": "Secure Student Management System API is running",
        "health": "/api/health",
        "frontend": "http://localhost:5173"
    }, 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True, use_reloader=False)