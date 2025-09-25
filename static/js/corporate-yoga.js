document.addEventListener('DOMContentLoaded', function() {

  // --- FORM LOGIC ---
  const progressText = document.getElementById('progressText');
  const nextButtons = document.querySelectorAll('.next-button');

  // Function to validate a specific step's questions
  function validateStep(stepNumber) {
    let isValid = true;
    let questions;

    if (stepNumber === 1) {
      questions = { start: 1, end: 6 };
    } else if (stepNumber === 2) {
      questions = { start: 7, end: 12 };
    } else {
      return true; // No validation needed for the final step before submission
    }

    // Loop through the questions for the current step
    for (let i = questions.start; i <= questions.end; i++) {
      if (!document.querySelector(`input[name="q${i}"]:checked`)) {
        isValid = false;
        break; // Stop checking if one is unanswered
      }
    }
    return isValid;
  }

  // Add a click listener to each "Next" button on the page
  nextButtons.forEach(button => {
    button.addEventListener('click', () => {
      const currentStepElement = button.closest('.form-step');
      const currentStepNumber = parseInt(currentStepElement.getAttribute('data-step'));
      const nextStepNumber = currentStepNumber + 1;

      // Validate the current step before proceeding
      if (validateStep(currentStepNumber)) {
        // Find the next step element
        const nextStepElement = document.getElementById(`step${nextStepNumber}`);
        
        if (nextStepElement) {
          // Switch the 'active' class from the current step to the next one
          currentStepElement.classList.remove('active');
          nextStepElement.classList.add('active');
          
          // Update the progress indicator text
          progressText.textContent = nextStepNumber;
        }
      } else {
        // If validation fails, alert the user
        alert('Please answer all questions before proceeding.');
      }
    });
  });

  // Handle form submission
  const form = document.querySelector('form[action*="submit_wellness"]');
  if (form) {
    form.addEventListener('submit', function(e) {
      console.log('Form submission initiated');
      
      // Check if all required questions are answered
      let allAnswered = true;
      for (let i = 1; i <= 12; i++) {
        if (!document.querySelector(`input[name="q${i}"]:checked`)) {
          allAnswered = false;
          console.log(`Question ${i} not answered`);
          break;
        }
      }
      
      // Check required personal info fields
      const name = document.querySelector('input[name="name"]').value.trim();
      const mobile = document.querySelector('input[name="mobile"]').value.trim();
      const email = document.querySelector('input[name="email"]').value.trim();
      
      if (!allAnswered || !name || !mobile || !email) {
        e.preventDefault();
        alert('Please complete all required fields and answer all questions before submitting.');
        return false;
      }
      
      console.log('Form validation passed, submitting...');
    });
  }

  // --- SWIPER JS INITIALIZATION FOR TESTIMONIALS ---
  const swiper = new Swiper('.mySwiper', {
    loop: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
  });

});