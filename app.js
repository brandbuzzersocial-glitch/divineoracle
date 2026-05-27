/* ==========================================================================
   Divine Oracle Tarot — Interactive App Scripts
   Author: Antigravity AI
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. Cosmic Starfield Canvas System
  // ==========================================
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  
  let stars = [];
  let shootingStars = [];
  const starCount = 100;
  
  // Handle window resizing
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  // Star Constructor
  class Star {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height; // Spread initially across full screen
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 10;
      this.radius = Math.random() * 1.5;
      this.alpha = Math.random() * 0.8 + 0.2;
      this.speed = Math.random() * 0.4 + 0.1;
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
      this.pulseDirection = Math.random() > 0.5 ? 1 : -1;
    }
    
    update() {
      // Float upward gently
      this.y -= this.speed;
      
      // Twinkle alpha pulse
      this.alpha += this.pulseSpeed * this.pulseDirection;
      if (this.alpha >= 1) {
        this.alpha = 1;
        this.pulseDirection = -1;
      } else if (this.alpha <= 0.1) {
        this.alpha = 0.1;
        this.pulseDirection = 1;
      }
      
      // Reset if moves past top of screen
      if (this.y < -10) {
        this.reset();
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${this.alpha})`; // Delicate gold stars
      ctx.fill();
    }
  }
  
  // Shooting Star Constructor
  class ShootingStar {
    constructor() {
      this.reset();
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * (canvas.height * 0.5);
      this.len = Math.random() * 80 + 40;
      this.speed = Math.random() * 10 + 5;
      this.angle = Math.PI / 4; // Slanted downwards
      this.alpha = 1;
      this.fadeSpeed = Math.random() * 0.03 + 0.01;
    }
    
    update() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.alpha -= this.fadeSpeed;
    }
    
    draw() {
      ctx.beginPath();
      const grad = ctx.createLinearGradient(
        this.x, this.y, 
        this.x - Math.cos(this.angle) * this.len, 
        this.y - Math.sin(this.angle) * this.len
      );
      grad.addColorStop(0, `rgba(255, 217, 125, ${this.alpha})`);
      grad.addColorStop(1, 'rgba(255, 217, 125, 0)');
      
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        this.x - Math.cos(this.angle) * this.len, 
        this.y - Math.sin(this.angle) * this.len
      );
      ctx.stroke();
    }
  }
  
  // Initialize starfield
  for (let i = 0; i < starCount; i++) {
    stars.push(new Star());
  }
  
  // Star loop animation
  function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw and update stars
    stars.forEach(star => {
      star.update();
      star.draw();
    });
    
    // Periodically spawn shooting stars
    if (Math.random() < 0.003 && shootingStars.length < 2) {
      shootingStars.push(new ShootingStar());
    }
    
    // Update and draw shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.update();
      if (ss.alpha <= 0) {
        shootingStars.splice(i, 1);
      } else {
        ss.draw();
      }
    }
    
    requestAnimationFrame(animateStars);
  }
  animateStars();


  // ==========================================
  // 2. Interactive 3D Parallax Card Controller
  // ==========================================
  const heroViewport = document.querySelector('.hero-visual-viewport');
  const cards = document.querySelectorAll('.tarot-card-3d');
  
  if (heroViewport && cards.length > 0) {
    heroViewport.addEventListener('mousemove', (e) => {
      const rect = heroViewport.getBoundingClientRect();
      // Get mouse coords relative to viewport center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      // Map cursor movement to rotation angles
      cards.forEach(card => {
        const factor = parseFloat(card.getAttribute('data-parallax-factor')) || 0.08;
        const rotateY = mouseX * factor;
        const rotateX = -mouseY * factor;
        
        // Base translation offsets to keep their relative positioning
        let baseTrans = '';
        if (card.classList.contains('card-star')) {
          baseTrans = 'translate3d(-60px, -20px, 40px)';
        } else {
          baseTrans = 'translate3d(80px, 30px, 0px)';
        }
        
        card.style.transform = `${baseTrans} rotateY(${rotateY + (card.classList.contains('card-star') ? -8 : 10)}deg) rotateX(${rotateX + (card.classList.contains('card-star') ? 6 : -5)}deg)`;
        
        // Adjust specular shine glare position based on cursor relative coordinates
        const glare = card.querySelector('.card-glow');
        if (glare) {
          const cardRect = card.getBoundingClientRect();
          const glareX = ((e.clientX - cardRect.left) / cardRect.width) * 100;
          const glareY = ((e.clientY - cardRect.top) / cardRect.height) * 100;
          glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)`;
        }
      });
    });
    
    // Smooth reset on mouse leave
    heroViewport.addEventListener('mouseleave', () => {
      cards.forEach(card => {
        card.style.transition = 'transform 0.8s ease-out';
        
        let resetTrans = '';
        if (card.classList.contains('card-star')) {
          resetTrans = 'translate3d(-60px, -20px, 40px) rotateY(-8deg) rotateX(6deg) rotateZ(-6deg)';
        } else {
          resetTrans = 'translate3d(80px, 30px, 0px) rotateY(10deg) rotateX(-5deg) rotateZ(4deg)';
        }
        card.style.transform = resetTrans;
        
        // Reset glare position
        const glare = card.querySelector('.card-glow');
        if (glare) {
          glare.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%)';
        }
        
        // Remove smooth transition after completion to avoid lag in continuous hover tracking
        setTimeout(() => {
          card.style.transition = '';
        }, 800);
      });
    });
  }


  // ==========================================
  // 3. Navigation Header Shrink & Mobile Toggle
  // ==========================================
  const header = document.getElementById('header');
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.getElementById('primary-navigation');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Shrink header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
  
  // Mobile menu toggle trigger
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !expanded);
      navMenu.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });
  }
  
  // Close menu when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
  });


  // ==========================================
  // 4. ScrollSpy: Update active nav states
  // ==========================================
  const sections = document.querySelectorAll('section[id]');
  
  function scrollSpy() {
    const currentScrollY = window.pageYOffset + 120; // Offsets top sticky nav
    
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop;
      const sectionId = section.getAttribute('id');
      
      if (currentScrollY > sectionTop && currentScrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', scrollSpy);


  // ==========================================
  // 5. Service Category Tab Filtering
  // ==========================================
  window.filterServices = function(category) {
    const tabButtons = document.querySelectorAll('.services-tabs .tab-btn');
    const serviceBlocks = document.querySelectorAll('.services-category-block');
    
    // Toggle active tab buttons
    tabButtons.forEach(btn => {
      btn.classList.remove('active');
      if (
        (category === 'all' && btn.innerText.includes('All')) ||
        (category === 'whispered' && btn.innerText.includes('Whispered')) ||
        (category === 'talk' && btn.innerText.includes('Talk')) ||
        (category === 'vision' && btn.innerText.includes('Vision')) ||
        (category === 'live' && btn.innerText.includes('Live'))
      ) {
        btn.classList.add('active');
      }
    });
    
    // Filter Category display blocks
    serviceBlocks.forEach(block => {
      block.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      
      if (category === 'all' || block.getAttribute('data-category') === category) {
        block.classList.remove('hidden');
        setTimeout(() => {
          block.style.opacity = '1';
          block.style.transform = 'translateY(0)';
        }, 50);
      } else {
        block.style.opacity = '0';
        block.style.transform = 'translateY(15px)';
        setTimeout(() => {
          block.classList.add('hidden');
        }, 400);
      }
    });
  };


  // ==========================================
  // 6. Testimonials Sliding Carousel
  // ==========================================
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.carousel-indicators .dot');
  const prevBtn = document.querySelector('.carousel-control.prev');
  const nextBtn = document.querySelector('.carousel-control.next');
  let currentSlide = 0;
  let carouselInterval;
  
  function updateCarousel(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Clamp indices
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }
  
  // Button Event Listeners
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      updateCarousel(currentSlide - 1);
      resetAutoSlide();
    });
    
    nextBtn.addEventListener('click', () => {
      updateCarousel(currentSlide + 1);
      resetAutoSlide();
    });
  }
  
  // Jump to specific slide using dots indicator
  window.jumpToSlide = function(index) {
    updateCarousel(index);
    resetAutoSlide();
  };
  
  // Auto rotation loop
  function startAutoSlide() {
    carouselInterval = setInterval(() => {
      updateCarousel(currentSlide + 1);
    }, 6500);
  }
  
  function resetAutoSlide() {
    clearInterval(carouselInterval);
    startAutoSlide();
  }
  
  if (slides.length > 0) {
    startAutoSlide();
  }


  // ==========================================
  // 7. FAQ Accordion Height Toggle
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    
    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all open FAQs
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-content').style.maxHeight = '0';
      });
      
      // If was not active, open it
      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });


  // ==========================================
  // 8. Meet Your Guide Biography Modal
  // ==========================================
  const bioModal = document.getElementById('bio-modal');
  
  window.toggleBioModal = function(show) {
    if (show) {
      bioModal.classList.add('active');
      document.body.classList.add('no-scroll');
    } else {
      bioModal.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }
  };
  
  // Click outside to close modals
  window.addEventListener('click', (e) => {
    if (e.target === bioModal) {
      toggleBioModal(false);
    }
    if (e.target === bookingModal) {
      closeBookingModal();
    }
  });


  // ==========================================
  // 9. Booking Funnel & WhatsApp Redirect
  // ==========================================
  const bookingModal = document.getElementById('booking-modal');
  const bookingForm = document.getElementById('booking-funnel-form');
  const serviceInput = document.getElementById('modal-service-selected');
  const formatInput = document.getElementById('modal-format-selected');
  
  // Open Booking trigger
  window.openBookingModal = function(serviceName, formatName) {
    if (serviceInput && formatInput && bookingModal) {
      serviceInput.value = serviceName;
      formatInput.value = formatName;
      
      bookingModal.classList.add('active');
      document.body.classList.add('no-scroll');
    }
  };
  
  // Close Booking trigger
  window.closeBookingModal = function() {
    if (bookingModal) {
      bookingModal.classList.remove('active');
      document.body.classList.remove('no-scroll');
      if (bookingForm) bookingForm.reset();
    }
  };
  
  // Process Booking and compile message redirecting to WhatsApp
  window.handleFormSubmission = function(event) {
    event.preventDefault();
    
    // Form Inputs
    const service = serviceInput.value;
    const format = formatInput.value;
    const name = document.getElementById('client-name').value;
    const dob = document.getElementById('client-dob').value;
    const tob = document.getElementById('client-tob').value || 'Not provided';
    const birthplace = document.getElementById('client-pob').value || 'Not provided';
    const partner = document.getElementById('partner-details').value || 'None';
    const questions = document.getElementById('client-questions').value;
    
    // Format Date of Birth cleanly
    let formattedDob = dob;
    try {
      const dateParts = dob.split('-');
      if (dateParts.length === 3) {
        const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        formattedDob = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch(err) {
      formattedDob = dob;
    }
    
    // Build Structured message for Ishita's WhatsApp
    const whatsappNumber = '919999988888'; // Replace with Ishita Kothari's actual WhatsApp business number
    
    const message = `🔮 *NEW SACRED BOOKING REQUEST* 🔮

👤 *Client Name:* ${name}
📅 *Date of Birth:* ${formattedDob}
⏰ *Birth Time:* ${tob}
📍 *Birthplace:* ${birthplace}

📖 *Selected Service:* ${service}
🎭 *Reading Format:* ${format}

👥 *Relational Connection details:* ${partner}

❓ *Subconscious blockages / Questions:*
"${questions}"

✨ _Please confirm my booking slot and share payment coordinates._ ✨`;

    // Encode string and redirect
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Open in new tab and close booking modal
    window.open(whatsappUrl, '_blank');
    closeBookingModal();
  };

});
