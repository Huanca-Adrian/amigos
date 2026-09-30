// ============================================================
//  anim.js  -  Letra sincronizada + título
// ============================================================

var audio = document.querySelector("audio");
var lyrics = document.querySelector("#lyrics");


// ============================================================
//  ZONA 1: LA LETRA
//  >>> PEGA AQUÍ TU LETRA (la de tu archivo anterior, completa,
//  >>> con la primera línea invisible incluida).
//  Una línea por renglón. Las líneas vacías se ignoran.
// ============================================================
var letra = `¿Hace falta que te diga
Que me muero por tener algo contigo?
¿Es que no te has dado cuenta
De lo mucho que me cuesta ser tu amigo?
Ya no puedo acercarme a tu boca
Sin deseártela de una manera loca
Necesito controlar tu vida
Ver quién te besa y quién te abriga
¿Hace falta que te diga
Que me muero por tener algo contigo?
¿Es que no te has dado cuenta
De lo mucho que me cuesta ser tu amigo?
Ya no puedo, continuar espiando
Día y noche tu llegar adivinando
Ya ni sé, con que inocente excusa
Pasar por tu casa
Ya me quedan tan pocos caminos
Y aunque pueda parecerte un desatino
No quisiera yo morirme sin tener
Algo contigo
¿Hace falta que te diga
Que me muero por tener algo contigo?
¿Es que no te has dado cuenta
De lo mucho que me cuesta ser tu amigo?
Ya no puedo acercarme a tu boca
Sin deseártela de una manera loca
Necesito, niña, controlar tu vida,
Saber quién te besa y quién te abriga
Ya me quedan muy pocos caminos
Y aunque pueda parecerte un desatino
No quisiera, yo morirme sin tener
Algo contigo
Niña no quisiera yo morirme sin tener
(Algo contigo, algo contigo)
Triste el destino que me espera sin poderte conocer
Ya no hay excusa, ya no hay nada que tenga que perder
(Algo contigo, algo contigo)
Esclavo para siempre no me importaría ser
Niña no quisiera yo morirme sin tener
(Algo contigo, algo contigo)
Triste el destino que me espera sin poderte conocer

`;


// ============================================================
//  ZONA 2: LOS TIEMPOS
//  Un número (segundos) por cada línea de la letra, en el mismo orden.
//  IMPORTANTE: debe haber EXACTAMENTE un tiempo por línea.
//  El último (222) es un cálculo: ajústalo al momento real.
// ============================================================
var tiempos = [19.7, 22.6, 29.5, 34.6, 39.4, 44, 49.6, 52.8, 59, 61.3, 68, 72.6, 77.5, 81.1, 84.6, 90.8, 95.3, 99.4, 104.9, 107.1, 113.8, 116.3, 123, 127.4, 131.9, 135.8, 140.6, 145.2, 149.8, 153.7, 159.3, 168.5, 171.5, 177.5, 186.5, 190.8, 195.3, 204.3, 207.3, 215.5, 222];

// ============================================================
//  ZONA 3: MODO CALIBRACIÓN
//  true  = te ayuda a sacar los tiempos (usa la barra ESPACIO)
//  false = modo normal, la letra se muestra sola con la música
// ============================================================
var calibrar = false;


// ============================================================
//  AJUSTE FINO: ADELANTO (en segundos)
//  Si la letra sale TARDE, sube este número.
//  Si sale ANTES de tiempo, bájalo.
//
//  EN VIVO (con la canción sonando, modo normal):
//    Flecha DERECHA  = +0.1 s (la letra sale antes)
//    Flecha IZQUIERDA = -0.1 s (la letra sale después)
//  El valor aparece en la consola (F12). Cuando quede bien,
//  cópialo aquí abajo.
// ============================================================
var adelanto = 10;


// ------------------------------------------------------------
//  De aquí para abajo no necesitas cambiar nada
//  (salvo los AJUSTES del efecto, al final del archivo)
// ------------------------------------------------------------

// Tiempo actual de la canción, ya con el adelanto aplicado
function ahora() {
  return audio.currentTime + adelanto;
}

// Convierte la letra en una lista de líneas
var lineas = letra
  .trim()
  .split("\n")
  .map(function (t) { return t.trim(); })
  .filter(Boolean);

// Une cada línea con su tiempo
var lyricsData = lineas
  .map(function (text, i) { return { text: text, time: tiempos[i] }; })
  .filter(function (l) { return l.time !== undefined; });

if (!calibrar && lineas.length !== tiempos.length) {
  console.warn(
    "Hay " + lineas.length + " líneas y " + tiempos.length +
    " tiempos. Deben ser iguales."
  );
}

// Muestra la línea actual hasta que llega la siguiente
function updateLyrics() {
  if (calibrar) return;

  var t = ahora();
  var currentLine = null;

  for (var i = 0; i < lyricsData.length; i++) {
    if (t >= lyricsData[i].time) currentLine = lyricsData[i];
  }

  if (currentLine) {
    if (lyrics.innerHTML !== currentLine.text) lyrics.innerHTML = currentLine.text;
    lyrics.style.opacity = 1;
  } else {
    lyrics.style.opacity = 0;
    lyrics.innerHTML = "";
  }
}

// requestAnimationFrame revisa ~60 veces por segundo (timeupdate solo ~4)
function bucleLetra() {
  updateLyrics();
  requestAnimationFrame(bucleLetra);
}
bucleLetra();

