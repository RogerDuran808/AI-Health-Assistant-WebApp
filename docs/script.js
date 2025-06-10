document.addEventListener('DOMContentLoaded', function() {
    // --- CONFIGURACIÓ GLOBAL DE CHARTS ---
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = 'rgba(245, 245, 245, 0.8)'; // Adaptat al nou text principal
    Chart.defaults.borderColor = 'rgba(51, 51, 51, 0.5)'; // Adaptat als nous bords

    // --- VARIABLES GLOBALS PER A GRÀFICS ---
    let fatigueIndicatorChartInstance, sleepStagesChartInstance;
    const chartInstances = {};

    // --- VARIABLES DE LA NOVA PALETA PER A JS ---
    const newPalette = {
        accent: '#D4FF58',
        textSecondary: '#758680',
        cardBg: '#1A1A1A',
        border: '#333333',
        textPrimary: '#F5F5F5',
        tertiaryBg: '#2A2A2A'
    };

    // --- DADES SIMULADES (sense canvis) ---
    let medicalContextDataStore = [
        { id: 1, name: "Fatiga Crònica", description: "Cansament persistent que no millora amb el descans." },
        { id: 2, name: "Desajust Autonòmic", description: "Dificultat del sistema nerviós per regular funcions." },
        { id: 3, name: "Fatiga Post-viral", description: "Esgotament prolongat després d'una infecció viral." },
        { id: 4, name: "Hipersensibilitat Central", description: "Sensibilitat augmentada a estímuls sensorials." }
    ];
    const fatigueData = { probability: 68 };
    const activityData = { 
        steps: 8439, 
        calories: 2043,
        activeZones: { sedentary: 1120, light: 145, moderate: 30, intense: 15 },
        heartRateZones: { rest: 1080, light: 180, moderate: 45, peak: 10 }
    };
    const centralMetricsData = { 
        rmssd: 42, spo2: 97, respRate: 15, hrResting: 52, hrMin: 43, hrMax: 175, tempVariation: -0.2 
    };
    const sleepData = {
        stages: [
            { name: 'Profund', minutes: 190, color: '#D4FF58', cssClass: 'deep' },
            { name: 'Lleuger', minutes: 260, color: '#A5A5A5', cssClass: 'light' },
            { name: 'REM', minutes: 90, color: '#F5F5F5', cssClass: 'rem' },
            { name: 'Despert', minutes: 20, color: '#758680', cssClass: 'awake' }
        ]
    };
    const trendData = {
        activity: {
            sedentari: [65, 62, 60, 68, 63, 61, 58],
            lleu: [25, 26, 28, 22, 26, 27, 30],
            moderat: [8, 9, 9, 8, 9, 10, 10],
            intens: [2, 3, 3, 2, 2, 2, 2]
        },
        heartRate: {
            repos: [60, 62, 58, 63, 59, 61, 62],
            suau: [25, 24, 26, 23, 26, 25, 24],
            moderat: [10, 9, 10, 9, 10, 9, 9],
            pic: [5, 5, 6, 5, 5, 5, 5]
        },
        sleepStages: {
            profund: [25, 28, 22, 27, 30, 26, 24],
            lleuger: [55, 53, 58, 56, 52, 54, 57],
            REM: [15, 14, 13, 12, 13, 15, 14],
            despert: [5, 5, 7, 5, 5, 5, 5]
        },
        dates: Array.from({length: 7}, (_, i) => new Date(Date.now() - (6 - i) * 864e5).toLocaleDateString('ca-ES', { weekday: 'short' }))
    };

    // --- FUNCIONS AUXILIARS ---
    function getElement(id) { return document.getElementById(id); }
    function formatMinutesToHoursAndMinutes(totalMinutes) {
        if (totalMinutes < 0) return "0m";
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        return `${hours > 0 ? hours + 'h ' : ''}${minutes}m`;
    }

    // --- RENDERITZACIÓ DE DADES PRINCIPALS ---
    function renderCurrentDate() {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = today.toLocaleDateString('ca-ES', options);
        getElement('currentDateSubtitle').textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }

    function renderFatigue(data) {
        let status, color;
        if (data.probability >= 75) { status = "MOLT CANSAT"; color = '#B3E04D'; } // Darker shade of accent
        else if (data.probability >= 60) { status = "CANSAT"; color = newPalette.accent; } // Main accent color
        else if (data.probability >= 40) { status = "NORMAL"; color = '#E5FF9E'; } // Lighter shade of accent
        else { status = "DESCANSAT"; color = newPalette.textSecondary; } // Secondary text color

        getElement('fatigueProbabilityText').textContent = `${data.probability}%`;
        getElement('fatigueStatusText').textContent = status;
        getElement('fatigueProbabilityText').style.color = color;
        getElement('fatigueStatusText').style.color = color;

        const ctx = getElement('fatigueIndicatorChart')?.getContext('2d');
        if (!ctx) return;
        if (fatigueIndicatorChartInstance) fatigueIndicatorChartInstance.destroy();
        fatigueIndicatorChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: { datasets: [{ data: [data.probability, 100 - data.probability], backgroundColor: [color, newPalette.cardBg], borderWidth: 0, borderRadius: { outerStart: 50, outerEnd: 50, innerStart: 50, innerEnd: 50 } }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '80%', plugins: { tooltip: { enabled: false }, legend: { display: false } } }
        });
    }

    function renderActivity(data) {
        getElement('activitySteps').textContent = data.steps.toLocaleString('ca-ES');
        getElement('activityCalories').textContent = data.calories.toLocaleString('ca-ES');
    }

    function renderCentralMetrics(data) {
        getElement('rmssdValue').textContent = `${data.rmssd} ms`;
        const rmssdStatusEl = getElement('rmssdStatus');
        if (data.rmssd >= 60) { rmssdStatusEl.textContent = 'Excel·lent'; rmssdStatusEl.style.color = newPalette.accent; } // Exelent si hi ha un rmssd major de 60
        else if (data.rmssd >= 40) { rmssdStatusEl.textContent = 'Normal'; rmssdStatusEl.style.color = newPalette.accent; } // Persones menys saludables entre 40 i 55
        else { rmssdStatusEl.textContent = 'Baix'; rmssdStatusEl.style.color = '#B3E04D'; } // Using a darker shade of accent for low

        getElement('spo2Value').textContent = `${data.spo2}%`;
        getElement('respRateValue').textContent = `${data.respRate} rpm`;
        getElement('heartRateResting').textContent = data.hrResting;
        getElement('heartRateMinMax').textContent = `${data.hrMin}/${data.hrMax}`;
        getElement('tempVariation').textContent = `${data.tempVariation > 0 ? '+' : ''}${data.tempVariation.toFixed(1)}°C`;
    }
    
    function renderSleep(data) {
        const totalMinutes = data.stages.reduce((sum, stage) => sum + stage.minutes, 0);
        const awakeMinutes = data.stages.find(s => s.name === 'Despert')?.minutes || 0;
        const sleepMinutes = totalMinutes - awakeMinutes;
        const efficiency = totalMinutes > 0 ? Math.round((sleepMinutes / totalMinutes) * 100) : 0;

        getElement('totalSleepTimeMetric').textContent = formatMinutesToHoursAndMinutes(sleepMinutes);
        getElement('timeInBedMetric').textContent = formatMinutesToHoursAndMinutes(totalMinutes);
        getElement('sleepEfficiencyMetric').textContent = `${efficiency}%`;
        getElement('timeAwakeMetric').textContent = formatMinutesToHoursAndMinutes(awakeMinutes);
        
        const legendContainer = getElement('sleepStagesList');
        legendContainer.innerHTML = '';
        data.stages.forEach(stage => {
            const percentage = Math.round((stage.minutes / totalMinutes) * 100);
            const item = document.createElement('div');
            item.className = 'stage-item';
            item.innerHTML = `<div class="stage-info"><div class="stage-color ${stage.cssClass}"></div><span class="stage-name">${stage.name}</span></div><div class="stage-details"><span class="stage-time">${formatMinutesToHoursAndMinutes(stage.minutes)}</span><span class="stage-percentage">${percentage}%</span></div>`;
            legendContainer.appendChild(item);
        });

        const ctx = getElement('sleepStagesChart')?.getContext('2d');
        if (!ctx) return;
        if (sleepStagesChartInstance) sleepStagesChartInstance.destroy();
        sleepStagesChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: data.stages.map(s => s.name), datasets: [{ data: data.stages.map(s => s.minutes), backgroundColor: data.stages.map(s => s.color), borderWidth: 4, borderColor: '#1A1A1A', hoverOffset: 8 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.label}: ${formatMinutesToHoursAndMinutes(c.raw)}` } } } }
        });
    }

    function renderMedicalConditions(conditions) {
        const container = getElement('medicalConditionsList');
        container.innerHTML = '';
        if (!conditions || conditions.length === 0) { container.innerHTML = '<p>No hi ha condicions registrades.</p>'; return; }
        conditions.forEach(c => {
            const item = document.createElement('div');
            item.className = 'condition-item';
            item.innerHTML = `<div class="condition-name">${c.name}</div><div class="condition-details">${c.description}</div>`;
            container.appendChild(item);
        });
    }
    
    // --- LÒGICA DEL MODAL MÈDIC (sense canvis de funcionalitat) ---
    function setupMedicalModal() {
        const modal = getElement('medicalContextModal');
        const openModalBtn = getElement('medicalContextLink');
        const closeModalBtns = [getElement('closeMedicalModalBtn'), getElement('cancelMedicalModalBtn')];
        const form = getElement('medicalContextForm');
        const addConditionBtn = getElement('addConditionBtn');
        let newConditionCounter = 0;

        openModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const existingContainer = getElement('existing-conditions-container');
            getElement('new-conditions-container').innerHTML = '';
            newConditionCounter = 0;
            existingContainer.innerHTML = '';
            medicalContextDataStore.forEach(cond => {
                const group = document.createElement('div');
                group.className = 'form-group';
                group.innerHTML = `<h5 style="margin-bottom: 0.5rem; color: ${newPalette.accent};">Condició existent</h5><label for="name-${cond.id}">Nom:</label><input type="text" id="name-${cond.id}" value="${cond.name}" required><label for="desc-${cond.id}" style="margin-top:0.5rem;">Descripció:</label><textarea id="desc-${cond.id}" rows="2">${cond.description}</textarea>`;
                existingContainer.appendChild(group);
            });
            modal.classList.add('show');
        });

        closeModalBtns.forEach(btn => btn.addEventListener('click', () => modal.classList.remove('show')));
        window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
        
        addConditionBtn.addEventListener('click', () => {
            newConditionCounter++;
            const newContainer = getElement('new-conditions-container');
            const group = document.createElement('div');
            group.className = 'form-group';
            group.innerHTML = `<h5 style="margin-bottom: 0.5rem; color: var(--info);">Nova Condició ${newConditionCounter}</h5><label for="newName-${newConditionCounter}">Nom:</label><input type="text" id="newName-${newConditionCounter}" placeholder="Nom de la condició" required><label for="newDesc-${newConditionCounter}" style="margin-top:0.5rem;">Descripció:</label><textarea id="newDesc-${newConditionCounter}" rows="2" placeholder="Breu descripció..."></textarea>`;
            newContainer.appendChild(group);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const updatedConditions = medicalContextDataStore.map(cond => ({ id: cond.id, name: getElement(`name-${cond.id}`).value, description: getElement(`desc-${cond.id}`).value }));
            for (let i = 1; i <= newConditionCounter; i++) {
                const nameInput = getElement(`newName-${i}`);
                if (nameInput && nameInput.value) updatedConditions.push({ id: Date.now() + i, name: nameInput.value, description: getElement(`newDesc-${i}`).value });
            }
            medicalContextDataStore = updatedConditions;
            renderMedicalConditions(medicalContextDataStore);
            modal.classList.remove('show');
            showToast("Context mèdic actualitzat!");
        });
    }
    
    // --- LÒGICA D'INTERACTIVITAT (sense canvis de funcionalitat) ---
    function setupInteractions() {
        const aiOutput = getElement('ai-recommendation-output');
        getElement('generateSimpleRecommendation').addEventListener('click', () => {
            aiOutput.innerHTML = `<strong>Recomanació Simple:</strong> Donat el teu nivell de fatiga (${fatigueData.probability}%) i l'activitat d'avui, es suggereix una activitat lleugera de 20-30 minuts, com un passeig, i prioritzar una bona higiene del son.`;
            showToast("Recomanació generada!");
        });
        getElement('generateStructuredPlan').addEventListener('click', () => {
            aiOutput.innerHTML = `<strong>Pla Estructurat:</strong><br>- <strong>Tarda (18:00):</strong> Passeig lleuger de 25 minuts per mantenir l'activitat sense augmentar la fatiga.<br>- <strong>Vespre (21:00):</strong> Reduir l'exposició a pantalles i llum blava. Optar per lectura o música relaxant.<br>- <strong>Nit (22:30):</strong> Anar a dormir per optimitzar la recuperació i el son profund.`;
            showToast("Pla estructurat generat!");
        });
    }
    function showToast(message) {
        const toast = getElement('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // --- MANEJO DE PESTAÑAS (sense canvis de funcionalitat) ---
    function initTabs(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        const tabButtons = container.querySelectorAll('.tab-button');
        const tabPanes = container.querySelectorAll('.tab-content > div, .sleep-tab-content');
        const initialTab = container.querySelector('.tab-button.active');
        if (initialTab) {
            const initialTabId = initialTab.getAttribute('data-tab');
            tabPanes.forEach(pane => {
                const isActive = pane.id === initialTabId;
                pane.classList.toggle('active', isActive);
                pane.style.display = isActive ? 'block' : 'none';
                if (isActive) { initializeChartsInPane(pane); }
            });
        }
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                tabPanes.forEach(pane => {
                    const isActive = pane.id === tabId;
                    pane.classList.toggle('active', isActive);
                    pane.style.display = isActive ? 'block' : 'none';
                    if (isActive) { initializeChartsInPane(pane); }
                });
            });
        });
        function initializeChartsInPane(pane) {
            setTimeout(() => {
                pane.querySelectorAll('canvas').forEach(canvas => {
                    const chart = chartInstances[canvas.id];
                    if (chart) {
                        requestAnimationFrame(() => {
                            chart.resize();
                            chart.update({ duration: 0, lazy: true });
                        });
                    }
                });
            }, 10);
        }
    }

    // --- INICIALITZACIÓ DE GRÀFICS (amb colors actualitzats) ---
    function initActivityCharts() {
        const barOpts = { 
            responsive: true, maintainAspectRatio: false, 
            scales: { 
                y: { beginAtZero: true, grid: { color: 'rgba(51, 51, 51, 0.4)' } }, 
                x: { grid: { display: false } } 
            }, 
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.label}: ${formatMinutesToHoursAndMinutes(c.raw)}` } } } 
        };
        const lineOpts = {
            responsive: true, maintainAspectRatio: false,
            elements: { line: { tension: 0.4, borderWidth: 2, fill: true }, point: { radius: 2, hoverRadius: 5 } },
            scales: { y: { beginAtZero: false, grid: { color: 'rgba(51, 51, 51, 0.2)' } }, x: { grid: { display: false } } },
            plugins: { legend: { display: false } },
            interaction: { intersect: false, mode: 'index' }
        };

        // Gràfic Barres Activitat
        chartInstances['activityBarsChart'] = new Chart(getElement('activityBarsChart').getContext('2d'), { 
            type: 'bar', data: { labels: ['Sedentari', 'Lleu', 'Moderat', 'Intens'], datasets: [{ data: Object.values(activityData.activeZones), backgroundColor: ['#758680', '#A5A5A5', '#D4FF58', '#F5F5F5'], borderRadius: 4 }] }, options: barOpts 
        });

        // Gràfic Barres Zones FC
        chartInstances['hrZonesChart'] = new Chart(getElement('hrZonesChart').getContext('2d'), { 
            type: 'bar', data: { labels: ['Suau', 'Moderada', 'Intensa', 'Pic'], datasets: [{ data: Object.values(activityData.heartRateZones), backgroundColor: ['#758680', '#A5A5A5', '#D4FF58', '#F5F5F5'], borderRadius: 4 }] }, options: barOpts 
        });

        // Gràfic Tendència Activitat
        const activityTrendOptions = JSON.parse(JSON.stringify(lineOpts));
        activityTrendOptions.plugins.legend = { position: 'bottom', labels: { color: newPalette.textPrimary } };
        chartInstances['activityTrendChart'] = new Chart(getElement('activityTrendChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: trendData.dates,
                datasets: [
                    { label: 'Sedentari', data: trendData.activity.sedentari, borderColor: '#758680', backgroundColor: 'rgba(117, 134, 128, 0.15)' },
                    { label: 'Lleu', data: trendData.activity.lleu, borderColor: '#A5A5A5', backgroundColor: 'rgba(165, 165, 165, 0.15)' },
                    { label: 'Moderat', data: trendData.activity.moderat, borderColor: '#D4FF58', backgroundColor: 'rgba(212, 255, 88, 0.15)' },
                    { label: 'Intens', data: trendData.activity.intens, borderColor: '#F5F5F5', backgroundColor: 'rgba(245, 245, 245, 0.15)' }
                ]
            },
            options: activityTrendOptions
        });
        
        // Gràfic Tendència Zones FC
        const hrTrendOptions = JSON.parse(JSON.stringify(lineOpts));
        hrTrendOptions.plugins.legend = { position: 'bottom', labels: { color: newPalette.textPrimary } };
        chartInstances['hrTrendChart'] = new Chart(getElement('hrTrendChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: trendData.dates,
                datasets: [
                    { label: 'Repòs', data: trendData.heartRate.repos, borderColor: '#758680', backgroundColor: 'rgba(117, 134, 128, 0.15)' },
                    { label: 'Suau', data: trendData.heartRate.suau, borderColor: '#A5A5A5', backgroundColor: 'rgba(165, 165, 165, 0.15)' },
                    { label: 'Moderat', data: trendData.heartRate.moderat, borderColor: '#D4FF58', backgroundColor: 'rgba(212, 255, 88, 0.15)' },
                    { label: 'Pic', data: trendData.heartRate.pic, borderColor: '#F5F5F5', backgroundColor: 'rgba(245, 245, 245, 0.15)' }
                ]
            },
            options: hrTrendOptions
        });

        // Gràfic Tendència Son (colors mantinguts per consistència amb el donut)
        const sleepTrendOptions = JSON.parse(JSON.stringify(lineOpts));
        sleepTrendOptions.plugins.legend = { position: 'bottom', labels: { color: newPalette.textPrimary } };
        chartInstances['sleepTrendChart'] = new Chart(getElement('sleepTrendChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: trendData.dates,
                datasets: [
                    { label: 'Profund', data: trendData.sleepStages.profund, borderColor: '#D4FF58', backgroundColor: 'rgba(212, 255, 88, 0.15)' },
                    { label: 'Lleuger', data: trendData.sleepStages.lleuger, borderColor: '#A5A5A5', backgroundColor: 'rgba(165, 165, 165, 0.15)' },
                    { label: 'REM', data: trendData.sleepStages.REM, borderColor: '#F5F5F5', backgroundColor: 'rgba(245, 245, 245, 0.15)' },
                    { label: 'Despert', data: trendData.sleepStages.despert, borderColor: '#758680', backgroundColor: 'rgba(117, 134, 128, 0.15)' }
                ]
            },
            options: sleepTrendOptions
        });
    }

    // --- CÀRREGA INICIAL ---
    function loadAllData() {
        renderCurrentDate();
        renderFatigue(fatigueData);
        renderActivity(activityData);
        renderCentralMetrics(centralMetricsData);
        renderSleep(sleepData);
        renderMedicalConditions(medicalContextDataStore);
        
        initActivityCharts();
        setupMedicalModal();
        setupInteractions();
        initTabs('.sleep-widget');
        initTabs('.activity-charts-widget');
    }

    loadAllData();
});