// Variables globales para manejar datos, estado y temporizador del quiz
let xmlData;              // Aquí guardo el XML con todas las preguntas
let currentQuestion = 0;  // Llevo el control de qué pregunta toca
let score = 0;            // Puntos que llevo (respuestas correctas)
let timerInterval;        // Intervalo del cronómetro
let time = 0;             // Tiempo que ha pasado desde que empezó el test
let selectedLanguage = 'es'; // Idioma por defecto al empezar
let answered = false;     // Para evitar que se pueda contestar varias veces la misma

// Cambia todos los textos según el idioma que haya elegido el usuario
function updateLanguage() {
  const lang = document.getElementById("language").value;
  selectedLanguage = lang;

  // Traducciones de los textos clave
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

  // Actualizo los elementos del DOM con los textos traducidos
  document.getElementById("title-text").textContent = t.title;
  document.getElementById("start-button").textContent = t.start;
  document.getElementById("timer").textContent = `${t.time}: ${time}s`;
  document.getElementById("next-btn").textContent = t.next;
  document.getElementById("end-title").textContent = t.end;
  document.getElementById("restart-button").textContent = t.restart;
}

// Empieza el test, carga el XML dependiendo del idioma
function startQuiz() {
  selectedLanguage = document.getElementById('language').value;
  const file = selectedLanguage === 'es' ? 'preguntas.xml' : 'preguntasen.xml';

  const xhr = new XMLHttpRequest();
  xhr.open("GET", file, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const data = new window.DOMParser().parseFromString(xhr.responseText, "text/xml");
      xmlData = data;

      // Oculto la pantalla de inicio y muestro el test
      document.getElementById('start-screen').classList.remove('active');
      document.getElementById('quiz-screen').classList.add('active');

      startTimer();   // Empieza el cronómetro
      showQuestion(); // Muestro la primera pregunta
    }
  };
  xhr.send();
}

// Muestra la pregunta actual y las opciones
function showQuestion() {
  const questions = xmlData.getElementsByTagName('question');

  // Si ya no hay más preguntas, termina el test
  if (currentQuestion >= questions.length) {
    endQuiz();
    return;
  }

  const question = questions[currentQuestion];
  const wording = question.getElementsByTagName('wording')[0].textContent;
  const choices = question.getElementsByTagName('choice');

  // Muestra en qué pregunta vamos
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

  // Creo los botones de respuesta y les pongo el onclick
  Array.from(choices).forEach(choice => {
    const div = document.createElement('div');
    div.className = 'choice';
    div.textContent = choice.textContent;
    div.setAttribute('data-correct', choice.getAttribute('correct'));
    div.onclick = () => selectAnswer(div, choice.getAttribute('correct') === 'yes');
    container.appendChild(div);
  });
}

// Se ejecuta cuando el usuario selecciona una respuesta
function selectAnswer(div, correct) {
  if (answered) return;
  answered = true;

  const allChoices = document.querySelectorAll('.choice');
  allChoices.forEach(c => c.classList.remove('selected'));

  div.classList.add('selected');

  // Recorro todas las opciones para marcarlas como correctas o incorrectas
  allChoices.forEach(c => {
    const isCorrect = c === div
      ? correct
      : c.getAttribute('data-correct') === 'yes';

    if (isCorrect) {
      c.classList.add('correct');
    } else if (c === div) {
      c.classList.add('incorrect');
    }

    c.onclick = null; // Desactivo el click para que no se pueda volver a contestar
  });

  if (correct) score++; // Si ha acertado, sumo punto
}

// Va a la siguiente pregunta
function nextQuestion() {
  currentQuestion++;
  showQuestion();
}

// Cuando se termina el test, paro el cronómetro y muestro el resultado
function endQuiz() {
  clearInterval(timerInterval);
  document.getElementById('quiz-screen').classList.remove('active');
  document.getElementById('end-screen').classList.add('active');

  const finalText = selectedLanguage === 'es'
    ? `Has acertado ${score} pregunta(s).`
    : `You answered correctly ${score} question(s).`;

  document.getElementById('final-score').textContent = finalText;
}

// Inicia el cronómetro y actualiza cada segundo
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
