document.addEventListener('DOMContentLoaded', function() {
    // --- CONFIGURACIÓ GLOBAL DE CHARTS ---
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--chart-text-color').trim();
    Chart.defaults.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--chart-grid-color').trim();
    Chart.defaults.plugins.tooltip.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--chart-tooltip-bg').trim();
    Chart.defaults.plugins.tooltip.titleFont = { size: 12, weight: '600', family: "'Inter', sans-serif" };
    Chart.defaults.plugins.tooltip.bodyFont = { size: 13, weight: '400', family: "'Inter', sans-serif" };
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.displayColors = false;

    // --- VARIABLES GLOBALS PER A INSTÀNCIES DE GRÀFICS ---
    let fatigueIndicatorChartInstance;
    let sleepChartInstance;
    let sleepTrendChartInstance;
    let activityChartInstance;
    let heartRateChartInstance;
    let trendChartInitialized = false;

    // --- DADES SIMULADES (AIXÒ VINDRIA DEL BACKEND) ---
    let userProfileData = {
        name: "Roger Duran",
        avatarInitials: "RD",
        role: "Atleta Amateur",
        age: 21,
        bmi: 24.7,
        weight: 75,
        height: 180
    };

    let medicalContextDataStore = [
        { id: 1, name: "Operació de Maluc", severity: "medium", description: "Cirurgia realitzada fa 8 mesos. Recuperació en progrés amb limitacions de mobilitat.", lastReview: "2025-05-15", icon: "fas fa-bone" },
        { id: 2, name: "Al·lèrgia Estacional", severity: "low", description: "Reaccions al·lèrgiques lleus durant la primavera. Controlada amb medicació periòdica.", lastReview: "2025-04-02", icon: "fas fa-allergies" }
    ];
    
    let fatiguePredictionData = {
        probability: 48,
        modelSensitivity: 85,
        dataQuality: 8.5
    };

    let activityData = {
        steps: 5126,
        calories: 2587,
        distribution: { // minuts
            light: 191,
            moderate: 45,
            intense: 15,
            inactive: 1249
        }
    };

    let heartRateData = {
        max: 152,
        min: 58,
        resting: 59,
        zones: { // minuts
            belowZone1: 1429,
            zone1: 120,
            zone2: 45,
            zone3: 15
        }
    };
    
    let biomarkersData = {
        tempVariation: 0.80,
        rmssd: 38.42,
        spo2: 98,
        breathingRate: 20.40
    };

    const sleepDataStore = {
        totalSleepMinutes: (7 * 60) + 42, // 7h 42m
        efficiency: 92,
        quality: "good", // 'good', 'fair', 'poor'
        bedtime: "11:23 PM",
        stages: [
            { name: 'Són profund', minutes: (1*60)+53, percentage: 24, color: 'rgba(129, 178, 230, 0.9)', hoverColor: 'rgba(149, 198, 250, 1)', cssClass: 'deep' },
            { name: 'Són lleuger', minutes: (4*60)+12, percentage: 54, color: 'rgba(115, 204, 194, 0.85)', hoverColor: 'rgba(135, 224, 214, 1)', cssClass: 'light' },
            { name: 'REM', minutes: (1*60)+37, percentage: 21, color: 'rgba(191, 178, 229, 0.9)', hoverColor: 'rgba(211, 198, 249, 1)', cssClass: 'rem' },
            { name: 'Despert', minutes: 12, percentage: 1, color: 'rgba(200, 200, 200, 0.75)', hoverColor: 'rgba(220, 220, 220, 0.9)', cssClass: 'awake' }
        ],
        trend: { // dades en minuts
            labels: ['Dl', 'Dm', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'],
            deep: [45, 52, 68, 41, 55, 62, 48],
            light: [120, 135, 142, 155, 148, 132, 140],
            rem: [30, 25, 32, 28, 35, 40, 38],
            awake: [15, 8, 10, 16, 12, 6, 14]
        }
    };

    // --- FUNCIONS AUXILIARS ---
    function getElement(id) { return document.getElementById(id); }
    function querySelector(selector) { return document.querySelector(selector); }
    function querySelectorAll(selector) { return document.querySelectorAll(selector); }

    function formatMinutesToHoursAndMinutes(totalMinutes) {
        if (totalMinutes === null || totalMinutes === undefined || totalMinutes < 0) return "--h --m";
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        return `${hours}h ${minutes}m`;
    }

    function updateTextContent(elementId, text) {
        const element = getElement(elementId);
        if (element) element.textContent = text;
    }
    
    // --- RENDERITZACIÓ DE DADES ---
    function renderUserProfile(data) {
        updateTextContent('userAvatar', data.avatarInitials);
        updateTextContent('userName', data.name);
        updateTextContent('userRoleAge', `${data.role} • ${data.age} anys`);
        updateTextContent('userBmi', data.bmi);
        updateTextContent('userWeight', `${data.weight}kg`);
        updateTextContent('userHeight', `${data.height}cm`);
    }

    function renderCurrentDate() {
        const today = new Date();
        const ऑप्शंस = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = today.toLocaleDateString('ca-ES', ऑप्शंस);
        // Capitalize first letter
        const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        updateTextContent('currentDateSubtitle', `${capitalizedDate} • Anàlisi en temps real`);
    }

    function renderMedicalConditions(conditions) {
        const display = getElement('medicalConditionsDisplay');
        if (!display) return;
        display.innerHTML = ''; // Clear previous
        if (!conditions || conditions.length === 0) {
            display.innerHTML = '<p>No hi ha condicions mèdiques registrades.</p>';
            return;
        }
        conditions.forEach(condition => {
            const severityClass = `severity-${condition.severity}`;
            const severityText = condition.severity === 'low' ? 'Baixa' : condition.severity === 'medium' ? 'Mitjana' : 'Alta';
            const formattedDate = condition.lastReview ? new Date(condition.lastReview).toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
            const conditionEl = document.createElement('div');
            conditionEl.classList.add('condition-item');
            conditionEl.innerHTML = `
                <div class="condition-item-header">
                    <div class="condition-item-title-group">
                        <i class="condition-item-icon ${condition.icon || 'fas fa-notes-medical'}"></i>
                        <h4>${condition.name}</h4>
                    </div>
                    <span class="condition-severity ${severityClass}">${severityText}</span>
                </div>
                <p>${condition.description || 'Sense descripció.'}</p>
                <div class="condition-item-footer">
                    <i class="fas fa-calendar-alt"></i> Darrera revisió: ${formattedDate}
                </div>
            `;
            display.appendChild(conditionEl);
        });
    }
    
    function renderFatiguePrediction(data) {
        updateTextContent('fatigueModelSensitivity', `${data.modelSensitivity}%`);
        updateTextContent('fatigueDataQuality', `${data.dataQuality} / 10`);
        updateFatigueIndicatorChart(data.probability);
    }

    function renderActivityMetrics(data) {
        updateTextContent('activitySteps', data.steps.toLocaleString('ca-ES'));
        updateTextContent('activityCalories', data.calories.toLocaleString('ca-ES'));
        updateActivityChart(data.distribution);
    }

    function renderHeartRateMetrics(data) {
        updateTextContent('hrMax', data.max);
        updateTextContent('hrMin', data.min);
        updateTextContent('hrResting', data.resting);
        updateHeartRateChart(data.zones);
    }
    
    function renderBiomarkers(data) {
        updateTextContent('biomarkerTempVar', data.tempVariation.toFixed(2));
        updateTextContent('biomarkerRmssd', data.rmssd.toFixed(2));
        updateTextContent('biomarkerSpo2', data.spo2);
        updateTextContent('biomarkerBreathRate', data.breathingRate.toFixed(2));
    }

    function renderSleepAnalysis(data) {
        const totalSleepFormatted = formatMinutesToHoursAndMinutes(data.totalSleepMinutes);
        updateTextContent('sleepTotalTime', totalSleepFormatted);
        updateTextContent('sleepChartTotalTime', totalSleepFormatted);
        updateTextContent('sleepChartEfficiency', `${data.efficiency}% eficiència`);
        
        const qualityTextEl = getElement('sleepQualityText');
        if (qualityTextEl) {
            let qualityClass = 'quality-good';
            let qualityLabel = 'Bona qualitat de son';
            if (data.quality === 'fair') {
                qualityClass = 'quality-fair';
                qualityLabel = 'Qualitat de son acceptable';
            } else if (data.quality === 'poor') {
                qualityClass = 'quality-poor';
                qualityLabel = 'Mala qualitat de son';
            }
            qualityTextEl.innerHTML = `<span class="${qualityClass}">${qualityLabel}</span>`;
        }

        renderSleepStagesList(data.stages);
        renderSleepMetricsGrid(data);
        updateSleepDoughnutChart(data.stages);
        // Trend chart is updated on tab click if not initialized
    }

    function renderSleepStagesList(stages) {
        const container = getElement('sleepStagesList');
        if (!container) return;
        container.innerHTML = '';
        stages.forEach(stage => {
            const item = document.createElement('div');
            item.className = 'stage-item';
            item.innerHTML = `
                <div class="stage-info">
                    <div class="stage-color ${stage.cssClass}"></div>
                    <span class="stage-name">${stage.name}</span>
                </div>
                <div class="stage-details">
                    <div class="stage-percentage">${stage.percentage}%</div>
                    <div class="stage-time">${formatMinutesToHoursAndMinutes(stage.minutes)}</div>
                </div>
            `;
            container.appendChild(item);
        });
    }

    function renderSleepMetricsGrid(sleepData) {
        const container = getElement('sleepMetricsGrid');
        if (!container) return;
        container.innerHTML = '';
        
        const metrics = [
            { icon: 'moon', value: formatMinutesToHoursAndMinutes(sleepData.totalSleepMinutes), label: 'Temps total de son' },
            { icon: 'bed', value: formatMinutesToHoursAndMinutes(sleepData.stages.find(s => s.cssClass === 'deep')?.minutes || 0), label: 'Son profund' },
            { icon: 'battery-full', value: `${sleepData.efficiency}%`, label: 'Eficiència' },
            { icon: 'clock', value: sleepData.bedtime, label: 'Hora d\'anar a dormir' }
        ];

        metrics.forEach(metric => {
            const card = document.createElement('div');
            card.className = 'metric-card';
            card.innerHTML = `
                <div class="metric-icon"><i class="fas fa-${metric.icon}"></i></div>
                <div class="metric-info">
                    <div class="metric-value">${metric.value}</div>
                    <div class="metric-label">${metric.label}</div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // --- LÒGICA DE GRÀFICS ---
    function updateFatigueIndicatorChart(probability) {
        const probabilityTextEl = getElement('fatigueProbabilityText');
        const statusTextEl = getElement('fatigueStatusText');
        
        if (probabilityTextEl) probabilityTextEl.textContent = `${probability}%`;
        
        let status = "";
        let primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--success').trim();
        let trackColor = "rgba(255, 255, 255, 0.1)";

        if (probability >= 75) {
            status = "Fatiga Alta";
            primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--danger').trim();
        } else if (probability >= 50) {
            status = "Fatiga Moderada";
            primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--warning').trim();
        } else if (probability >= 25) {
            status = "Descansat";
            const greenRGB = [16, 185, 129];
            const orangeRGB = [245, 158, 11];
            const factor = (probability - 25) / 25;
            const r = Math.round(greenRGB[0] * (1 - factor) + orangeRGB[0] * factor);
            const g = Math.round(greenRGB[1] * (1 - factor) + orangeRGB[1] * factor);
            const b = Math.round(greenRGB[2] * (1 - factor) + orangeRGB[2] * factor);
            primaryColor = `rgb(${r},${g},${b})`;
        } else {
             status = "Molt Descansat";
        }

        if (statusTextEl) statusTextEl.textContent = status;
        if (probabilityTextEl) probabilityTextEl.style.color = primaryColor;
        if (statusTextEl) statusTextEl.style.color = primaryColor;

        const ctx = getElement('fatigueIndicatorChart')?.getContext('2d');
        if (!ctx) return;

        if (fatigueIndicatorChartInstance) {
            fatigueIndicatorChartInstance.destroy();
        }
        fatigueIndicatorChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [probability, 100 - probability],
                    backgroundColor: [primaryColor, trackColor],
                    borderColor: [primaryColor, trackColor],
                    borderWidth: 1,
                    borderRadius: 20,
                    circumference: 360,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '80%',
                animation: { animateRotate: true, animateScale: false, duration: 800 },
                plugins: { tooltip: { enabled: false }, legend: { display: false } },
                events: []
            }
        });
    }

    function updateActivityChart(distributionData) {
        const ctx = getElement('activityChart')?.getContext('2d');
        if (!ctx) return;
        if (activityChartInstance) activityChartInstance.destroy();
        
        activityChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Lleu', 'Moderada', 'Alta', 'Inactiu'],
                datasets: [{
                    data: [
                        distributionData.light, 
                        distributionData.moderate, 
                        distributionData.intense, 
                        distributionData.inactive
                    ],
                    backgroundColor: [
                        getComputedStyle(document.documentElement).getPropertyValue('--chart-color-1'),
                        getComputedStyle(document.documentElement).getPropertyValue('--chart-color-2'),
                        getComputedStyle(document.documentElement).getPropertyValue('--chart-color-3'),
                        getComputedStyle(document.documentElement).getPropertyValue('--chart-color-inactive')
                    ],
                    borderWidth: 0,
                    borderRadius: 6,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { beginAtZero: true, grid: { borderColor: 'transparent' }, ticks: { callback: value => formatMinutesToHoursAndMinutes(value) } },
                    y: { grid: { display: false, drawBorder: false }, ticks: { padding: 5 } }
                },
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => formatMinutesToHoursAndMinutes(ctx.parsed.x) } } },
                layout: { padding: { left: 5, right: 5, top: 5, bottom: 5 } }
            }
        });
    }

    function updateHeartRateChart(zonesData) {
        const ctx = getElement('heartRateChart')?.getContext('2d');
        if (!ctx) return;
        if (heartRateChartInstance) heartRateChartInstance.destroy();

        heartRateChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Sota Zona 1', 'Zona 1', 'Zona 2', 'Zona 3'],
                datasets: [{
                    data: [
                        zonesData.belowZone1,
                        zonesData.zone1,
                        zonesData.zone2,
                        zonesData.zone3
                    ],
                    backgroundColor: [
                        getComputedStyle(document.documentElement).getPropertyValue('--chart-color-1'),
                        getComputedStyle(document.documentElement).getPropertyValue('--chart-color-3'),
                        getComputedStyle(document.documentElement).getPropertyValue('--chart-color-2'),
                        getComputedStyle(document.documentElement).getPropertyValue('--chart-color-4')
                    ],
                    borderWidth: 0,
                    borderRadius: 8,
                    barPercentage: 0.7,
                    categoryPercentage: 0.8
                }]
            },
            options: {
                indexAxis: 'x', // Canviat per a barres verticals
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${formatMinutesToHoursAndMinutes(ctx.raw)}` } } },
                scales: {
                    x: { grid: { display: false, drawBorder: false } },
                    y: { beginAtZero: true, grid: { borderColor: 'transparent' }, ticks: { callback: value => formatMinutesToHoursAndMinutes(value) } }
                },
                layout: { padding: 10 },
                animation: { duration: 1000, easing: 'easeOutQuart' }
            }
        });
    }

    function updateSleepDoughnutChart(stagesData) {
        const ctx = getElement('sleepChart')?.getContext('2d');
        if (!ctx) return;
        if (sleepChartInstance) sleepChartInstance.destroy();

        sleepChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: stagesData.map(stage => stage.name),
                datasets: [{
                    data: stagesData.map(stage => stage.percentage),
                    backgroundColor: stagesData.map(stage => stage.color),
                    hoverBackgroundColor: stagesData.map(stage => stage.hoverColor),
                    borderColor: 'rgba(0,0,0,0)',
                    borderWidth: 0,
                    hoverBorderWidth: 0,
                    cutout: '70%',
                    borderRadius: 8,
                    hoverOffset: 10,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 1200, easing: 'easeInOutQuart', animateScale: true, animateRotate: true },
                layout: { padding: 5 },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const stageInfo = stagesData.find(s => s.name === label);
                                const time = stageInfo ? formatMinutesToHoursAndMinutes(stageInfo.minutes) : '';
                                return `${label}: ${value}% (${time})`;
                            }
                        }
                    }
                }
            }
        });
    }

    function updateSleepTrendChart(trendData) {
        const ctx = getElement('sleepTrendChart')?.getContext('2d');
        if (!ctx) return;
        if (sleepTrendChartInstance) sleepTrendChartInstance.destroy();

        function getAreaFillColor(lineColor) {
            if (lineColor.startsWith('rgba')) {
                return lineColor.replace(/,\s?[\d\.]+\)$/, ', 0.2)');
            }
            return lineColor + '33'; // Simple alpha for hex
        }

        sleepTrendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [
                    { label: 'Són profund', data: trendData.deep, borderColor: sleepDataStore.stages[0].color, backgroundColor: getAreaFillColor(sleepDataStore.stages[0].color), borderWidth: 2.5, tension: 0.4, fill: true, pointRadius: 3, pointHoverRadius: 5 },
                    { label: 'Són lleuger', data: trendData.light, borderColor: sleepDataStore.stages[1].color, backgroundColor: getAreaFillColor(sleepDataStore.stages[1].color), borderWidth: 2.5, tension: 0.4, fill: true, pointRadius: 3, pointHoverRadius: 5 },
                    { label: 'REM', data: trendData.rem, borderColor: sleepDataStore.stages[2].color, backgroundColor: getAreaFillColor(sleepDataStore.stages[2].color), borderWidth: 2.5, tension: 0.4, fill: true, pointRadius: 3, pointHoverRadius: 5 },
                    { label: 'Despert', data: trendData.awake, borderColor: sleepDataStore.stages[3].color, backgroundColor: getAreaFillColor(sleepDataStore.stages[3].color), borderWidth: 2.5, tension: 0.4, fill: true, pointRadius: 3, pointHoverRadius: 5 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }, // Ja tenim llegenda HTML
                    tooltip: { mode: 'index', intersect: false, displayColors: true, callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw} min` } }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { callback: value => `${value}m` } }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false }
            }
        });
        trendChartInitialized = true;
    }

    // --- GESTIÓ D'ESDEVENIMENTS UI (SIDEBAR, TABS, MODAL) ---
    const sidebar = getElement('sidebar');
    const mainContent = getElement('mainContent');
    const mobileMenuBtn = getElement('mobileMenuBtn');
    const navLinks = querySelectorAll('.nav-link');
    const settingsLink = getElement('settingsLink');
    const medicalModal = getElement('medicalContextModal');
    const openModalBtn = getElement('editMedicalContextBtn');
    const closeModalBtns = [getElement('closeMedicalModalBtn'), getElement('cancelMedicalModalBtn')];
    const medicalContextForm = getElement('medicalContextForm');
    const existingConditionsContainer = getElement('existing-conditions-container');
    const newConditionsContainer = getElement('new-conditions-container');
    const addConditionBtn = getElement('addConditionBtn');
    const tabButtons = querySelectorAll('.tab-button');
    const tabContents = querySelectorAll('.tab-content');
    const generateAIPlanBtn = getElement('generateAIPlanBtn');

    function toggleSidebar() {
        if (window.innerWidth <= 1200) {
            sidebar.classList.toggle('show-mobile');
            mobileMenuBtn.classList.toggle('active');
        } else {
            sidebar.classList.toggle('hidden-desktop');
            mainContent.classList.toggle('full-width');
        }
    }

    function handleResize() {
        if (window.innerWidth > 1200) {
            sidebar.classList.remove('show-mobile');
            mobileMenuBtn.classList.remove('active');
            // No restaurar hidden-desktop automàticament, l'usuari pot haver-ho tancat
        } else {
            // Si estava amagat en desktop, el mostrem per defecte en mòbil (controlat per show-mobile)
            sidebar.classList.remove('hidden-desktop');
            mainContent.classList.remove('full-width');
        }
    }
    
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleSidebar);
    window.addEventListener('resize', handleResize);
    handleResize(); // Call on load

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.id !== 'settingsLink') {
                navLinks.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                if (window.innerWidth <= 1200 && sidebar.classList.contains('show-mobile')) {
                    toggleSidebar(); // Tanca sidebar en mòbil després de clic
                }
            } else {
                e.preventDefault();
                openMedicalContextModal();
            }
        });
    });

    // Medical Context Modal Logic
    let newConditionCounter = 0;

    function populateMedicalForm() {
        existingConditionsContainer.innerHTML = '';
        newConditionsContainer.innerHTML = ''; // Clear new ones too
        newConditionCounter = 0; // Reset counter

        medicalContextDataStore.forEach((condition, index) => {
            const formGroup = document.createElement('div');
            formGroup.classList.add('form-group');
            formGroup.innerHTML = `
                <h5 style="margin-bottom: 0.5rem; color: var(--primary);">Condició ${index + 1}</h5>
                <label for="conditionName-${condition.id}">Nom de la Condició:</label>
                <input type="text" id="conditionName-${condition.id}" value="${condition.name || ''}" required>
                <label for="conditionSeverity-${condition.id}" style="margin-top:0.5rem;">Gravetat:</label>
                <select id="conditionSeverity-${condition.id}">
                    <option value="low" ${condition.severity === 'low' ? 'selected' : ''}>Baixa</option>
                    <option value="medium" ${condition.severity === 'medium' ? 'selected' : ''}>Mitjana</option>
                    <option value="high" ${condition.severity === 'high' ? 'selected' : ''}>Alta</option>
                </select>
                <label for="conditionDescription-${condition.id}" style="margin-top:0.5rem;">Descripció:</label>
                <textarea id="conditionDescription-${condition.id}" rows="3">${condition.description || ''}</textarea>
                <label for="conditionLastReview-${condition.id}" style="margin-top:0.5rem;">Darrera Revisió:</label>
                <div class="date-input-wrapper">
                    <input type="date" id="conditionLastReview-${condition.id}" value="${condition.lastReview || ''}">
                    <i class="fas fa-calendar-alt date-input-icon"></i>
                </div>
                <label for="conditionIcon-${condition.id}" style="margin-top:0.5rem;">Icona (Font Awesome class):</label>
                <input type="text" id="conditionIcon-${condition.id}" value="${condition.icon || 'fas fa-notes-medical'}">
            `;
            existingConditionsContainer.appendChild(formGroup);
        });
    }

    if (addConditionBtn) {
        addConditionBtn.addEventListener('click', () => {
            newConditionCounter++;
            const newFormGroup = document.createElement('div');
            newFormGroup.classList.add('form-group');
            newFormGroup.innerHTML = `
                <h5 style="margin-bottom: 0.5rem; color: var(--accent);">Nova Condició ${newConditionCounter}</h5>
                <label for="newConditionName-${newConditionCounter}">Nom de la Condició:</label>
                <input type="text" id="newConditionName-${newConditionCounter}" required>
                <label for="newConditionSeverity-${newConditionCounter}" style="margin-top:0.5rem;">Gravetat:</label>
                <select id="newConditionSeverity-${newConditionCounter}">
                    <option value="low">Baixa</option>
                    <option value="medium" selected>Mitjana</option>
                    <option value="high">Alta</option>
                </select>
                <label for="newConditionDescription-${newConditionCounter}" style="margin-top:0.5rem;">Descripció:</label>
                <textarea id="newConditionDescription-${newConditionCounter}" rows="3"></textarea>
                <label for="newConditionLastReview-${newConditionCounter}" style="margin-top:0.5rem;">Darrera Revisió:</label>
                <div class="date-input-wrapper">
                    <input type="date" id="newConditionLastReview-${newConditionCounter}">
                    <i class="fas fa-calendar-alt date-input-icon"></i>
                </div>
                <label for="newConditionIcon-${newConditionCounter}" style="margin-top:0.5rem;">Icona (Font Awesome class):</label>
                <input type="text" id="newConditionIcon-${newConditionCounter}" value="fas fa-briefcase-medical">
            `;
            newConditionsContainer.appendChild(newFormGroup);
        });
    }
    
    function openMedicalContextModal() {
        populateMedicalForm();
        medicalModal.classList.add('show');
    }

    function closeMedicalContextModal() {
        medicalModal.classList.remove('show');
    }

    if (openModalBtn) openModalBtn.onclick = openMedicalContextModal;
    closeModalBtns.forEach(btn => { if (btn) btn.onclick = closeMedicalContextModal; });
    window.onclick = function(event) { if (event.target == medicalModal) closeMedicalContextModal(); }

    if (medicalContextForm) {
        medicalContextForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const updatedMedicalData = [];
            // Process existing conditions
            medicalContextDataStore.forEach(condition => {
                const name = getElement(`conditionName-${condition.id}`).value;
                const severity = getElement(`conditionSeverity-${condition.id}`).value;
                const description = getElement(`conditionDescription-${condition.id}`).value;
                const lastReview = getElement(`conditionLastReview-${condition.id}`).value;
                const icon = getElement(`conditionIcon-${condition.id}`).value;
                if (name) { // Only keep if name is present
                    updatedMedicalData.push({ id: condition.id, name, severity, description, lastReview, icon });
                }
            });
    
            // Process new conditions
            for (let i = 1; i <= newConditionCounter; i++) {
                const nameInput = getElement(`newConditionName-${i}`);
                if (nameInput && nameInput.value) { // Only add if name is present
                    updatedMedicalData.push({
                        id: Date.now() + i, // Simple unique ID
                        name: nameInput.value,
                        severity: getElement(`newConditionSeverity-${i}`).value,
                        description: getElement(`newConditionDescription-${i}`).value,
                        lastReview: getElement(`newConditionLastReview-${i}`).value,
                        icon: getElement(`newConditionIcon-${i}`).value || "fas fa-briefcase-medical"
                    });
                }
            }
            medicalContextDataStore = updatedMedicalData; // Update the store
            // Aquí es faria la crida al backend per guardar `medicalContextDataStore`
            console.log("Context mèdic per guardar:", medicalContextDataStore); 
            renderMedicalConditions(medicalContextDataStore); // Re-render the display
            closeMedicalContextModal();
            alert("Context mèdic actualitzat! (Simulat - comprova la consola per veure les dades)");
        });
    }

    // Sleep Analysis Tabs
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                button.classList.add('active');
                const targetId = button.getAttribute('data-tab');
                const targetContent = getElement(targetId);
                if (targetContent) targetContent.classList.add('active');

                if (targetId === 'trend-tab' && !trendChartInitialized) {
                    updateSleepTrendChart(sleepDataStore.trend);
                }
            });
        });
        // Activate the first tab by default
        tabButtons[0].classList.add('active');
        const firstTabContentId = tabButtons[0].getAttribute('data-tab');
        const firstTabContent = getElement(firstTabContentId);
        if (firstTabContent) firstTabContent.classList.add('active');
    }
    
    if (generateAIPlanBtn) {
        generateAIPlanBtn.addEventListener('click', () => {
            // Aquí es faria una crida al backend
            alert("Generant pla personalitzat amb IA... (Funcionalitat simulada)");
            // El backend retornaria el pla, i es podria mostrar en un modal o una nova secció.
        });
    }

    // --- INICIALITZACIÓ DE DADES I RENDERITZAT INICIAL ---
    function loadAndRenderAllData() {
        renderCurrentDate();
        renderUserProfile(userProfileData);
        renderMedicalConditions(medicalContextDataStore);
        renderFatiguePrediction(fatiguePredictionData);
        renderActivityMetrics(activityData);
        renderHeartRateMetrics(heartRateData);
        renderBiomarkers(biomarkersData);
        renderSleepAnalysis(sleepDataStore); // Això ja crida el gràfic de fases
        // Els altres gràfics es carreguen quan es mostren o les seves dades es passen
    }

    loadAndRenderAllData();

    // Per simular canvis de fatiga (exemple)
    // setTimeout(() => { 
    //     fatiguePredictionData.probability = 78;
    //     renderFatiguePrediction(fatiguePredictionData);
    // }, 5000); 
    // setTimeout(() => { 
    //     fatiguePredictionData.probability = 15;
    //     renderFatiguePrediction(fatiguePredictionData);
    // }, 10000);

});