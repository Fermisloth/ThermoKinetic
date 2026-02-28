/* ═══════════════════════════════════════════════════════════
   ThermoKinetic — Contact Form Handler
   Validates and submits demo requests to /api/contact
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        submitBtn.style.opacity = '0.6';

        const formData = {
            name: document.getElementById('name').value.trim(),
            company: document.getElementById('company').value.trim(),
            role: document.getElementById('role').value,
            email: document.getElementById('email').value.trim(),
            volume: document.getElementById('volume').value.trim(),
            message: document.getElementById('message').value.trim()
        };

        // Client-side validation
        if (!formData.name || !formData.company || !formData.email) {
            showToast('Please fill in all required fields.', true);
            resetButton();
            return;
        }

        if (!isValidEmail(formData.email)) {
            showToast('Please enter a valid email address.', true);
            resetButton();
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                showToast('Demo request sent! We\'ll respond within 24 hours.', false);
                form.reset();
            } else {
                showToast(result.error || 'Something went wrong. Please try again.', true);
            }
        } catch (err) {
            showToast('Network error. Please check your connection and try again.', true);
        }

        resetButton();
    });

    function resetButton() {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request My Demo →';
        submitBtn.style.opacity = '1';
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showToast(message, isError) {
        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.style.borderColor = isError ? 'var(--accent-warn)' : 'var(--accent-bio)';
        toast.style.color = isError ? 'var(--accent-warn)' : 'var(--accent-bio)';
        toast.querySelector('span:first-child').textContent = isError ? '✗' : '✓';

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
});
