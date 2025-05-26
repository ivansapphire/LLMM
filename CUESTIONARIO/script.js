// Variables globales para manejar datos, estado y temporizador del quiz
let xmlData;           // Aquí guardo el XML con todas las preguntas
let currentQuestion = 0; // Índice para saber qué pregunta estamos mostrando
let score = 0;          // Contador de respuestas correctas que llevo hasta ahora
let timerInterval;      // Variable para el intervalo del cronómetro
let time = 0;           // Tiempo que lleva pasando desde que empecé el quiz (en segundos)
let selectedLanguage = 'es'; // Idioma actual del cuestionario, empieza en español
let answered = false;   // Controla si ya respondí la pregunta actual para no repetir

// Función que actualiza todos los textos de la página según el idioma que elija el usuario
function updateLanguage() {
  const lang = document.getElementById("language").value;
  selectedLanguage = lang;

  const translations = {
    es: {
      title: "Preguntas de cultura pop",
      start: "Comenzar",
      time: "Tiempo",
      next: "Siguiente",
      end: "¡Has completado el test!",
      restart: "Reiniciar"
    },
    en: {
      title: "Pop culture questions",
      start: "Start",
      time: "Time",
      next: "Next",
      end: "You have completed the quiz!",
      restart: "Restart"
    }
  };

  const t = translations[lang];

  document.getElementById("title-text").textContent = t.title;
  document.getElementById("start-button").textContent = t.start;
  document.getElementById("timer").textContent = `${t.time}: ${time}s`;
  document.getElementById("next-btn").textContent = t.next;
  document.getElementById("end-title").textContent = t.end;
  document.getElementById("restart-button").textContent = t.restart;
}

// ✅ FUNCIÓN MODIFICADA CON AJAX CLÁSICO
function startQuiz() {
  selectedLanguage = document.getElementById('language').value;
  const file = selectedLanguage === 'es' ? 'preguntas.xml' : 'preguntasen.xml';

  const xhr = new XMLHttpRequest();
  xhr.open("GET", file, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const data = new window.DOMParser().parseFromString(xhr.responseText, "text/xml");
      xmlData = data;

      document.getElementById('start-screen').classList.remove('active');
      document.getElementById('quiz-screen').classList.add('active');

      startTimer();
      showQuestion();
    }
  };
  xhr.send();
}

function showQuestion() {
  const questions = xmlData.getElementsByTagName('question');

  if (currentQuestion >= questions.length) {
    endQuiz();
    return;
  }

  const question = questions[currentQuestion];
  const wording = question.getElementsByTagName('wording')[0].textContent;
  const choices = question.getElementsByTagName('choice');

  const progressText = selectedLanguage === 'es'
    ? `Pregunta ${currentQuestion + 1} de ${questions.length}`
    : `Question ${currentQuestion + 1} of ${questions.length}`;

  answered = false;

  const container = document.getElementById('question-container');
  container.innerHTML = `
    <div class="question-spacing"></div>
    <p class="progress-text">${progressText}</p>
    <h2>${wording}</h2>
  `;

  Array.from(choices).forEach(choice => {
    const div = document.createElement('div');
    div.className = 'choice';
    div.textContent = choice.textContent;
    div.setAttribute('data-correct', choice.getAttribute('correct'));
    div.onclick = () => selectAnswer(div, choice.getAttribute('correct') === 'yes');
    container.appendChild(div);
  });
}

function selectAnswer(div, correct) {
  if (answered) return;
  answered = true;

  const allChoices = document.querySelectorAll('.choice');
  allChoices.forEach(c => c.classList.remove('selected'));

  div.classList.add('selected');

  allChoices.forEach(c => {
    const isCorrect = c === div
      ? correct
      : c.getAttribute('data-correct') === 'yes';

    if (isCorrect) {
      c.classList.add('correct');
    } else if (c === div) {
      c.classList.add('incorrect');
    }

    c.onclick = null;
  });

  if (correct) score++;
}

function nextQuestion() {
  currentQuestion++;
  showQuestion();
}

function endQuiz() {
  clearInterval(timerInterval);
  document.getElementById('quiz-screen').classList.remove('active');
  document.getElementById('end-screen').classList.add('active');

  const finalText = selectedLanguage === 'es'
    ? `Has acertado ${score} pregunta(s).`
    : `You answered correctly ${score} question(s).`;

  document.getElementById('final-score').textContent = finalText;
}

function startTimer() {
  const label = selectedLanguage === 'es' ? 'Tiempo' : 'Time';
  timerInterval = setInterval(() => {
    time++;

    const hours = String(Math.floor(time / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');

    document.getElementById('timer').textContent = `${label}: ${hours}:${minutes}:${seconds}`;
  }, 1000);
}