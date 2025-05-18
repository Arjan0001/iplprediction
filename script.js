document.addEventListener('DOMContentLoaded', () => {
    const generateCsvBtn = document.getElementById('generate-csv-btn');
    const downloadCsvBtn = document.getElementById('download-csv-btn');
    const submitCsvBtn = document.getElementById('submit-csv-btn');
    const resetFormBtn = document.getElementById('reset-form-btn');
    const csvPreviewContainer = document.getElementById('csv-preview-container');
    const csvPreview = document.getElementById('csv-preview');
    const toast = document.getElementById('toast');

    const topTeamsContainer = document.getElementById('top-teams-container');
    const eliminatedTeamsContainer = document.getElementById('eliminated-teams-container');
    const predictionResults = document.getElementById('prediction-results');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const lastUpdatedTime = document.getElementById('last-updated-time');

    const API_URL = "https://ipl-api-256854902296.asia-south1.run.app/ipl2025";

    const TEAM_LOGOS = {
        "CSK": "logos\csk.png",
        "MI": "logos\mi.png",
        "RCB": "logos\rcb.png",
        "GT": "logos\gt.png",
        "RR": "logos\rr.png",
        "KKR": "logos\kkr.png",
        "LSG": "logos\lsg.png",
        "PBKS": "logos\pbks.png",
        "DC": "logos\dc.png",
        "SRH": "logos\srh.png"
    };

    const TEAM_FULL_NAMES = {
        "CSK": "Chennai Super Kings",
        "MI": "Mumbai Indians",
        "RCB": "Royal Challengers Bangalore",
        "GT": "Gujarat Titans",
        "RR": "Rajasthan Royals",
        "KKR": "Kolkata Knight Riders",
        "LSG": "Lucknow Super Giants",
        "PBKS": "Punjab Kings",
        "DC": "Delhi Capitals",
        "SRH": "Sunrisers Hyderabad"
    };

    const getTeamData = () => {
        const rows = document.querySelectorAll('#team-data-table tbody tr');
        const data = [['Team', 'Matches', 'Won', 'Lost', 'Points', 'NRR', 'Remaining_Matches']];
        rows.forEach(row => {
            const team = row.cells[0].innerText.trim();
            const matches = row.querySelector('.matches-input')?.value || '0';
            const won = row.querySelector('.won-input')?.value || '0';
            const lost = row.querySelector('.lost-input')?.value || '0';
            const points = row.querySelector('.points-input')?.value || '0';
            const nrr = row.querySelector('.nrr-input')?.value || '0';
            const remaining = row.querySelector('.remaining-input')?.value || '0';
            data.push([team, matches, won, lost, points, nrr, remaining]);
        });
        return data;
    };

    const convertToCSV = (data) => {
        return data.map(row => row.join(',')).join('\n');
    };

    const showToast = (message) => {
        toast.querySelector('.toast-message').textContent = message;
        toast.classList.remove('hidden');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    const createCSVFile = (csvText) => {
        const blob = new Blob([csvText], { type: 'text/csv' });
        return new File([blob], 'team_data.csv', { type: 'text/csv' });
    };

    function createTeamCard(team, isTopTeam) {
        const card = document.createElement('div');
        card.className = 'team-card';
        
        const headerColor = isTopTeam ? 'var(--accent-color)' : 'var(--secondary-color)';
        
        card.innerHTML = `
            <div class="team-card-header" style="background-color: ${headerColor}">
                <h4>${TEAM_FULL_NAMES[team.team] || team.team}</h4>
            </div>
            <div class="team-card-body">
                <img src="${TEAM_LOGOS[team.team] || 'logos/default.png'}" alt="${team.team} Logo" class="team-logo">
                <div class="team-rank">#${team.rank}</div>
                <div class="team-name">${team.team}</div>
                <div class="team-stats">
                    <div>Points: ${team.points}</div>
                    <div>NRR: ${team.nrr}</div>
                </div>
            </div>
        `;
        return card;
    }

    const showPredictions = (result) => {
        const top_teams = result["Predicted Playoff Teams"] || [];
        const eliminated_teams = result["Eliminated Teams"] || [];

        topTeamsContainer.innerHTML = '';
        eliminatedTeamsContainer.innerHTML = '';

        top_teams.forEach((team, index) => {
            const teamObj = {
                team: team,
                rank: index + 1,
                points: '',  // Can populate from original data if needed
                nrr: ''
            };
            const card = createTeamCard(teamObj, true);
            topTeamsContainer.appendChild(card);
        });

        eliminated_teams.forEach((team, index) => {
            const teamObj = {
                team: team,
                rank: top_teams.length + index + 1,
                points: '',
                nrr: ''
            };
            const card = createTeamCard(teamObj, false);
            eliminatedTeamsContainer.appendChild(card);
        });

        lastUpdatedTime.textContent = new Date().toLocaleString();
        predictionResults.classList.remove('hidden');
    };

    generateCsvBtn.addEventListener('click', () => {
        const data = getTeamData();
        const csvText = convertToCSV(data);
        csvPreview.textContent = csvText;
        csvPreviewContainer.classList.remove('hidden');
    });

    downloadCsvBtn.addEventListener('click', () => {
        const csvText = csvPreview.textContent;
        const blob = new Blob([csvText], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'team_data.csv';
        link.click();
    });

    submitCsvBtn.addEventListener('click', async () => {
        const csvText = csvPreview.textContent;
        if (!csvText.trim()) {
            showToast('CSV preview is empty. Generate it first.');
            return;
        }

        const file = createCSVFile(csvText);
        const formData = new FormData();
        formData.append('file', file);

        loadingSpinner.classList.remove('hidden');
        predictionResults.classList.add('hidden');
        errorMessage.classList.add('hidden');

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('API Error');
            }

            const result = await response.json();
            showPredictions(result);
            showToast('Prediction successful!');
        } catch (error) {
            console.error('Prediction Error:', error);
            errorMessage.classList.remove('hidden');
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    });

    resetFormBtn.addEventListener('click', () => {
        document.querySelectorAll('.points-input, .nrr-input, .matches-input, .won-input, .lost-input, .remaining-input').forEach(input => input.value = '');
        csvPreviewContainer.classList.add('hidden');
        predictionResults.classList.add('hidden');
        errorMessage.classList.add('hidden');
    });
});



/*document.addEventListener('DOMContentLoaded', () => {
    const generateCsvBtn = document.getElementById('generate-csv-btn');
    const downloadCsvBtn = document.getElementById('download-csv-btn');
    const submitCsvBtn = document.getElementById('submit-csv-btn');
    const resetFormBtn = document.getElementById('reset-form-btn');
    const csvPreviewContainer = document.getElementById('csv-preview-container');
    const csvPreview = document.getElementById('csv-preview');
    const toast = document.getElementById('toast');

    const topTeamsContainer = document.getElementById('top-teams-container');
    const eliminatedTeamsContainer = document.getElementById('eliminated-teams-container');
    const predictionResults = document.getElementById('prediction-results');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const lastUpdatedTime = document.getElementById('last-updated-time');

    const API_URL ="https://ipl-api-256854902296.asia-south1.run.app/ipl2025";/// 'http://127.0.0.1:8000/ipl2025';///'https://ipl-api-256854902296.asia-south1.run.app/ipl2025';
    
    const getTeamData = () => {
        const rows = document.querySelectorAll('#team-data-table tbody tr');
        const data = [['Team', 'Matches', 'Won', 'Lost', 'Points', 'NRR', 'Remaining_Matches']];
        rows.forEach(row => {
            const team = row.cells[0].innerText.trim();
            const matches = row.querySelector('.matches-input')?.value || '0';
            const won = row.querySelector('.won-input')?.value || '0';
            const lost = row.querySelector('.lost-input')?.value || '0';
            const points = row.querySelector('.points-input')?.value || '0';
            const nrr = row.querySelector('.nrr-input')?.value || '0';
            const remaining_matches = row.querySelector('.remaining-input')?.value || '0';
            data.push([team, matches, won, lost, points, nrr, remaining_matches]);
        });
        return data;
    };

    const convertToCSV = (data) => {
        return data.map(row => row.join(',')).join('\n');
    };

    const showToast = (message) => {
        toast.querySelector('.toast-message').textContent = message;
        toast.classList.remove('hidden');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    const createCSVFile = (csvText) => {
        const blob = new Blob([csvText], { type: 'text/csv' });
        return new File([blob], 'team_data.csv', { type: 'text/csv' });
    };

    generateCsvBtn.addEventListener('click', () => {
        const data = getTeamData();
        const csvText = convertToCSV(data);
        csvPreview.textContent = csvText;
        csvPreviewContainer.classList.remove('hidden');
    });

    downloadCsvBtn.addEventListener('click', () => {
        const csvText = csvPreview.textContent;
        const blob = new Blob([csvText], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'team_data.csv';
        link.click();
    });

    submitCsvBtn.addEventListener('click', async () => {
        const csvText = csvPreview.textContent;
        const file = createCSVFile(csvText);
        const formData = new FormData();
        formData.append('file', file);

        loadingSpinner.classList.remove('hidden');
        predictionResults.classList.add('hidden');
        errorMessage.classList.add('hidden');

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('API Error');
            }

            const result = await response.json();
            showPredictions(result);
            showToast('CSV submitted successfully!');
        } catch (error) {
            console.error('Prediction Error:', error);
            errorMessage.classList.remove('hidden');
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    });

    const showPredictions = (result) => {
        const top_teams = result["Predicted Playoff Teams"] || [];
        const eliminated_teams = result["Eliminated Teams"] || [];

        topTeamsContainer.innerHTML = '';
        eliminatedTeamsContainer.innerHTML = '';

        top_teams.forEach(team => {
            const card = document.createElement('div');
            card.className = 'team-card';
            card.textContent = team;
            topTeamsContainer.appendChild(card);
        });

        eliminated_teams.forEach(team => {
            const card = document.createElement('div');
            card.className = 'team-card';
            card.textContent = team;
            eliminatedTeamsContainer.appendChild(card);
        });

        lastUpdatedTime.textContent = new Date().toLocaleString();
        predictionResults.classList.remove('hidden');
    };

    resetFormBtn.addEventListener('click', () => {
        document.querySelectorAll('.points-input, .nrr-input').forEach(input => input.value = '');
        csvPreviewContainer.classList.add('hidden');
        predictionResults.classList.add('hidden');
        errorMessage.classList.add('hidden');
    });
});
*/