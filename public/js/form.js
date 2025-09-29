// Form handling and Formspree integration
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.contact-form');
    const interestButtons = document.querySelectorAll('.interest-btn');
    const hiddenInput = document.getElementById('interest-type');

    // Handle interest button interactions
    interestButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            interestButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Update hidden input value
            hiddenInput.value = this.getAttribute('data-value');
        });
    });

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Prepare form data
        const formData = new FormData(form);
        
        // Submit to Formspree
        fetch('https://formspree.io/f/mqayplry', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => {
                    throw new Error(`HTTP ${response.status}: ${text}`);
                });
            }
        })
        .then(data => {
            console.log('Success:', data);
            // Success
            submitBtn.textContent = 'Message Sent!';
            submitBtn.style.background = '#28a745';
            form.reset();
            // Reset interest button to default
            interestButtons.forEach(b => b.classList.remove('active'));
            document.querySelector('.interest-btn[data-value="sponsor"]').classList.add('active');
            hiddenInput.value = 'sponsor';
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '#007bff';
                submitBtn.disabled = false;
            }, 3000);
        })
        .catch(error => {
            // Error
            console.error('Form submission error:', error);
            submitBtn.textContent = 'Error - Try Again';
            submitBtn.style.background = '#dc3545';
            
            // Show more specific error message
            if (error.message.includes('HTTP 422')) {
                submitBtn.textContent = 'Invalid Data - Check Fields';
            } else if (error.message.includes('HTTP 429')) {
                submitBtn.textContent = 'Too Many Requests - Wait';
            } else if (error.message.includes('NetworkError')) {
                submitBtn.textContent = 'Network Error - Check Connection';
            }
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '#007bff';
                submitBtn.disabled = false;
            }, 3000);
        });
    });
});
