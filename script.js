document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const generateCsvBtn = document.getElementById('generate-csv-btn');
    const resetFormBtn = document.getElementById('reset-form-btn');
    const csvPreviewContainer = document.getElementById('csv-preview-container');
    const csvPreview = document.getElementById('csv-preview');
    const downloadCsvBtn = document.getElementById('download-csv-btn');
    const submitCsvBtn = document.getElementById('submit-csv-btn');
    const refreshPredictionsBtn = document.getElementById('refresh-predictions-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const predictionResults = document.getElementById('prediction-results');
    const topTeamsContainer = document.getElementById('top-teams-container');
    const eliminatedTeamsContainer = document.getElementById('eliminated-teams-container');
    const lastUpdatedTime = document.getElementById('last-updated-time');
    const toast = document.getElementById('toast');

    // Team logos mapping (for bonus feature)
    const teamLogos = {
        'CSK': 'https://static.iplt20.com/players/284/csk.png',
        'MI': 'https://static.iplt20.com/players/284/mi.png',
        'RCB': 'https://static.iplt20.com/players/284/rcb.png',
        'KKR': 'https://static.iplt20.com/players/284/kkr.png',
        'DC': 'https://static.iplt20.com/players/284/dc.png',
        'SRH': 'https://static.iplt20.com/players/284/srh.png',
        'PBKS': 'https://static.iplt20.com/players/284/pbks.png',
        'RR': 'https://static.iplt20.com/players/284/rr.png',
        'GT': 'https://static.iplt20.com/players/284/gt.png',
        'LSG': 'https://static.iplt20.com/players/284/lsg.png'
    };

    // Team full names mapping
    const teamFullNames = {
        'CSK': 'Chennai Super Kings',
        'MI': 'Mumbai Indians',
        'RCB': 'Royal Challengers Bangalore',
        'KKR': 'Kolkata Knight Riders',
        'DC': 'Delhi Capitals',
        'SRH': 'Sunrisers Hyderabad',
        'PBKS': 'Punjab Kings',
        'RR': 'Rajasthan Royals',
        'GT': 'Gujarat Titans',
        'LSG': 'Lucknow Super Giants'
    };

    // Team abbreviations mapping
    const teamAbbreviations = {
        'Chennai Super Kings (CSK)': 'CSK',
        'Mumbai Indians (MI)': 'MI',
        'Royal Challengers Bangalore (RCB)': 'RCB',
        'Kolkata Knight Riders (KKR)': 'KKR',
        'Delhi Capitals (DC)': 'DC',
        'Sunrisers Hyderabad (SRH)': 'SRH',
        'Punjab Kings (PBKS)': 'PBKS',
        'Rajasthan Royals (RR)': 'RR',
        'Gujarat Titans (GT)': 'GT',
        'Lucknow Super Giants (LSG)': 'LSG'
    };

    // API Endpoints (replace with actual endpoints when available)
    const API_ENDPOINTS = {
        UPLOAD_CSV: 'https://api.example.com/api/upload',
        GET_PREDICTIONS: 'https://api.example.com'
    };

    // Check for saved theme preference
    initTheme();

    // Event Listeners
    themeToggleBtn.addEventListener('click', toggleTheme);
    generateCsvBtn.addEventListener('click', generateAndPreviewCSV);
    resetFormBtn.addEventListener('click', resetForm);
    downloadCsvBtn.addEventListener('click', downloadCSV);
    submitCsvBtn.addEventListener('click', submitCSV);
    refreshPredictionsBtn.addEventListener('click', fetchPredictions);

    // Theme Toggle Function
    function toggleTheme() {
        const body = document.body;
        const isDarkMode = body.classList.toggle('dark-mode');
        
        // Update button text and icon
        if (isDarkMode) {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
        
        // Save preference to localStorage
        localStorage.setItem('darkMode', isDarkMode);
    }

    // Initialize theme based on saved preference
    function initTheme() {
        const savedTheme = localStorage.getItem('darkMode');
        
        if (savedTheme === 'true') {
            document.body.classList.add('dark-mode');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        }
    }

    // Generate and Preview CSV
    function generateAndPreviewCSV() {
        const tableRows = document.querySelectorAll('#team-data-table tbody tr');
        let csvData = 'Team,Points,NRR\n';
        let isValid = true;
        
        tableRows.forEach(row => {
            const teamName = row.cells[0].textContent.trim();
            const points = row.querySelector('.points-input').value;
            const nrr = row.querySelector('.nrr-input').value;
            
            // Validate inputs
            if (!points || !nrr) {
                isValid = false;
                return;
            }
            
            // Add to CSV string
            csvData += `${teamAbbreviations[teamName]},${points},${nrr}\n`;
        });
        
        if (!isValid) {
            alert('Please fill in all fields for all teams.');
            return;
        }
        
        // Show CSV preview
        csvPreview.textContent = csvData;
        csvPreviewContainer.classList.remove('hidden');
        
        // Store CSV data for later use
        window.generatedCSV = csvData;
    }

    // Reset Form
    function resetForm() {
        const inputs = document.querySelectorAll('#team-data-table input');
        inputs.forEach(input => input.value = '');
        csvPreviewContainer.classList.add('hidden');
    }

    // Download CSV
    function downloadCSV() {
        if (!window.generatedCSV) return;
        
        const blob = new Blob([window.generatedCSV], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ipl_team_data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Submit CSV to API
    function submitCSV() {
        if (!window.generatedCSV) return;
        
        // Show loading spinner
        loadingSpinner.classList.remove('hidden');
        predictionResults.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        // Create FormData
        const formData = new FormData();
        const blob = new Blob([window.generatedCSV], { type: 'text/csv' });
        formData.append('file', blob, 'team_data.csv');
        
        // For demo purposes, we'll simulate an API call
        setTimeout(() => {
            // Hide CSV preview
            csvPreviewContainer.classList.add('hidden');
            
            // Show toast notification
            showToast('CSV submitted successfully!');
            
            // Fetch predictions
            fetchPredictions();
        }, 1500);
        
        // Actual API call (uncomment when API is available)
        /*
        fetch(API_ENDPOINTS.UPLOAD_CSV, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to upload CSV');
            return response.json();
        })
        .then(data => {
            // Hide CSV preview
            csvPreviewContainer.classList.add('hidden');
            
            // Show toast notification
            showToast('CSV submitted successfully!');
            
            // Fetch predictions
            fetchPredictions();
        })
        .catch(error => {
            console.error('Error:', error);
            loadingSpinner.classList.add('hidden');
            errorMessage.classList.remove('hidden');
        });
        */
    }

    // Fetch Predictions
    function fetchPredictions() {
        // Show loading spinner
        loadingSpinner.classList.remove('hidden');
        predictionResults.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        // For demo purposes, we'll use mock data
        setTimeout(() => {
            const mockData = {
                top_teams: [
                    { team: 'MI', points: 16, nrr: 0.45, rank: 1 },
                    { team: 'CSK', points: 14, nrr: 0.38, rank: 2 },
                    { team: 'RCB', points: 14, nrr: 0.12, rank: 3 },
                    { team: 'DC', points: 12, nrr: 0.09, rank: 4 }
                ],
                eliminated_teams: [
                    { team: 'KKR', points: 12, nrr: -0.05, rank: 5 },
                    { team: 'PBKS', points: 10, nrr: -0.12, rank: 6 },
                    { team: 'RR', points: 10, nrr: -0.25, rank: 7 },
                    { team: 'SRH', points: 8, nrr: -0.35, rank: 8 },
                    { team: 'GT', points: 8, nrr: -0.42, rank: 9 },
                    { team: 'LSG', points: 6, nrr: -0.58, rank: 10 }
                ],
                last_updated: new Date().toISOString()
            };
            
            displayPredictions(mockData);
        }, 2000);
        
        // Actual API call (uncomment when API is available)
        /*
        fetch(API_ENDPOINTS.GET_PREDICTIONS)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch predictions');
            return response.json();
        })
        .then(data => {
            displayPredictions(data);
        })
        .catch(error => {
            console.error('Error:', error);
            loadingSpinner.classList.add('hidden');
            errorMessage.classList.remove('hidden');
        });
        */
    }

    // Display Predictions
    function displayPredictions(data) {
        // Hide loading spinner
        loadingSpinner.classList.add('hidden');
        
        // Clear previous results
        topTeamsContainer.innerHTML = '';
        eliminatedTeamsContainer.innerHTML = '';
        
        // Display top teams
        data.top_teams.forEach(team => {
            topTeamsContainer.appendChild(createTeamCard(team, true));
        });
        
        // Display eliminated teams
        data.eliminated_teams.forEach(team => {
            eliminatedTeamsContainer.appendChild(createTeamCard(team, false));
        });
        
        // Update last updated time
        const date = new Date(data.last_updated);
        lastUpdatedTime.textContent = date.toLocaleString();
        
        // Show prediction results
        predictionResults.classList.remove('hidden');
    }

    // Create Team Card
    function createTeamCard(team, isTopTeam) {
        const card = document.createElement('div');
        card.className = 'team-card';
        
        const headerColor = isTopTeam ? 'var(--accent-color)' : 'var(--secondary-color)';
        
        card.innerHTML = `
            <div class="team-card-header" style="background-color: ${headerColor}">
                <h4>${teamFullNames[team.team]}</h4>
            </div>
            <div class="team-card-body">
                <img src="${teamLogos[team.team]}" alt="${team.team} Logo" class="team-logo">
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

    // Show Toast Notification
    function showToast(message) {
        const toastMessage = document.querySelector('.toast-message');
        toastMessage.textContent = message;
        
        toast.classList.add('show');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
