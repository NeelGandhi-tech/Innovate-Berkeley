// Contact form setup
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.contact-form');
    const interestButtons = document.querySelectorAll('.interest-btn');
    const hiddenInput = document.getElementById('interest-type');
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;

    // Interest button selection
    interestButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            interestButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            hiddenInput.value = this.getAttribute('data-value');
        });
    });

    // Form submission handler
    async function handleSubmit(event) {
        event.preventDefault();
        
        console.log('Submitting to:', event.target.action);
        console.log('Method:', event.target.method);
        
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        submitBtn.style.background = '#6c757d';

        var data = new FormData(event.target);
        
        console.log('Form data:');
        for (let [key, value] of data.entries()) {
            console.log(key, value);
        }
        
        try {
            const response = await fetch(event.target.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                submitBtn.textContent = 'Message Sent!';
                submitBtn.style.background = '#28a745';
                form.reset();
                
                // Reset to default selection
                interestButtons.forEach(b => b.classList.remove('active'));
                document.querySelector('.interest-btn[data-value="sponsor"]').classList.add('active');
                hiddenInput.value = 'sponsor';
                
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
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '#007bff';
                    submitBtn.disabled = false;
                }, 3000);
            }
        } catch (error) {
            console.error('Submission failed:', error);
            submitBtn.textContent = 'Network Error - Try Again';
            submitBtn.style.background = '#dc3545';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '#007bff';
                submitBtn.disabled = false;
            }, 3000);
        }
    }

    form.addEventListener("submit", handleSubmit);
});
