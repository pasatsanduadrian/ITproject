// Cost Estimation Calculator JavaScript

class CostCalculator {
    constructor() {
        this.rates = {
            junior: 42,
            mid: 65,
            senior: 95,
            architect: 85,
            qaManual: 35,
            qaAuto: 45,
            documentation: 40,
            training: 40,
            projectMgmt: 75
        };

        this.licensePresets = {
            database: { name: 'Licență Bază de Date Enterprise', cost: 5000 },
            framework: { name: 'Framework Comercial', cost: 2500 },
            cicd: { name: 'Instrumente CI/CD', cost: 1000 },
            ide: { name: 'IDE Professional', cost: 500 }
        };

        this.chart = null;
        this.init();
    }

    init() {
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
                    // Set default values when checkbox is checked
                    if (service === 'assembly') costInput.value = 1500;
                    if (service === 'certification') costInput.value = 6000;
                    if (service === 'logistics') costInput.value = 800;
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

        // Sliders
        const riskSlider = document.getElementById('riskBuffer');
        const riskValue = document.getElementById('riskValue');
        
        riskSlider.addEventListener('input', () => {
            riskValue.textContent = riskSlider.value;
            this.calculateAll();
        });

        const marginSlider = document.getElementById('commercialMargin');
        const marginValue = document.getElementById('marginValue');
        
        marginSlider.addEventListener('input', () => {
            marginValue.textContent = marginSlider.value;
            this.calculateAll();
        });

        // Action buttons
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetCalculator();
        });

        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveToStorage();
        });

        document.getElementById('loadBtn').addEventListener('click', () => {
            this.loadFromStorage();
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

    addLicenseRow() {
        const container = document.getElementById('licensesContainer');
        const newRow = document.createElement('div');
        newRow.className = 'license-item';
        newRow.innerHTML = `
            <select class="form-control license-select">
                <option value="">Selectează licența...</option>
                <option value="database">Licență Bază de Date Enterprise (5000 €)</option>
                <option value="framework">Framework Comercial (2500 €)</option>
                <option value="cicd">Instrumente CI/CD (1000 €)</option>
                <option value="ide">IDE Professional (500 €)</option>
                <option value="custom">Personalizată</option>
            </select>
            <input type="text" class="form-control license-name" placeholder="Numele licenței" style="display: none;">
            <input type="number" class="form-control license-quantity" placeholder="Cantitate" min="1" value="1">
            <input type="number" class="form-control license-cost" placeholder="Cost unitar" min="0">
            <span class="license-total">0 €</span>
            <button type="button" class="btn btn--secondary btn--sm remove-license">Șterge</button>
        `;
        
        container.appendChild(newRow);
        this.bindLicenseRow(newRow);
    }

    bindLicenseRow(row) {
        const select = row.querySelector('.license-select');
        const nameInput = row.querySelector('.license-name');
        const quantityInput = row.querySelector('.license-quantity');
        const costInput = row.querySelector('.license-cost');
        const removeBtn = row.querySelector('.remove-license');

        select.addEventListener('change', () => {
            if (select.value === 'custom') {
                nameInput.style.display = 'block';
                costInput.value = '';
            } else if (select.value && this.licensePresets[select.value]) {
                nameInput.style.display = 'none';
                costInput.value = this.licensePresets[select.value].cost;
            } else {
                nameInput.style.display = 'none';
                costInput.value = '';
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
            document.getElementById('riskBuffer').value = 15;
            document.getElementById('commercialMargin').value = 20;
            document.getElementById('riskValue').textContent = '15';
            document.getElementById('marginValue').textContent = '20';

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