// Si el navegador bloquea el autoplay, un clic inicia la música
if (!calibrar) {
  document.addEventListener("click", function () {
    if (audio.paused) audio.play();
  }, { once: true });

  // Ajuste del adelanto en vivo con las flechas
  document.addEventListener("keydown", function (e) {
    if (e.code !== "ArrowRight" && e.code !== "ArrowLeft") return;
    e.preventDefault();
    adelanto += e.code === "ArrowRight" ? 0.1 : -0.1;
    adelanto = Math.round(adelanto * 10) / 10;
    console.log("var adelanto = " + adelanto + ";");
  });
}


// ---------- Modo calibración ----------
var marcas = [];

if (calibrar) {
  // Detiene la canción hasta que presiones ESPACIO por primera vez
  audio.pause();
  audio.currentTime = 0;

  lyrics.style.opacity = 1;
  lyrics.innerHTML = lineas.length
    ? "Presiona ESPACIO para iniciar la canción"
    : "Falta pegar la letra en la ZONA 1";

  document.addEventListener("keydown", function (e) {
    if (e.code !== "Space") return;
    e.preventDefault();
    if (marcas.length >= lineas.length) return;

    if (marcas.length === 0) {
      // Primer toque: inicia la música y la primera línea queda en 0 s
      audio.currentTime = 0;
      audio.play();
      marcas.push(0);
    } else {
      marcas.push(Math.round(audio.currentTime * 10) / 10);
    }

    if (marcas.length < lineas.length) {
      // Muestra la línea que sigue; presiona ESPACIO cuando empiece a cantarse
      lyrics.innerHTML = lineas[marcas.length];
    } else {
      lyrics.innerHTML = "Listo. Abre la consola (F12) y copia los tiempos.";
      console.log("var tiempos = [" + marcas.join(", ") + "];");
    }
  });
}


// ---------- Título ----------
// Se oculta solo cuando la canción termina (ya no hay que calcular la duración)
function ocultarTitulo() {
  var titulo = document.querySelector(".titulo");
  if (!titulo) return;
  titulo.style.animation = "fadeOut 3s ease-in-out forwards";
  setTimeout(function () {
    titulo.style.display = "none";
  }, 3000);
}

audio.addEventListener("ended", ocultarTitulo);


// ============================================================
//  EFECTO DE PALABRA EN GRANDE (opcional)
//  Cuando una línea repite la palabra/frase varias veces,
//  aparece en grande por toda la pantalla.
// ============================================================
(function () {

  // ---------- AJUSTES QUE PUEDES CAMBIAR ----------
  var ACTIVAR = false;           // true = usar el efecto, false = apagado
  var TEXTO = "pa' mí";          // palabra o frase que se muestra en grande
  var MIN_VECES = 2;             // cuántas veces debe aparecer en la línea para activarse
  var COLOR = "#ffd54a";         // color de las palabras
  var TAMANO = "clamp(2.5rem, 11vw, 8rem)";
  var DURACION = 1.6;            // segundos que dura cada palabra en pantalla
  var RETRASO = 0.45;            // segundos entre una palabra y la siguiente
  var ESPERA_INICIO = 2.8;       // segundos que espera antes de mostrar la primera
  // ------------------------------------------------

  if (!ACTIVAR) return;

  // Crea la expresión de búsqueda a partir de TEXTO (acepta ' o ’ y espacios flexibles)
  var patron = TEXTO
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/['’]/g, "['’]?")
    .replace(/\s+/g, "\\s*");
  var regex = new RegExp(patron, "gi");

  var estilo = document.createElement("style");
  estilo.textContent =
    "#pami-capa{position:fixed;inset:0;pointer-events:none;z-index:10;overflow:hidden;}" +
    ".pami-palabra{position:absolute;font-weight:800;white-space:nowrap;opacity:0;" +
    "font-size:" + TAMANO + ";color:" + COLOR + ";" +
    "text-shadow:0 0 20px rgba(255,213,74,.8),0 0 50px rgba(255,170,0,.6);" +
    "animation:pamiPop " + DURACION + "s ease-out forwards;}" +
    "@keyframes pamiPop{" +
    "0%{opacity:0;transform:scale(.4) rotate(var(--rot));}" +
    "25%{opacity:1;transform:scale(1.1) rotate(var(--rot));}" +
    "70%{opacity:1;transform:scale(1) rotate(var(--rot));}" +
    "100%{opacity:0;transform:scale(1.3) rotate(var(--rot));}}";
  document.head.appendChild(estilo);

  var capa = document.createElement("div");
  capa.id = "pami-capa";
  document.body.appendChild(capa);

  function lanzarPalabras(cantidad) {
    for (var i = 0; i < cantidad; i++) {
      var p = document.createElement("div");
      p.className = "pami-palabra";
      p.textContent = TEXTO;

      var top = 5 + i * (70 / cantidad) + Math.random() * 8;
      var left = 3 + Math.random() * 50;
      var rot = Math.round(Math.random() * 16 - 8);

      p.style.top = top + "%";
      p.style.left = left + "%";
      p.style.setProperty("--rot", rot + "deg");
      p.style.animationDelay = (ESPERA_INICIO + i * RETRASO) + "s";
      p.addEventListener("animationend", function () { this.remove(); });
      capa.appendChild(p);
    }
  }

  var ultimoIdx = -1;

  function revisar() {
    if (calibrar) return;

    var t = ahora();
    var idx = -1;
    for (var i = 0; i < lyricsData.length; i++) {
      if (t >= lyricsData[i].time) idx = i;
    }

    if (idx === ultimoIdx) return;
    ultimoIdx = idx;
    if (idx < 0) return;

    var veces = (lyricsData[idx].text.match(regex) || []).length;
    if (veces >= MIN_VECES) lanzarPalabras(veces);
  }

  (function bucle() {
    revisar();
    requestAnimationFrame(bucle);
  })();
})();
