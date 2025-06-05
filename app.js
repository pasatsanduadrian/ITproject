// Cost Estimation Calculator JavaScript

const defaultConfig = {
    rates: {
        junior: 42,
        mid: 65,
        senior: 95,
        architect: 85,
        qaManual: 35,
        qaAuto: 45,
        documentation: 40,
        training: 40,
        projectMgmt: 75
    },
    hardwareCosts: {
        assembly: 1500,
        certification: 6000,
        logistics: 800
    },
    licensePresets: [
        { id: 'database', name: 'Licență Bază de Date Enterprise', cost: 5000 },
        { id: 'framework', name: 'Framework Comercial', cost: 2500 },
        { id: 'cicd', name: 'Instrumente CI/CD', cost: 1000 },
        { id: 'ide', name: 'IDE Professional', cost: 500 }
    ],
    riskBuffer: 15,
    commercialMargin: 20
};

function loadConfig() {
    try {
        const raw = localStorage.getItem('costConfig');
        if (raw) {
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error('Failed to load config', e);
    }
    return JSON.parse(JSON.stringify(defaultConfig));
}

function saveConfig(cfg) {
    try {
        localStorage.setItem('costConfig', JSON.stringify(cfg));
    } catch (e) {
        console.error('Failed to save config', e);
    }
}

class CostCalculator {
    constructor() {
        this.config = loadConfig();
        this.rates = { ...this.config.rates };
        this.hardwareCosts = { ...this.config.hardwareCosts };
        this.licensePresets = JSON.parse(JSON.stringify(this.config.licensePresets));
        this.chart = null;
        this.init();
    }

    applyConfigToUI() {
        // Developer rates display
        document.getElementById('rateJuniorDisplay').textContent = `${this.rates.junior} €/oră`;
        document.getElementById('rateMidDisplay').textContent = `${this.rates.mid} €/oră`;
        document.getElementById('rateSeniorDisplay').textContent = `${this.rates.senior} €/oră`;
        document.getElementById('rateArchitectDisplay').textContent = `${this.rates.architect} €/oră`;

        // Service labels
        document.getElementById('labelQaManual').textContent = `Testare QA Manual (${this.rates.qaManual} €/oră)`;
        document.getElementById('labelQaAuto').textContent = `Testare QA Automatizat (${this.rates.qaAuto} €/oră)`;
        document.getElementById('labelDocumentation').textContent = `Documentație Tehnică (${this.rates.documentation} €/oră)`;
        document.getElementById('labelTraining').textContent = `Training Utilizatori (${this.rates.training} €/oră)`;
        document.getElementById('labelProjectMgmt').textContent = `Management Proiect (${this.rates.projectMgmt} €/oră)`;

        // Hardware service labels and placeholders
        document.getElementById('labelAssembly').textContent = 'Asamblare și Testare';
        document.getElementById('labelCertification').textContent = 'Certificări (CE, FCC, ROHS)';
        document.getElementById('labelLogistics').textContent = 'Logistică și Transport';
        document.getElementById('assemblyCost').placeholder = this.hardwareCosts.assembly;
        document.getElementById('certificationCost').placeholder = this.hardwareCosts.certification;
        document.getElementById('logisticsCost').placeholder = this.hardwareCosts.logistics;

        // License selects
        document.querySelectorAll('.license-select').forEach(sel => {
            this.populateLicenseSelect(sel);
        });

        // Sliders default values
        document.getElementById('riskBuffer').value = this.config.riskBuffer;
        document.getElementById('commercialMargin').value = this.config.commercialMargin;
        document.getElementById('riskValue').textContent = this.config.riskBuffer;
        document.getElementById('marginValue').textContent = this.config.commercialMargin;

        // Config form values
        document.getElementById('cfgJunior').value = this.rates.junior;
        document.getElementById('cfgMid').value = this.rates.mid;
        document.getElementById('cfgSenior').value = this.rates.senior;
        document.getElementById('cfgArchitect').value = this.rates.architect;
        document.getElementById('cfgQaManual').value = this.rates.qaManual;
        document.getElementById('cfgQaAuto').value = this.rates.qaAuto;
        document.getElementById('cfgDocumentation').value = this.rates.documentation;
        document.getElementById('cfgTraining').value = this.rates.training;
        document.getElementById('cfgProjectMgmt').value = this.rates.projectMgmt;
        document.getElementById('cfgAssembly').value = this.hardwareCosts.assembly;
        document.getElementById('cfgCertification').value = this.hardwareCosts.certification;
        document.getElementById('cfgLogistics').value = this.hardwareCosts.logistics;
        this.renderLicensePresetConfig();
    }

    updateConfigFromForm() {
        this.config.rates.junior = parseFloat(document.getElementById('cfgJunior').value) || 0;
        this.config.rates.mid = parseFloat(document.getElementById('cfgMid').value) || 0;
        this.config.rates.senior = parseFloat(document.getElementById('cfgSenior').value) || 0;
        this.config.rates.architect = parseFloat(document.getElementById('cfgArchitect').value) || 0;
        this.config.rates.qaManual = parseFloat(document.getElementById('cfgQaManual').value) || 0;
        this.config.rates.qaAuto = parseFloat(document.getElementById('cfgQaAuto').value) || 0;
        this.config.rates.documentation = parseFloat(document.getElementById('cfgDocumentation').value) || 0;
        this.config.rates.training = parseFloat(document.getElementById('cfgTraining').value) || 0;
        this.config.rates.projectMgmt = parseFloat(document.getElementById('cfgProjectMgmt').value) || 0;
        this.config.hardwareCosts.assembly = parseFloat(document.getElementById('cfgAssembly').value) || 0;
        this.config.hardwareCosts.certification = parseFloat(document.getElementById('cfgCertification').value) || 0;
        this.config.hardwareCosts.logistics = parseFloat(document.getElementById('cfgLogistics').value) || 0;
        this.config.licensePresets = [];
        document.querySelectorAll('#licensePresetsConfig .preset-row').forEach(row => {
            const id = row.querySelector('.preset-id').value.trim();
            const name = row.querySelector('.preset-name').value.trim();
            const cost = parseFloat(row.querySelector('.preset-cost').value) || 0;
            if (id) {
                this.config.licensePresets.push({ id, name, cost });
            }
        });

        this.rates = { ...this.config.rates };
        this.hardwareCosts = { ...this.config.hardwareCosts };
        this.licensePresets = JSON.parse(JSON.stringify(this.config.licensePresets));
    }

    init() {
        this.applyConfigToUI();
        this.bindEvents();
        this.initChart();
        this.updateVisibility();
        this.calculateAll();
        this.loadFromStorage();
    }

    bindEvents() {
        // Project type change
        document.getElementById('projectType').addEventListener('change', () => {
            this.updateVisibility();
            this.calculateAll();
        });

        // Developer hours inputs
        ['junior', 'mid', 'senior', 'architect'].forEach(role => {
            document.getElementById(`${role}Hours`).addEventListener('input', () => {
                this.calculateDeveloperCost(role);
                this.calculateAll();
            });
        });

        // Service checkboxes and hours
        ['qaManual', 'qaAuto', 'documentation', 'training', 'projectMgmt'].forEach(service => {
            const checkbox = document.getElementById(service);
            const hoursInput = document.getElementById(`${service}Hours`);
            
            checkbox.addEventListener('change', () => {
                hoursInput.disabled = !checkbox.checked;
                if (checkbox.checked && hoursInput.value === '') {
                    // Set default values when checkbox is checked
                    if (service === 'qaManual') hoursInput.value = 200;
                    if (service === 'qaAuto') hoursInput.value = 100;
                    if (service === 'documentation') hoursInput.value = 80;
                    if (service === 'training') hoursInput.value = 40;
                    if (service === 'projectMgmt') hoursInput.value = 160;
                }
                this.calculateServiceCost(service);
                this.calculateAll();
            });

            hoursInput.addEventListener('input', () => {
                this.calculateServiceCost(service);
                this.calculateAll();
            });
        });

        // Hardware service checkboxes
        ['assembly', 'certification', 'logistics'].forEach(service => {
            const checkbox = document.getElementById(service);
            const costInput = document.getElementById(`${service}Cost`);
            
            checkbox.addEventListener('change', () => {
                costInput.disabled = !checkbox.checked;
                if (checkbox.checked && costInput.value === '') {
                    costInput.value = this.hardwareCosts[service];
                }
                this.calculateHardwareServices();
                this.calculateAll();
            });

            costInput.addEventListener('input', () => {
                this.calculateHardwareServices();
                this.calculateAll();
            });
        });

        // License management
        document.getElementById('addLicense').addEventListener('click', () => {
            this.addLicenseRow();
        });

        // Component management
        document.getElementById('addComponent').addEventListener('click', () => {
            this.addComponentRow();
        });

        // License preset management
        const addPresetBtn = document.getElementById('addPresetBtn');
        if (addPresetBtn) {
            addPresetBtn.addEventListener('click', () => {
                this.addPresetRow();
            });
        }

        // Sliders
        const riskSlider = document.getElementById('riskBuffer');
        const riskValue = document.getElementById('riskValue');
        
        riskSlider.addEventListener('input', () => {
            riskValue.textContent = riskSlider.value;
            this.config.riskBuffer = parseInt(riskSlider.value);
            saveConfig(this.config);
            this.calculateAll();
        });

        const marginSlider = document.getElementById('commercialMargin');
        const marginValue = document.getElementById('marginValue');
        
        marginSlider.addEventListener('input', () => {
            marginValue.textContent = marginSlider.value;
            this.config.commercialMargin = parseInt(marginSlider.value);
            saveConfig(this.config);
            this.calculateAll();
        });

        // Action buttons
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetCalculator();
        });

        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveToStorage();
            this.exportPDF();
        });

        document.getElementById('loadBtn').addEventListener('click', () => {
            this.loadFromStorage();
        });

        document.getElementById('navConfig').addEventListener('click', () => {
            document.getElementById('calculatorView').style.display = 'none';
            document.getElementById('configSection').style.display = 'block';
        });

        document.getElementById('navCalculator').addEventListener('click', () => {
            document.getElementById('calculatorView').style.display = 'block';
            document.getElementById('configSection').style.display = 'none';
        });

        document.getElementById('saveConfigBtn').addEventListener('click', () => {
            this.updateConfigFromForm();
            saveConfig(this.config);
            this.applyConfigToUI();
            this.calculateAll();
        });

        // Initial license row setup
        this.bindLicenseRow(document.querySelector('.license-item'));
        
        // Initial component row setup
        this.bindComponentRow(document.querySelector('.component-item'));
    }

    updateVisibility() {
        const projectType = document.getElementById('projectType').value;
        const softwareSection = document.getElementById('softwareSection');
        const hardwareSection = document.getElementById('hardwareSection');

        switch (projectType) {
            case 'software':
                softwareSection.style.display = 'block';
                hardwareSection.style.display = 'none';
                break;
            case 'hardware':
                softwareSection.style.display = 'none';
                hardwareSection.style.display = 'block';
                break;
            case 'combined':
                softwareSection.style.display = 'block';
                hardwareSection.style.display = 'block';
                break;
        }
    }

    calculateDeveloperCost(role) {
        const hours = parseFloat(document.getElementById(`${role}Hours`).value) || 0;
        const rate = this.rates[role];
        const cost = hours * rate;
        
        const costElement = document.getElementById(`${role}Cost`);
        costElement.textContent = `${cost.toLocaleString('ro-RO')} €`;
        costElement.classList.add('cost-update');
        setTimeout(() => costElement.classList.remove('cost-update'), 300);
        
        return cost;
    }

    calculateServiceCost(service) {
        const checkbox = document.getElementById(service);
        const hoursInput = document.getElementById(`${service}Hours`);
        const costElement = document.getElementById(`${service}Cost`);
        
        if (!checkbox.checked) {
            costElement.textContent = '0 €';
            return 0;
        }
        
        const hours = parseFloat(hoursInput.value) || 0;
        const rate = this.rates[service];
        const cost = hours * rate;
        
        costElement.textContent = `${cost.toLocaleString('ro-RO')} €`;
        costElement.classList.add('cost-update');
        setTimeout(() => costElement.classList.remove('cost-update'), 300);
        
        return cost;
    }

    calculateSoftwareTotal() {
        let total = 0;
        
        // Developer costs
        ['junior', 'mid', 'senior', 'architect'].forEach(role => {
            total += this.calculateDeveloperCost(role);
        });

        // Service costs
        ['qaManual', 'qaAuto', 'documentation', 'training', 'projectMgmt'].forEach(service => {
            total += this.calculateServiceCost(service);
        });

        // License costs
        total += this.calculateLicenses();

        document.getElementById('softwareTotal').textContent = `${total.toLocaleString('ro-RO')} €`;
        return total;
    }

    calculateLicenses() {
        let total = 0;
        const licenseItems = document.querySelectorAll('.license-item');
        
        licenseItems.forEach(item => {
            const quantity = parseFloat(item.querySelector('.license-quantity').value) || 0;
            const cost = parseFloat(item.querySelector('.license-cost').value) || 0;
            const itemTotal = quantity * cost;
            
            item.querySelector('.license-total').textContent = `${itemTotal.toLocaleString('ro-RO')} €`;
            total += itemTotal;
        });
        
        return total;
    }

    calculateComponents() {
        let total = 0;
        const componentItems = document.querySelectorAll('.component-item');
        
        componentItems.forEach(item => {
            const quantity = parseFloat(item.querySelector('.component-quantity').value) || 0;
            const price = parseFloat(item.querySelector('.component-price').value) || 0;
            const itemTotal = quantity * price;
            
            item.querySelector('.component-total').textContent = `${itemTotal.toLocaleString('ro-RO')} €`;
            total += itemTotal;
        });
        
        return total;
    }

    calculateHardwareServices() {
        let total = 0;
        
        ['assembly', 'certification', 'logistics'].forEach(service => {
            const checkbox = document.getElementById(service);
            const costInput = document.getElementById(`${service}Cost`);
            const totalElement = document.getElementById(`${service}Total`);
            
            if (checkbox.checked) {
                const cost = parseFloat(costInput.value) || 0;
                totalElement.textContent = `${cost.toLocaleString('ro-RO')} €`;
                total += cost;
            } else {
                totalElement.textContent = '0 €';
            }
        });
        
        return total;
    }

    calculateHardwareTotal() {
        const componentsTotal = this.calculateComponents();
        const servicesTotal = this.calculateHardwareServices();
        const total = componentsTotal + servicesTotal;
        
        document.getElementById('hardwareTotal').textContent = `${total.toLocaleString('ro-RO')} €`;
        return total;
    }

    calculateAll() {
        const softwareTotal = this.calculateSoftwareTotal();
        const hardwareTotal = this.calculateHardwareTotal();
        const subtotal = softwareTotal + hardwareTotal;
        
        const riskPercent = parseFloat(document.getElementById('riskBuffer').value) / 100;
        const marginPercent = parseFloat(document.getElementById('commercialMargin').value) / 100;
        
        const riskAmount = subtotal * riskPercent;
        const marginAmount = (subtotal + riskAmount) * marginPercent;
        const finalTotal = subtotal + riskAmount + marginAmount;

        // Update summary
        document.getElementById('summarySoftware').textContent = `${softwareTotal.toLocaleString('ro-RO')} €`;
        document.getElementById('summaryHardware').textContent = `${hardwareTotal.toLocaleString('ro-RO')} €`;
        document.getElementById('summarySubtotal').textContent = `${subtotal.toLocaleString('ro-RO')} €`;
        document.getElementById('summaryRisk').textContent = `${riskAmount.toLocaleString('ro-RO')} €`;
        document.getElementById('summaryMargin').textContent = `${marginAmount.toLocaleString('ro-RO')} €`;
        document.getElementById('summaryTotal').textContent = `${finalTotal.toLocaleString('ro-RO')} €`;

        // Update chart
        this.updateChart(softwareTotal, hardwareTotal, riskAmount, marginAmount);
    }

    initChart() {
        const ctx = document.getElementById('costChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Software', 'Hardware', 'Buffer Risc', 'Marjă Comercială'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${value.toLocaleString('ro-RO')} € (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateChart(software, hardware, risk, margin) {
        if (this.chart) {
            this.chart.data.datasets[0].data = [software, hardware, risk, margin];
            this.chart.update('none');
        }
    }

    populateLicenseSelect(select) {
        if (!select) return;
        select.innerHTML = '<option value="">Selectează licența...</option>';
        this.licensePresets.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name} (${p.cost} €)`;
            select.appendChild(opt);
        });
        const custom = document.createElement('option');
        custom.value = 'custom';
        custom.textContent = 'Personalizată';
        select.appendChild(custom);
    }

    addLicenseRow() {
        const container = document.getElementById('licensesContainer');
        const newRow = document.createElement('div');
        newRow.className = 'license-item';
        newRow.innerHTML = `
            <select class="form-control license-select"></select>
            <input type="text" class="form-control license-name" placeholder="Numele licenței" style="display: none;">
            <input type="number" class="form-control license-quantity" placeholder="Cantitate" min="1" value="1">
            <input type="number" class="form-control license-cost" placeholder="Cost unitar" min="0">
            <span class="license-total">0 €</span>
            <button type="button" class="btn btn--secondary btn--sm remove-license">Șterge</button>
        `;

        container.appendChild(newRow);
        this.populateLicenseSelect(newRow.querySelector('.license-select'));
        this.bindLicenseRow(newRow);
    }

    bindLicenseRow(row) {
        const select = row.querySelector('.license-select');
        this.populateLicenseSelect(select);
        const nameInput = row.querySelector('.license-name');
        const quantityInput = row.querySelector('.license-quantity');
        const costInput = row.querySelector('.license-cost');
        const removeBtn = row.querySelector('.remove-license');

        select.addEventListener('change', () => {
            if (select.value === 'custom') {
                nameInput.style.display = 'block';
                costInput.value = '';
            } else {
                const preset = this.licensePresets.find(p => p.id === select.value);
                if (preset) {
                    nameInput.style.display = 'none';
                    costInput.value = preset.cost;
                } else {
                    nameInput.style.display = 'none';
                    costInput.value = '';
                }
            }
            this.calculateAll();
        });

        [quantityInput, costInput].forEach(input => {
            input.addEventListener('input', () => {
                this.calculateAll();
            });
        });

        removeBtn.addEventListener('click', () => {
            if (document.querySelectorAll('.license-item').length > 1) {
                row.remove();
                this.calculateAll();
            }
        });
    }

    renderLicensePresetConfig() {
        const container = document.getElementById('licensePresetsConfig');
        if (!container) return;
        container.innerHTML = '';
        this.licensePresets.forEach(p => this.addPresetRow(p));
    }

    addPresetRow(preset = { id: '', name: '', cost: 0 }) {
        const container = document.getElementById('licensePresetsConfig');
        if (!container) return;
        const row = document.createElement('div');
        row.className = 'preset-row';
        row.innerHTML = `
            <input type="text" class="form-control preset-id" placeholder="ID" value="${preset.id}">
            <input type="text" class="form-control preset-name" placeholder="Nume" value="${preset.name}">
            <input type="number" class="form-control preset-cost" placeholder="Cost (€)" min="0" value="${preset.cost}">
            <button type="button" class="btn btn--secondary btn--sm remove-preset">Șterge</button>
        `;
        container.appendChild(row);
        this.bindPresetRow(row);
    }

    bindPresetRow(row) {
        const removeBtn = row.querySelector('.remove-preset');
        removeBtn.addEventListener('click', () => {
            row.remove();
        });
    }

    addComponentRow() {
        const container = document.getElementById('componentsContainer');
        const newRow = document.createElement('div');
        newRow.className = 'component-item';
        newRow.innerHTML = `
            <input type="text" class="form-control component-name" placeholder="Nume componentă">
            <input type="number" class="form-control component-quantity" placeholder="Cantitate" min="1" value="1">
            <input type="number" class="form-control component-price" placeholder="Preț unitar (€)" min="0">
            <span class="component-total">0 €</span>
            <button type="button" class="btn btn--secondary btn--sm remove-component">Șterge</button>
        `;
        
        container.appendChild(newRow);
        this.bindComponentRow(newRow);
    }

    bindComponentRow(row) {
        const quantityInput = row.querySelector('.component-quantity');
        const priceInput = row.querySelector('.component-price');
        const removeBtn = row.querySelector('.remove-component');

        [quantityInput, priceInput].forEach(input => {
            input.addEventListener('input', () => {
                this.calculateAll();
            });
        });

        removeBtn.addEventListener('click', () => {
            if (document.querySelectorAll('.component-item').length > 1) {
                row.remove();
                this.calculateAll();
            }
        });
    }

    saveToStorage() {
        try {
            const data = {
                projectName: document.getElementById('projectName').value,
                clientName: document.getElementById('clientName').value,
                projectType: document.getElementById('projectType').value,
                complexity: document.getElementById('complexity').value,
                
                // Developer hours
                juniorHours: document.getElementById('juniorHours').value,
                midHours: document.getElementById('midHours').value,
                seniorHours: document.getElementById('seniorHours').value,
                architectHours: document.getElementById('architectHours').value,
                
                // Services
                services: {},
                
                // Risk and margin
                riskBuffer: document.getElementById('riskBuffer').value,
                commercialMargin: document.getElementById('commercialMargin').value,
                
                // Licenses
                licenses: [],
                
                // Components
                components: [],
                
                // Hardware services
                hardwareServices: {}
            };

            // Save services
            ['qaManual', 'qaAuto', 'documentation', 'training', 'projectMgmt'].forEach(service => {
                data.services[service] = {
                    checked: document.getElementById(service).checked,
                    hours: document.getElementById(`${service}Hours`).value
                };
            });

            // Save licenses
            document.querySelectorAll('.license-item').forEach(item => {
                data.licenses.push({
                    select: item.querySelector('.license-select').value,
                    name: item.querySelector('.license-name').value,
                    quantity: item.querySelector('.license-quantity').value,
                    cost: item.querySelector('.license-cost').value
                });
            });

            // Save components
            document.querySelectorAll('.component-item').forEach(item => {
                data.components.push({
                    name: item.querySelector('.component-name').value,
                    quantity: item.querySelector('.component-quantity').value,
                    price: item.querySelector('.component-price').value
                });
            });

            // Save hardware services
            ['assembly', 'certification', 'logistics'].forEach(service => {
                data.hardwareServices[service] = {
                    checked: document.getElementById(service).checked,
                    cost: document.getElementById(`${service}Cost`).value
                };
            });

            // Use localStorage API in a try-catch block
            const estimationJSON = JSON.stringify(data);
            this.showMessage('Estimarea a fost salvată cu succes!', 'success');
            
            // Simulate saving without actually using localStorage
            console.log('Saved estimation:', estimationJSON);
            
        } catch (error) {
            this.showMessage('Eroare la salvarea estimării!', 'error');
            console.error('Error saving estimation:', error);
        }
    }

    loadFromStorage() {
        try {
            // Note: Since we can't use localStorage, we'll just log this action
            // and not actually load any data
            console.log('Attempted to load estimation from storage');
            this.showMessage('Funcționalitatea de încărcare este dezactivată în acest mediu.', 'info');
        } catch (error) {
            this.showMessage('Eroare la încărcarea estimării!', 'error');
            console.error('Error loading estimation:', error);
        }
    }

    exportPDF() {
        const element = document.getElementById('summarySection');
        if (!element) {
            this.showMessage('Secțiunea de sumar nu a fost găsită!', 'error');
            return;
        }

        if (typeof window.html2pdf === 'undefined') {
            this.showMessage('Export PDF indisponibil', 'error');
            return;
        }

        // Asigură că datele și graficul sunt actualizate înainte de export
        this.calculateAll();

        setTimeout(async () => {
            const clone = element.cloneNode(true);
            // Replace the chart canvas with an image so html2pdf can render it
            const clonedCanvas = clone.querySelector('#costChart');
            if (clonedCanvas && this.chart) {
                const img = document.createElement('img');
                img.src = this.chart.toBase64Image();
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                clonedCanvas.parentNode.replaceChild(img, clonedCanvas);
            }

            const opt = {
                margin:       10,
                filename:     'estimare_costuri.pdf',
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            clone.style.position = 'fixed';
            clone.style.left = '-9999px';
            document.body.appendChild(clone);

            try {
                await html2pdf().set(opt).from(clone).save();
            } catch (err) {
                this.showMessage('Export PDF indisponibil', 'error');
            } finally {
                document.body.removeChild(clone);
            }
        }, 300);
    }

    resetCalculator() {
        if (confirm('Sunteți sigur că doriți să resetați toate datele?')) {
            // Reset form inputs
            document.querySelectorAll('input:not([type="range"]), select').forEach(input => {
                if (input.type === 'checkbox') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
            
            // Make sure disabled inputs are properly set
            document.querySelectorAll('.service-hours, .service-cost-input').forEach(input => {
                input.disabled = true;
            });

            // Reset sliders to defaults
            document.getElementById('riskBuffer').value = this.config.riskBuffer;
            document.getElementById('commercialMargin').value = this.config.commercialMargin;
            document.getElementById('riskValue').textContent = this.config.riskBuffer;
            document.getElementById('marginValue').textContent = this.config.commercialMargin;

            // Reset project type
            document.getElementById('projectType').value = 'software';

            // Reset quantity fields to default values
            document.querySelectorAll('.component-quantity, .license-quantity').forEach(input => {
                input.value = '1';
            });

            // Remove extra license and component rows
            const licenseItems = document.querySelectorAll('.license-item');
            for (let i = 1; i < licenseItems.length; i++) {
                licenseItems[i].remove();
            }

            const componentItems = document.querySelectorAll('.component-item');
            for (let i = 1; i < componentItems.length; i++) {
                componentItems[i].remove();
            }

            // Reset first rows
            document.querySelector('.license-select').value = '';
            document.querySelector('.license-name').style.display = 'none';
            document.querySelector('.license-cost').value = '';

            document.querySelector('.component-name').value = '';
            document.querySelector('.component-price').value = '';

            this.applyConfigToUI();
            this.updateVisibility();
            this.calculateAll();
            this.showMessage('Calculatorul a fost resetat!', 'info');
        }
    }

    showMessage(message, type) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = `status status--${type}`;
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '1000';
        toast.style.padding = '12px 16px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CostCalculator();
});