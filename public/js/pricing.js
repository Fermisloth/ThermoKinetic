/* ═══════════════════════════════════════════════════════════
   ThermoKinetic — Pricing Toggle
   Monthly / Annual billing switch
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const billingToggle = document.getElementById('billingToggle');
    const saveBadge = document.getElementById('saveBadge');
    const priceStarter = document.getElementById('price-starter');
    const pricePro = document.getElementById('price-pro');

    if (!billingToggle) return;

    const prices = {
        monthly: { starter: '$499', pro: '$1,499' },
        annual: { starter: '$399', pro: '$1,199' }
    };

    const options = billingToggle.querySelectorAll('.toggle-option');

    options.forEach(option => {
        option.addEventListener('click', () => {
            options.forEach(o => o.classList.remove('active'));
            option.classList.add('active');

            const period = option.dataset.period;
            const isAnnual = period === 'annual';

            // Update prices
            if (priceStarter) {
                priceStarter.innerHTML = prices[period].starter + '<span class="price-period">/mo</span>';
            }
            if (pricePro) {
                pricePro.innerHTML = prices[period].pro + '<span class="price-period">/mo</span>';
            }

            // Show/hide save badge
            if (saveBadge) {
                saveBadge.style.display = isAnnual ? 'inline' : 'none';
            }
        });
    });
});
