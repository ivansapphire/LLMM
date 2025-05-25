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
  const lang = document.getElementById("language").value; // Leo el idioma seleccionado
  selectedLanguage = lang;  // Guardo el idioma para usarlo en otras partes

  // Objeto con las traducciones que uso para cambiar los textos de la interfaz
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

  const t = translations[lang]; // Selecciono las traducciones según el idioma

  // Aquí cambio el texto visible de cada parte de la interfaz
  document.getElementById("title-text").textContent = t.title;
  document.getElementById("start-button").textContent = t.start;
  document.getElementById("timer").textContent = `${t.time}: ${time}s`; // Muestro tiempo con texto correcto
  document.getElementById("next-btn").textContent = t.next;
  document.getElementById("end-title").textContent = t.end;
  document.getElementById("restart-button").textContent = t.restart;
}

// Función para empezar el cuestionario cuando el usuario pulse comenzar
function startQuiz() {
  selectedLanguage = document.getElementById('language').value; // Leo el idioma para cargar el XML correcto
  const file = selectedLanguage === 'es' ? 'preguntas.xml' : 'preguntasen.xml'; // Archivo XML según idioma

  // Cargo el archivo XML con fetch y lo convierto a un objeto que JS pueda leer
  fetch(file)
    .then(response => response.text()) // Leo el texto del XML
    .then(str => new window.DOMParser().parseFromString(str, "text/xml")) // Parsea el XML a objeto
    .then(data => {
      xmlData = data; // Guardo el XML para usarlo en el quiz

      // Cambio la pantalla, oculto la de inicio y muestro la de preguntas
      document.getElementById('start-screen').classList.remove('active');
      document.getElementById('quiz-screen').classList.add('active');

      startTimer(); // Empiezo el cronómetro
      showQuestion(); // Muestro la primera pregunta
    });
}

// Función que muestra la pregunta actual con sus opciones
function showQuestion() {
  const questions = xmlData.getElementsByTagName('question'); // Todas las preguntas

  // Si ya pasé la última pregunta, termino el quiz
  if (currentQuestion >= questions.length) {
    endQuiz();
    return;
  }

  // Extraigo el texto de la pregunta y sus opciones
  const question = questions[currentQuestion];
  const wording = question.getElementsByTagName('wording')[0].textContent;
  const choices = question.getElementsByTagName('choice');

  // Texto de progreso para que el usuario sepa en qué pregunta está (con traducción)
  const progressText = selectedLanguage === 'es'
    ? `Pregunta ${currentQuestion + 1} de ${questions.length}`
    : `Question ${currentQuestion + 1} of ${questions.length}`;

  answered = false; // Reseteo para que el usuario pueda contestar esta nueva pregunta

  // Contenedor donde pongo la pregunta y las opciones, limpio lo anterior y pongo lo nuevo
  const container = document.getElementById('question-container');
  container.innerHTML = `
    <div class="question-spacing"></div>
    <p class="progress-text">${progressText}</p>
    <h2>${wording}</h2>
  `;

  // Recorro todas las opciones y las pongo como divs clicables
  Array.from(choices).forEach(choice => {
    const div = document.createElement('div');
    div.className = 'choice';
    div.textContent = choice.textContent;
    div.setAttribute('data-correct', choice.getAttribute('correct')); // Guardo si es correcta o no
    // Al hacer clic, llamo a selectAnswer y le paso si la respuesta es correcta o no
    div.onclick = () => selectAnswer(div, choice.getAttribute('correct') === 'yes');
    container.appendChild(div);
  });
}

// Función que se llama al seleccionar una opción, corrige y marca las respuestas
function selectAnswer(div, correct) {
  if (answered) return; // Si ya respondí esta pregunta, no hago nada para no contar doble
  answered = true;      // Marco que ya respondí para bloquear más selecciones

  const allChoices = document.querySelectorAll('.choice'); // Todas las opciones en pantalla
  allChoices.forEach(c => c.classList.remove('selected')); // Quito selección previa si hubo

  div.classList.add('selected'); // Marco la opción que ha seleccionado el usuario

  // Recorro todas para marcar visualmente correctas e incorrectas
  allChoices.forEach(c => {
    const isCorrect = c === div
      ? correct // La opción clicada es correcta o no según parámetro
      : c.getAttribute('data-correct') === 'yes'; // Las demás que sean correctas las marco también

    if (isCorrect) {
      c.classList.add('correct'); // Pongo estilo para respuestas correctas
    } else if (c === div) {
      c.classList.add('incorrect'); // Si la seleccionada es incorrecta, la marco así
    }

    c.onclick = null; // Desactivo el click para que no puedan cambiar la respuesta
  });

  if (correct) score++; // Si acertó, aumento la puntuación
}

// Función para pasar a la siguiente pregunta
function nextQuestion() {
  currentQuestion++;  // Subo el índice de pregunta
  showQuestion();     // Muestro la siguiente
}

// Función que se ejecuta cuando el cuestionario termina
function endQuiz() {
  clearInterval(timerInterval); // Paro el cronómetro
  document.getElementById('quiz-screen').classList.remove('active'); // Oculto el quiz
  document.getElementById('end-screen').classList.add('active'); // Muestro la pantalla final

  // Texto final con la puntuación traducida
  const finalText = selectedLanguage === 'es'
    ? `Has acertado ${score} pregunta(s).`
    : `You answered correctly ${score} question(s).`;

  document.getElementById('final-score').textContent = finalText; // Muestro el resultado
}

// Función para iniciar el temporizador que cuenta el tiempo que lleva el quiz
function startTimer() {
  const label = selectedLanguage === 'es' ? 'Tiempo' : 'Time'; // Etiqueta según idioma
  timerInterval = setInterval(() => {
    time++; // Sumo 1 segundo cada vez

    // Paso el tiempo en segundos a formato hh:mm:ss con ceros a la izquierda
    const hours = String(Math.floor(time / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');

    // Actualizo el texto del temporizador
    document.getElementById('timer').textContent = `${label}: ${hours}:${minutes}:${seconds}`;
  }, 1000);
}
