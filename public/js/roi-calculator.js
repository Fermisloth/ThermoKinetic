/* ═══════════════════════════════════════════════════════════
   ThermoKinetic — ROI Calculator
   Interactive sliders with server-side ROI calculation
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

    // New output elements
    const shipmentsSavedOutput = document.getElementById('shipmentsSavedOutput');
    const tierOutput = document.getElementById('tierOutput');
    const netRoiOutput = document.getElementById('netRoiOutput');
    const roiMultipleOutput = document.getElementById('roiMultipleOutput');

    if (!volumeSlider) return;

    let selectedProduct = 'mrna_vaccine';
    let calcTimeout = null;

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

    // Debounced server-side calculation
    function calculate() {
        const volume = parseInt(volumeSlider.value);
        const value = parseInt(valueSlider.value);
        const rate = parseInt(rateSlider.value);

        // Update display values immediately
        volumeVal.textContent = volume.toLocaleString('en-US') + ' units';
        valueVal.textContent = formatCurrency(value);
        rateVal.textContent = rate + '%';

        // Debounce API call (300ms)
        clearTimeout(calcTimeout);
        calcTimeout = setTimeout(() => {
            fetchROI(volume, value, rate, selectedProduct);
        }, 300);
    }

    async function fetchROI(annualShipments, avgProductValueUSD, currentExcursionRate, productType) {
        try {
            const response = await fetch('/api/roi/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    annualShipments,
                    avgProductValueUSD,
                    currentExcursionRate,
                    productType
                })
            });

            const data = await response.json();

            if (data.success) {
                const r = data.result;
                const p = data.platform;

                // Animate main outputs
                animateValue(wasteOutput, r.currentAnnualWasteUSD, '$');
                animateValue(savingsOutput, r.projectedAnnualSavingsUSD, '$');
                reductionOutput.textContent = r.wasteReductionPercent + '%';

                // Update new fields
                if (shipmentsSavedOutput) {
                    animateValue(shipmentsSavedOutput, r.shipmentsSavedPerYear);
                }
                if (tierOutput) {
                    tierOutput.textContent = p.suggestedTier;
                }
                if (netRoiOutput) {
                    if (typeof p.netROIafterPlatformUSD === 'number') {
                        animateValue(netRoiOutput, p.netROIafterPlatformUSD, '$');
                    } else {
                        netRoiOutput.textContent = p.netROIafterPlatformUSD;
                    }
                }
                if (roiMultipleOutput) {
                    roiMultipleOutput.textContent = p.roiMultiple;
                }
            }
        } catch (err) {
            console.error('ROI API error:', err);
            // Fallback: keep displaying whatever is currently shown
        }
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

    // Load benchmarks on page load
    async function loadBenchmarks() {
        try {
            const response = await fetch('/api/roi/benchmarks');
            const data = await response.json();
            if (data.success) {
                const b = data.benchmarks;
                const strip = document.getElementById('benchmarksStrip');
                const benchLoss = document.getElementById('benchLoss');
                const benchAccuracy = document.getElementById('benchAccuracy');
                const benchDiscard = document.getElementById('benchDiscard');

                if (benchLoss) benchLoss.textContent = '$' + (b.industryAnnualLossUSD / 1e9).toFixed(0) + 'B';
                if (benchAccuracy) benchAccuracy.textContent = b.degradationForecastAccuracy;
                if (benchDiscard) benchDiscard.textContent = b.globalVaccineDiscardRate;
                if (strip) strip.style.display = 'block';
            }
        } catch (err) {
            console.error('Benchmarks fetch error:', err);
        }
    }

    // Initial calculation and benchmarks
    calculate();
    loadBenchmarks();
});
