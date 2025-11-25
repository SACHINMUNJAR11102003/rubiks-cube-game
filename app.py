from flask import Flask, jsonify, render_template
import pycuber as pc
import random

app = Flask(__name__, static_folder="static", template_folder="templates")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/new_game")
def new_game():
    return generate_game_state()

MOVES = ["U", "U'", "D", "D'", "L", "L'", "R", "R'", "F", "F'", "B", "B'"]

def random_scramble(n=20):
    return " ".join(random.choice(MOVES) for _ in range(n))

def apply_moves(cube, scramble):
    for move in scramble.split():
        cube(move)
    return cube

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/new_game")
def new_game():
    level = 1
    scramble = random_scramble(20)

    cube = pc.Cube()
    cube = apply_moves(cube, scramble)

    # convert cube to facelet colors
    state = {}
    for face in "URFDLB":
        facelet = cube.get_face(face)
        state[face] = [str(c) for row in facelet for c in row]

    # placeholder: random solution length
    required_moves = random.randint(12, 20)

    return jsonify({
        "level": level,
        "scramble": scramble,
        "required_moves": required_moves,
        "state": state
    })

if __name__ == "__main__":
    app.run(debug=True)
