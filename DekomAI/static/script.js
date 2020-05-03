
window.questions = ['present','frequency','severity','duration','current','past'];
window.start_q = ['Have you suffered from *?', 'How frequent have you suffered from * in the past month?', 'How severe was the *?', 'Prior to last month, how long has * lasted', 'Is this still a part of your ill health?', 'Has this been a part of your ill health in the past?']
window.User = {'token': 0, 'present': -1,'frequency': -1,'severity': -1,'duration': -1,'current': -1,'past': -1};


function medication_taken(){

    // no display for all boxes
    // after input show boxes
    
    document.getElementById('symptom').innerText = 'Welcome to the Dekom.AI chatbot';
    document.getElementById('question').innerText = 'Please enter any medication that is currently being taken';

    var inputEl = document.createElement("INPUT");

    inputEl.setAttribute("type", "text");
    inputEl.setAttribute("placeholder", "input previous medicines taken here");
    inputEl.style.width = '100%';
    inputEl.style.padding = '0.5em';
    inputEl.id = 'med_input';

    var submitEl = document.createElement("INPUT");
    
    submitEl.setAttribute('type', 'submit');
    submitEl.className = 'btn btn-lg btn-primary mt-2';
    submitEl.id = 'med_submit';

    submitEl.onclick = () => {
        
        // run an ajax post to python server to save results to user file / folder?

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        // get data from the window.User object later
        data = {'token': window.User.token, 'medication': document.getElementById('med_input').value}
        
        xhr.open("POST", "https://DekomAI.jasamritrahala.repl.co/record_medication", false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));

        var res = xhr.responseText;

        document.getElementsByClassName('card-body')[0].removeChild(document.getElementById('med_submit'));
        document.getElementsByClassName('card-body')[0].removeChild(document.getElementById('med_input'));
        

        document.getElementById('symptom').innerText = 'Sore Throat';
        document.getElementById('question').innerText = 'Have you suffered from Sore Throat?';

        document.getElementById('button-present').style.display = 'block';


    }

    document.getElementsByClassName('card-body')[0].appendChild(inputEl);
    document.getElementsByClassName('card-body')[0].appendChild(submitEl);
    
    



}


function save_results(){

    // run an ajax post to python server to save results to user file / folder?

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    // get data from the window.User object later
    data = {'token': window.User['token']}
    
    xhr.open("POST", "https://DekomAI.jasamritrahala.repl.co/record", false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

    var res = xhr.responseText;
    create_alert();
    alert('Doctor has been sent results, your doctor will get in touch with you soon');



}


function create_alert(){

    var alert_box = document.getElementById('alerts');
    
    var holder = div = document.createElement('div');
    holder.className = 'alert alert-success alert-dismissible'

    var closeLink = document.createElement('a');

    closeLink.href = '#';
    closeLink.className = 'close';
    closeLink.setAttribute('data-dismiss', 'alert');
    closeLink.innerText = 'x';
    
    holder.innerText = 'Symptom successfully recorded';
    holder.appendChild(closeLink);
    alert_box.appendChild(holder);

}


function generate_question(symptom, property){

    var base_q = window.start_q[window.questions.indexOf(property)];
    var ins_pos = base_q.indexOf('*');

    if (ins_pos == -1){
        return base_q;
    }

    var title = [base_q.slice(0, ins_pos), symptom, base_q.slice(ins_pos + 1)].join('');
    return title;

}


function record_data(){

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    // get data from the window.User object later
    data = {'token': window.User['token'], 'present': window.User['present'], 'frequency': window.User['frequency'], 'severity': window.User['severity'], 'duration': window.User['duration'], 'current': window.User['current'], 'past': window.User['past']};

    
    xhr.open("POST", "https://DekomAI.jasamritrahala.repl.co/answer", false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

    var next_question = xhr.responseText;
    create_alert();
    return next_question;

}



function generate_token(){

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;    
    xhr.open("POST", "https://DekomAI.jasamritrahala.repl.co/create_user", false);
    xhr.send();
    window.User['token'] = xhr.responseText; // hte user was nto synchronised with the token transmission so ne key error
}


window.onload = function(){

    // generate user token
    
    generate_token();
    medication_taken();

}


function next_question(){

    var question_title = document.getElementById('symptom');
    var next_question = record_data();

    // reset vars

    window.User['present'] = -1,
    window.User['frequency'] = -1
    window.User['severity'] = -1;
    window.User['duration'] = -1;
    window.User['current'] = -1;
    window.User['past'] = -1;


    console.log(next_question);
    
    if (next_question == 'STOP'){

        document.getElementById('button-past').style.display = 'none';
        alert('Thank you for filling out the form, please wait for confirmation of form submission');
        save_results();

    }

    else{

        question_title.innerText = next_question;

        // reset the none displays

        document.getElementById('button-present').style.display = 'block';
        document.getElementById('button-past').style.display = 'none';
    }

}


function next_topic(property){

    // show next element, hide current element in js

    var current_buttons = document.getElementById('button-' + property);
    current_buttons.style.display = 'none';

    console.log(current_buttons);

    var next_property = window.questions[window.questions.indexOf(property) + 1];
    next_q = document.getElementById('button-' + next_property);
    next_q.style.display = 'block';

    console.log(next_q);

    // change current question

    var symptom = document.getElementById('symptom').innerText;

    var question_title = document.getElementById('question');
    question_title.innerText = generate_question(symptom, next_property);

}


function answer(property, ans){

    // record value
    window.User[property] = ans;

    if (property == 'present'){
        if (ans == 'False'){
            // move to next part
            // load the next question
            next_question();
        }
        else{
            // move to next part
            next_topic(property);
        }
    }

    else if (property == 'past'){

        // move to next question
        next_question();

    }

    else{
        // move to next part
        next_topic(property);
    }

}