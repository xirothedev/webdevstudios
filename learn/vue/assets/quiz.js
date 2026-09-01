// Reusable quiz widget for lessons. Usage in lesson HTML:
// <div class="quiz" data-answer="2">
//   <h3>Question?</h3>
//   <button class="opt">A</button><button class="opt">B</button><button class="opt">C</button>
//   <p class="fb"></p>
// </div>
// Optional per-option feedback: data-fb="why this is right/wrong" on each .opt.
// Multiple quizzes per page supported. Answers chosen so options have equal length.
document.querySelectorAll('.quiz').forEach((quiz) => {
  const answer = Number(quiz.dataset.answer);
  const fb = quiz.querySelector('.fb');
  quiz.querySelectorAll('.opt').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      quiz.querySelectorAll('.opt').forEach((b) => b.classList.remove('correct', 'wrong'));
      if (i === answer) {
        btn.classList.add('correct');
        fb.textContent = btn.dataset.fb || 'Đúng.';
        fb.className = 'fb ok';
      } else {
        btn.classList.add('wrong');
        fb.textContent = btn.dataset.fb || 'Chưa đúng. Nghĩ lại xem React làm gì ở tình huống này.';
        fb.className = 'fb no';
      }
    });
  });
});
