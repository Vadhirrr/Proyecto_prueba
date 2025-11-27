// Smooth scrolling para links de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar activo en scroll
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('.section');

window.addEventListener('scroll', () => {
    // Agregar sombra al navbar cuando se hace scroll
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    }

    // Resaltar link activo
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Hamburger menu para móviles
const hamburger = document.querySelector('.hamburger');
const navLinksContainer = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinksContainer.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Animaciones de entrada cuando los elementos entran en el viewport
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar elementos para animaciones
const animatedElements = document.querySelectorAll('.about-card, .timeline-item, .skill-category, .contact-item');
animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Manejo del formulario de contacto
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Obtener valores del formulario
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // Aquí puedes agregar la lógica para enviar el formulario
        // Por ahora, solo mostraremos un mensaje de éxito
        alert(`¡Gracias por tu mensaje, ${name}! Te contactaré pronto.`);
        
        // Limpiar formulario
        contactForm.reset();
    });
}

// Efecto de escritura en el título (opcional)
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    const text = heroTitle.innerHTML;
    heroTitle.innerHTML = '';
    let i = 0;
    
    function typeWriter() {
        if (i < text.length) {
            heroTitle.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    }
    
    // Iniciar el efecto después de un pequeño delay
    setTimeout(typeWriter, 500);
}

// Agregar efecto parallax sutil al hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - scrolled / 800;
    }
});

// Contador de experiencia animado
function animateCounter(element, target, duration) {
    let start = 0;
    const increment = target / (duration / 16); // 60 FPS
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Activar contador cuando la sección sea visible
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('[data-count]');
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-count'));
                animateCounter(counter, target, 2000);
            });
            timelineObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const experienciaSection = document.querySelector('.experiencia');
if (experienciaSection) {
    timelineObserver.observe(experienciaSection);
}

// Easter egg: Click en el logo
const logo = document.querySelector('.logo');
if (logo) {
    let clickCount = 0;
    logo.addEventListener('click', () => {
        clickCount++;
        if (clickCount === 5) {
            alert('¡Hola! Gracias por explorar mi portafolio 🚀');
            clickCount = 0;
        }
    });
}

/* --- Asistente Gemini (fetch puro) --- */
(function(){
  const root = document.getElementById('assistant-chat');
  if (!root) return;

  const toggle = document.getElementById('assistant-toggle');
  const closeBtn = document.getElementById('assistant-close');
  const form = document.getElementById('assistant-form');
  const input = document.getElementById('assistant-input');
  const messagesEl = document.getElementById('assistant-messages');

  // Poner a false para hacer llamadas reales (riesgo: expone la API key en el cliente)
  const ASSISTANT_TEST_MODE = false;

  async function sendToGemini(prompt) {
    if (ASSISTANT_TEST_MODE) {
      await new Promise(r => setTimeout(r, 700));
      return { text: "Respuesta simulada: " + prompt, simulated: true };
    }

    // ADVERTENCIA: si pruebas desde cliente, usa YOUR_API_KEY_HERE (no recomendado en producción)
    const API_KEY = 'AIzaSyA7K0JuntY4g44g5S8qJvLgolemkZ4BNOA';
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    // <-- enviar solo el prompt del usuario, no texto fijo
    const bodyPayload = {
      contents: [
        {
          parts: [
            { text: String(prompt) }
          ]
        }
      ]
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': API_KEY },
      body: JSON.stringify(bodyPayload)
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Gemini returned ${res.status}: ${txt}`);
    }

    const json = await res.json();

    // Parsing robusto y limpieza final
    let text = '';
    if (Array.isArray(json?.candidates) && json.candidates.length) {
      const content = json.candidates[0].content;
      if (Array.isArray(content)) {
        text = content.map(i => (typeof i === 'string' ? i : (i?.text ?? ''))).join('\n').trim();
      } else if (typeof content === 'string') text = content;
      else {
        const found = [];
        const walk = v => { if (!v) return; if (typeof v === 'string') found.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (typeof v === 'object') Object.values(v).forEach(walk); };
        walk(content);
        text = found.join('\n').trim();
      }
    }
    if (!text && Array.isArray(json?.output)) {
      text = json.output.map(o => (typeof o === 'string' ? o : (o?.content?.map(c => c?.text || '').join('') || ''))).join('\n').trim();
    }
    if (!text) {
      const collected = [];
      const collect = v => { if (!v) return; if (typeof v === 'string') collected.push(v); else if (Array.isArray(v)) v.forEach(collect); else if (typeof v === 'object') Object.values(v).forEach(collect); };
      collect(json);
      text = collected.join('\n').slice(0, 3000).trim() || JSON.stringify(json);
    }

    // Eliminar líneas vacías o que solo contengan "model"
    text = text.replace(/(^|\n)\s*model\s*(\n|$)/ig, '\n').replace(/\n{2,}/g, '\n\n').trim();

    console.debug('[Gemini raw response]', json);
    return { text, raw: json };
  }

  function nowTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function createMessageNode({ text, who='assistant', simulated=false }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'msg-wrapper ' + (who === 'user' ? 'user' : 'assistant');

    // avatar
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = who === 'user' ? 'TU' : 'AI';

    // bubble
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble' + (simulated ? ' simulated' : '');
    bubble.innerHTML = `<div class="msg-content">${escapeHtml(text)}</div>
                        <div class="msg-meta"><div class="msg-time">${nowTime()}</div></div>`;

    if (who === 'user') {
      wrapper.appendChild(bubble);
      wrapper.appendChild(avatar);
    } else {
      wrapper.appendChild(avatar);
      wrapper.appendChild(bubble);
    }
    return wrapper;
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
  }

  function appendMessage(text, who='assistant', simulated=false) {
    const node = createMessageNode({ text, who, simulated });
    messagesEl.appendChild(node);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return node;
  }

  function appendTyping() {
    const wrapper = document.createElement('div');
    wrapper.className = 'msg-wrapper assistant';
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar'; avatar.textContent = 'AI';
    const typing = document.createElement('div');
    typing.className = 'typing';
    typing.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
    wrapper.appendChild(avatar);
    wrapper.appendChild(typing);
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrapper;
  }

  // events
  toggle.addEventListener('click', () => root.classList.contains('open') ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  function openChat(){ root.classList.remove('closed'); root.classList.add('open'); root.setAttribute('aria-hidden','false'); input.focus(); }
  function closeChat(){ root.classList.remove('open'); root.classList.add('closed'); root.setAttribute('aria-hidden','true'); }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim(); if (!text) return;
    appendMessage(text, 'user');
    input.value='';
    const typingNode = appendTyping();

    try {
      const json = await sendToGemini(text);
      typingNode.remove();
      const simulated = !!json?.simulated;
      appendMessage(json?.text || 'Sin respuesta', 'assistant', simulated);
    } catch (err) {
      typingNode.remove();
      appendMessage('Error: ' + (err.message || 'Error de conexión'), 'assistant', false);
      console.error(err);
    }
  });

  // shortcuts
  window.addEventListener('keydown', (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') { ev.preventDefault(); openChat(); }
    if (ev.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { openChat(); input.focus(); }
  });

})();
