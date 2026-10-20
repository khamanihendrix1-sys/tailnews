    document.querySelector('form').addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = this.querySelector('button[type="submit"]');
      btn.textContent = 'Signing in\u2026';
      btn.disabled = true;
      setTimeout(function() { window.location.href = 'dashboard.html'; }, 600);
    });
