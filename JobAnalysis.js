let jobData = [];
let filteredJobs = [];

// Job Class Definition
class Job {
    constructor(title, type, level, skill, posted, description) {
        this.title = title;
        this.type = type;
        this.level = level;
        this.skill = skill;
        this.posted = this.convertToDate(posted);
        this.description = description;
    }

    // Get formatted job details
    getDetails() {
        return `
            <h4>${this.title}</h4>
            <p><strong>Type:</strong> ${this.type}</p>
            <p><strong>Level:</strong> ${this.level}</p>
            <p><strong>Skill:</strong> ${this.skill}</p>
            <p><strong>Posted:</strong> ${this.getFormattedPostedTime()}</p>
            <div class="job-details">
                <p><strong>Description:</strong> ${this.description}</p>
            </div>
        `;
    }

    // Format posted time as a relative time (e.g., "59 minutes ago")
    getFormattedPostedTime() {
        const now = new Date();
        const diffInSeconds = Math.floor((now - this.posted) / 1000);
        
        if (diffInSeconds < 60) {
            return `${diffInSeconds} seconds ago`;
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minutes ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
        }
        
        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
    }

    // Convert relative time to a Date object
    convertToDate(postedTime) {
        const now = new Date();
        const timeAgoRegex = /(\d+)\s*(minute|hour|day|month|year)s?\s*ago/;

        const match = postedTime.match(timeAgoRegex);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2];

            switch (unit) {
                case 'minute':
                    now.setMinutes(now.getMinutes() - value);
                    break;
                case 'hour':
                    now.setHours(now.getHours() - value);
                    break;
                case 'day':
                    now.setDate(now.getDate() - value);
                    break;
                case 'month':
                    now.setMonth(now.getMonth() - value);
                    break;
                case 'year':
                    now.setFullYear(now.getFullYear() - value);
                    break;
            }
        }

        return now;
    }
}


// Handle file upload and load job data
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const rawData = JSON.parse(e.target.result);
                jobData = rawData.map(job => new Job(
                    job.Title, 
                    job.Type,       
                    job.Level,      
                    job.Skill,       
                    job.Posted,     
                    job.Detail       
                ));
                filteredJobs = [...jobData];
                populateFilters();
                displayJobs(filteredJobs);
            } catch (err) {
                alert("Error reading the file. Please upload a valid JSON file.");
            }
        };
        reader.readAsText(file);
    } else {
        alert("Please upload a valid JSON file.");
    }
}

// Populate filter dropdowns dynamically based on unique job data
function populateFilters() {
    const types = new Set();
    const levels = new Set();
    const skills = new Set();

    jobData.forEach(job => {
        types.add(job.type);
        levels.add(job.level);
        skills.add(job.skill);
    });

    populateFilter('typeFilter', types);
    populateFilter('levelFilter', levels);
    populateFilter('skillFilter', skills);
}

// Populate a single filter dropdown
function populateFilter(id, values) {
    const selectElement = document.getElementById(id);
    selectElement.innerHTML = '<option value="">All</option>';

    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectElement.appendChild(option);
    });
}

// Apply filters based on user input
function applyFilters() {
    const typeFilter = document.getElementById('typeFilter').value;
    const levelFilter = document.getElementById('levelFilter').value;
    const skillFilter = document.getElementById('skillFilter').value;

    filteredJobs = jobData.filter(job => {
        return (
            (typeFilter === "" || job.type === typeFilter) &&
            (levelFilter === "" || job.level === levelFilter) &&
            (skillFilter === "" || job.skill === skillFilter)
        );
    });

    displayJobs(filteredJobs);
}

// Sort jobs by title or posted time
function sortJobs(field, order) {
    const compare = (a, b) => {
        if (field === 'title') {
            return order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        } else if (field === 'posted') {
            return order === 'asc' ? a.posted - b.posted : b.posted - a.posted;
        }
    };

    filteredJobs.sort(compare);
    displayJobs(filteredJobs);
}

// Display job listings on the page
function displayJobs(jobs) {
    const jobContainer = document.getElementById('jobContainer');
    jobContainer.innerHTML = ''; 

    if (jobs.length === 0) {
        jobContainer.innerHTML = '<p>No jobs found.</p>';
        return;
    }

    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.classList.add('job-card');
        jobCard.innerHTML = job.getDetails();

        jobCard.addEventListener('click', () => {
            alert(`Job Details:\nTitle: ${job.title}\nDescription: ${job.description}`);
        });

        jobContainer.appendChild(jobCard);
    });
}

// Event Listeners
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('filterButton').addEventListener('click', applyFilters);
document.getElementById('sortTitleAsc').addEventListener('click', () => sortJobs('title', 'asc'));
document.getElementById('sortTitleDesc').addEventListener('click', () => sortJobs('title', 'desc'));
document.getElementById('sortPostedAsc').addEventListener('click', () => sortJobs('posted', 'asc'));
document.getElementById('sortPostedDesc').addEventListener('click', () => sortJobs('posted', 'desc'));
