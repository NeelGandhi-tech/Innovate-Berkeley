// Form handling and Formspree integration
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.contact-form');
    const interestButtons = document.querySelectorAll('.interest-btn');
    const hiddenInput = document.getElementById('interest-type');
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;

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

    // Handle form submission using Formspree AJAX
    async function handleSubmit(event) {
        event.preventDefault();
        
        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        submitBtn.style.background = '#6c757d';

        var data = new FormData(event.target);
        
        try {
            const response = await fetch(event.target.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
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
            } else {
                const data = await response.json();
                if (Object.hasOwn(data, 'errors')) {
                    submitBtn.textContent = 'Error: ' + data["errors"].map(error => error["message"]).join(", ");
                } else {
                    submitBtn.textContent = 'Error - Try Again';
                }
                submitBtn.style.background = '#dc3545';
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '#007bff';
                    submitBtn.disabled = false;
                }, 3000);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            submitBtn.textContent = 'Network Error - Try Again';
            submitBtn.style.background = '#dc3545';
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '#007bff';
                submitBtn.disabled = false;
            }, 3000);
        }
    }

    form.addEventListener("submit", handleSubmit);
});
