(function () {
  'use strict';

  // ---- Subscribe form -------------------------------------------------------
  // Same rule as lib/validate-email.js (the server checks again).
  var EMAIL_PATTERN =
    /^[A-Za-z0-9_%+-]+(?:\.[A-Za-z0-9_%+-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;

  function emailProblem(value) {
    if (!value) return 'Please enter your email address.';
    if (value.indexOf('@') === -1) return 'Please include an "@" in the email address.';
    if (value.length > 254 || value.split('@')[0].length > 64 || !EMAIL_PATTERN.test(value)) {
      return 'Please enter a valid email address, like name@example.com.';
    }
    return '';
  }

  var form = document.querySelector('.landing-subscribe');
  if (form) {
    var input = form.querySelector('#landing-email');
    var trap = form.querySelector('input[name="website"]');
    var button = form.querySelector('button[type="submit"]');
    var status = document.getElementById('landing-subscribe-status');
    var buttonLabel = button.textContent;
    var showingError = false;

    function setStatus(kind, message) {
      status.textContent = message;
      status.className = 'landing-form-status' + (kind ? ' is-' + kind : '');
      showingError = kind === 'error';
      input.setAttribute('aria-invalid', showingError ? 'true' : 'false');
      input.classList.toggle('is-invalid', showingError);
    }

    function setSending(sending) {
      button.disabled = sending;
      input.readOnly = sending;
      button.textContent = sending ? 'Subscribing…' : buttonLabel;
    }

    // Once an error is showing, clear it as soon as the address becomes valid.
    input.addEventListener('input', function () {
      if (showingError && !emailProblem(input.value.trim())) setStatus('', '');
    });

    input.addEventListener('blur', function () {
      var value = input.value.trim();
      if (value && emailProblem(value)) setStatus('error', emailProblem(value));
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (button.disabled) return;

      var email = input.value.trim();
      var problem = emailProblem(email);
      if (problem) {
        setStatus('error', problem);
        input.focus();
        return;
      }

      setStatus('', '');
      setSending(true);

      fetch(form.getAttribute('action'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, website: trap ? trap.value : '' }),
      })
        .then(function (response) {
          return response
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              return { ok: response.ok && data.ok, message: data.message };
            });
        })
        .then(function (result) {
          setSending(false);
          if (result.ok) {
            form.reset();
            setStatus('success', result.message || "You're subscribed! Please check your inbox.");
          } else {
            setStatus('error', result.message || 'Something went wrong. Please try again.');
          }
        })
        .catch(function () {
          setSending(false);
          setStatus('error', "We couldn't reach the server. Check your connection and try again.");
        });
    });
  }

  // ---- Reveal sections as they scroll into view ----------------------------
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll(
      '.landing-section-head, .landing-card, .landing-cause-card, .landing-step, .landing-role-card, .landing-cta-box'
    );
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    Array.prototype.forEach.call(targets, function (el) {
      // Stagger cards that sit side by side in the same grid.
      var index = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = (index % 3) * 90 + 'ms';
      el.classList.add('landing-reveal');
      observer.observe(el);
    });
  }
})();
