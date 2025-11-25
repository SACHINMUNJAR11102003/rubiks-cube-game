from flask import Flask, jsonify, render_template
import pycuber as pc
import random

app = Flask(__name__, static_folder="static", template_folder="templates")

# ----------------------------
# Utility functions
# ----------------------------

MOVES = ["U", "U'", "D", "D'", "L", "L'", "R", "R'", "F", "F'", "B", "B'"]

def random_scramble(n=20):
    """Generate a random cube scramble."""
    return " ".join(random.choice(MOVES) for _ in range(n))

def apply_moves(cube, scramble):
    """Apply a sequence of moves to a PyCuber cube."""
    for move in scramble.split():
        cube(move)
    return cube

def cube_state_to_dict(cube):
    """Convert PyCuber Cube to dictionary of facelet colors."""
    state = {}
    for face in "URFDLB":
        facelet = cube.get_face(face)
        state[face] = [str(c) for row in facelet for c in row]
    return state

# ----------------------------
# Routes
# ----------------------------

@app.route("/")
def index():
    """Serve the main HTML page."""
    return render_template("index.html")

@app.route("/new_game")
def new_game_route():
    """Generate a new scrambled cube game state."""
    level = 1
    scramble = random_scramble(20)
    cube = pc.Cube()
    cube = apply_moves(cube, scramble)
    state = cube_state_to_dict(cube)
    required_moves = random.randint(12, 20)  # placeholder solution length

    return jsonify({
        "level": level,
        "scramble": scramble,
        "required_moves": required_moves,
        "state": state
    })

# ----------------------------
# Run Flask app
# ----------------------------

if __name__ == "__main__":
    app.run(debug=True)
