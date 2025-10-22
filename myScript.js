document.addEventListener('DOMContentLoaded', () => {
  const sign = document.getElementById('shakingSign');

  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', e => e.preventDefault());
  });
  

  sign.addEventListener('click', () => {
    window.location.href = 'index2.html';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    sign.classList.add('shake-paused');
    nextIntro();
  });
  
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    sign.classList.remove('shake-paused');
    window.location.reload();
  });

  modal.style.display = 'none';

  document.body.addEventListener('mouseover', (e) => {
    const target = e.target;

    if (target.matches('button, .clickable, [role="button"], a, #closeBtn, #shakingSign')) {
      document.body.style.cursor = 'url("img/c_cursor.png"), pointer';
    } else if (target.matches('input, textarea, .text-field')) {
      document.body.style.cursor = 'url("img/t_cursor.png"), text';
    } else if (target.matches('.forbidden, [disabled]')) {
      document.body.style.cursor = 'url("img/s_cursor.png"), not-allowed';
    } else {
      document.body.style.cursor = 'url("img/cursor.png"), default';
    }
    
  });
});

