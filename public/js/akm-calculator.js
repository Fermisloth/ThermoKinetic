/* ═══════════════════════════════════════════════════════════
   ThermoKinetic — AKM Calculator Widget
   Interactive Arrhenius kinetic modeling calculator
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const widget = document.getElementById('akmWidget');
    if (!widget) return;

    const productSelect = document.getElementById('akmProductType');
    const excursionsContainer = document.getElementById('excursionsList');
    const addExcursionBtn = document.getElementById('addExcursion');
    const calculateBtn = document.getElementById('akmCalculateBtn');
    const resultsPanel = document.getElementById('akmResults');

    let excursionCount = 1;

    // Load product profiles from API
    async function loadProducts() {
        try {
            const res = await fetch('/api/akm/products');
            const data = await res.json();
            if (data.success && productSelect) {
                productSelect.innerHTML = '';
                data.products.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.key;
                    opt.textContent = `${p.label} (store at ${p.referenceStorageTempC}°C, threshold ${p.potencyThreshold}%)`;
                    productSelect.appendChild(opt);
                });
            }
        } catch (err) {
            console.error('Failed to load AKM products:', err);
        }
    }

    // Add excursion row
    function addExcursionRow(tempC = '', durationHours = '') {
        excursionCount++;
        const row = document.createElement('div');
        row.className = 'excursion-row';
        row.style.cssText = 'display: flex; gap: 12px; align-items: center; margin-bottom: 8px;';
        row.innerHTML = `
            <div style="flex: 1;">
                <input type="number" class="form-input exc-temp" placeholder="Temp °C" step="0.1" min="-80" max="60" value="${tempC}" style="padding: 8px 12px; font-size: 13px;">
            </div>
            <div style="flex: 1;">
                <input type="number" class="form-input exc-dur" placeholder="Hours" step="0.1" min="0.1" max="720" value="${durationHours}" style="padding: 8px 12px; font-size: 13px;">
            </div>
            <button type="button" class="remove-exc" style="background: none; border: 1px solid rgba(255,107,53,0.3); color: #FF6B35; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;">×</button>
        `;
        excursionsContainer.appendChild(row);

        row.querySelector('.remove-exc').addEventListener('click', () => {
            row.remove();
        });
    }

    if (addExcursionBtn) {
        addExcursionBtn.addEventListener('click', () => addExcursionRow());
    }

    // Calculate potency
    if (calculateBtn) {
        calculateBtn.addEventListener('click', async () => {
            const productType = productSelect.value;
            const tempInputs = excursionsContainer.querySelectorAll('.exc-temp');
            const durInputs = excursionsContainer.querySelectorAll('.exc-dur');

            const excursions = [];
            for (let i = 0; i < tempInputs.length; i++) {
                const tempC = parseFloat(tempInputs[i].value);
                const durationHours = parseFloat(durInputs[i].value);
                if (!isNaN(tempC) && !isNaN(durationHours) && durationHours > 0) {
                    excursions.push({ tempC, durationHours });
                }
            }

            if (excursions.length === 0) {
                alert('Please add at least one temperature excursion segment.');
                return;
            }

            calculateBtn.disabled = true;
            calculateBtn.textContent = 'Calculating...';

            try {
                const response = await fetch('/api/akm/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productType, excursions })
                });

                const data = await response.json();

                if (data.success) {
                    displayResults(data);
                } else {
                    const errorMsg = data.errors
                        ? data.errors.map(e => e.msg).join('; ')
                        : data.error || 'Calculation failed.';
                    resultsPanel.innerHTML = `<div style="color: var(--accent-warn); padding: 16px; text-align: center;">${errorMsg}</div>`;
                    resultsPanel.style.display = 'block';
                }
            } catch (err) {
                console.error('AKM API error:', err);
                resultsPanel.innerHTML = `<div style="color: var(--accent-warn); padding: 16px; text-align: center;">Network error. Please try again.</div>`;
                resultsPanel.style.display = 'block';
            }

            calculateBtn.disabled = false;
            calculateBtn.textContent = 'Calculate Potency →';
        });
    }

    function displayResults(data) {
        const placeholder = document.getElementById('akmResultsPlaceholder');
        if (placeholder) placeholder.style.display = 'none';
        const r = data.result;
        const p = data.product;
        const statusColor = r.status.color;

        resultsPanel.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div class="stat-card" style="padding: 16px; text-align: center;">
                    <div class="mono" style="font-size: 10px; color: var(--text-secondary); margin-bottom: 4px;">POTENCY REMAINING</div>
                    <div style="font-size: 32px; font-weight: 700; color: ${statusColor}; font-family: 'JetBrains Mono', monospace;">${r.potencyRemaining}%</div>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">threshold: ${p.potencyThreshold}%</div>
                </div>
                <div class="stat-card" style="padding: 16px; text-align: center;">
                    <div class="mono" style="font-size: 10px; color: var(--text-secondary); margin-bottom: 4px;">DYNAMIC EXPIRY</div>
                    <div style="font-size: 24px; font-weight: 700; color: var(--accent-cryo); font-family: 'JetBrains Mono', monospace;">${r.dynamicExpiryDate}</div>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">${r.daysRemaining} days remaining</div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <div style="text-align: center; padding: 12px; background: rgba(0,212,255,0.03); border-radius: 8px; border: 1px solid rgba(0,212,255,0.06);">
                    <div class="mono" style="font-size: 9px; color: var(--text-secondary); margin-bottom: 2px;">MKT</div>
                    <div style="font-size: 18px; font-weight: 600; color: var(--text-primary); font-family: 'JetBrains Mono', monospace;">${r.meanKineticTempC}°C</div>
                </div>
                <div style="text-align: center; padding: 12px; background: rgba(0,212,255,0.03); border-radius: 8px; border: 1px solid rgba(0,212,255,0.06);">
                    <div class="mono" style="font-size: 9px; color: var(--text-secondary); margin-bottom: 2px;">EXPOSURE</div>
                    <div style="font-size: 18px; font-weight: 600; color: var(--text-primary); font-family: 'JetBrains Mono', monospace;">${r.totalExposureHours}h</div>
                </div>
                <div style="text-align: center; padding: 12px; background: rgba(0,212,255,0.03); border-radius: 8px; border: 1px solid rgba(0,212,255,0.06);">
                    <div class="mono" style="font-size: 9px; color: var(--text-secondary); margin-bottom: 2px;">STATUS</div>
                    <div style="font-size: 14px; font-weight: 600; color: ${statusColor};">${r.status.label}</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; padding: 12px; background: ${statusColor}10; border: 1px solid ${statusColor}30; border-radius: 8px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: ${statusColor}; animation: qrPulse 2s ease infinite;"></span>
                <span style="font-size: 12px; color: ${statusColor}; font-family: 'JetBrains Mono', monospace; font-weight: 600;">${r.status.code}</span>
                <span style="font-size: 12px; color: var(--text-secondary); margin-left: auto;">Shipment ID: ${data.shipmentId}</span>
            </div>
        `;
        resultsPanel.style.display = 'block';
    }

    // Initialize
    loadProducts();
});
