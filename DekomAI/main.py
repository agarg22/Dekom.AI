import pickle
from flask import Flask, request, render_template, jsonify
app = Flask(__name__)


class Question:

    def __init__(self, name):

        self.name = name
        self.answers = []



class User:

    reference = {}
    symptoms = ['Sore Throat', 'Tender Lymph Nodes and Swollen Glands', 'Diarrhea', 'Fatigue after exertion', 'Muscle aches and pains', 'STOP']
    questions = [Question(x) for x in symptoms]

    def __init__(self):

        self.token = str(id(self))
        User.reference[self.token] = self
        User.answers = User.questions
        self.index = 0


    def answer(self):
        self.index += 1
        return self.questions[self.index - 1]


    def next(self):
        return self.questions[self.index]


def get_from_db():

    saveFile = open('database.prb', 'rb')
    users = pickle.load(saveFile)
    saveFile.close()

    print(users)

    return users

def write_to_db(user):

    print(user)

    users = get_from_db()
    users.append(user)

    saveFile = open('database.prb', 'wb')
    pickle.dump(users, saveFile)
    saveFile.close()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/create_user', methods = ['POST'])
def create_user():
    return User().token


@app.route('/answer', methods = ['POST'])
def answer():

    data = request.get_json()

    print('#' * 50)
    print('Data Recieved')
    print('-' * 30)
    print(data)
    print('#' * 50)

    print(User.reference)
    print(type(data['token']))

    currentUser = User.reference[data['token']]

    currentQuestion = currentUser.answer()
    currentQuestion.answers = [data['present'], data['frequency'], data['severity'], data['duration'], data['current'], data['past']]

    return currentUser.next().name


@app.route('/record', methods = ['POST'])
def record():
    
    print('*' * 20)
    print('RECORDING DATA')
    print('*' * 20)

    data = request.get_json()

    user = User.reference[data['token']]
    write_to_db(user)

    print(f'User token -> {user.token}')
    print(f'User database -> {get_from_db()}')
    

    return 'Successfully saved user data'


@app.route('/record_medication', methods = ['POST'])
def record_medication():
    
    data = request.get_json()
    user = User.reference[data['token']]
    user.medication = data['medication']

    return 'Success'


@app.route('/get_records')
def get_records():

    users = get_from_db()
    return render_template('records.html', users = users, symptoms = User.symptoms[:-1])

app.run(debug = True, host = '0.0.0.0', port = 8080)