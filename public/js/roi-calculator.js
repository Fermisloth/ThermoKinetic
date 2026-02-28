/* ═══════════════════════════════════════════════════════════
   ThermoKinetic — ROI Calculator
   Interactive sliders with live output calculation
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const volumeSlider = document.getElementById('volumeSlider');
    const valueSlider = document.getElementById('valueSlider');
    const rateSlider = document.getElementById('rateSlider');
    const volumeVal = document.getElementById('volumeVal');
    const valueVal = document.getElementById('valueVal');
    const rateVal = document.getElementById('rateVal');
    const wasteOutput = document.getElementById('wasteOutput');
    const savingsOutput = document.getElementById('savingsOutput');
    const reductionOutput = document.getElementById('reductionOutput');
    const productToggle = document.getElementById('productToggle');

    if (!volumeSlider) return;

    let selectedProduct = 'Vaccine';

    // Waste reduction factors by product type
    const reductionFactors = {
        mRNA: 0.22,
        Biologic: 0.18,
        Insulin: 0.15,
        Vaccine: 0.20
    };

    function formatCurrency(num) {
        return '$' + num.toLocaleString('en-US');
    }

    function animateValue(el, newValue, prefix = '', suffix = '') {
        const currentText = el.textContent.replace(/[^0-9.-]/g, '');
        const current = parseFloat(currentText) || 0;
        const target = newValue;
        const duration = 400;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(current + (target - current) * eased);
            el.textContent = prefix + value.toLocaleString('en-US') + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }

    function calculate() {
        const volume = parseInt(volumeSlider.value);
        const value = parseInt(valueSlider.value);
        const rate = parseInt(rateSlider.value);
        const factor = reductionFactors[selectedProduct] || 0.20;

        const annualWaste = volume * value * (rate / 100);
        const projectedSavings = annualWaste * factor;
        const wasteReduction = factor * 100;

        // Update display values
        volumeVal.textContent = volume.toLocaleString('en-US') + ' units';
        valueVal.textContent = formatCurrency(value);
        rateVal.textContent = rate + '%';

        // Animate outputs
        animateValue(wasteOutput, Math.round(annualWaste), '$');
        animateValue(savingsOutput, Math.round(projectedSavings), '$');
        reductionOutput.textContent = wasteReduction + '%';
    }

    // Slider event listeners
    volumeSlider.addEventListener('input', calculate);
    valueSlider.addEventListener('input', calculate);
    rateSlider.addEventListener('input', calculate);

    // Product type toggle
    if (productToggle) {
        const pills = productToggle.querySelectorAll('.pill-option');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                selectedProduct = pill.dataset.value;
                calculate();
            });
        });
    }

    // Initial calculation
    calculate();
});
