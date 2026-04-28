// quiz.js – Chuyển toàn bộ HTML/CSS/JS gốc thành JavaScript động
(function() {
  // ========== STYLE ==========
  const style = document.createElement('style');
  style.textContent = `
    body {
      margin: 0;
      font-family: Arial;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .quiz-box {
      width: 420px;
      padding: 30px;
      border-radius: 20px;
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(10px);
      text-align: center;
    }
    h2 { margin-bottom: 10px; }
    .answers button {
      display: block;
      width: 100%;
      margin: 10px 0;
      padding: 12px;
      border: none;
      border-radius: 12px;
      background: #334155;
      color: white;
      cursor: pointer;
      transition: 0.3s;
    }
    .answers button:hover {
      background: #38bdf8;
      color: black;
    }
    .progress {
      margin: 10px 0;
      opacity: 0.7;
    }
    .bar {
      height: 8px;
      background: #334155;
      border-radius: 10px;
      overflow: hidden;
    }
    .fill {
      height: 100%;
      width: 0%;
      background: #38bdf8;
      transition: 0.3s;
    }
    .fade {
      animation: fade 0.4s;
    }
    @keyframes fade {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  // ========== HTML ==========
  const quizBox = document.createElement('div');
  quizBox.className = 'quiz-box fade';

  const question = document.createElement('h2');
  question.id = 'question';
  question.textContent = 'Bấm bắt đầu 😏';

  const answers = document.createElement('div');
  answers.className = 'answers';
  answers.id = 'answers';

  const progress = document.createElement('div');
  progress.className = 'progress';
  progress.id = 'progress';

  const bar = document.createElement('div');
  bar.className = 'bar';
  const fill = document.createElement('div');
  fill.className = 'fill';
  fill.id = 'fill';
  bar.appendChild(fill);

  const startBtn = document.createElement('button');
  startBtn.id = 'startBtn';
  startBtn.textContent = 'Bắt đầu';

  quizBox.appendChild(question);
  quizBox.appendChild(answers);
  quizBox.appendChild(progress);
  quizBox.appendChild(bar);
  quizBox.appendChild(startBtn);
  document.body.appendChild(quizBox);

  // ========== DATA & STATE ==========
  const data = [
    {
      q: "Thánh Gióng thuộc thể loại gì?",
      options: ["Cổ tích", "Truyền thuyết", "Ngụ ngôn", "Thơ"],
      correct: 1
    },
    {
      q: "Ai là người đánh thắng Thủy Tinh?",
      options: ["Lang Liêu", "Sơn Tinh", "Gióng", "Lạc Long Quân"],
      correct: 1
    },
    {
      q: "Bánh chưng tượng trưng cho gì?",
      options: ["Trời", "Biển", "Đất", "Núi"],
      correct: 2
    },
    {
      q: "Gióng bay về đâu?",
      options: ["Biển", "Trời", "Núi", "Rừng"],
      correct: 1
    },
    {
      q: "Con Rồng Cháu Tiên có bao nhiêu con?",
      options: ["50", "100", "18", "10"],
      correct: 1
    }
  ];

  let current = 0;
  let xp = 0;

  // Âm thanh
  const correctSound = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");
  const wrongSound   = new Audio("https://www.soundjay.com/buttons/sounds/button-10.mp3");

  // ========== FUNCTIONS ==========
  function loadQ() {
    const q = data[current];
    question.textContent = q.q;
    answers.innerHTML = "";
    progress.textContent = `Câu ${current + 1}/${data.length}`;
    fill.style.width = (current / data.length) * 100 + "%";

    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.addEventListener('click', () => select(i));
      answers.appendChild(btn);
    });
  }

  function select(i) {
    const correct = data[current].correct;
    if (i === correct) {
      xp += 20;
      correctSound.play();
    } else {
      wrongSound.play();
    }

    current++;

    if (current < data.length) {
      // Tạo hiệu ứng fade
      quizBox.classList.remove('fade');
      void quizBox.offsetWidth; // trigger reflow
      quizBox.classList.add('fade');

      setTimeout(loadQ, 300);
    } else {
      showResult();
    }
  }

  function showResult() {
    let rank = "Gà 🐔";
    if (xp >= 80) rank = "Pro 😎";
    else if (xp >= 60) rank = "Ổn áp 🙂";
    else if (xp >= 40) rank = "Tập sự 😅";

    question.textContent = `🔥 XP: ${xp}\nRank: ${rank}`;
    answers.innerHTML = "";
    progress.textContent = "";
    fill.style.width = "100%";
    startBtn.style.display = "block";
    startBtn.textContent = "Chơi lại";
    startBtn.onclick = () => location.reload();
  }

  // Bắt đầu
  startBtn.addEventListener('click', () => {
    startBtn.style.display = "none";
    loadQ();
  });
})();