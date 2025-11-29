// Application State
const APP = {
    currentCourse: null,
    currentWeek: null,
    courses: [],
    courseData: null,
    progress: {},
    theme: 'light'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    loadTheme();
    loadProgress();
    await loadCourses();
    setupEventListeners();
    displayCourses();
});

// Theme Management
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    APP.theme = savedTheme;
    document.body.className = `${savedTheme}-mode`;
}

function toggleTheme() {
    APP.theme = APP.theme === 'light' ? 'dark' : 'light';
    document.body.className = `${APP.theme}-mode`;
    localStorage.setItem('theme', APP.theme);
}

// Progress Management
function loadProgress() {
    const saved = localStorage.getItem('learningProgress');
    if (saved) {
        APP.progress = JSON.parse(saved);
    }
}

function saveProgress() {
    localStorage.setItem('learningProgress', JSON.stringify(APP.progress));
}

function getCourseProgress(courseId) {
    if (!APP.progress[courseId]) {
        APP.progress[courseId] = {};
    }
    return APP.progress[courseId];
}

// Load Courses Configuration
async function loadCourses() {
    try {
        const response = await fetch('courses.json');
        const data = await response.json();
        APP.courses = data.courses;
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// Display Courses Grid
function displayCourses() {
    const grid = document.getElementById('coursesGrid');
    grid.innerHTML = '';

    APP.courses.forEach(course => {
        const card = document.createElement('div');
        card.className = `course-card ${course.status !== 'active' ? 'disabled' : ''}`;
        
        const statusClass = course.status === 'active' ? 'active' : 'coming-soon';
        const statusText = course.status === 'active' ? 'Disponible' : 'Bientôt disponible';
        
        card.innerHTML = `
            <span class="course-status ${statusClass}">${statusText}</span>
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <div class="course-meta">
                <div class="meta-item">
                    <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>${course.duration}</span>
                </div>
                <div class="meta-item">
                    <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>${course.level}</span>
                </div>
            </div>
        `;

        if (course.status === 'active') {
            card.addEventListener('click', () => openCourse(course));
        }

        grid.appendChild(card);
    });
}

// Open Course
async function openCourse(course) {
    APP.currentCourse = course;
    
    try {
        const response = await fetch(course.contentFile);
        APP.courseData = await response.json();
        
        showView('courseView');
        setupCourseSidebar();
        
        // Display first week by default
        const firstWeek = Object.keys(APP.courseData)[0];
        displayWeek(firstWeek);
        
    } catch (error) {
        console.error('Error loading course content:', error);
        alert('Impossible de charger le contenu du cours.');
    }
}

// Setup Course Sidebar
function setupCourseSidebar() {
    const title = document.getElementById('sidebarCourseTitle');
    title.textContent = APP.currentCourse.title;
    
    const sidebarContent = document.getElementById('sidebarContent');
    sidebarContent.innerHTML = '';
    
    Object.keys(APP.courseData).forEach(weekNumber => {
        const weekData = APP.courseData[weekNumber];
        const weekDiv = document.createElement('div');
        weekDiv.className = 'week-section';
        
        const progress = calculateWeekProgress(weekNumber);
        
        weekDiv.innerHTML = `
            <div class="week-header" data-week="${weekNumber}">
                <div class="week-info">
                    <h4>Semaine ${weekNumber}</h4>
                    <p>${weekData.title}</p>
                </div>
                <div class="week-progress">${progress}%</div>
            </div>
        `;
        
        weekDiv.querySelector('.week-header').addEventListener('click', () => {
            displayWeek(weekNumber);
        });
        
        sidebarContent.appendChild(weekDiv);
    });
}

// Extract sections from week data (based on markdown titles)
function extractSections(weekData) {
    const sections = [];
    let currentSection = null;
    
    weekData.cells.forEach((cell, index) => {
        if (cell.cell_type === 'markdown') {
            const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
            const lines = source.split('\n');
            
            // Look for titles (# ## ### ####)
            for (let line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('####') || trimmed.startsWith('###') || trimmed.startsWith('##')) {
                    // Extract title without markdown symbols and links
                    let title = trimmed.replace(/^#+\s*/, '');
                    title = title.replace(/<a[^>]*>.*?<\/a>/g, '');
                    title = title.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
                    title = title.trim();
                    
                    if (title && title.length > 3) {
                        currentSection = {
                            title: title,
                            startIndex: index,
                            cells: []
                        };
                        sections.push(currentSection);
                        break;
                    }
                }
            }
        }
        
        if (currentSection) {
            currentSection.cells.push({ cell, index });
        }
    });
    
    return sections;
}

// Calculate Week Progress
function calculateWeekProgress(weekNumber) {
    const courseProgress = getCourseProgress(APP.currentCourse.id);
    const weekData = APP.courseData[weekNumber];
    
    if (!weekData || !weekData.cells) return 0;
    
    const sections = extractSections(weekData);
    if (sections.length === 0) return 0;
    
    let completedSections = 0;
    
    sections.forEach((section, idx) => {
        const sectionId = `${APP.currentCourse.id}_week${weekNumber}_section${idx}`;
        if (courseProgress[sectionId]) {
            completedSections++;
        }
    });
    
    return Math.round((completedSections / sections.length) * 100);
}

// Calculate Overall Course Progress
function calculateCourseProgress() {
    const courseProgress = getCourseProgress(APP.currentCourse.id);
    let totalSections = 0;
    let completedSections = 0;
    
    Object.keys(APP.courseData).forEach(weekNumber => {
        const weekData = APP.courseData[weekNumber];
        if (weekData && weekData.cells) {
            const sections = extractSections(weekData);
            totalSections += sections.length;
            
            sections.forEach((section, idx) => {
                const sectionId = `${APP.currentCourse.id}_week${weekNumber}_section${idx}`;
                if (courseProgress[sectionId]) {
                    completedSections++;
                }
            });
        }
    });
    
    return totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
}

// Display Week Content
function displayWeek(weekNumber) {
    APP.currentWeek = weekNumber;
    const weekData = APP.courseData[weekNumber];
    
    // Update active week in sidebar
    document.querySelectorAll('.week-header').forEach(header => {
        header.classList.remove('active');
    });
    document.querySelector(`[data-week="${weekNumber}"]`).classList.add('active');
    
    // Update content header
    const sections = extractSections(weekData);
    document.getElementById('contentTitle').textContent = weekData.title;
    document.getElementById('contentSubtitle').textContent = `${sections.length} sections`;
    
    // Render content
    renderWeekContent(weekNumber, weekData);
    
    // Update progress
    updateProgressDisplay();
}

// Render Week Content
function renderWeekContent(weekNumber, weekData) {
    const container = document.getElementById('lessonContent');
    container.innerHTML = '';
    
    const sections = extractSections(weekData);
    
    sections.forEach((section, sectionIndex) => {
        const sectionId = `${APP.currentCourse.id}_week${weekNumber}_section${sectionIndex}`;
        const courseProgress = getCourseProgress(APP.currentCourse.id);
        const isCompleted = courseProgress[sectionId] || false;
        
        const sectionDiv = document.createElement('div');
        sectionDiv.className = `section-item ${isCompleted ? 'completed' : ''}`;
        sectionDiv.dataset.sectionId = sectionId;
        
        // Section header with checkbox
        const header = document.createElement('div');
        header.className = 'section-header';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'section-checkbox';
        checkbox.checked = isCompleted;
        checkbox.addEventListener('change', (e) => toggleSection(sectionId, e.target.checked));
        
        const label = document.createElement('label');
        label.className = 'section-label';
        label.textContent = section.title;
        label.addEventListener('click', () => checkbox.click());
        
        header.appendChild(checkbox);
        header.appendChild(label);
        sectionDiv.appendChild(header);
        
        // Section content
        const content = document.createElement('div');
        content.className = 'section-content';
        
        section.cells.forEach(({ cell }) => {
            if (cell.cell_type === 'markdown') {
                content.appendChild(renderMarkdown(cell));
            } else if (cell.cell_type === 'code') {
                content.appendChild(renderCode(cell));
            }
        });
        
        sectionDiv.appendChild(content);
        container.appendChild(sectionDiv);
    });
}

// Render Markdown Cell
function renderMarkdown(cell) {
    const div = document.createElement('div');
    div.className = 'markdown-content';
    
    const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
    const cleanedSource = source
        .replace(/<a id='[^']*'><\/a>/g, '')
        .replace(/\[([^\]]+)\]\(#[^\)]+\)/g, '$1');
    
    div.innerHTML = marked.parse(cleanedSource);
    
    return div;
}

// Render Code Cell
function renderCode(cell) {
    const container = document.createElement('div');
    container.className = 'code-block';
    
    const header = document.createElement('div');
    header.className = 'code-header';
    
    const language = document.createElement('span');
    language.className = 'code-language';
    language.textContent = 'Python';
    
    const badge = document.createElement('span');
    badge.className = 'code-badge';
    badge.textContent = 'Lecture seule';
    
    header.appendChild(language);
    header.appendChild(badge);
    container.appendChild(header);
    
    const codeContent = document.createElement('div');
    codeContent.className = 'code-content';
    
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'language-python';
    
    const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
    code.textContent = source;
    
    pre.appendChild(code);
    codeContent.appendChild(pre);
    container.appendChild(codeContent);
    
    // Add outputs if available
    if (cell.outputs && cell.outputs.length > 0) {
        cell.outputs.forEach(output => {
            const outputDiv = renderOutput(output);
            if (outputDiv) {
                container.appendChild(outputDiv);
            }
        });
    }
    
    // Highlight code
    setTimeout(() => {
        hljs.highlightElement(code);
    }, 0);
    
    return container;
}

// Render Output
function renderOutput(output) {
    const div = document.createElement('div');
    div.className = 'output-block';
    
    const label = document.createElement('div');
    label.className = 'output-label';
    label.textContent = 'Sortie';
    div.appendChild(label);
    
    if (output.output_type === 'stream') {
        const text = Array.isArray(output.text) ? output.text.join('') : output.text;
        const pre = document.createElement('pre');
        pre.textContent = text;
        div.appendChild(pre);
    } else if (output.output_type === 'execute_result' || output.output_type === 'display_data') {
        if (output.data && output.data['text/plain']) {
            const text = Array.isArray(output.data['text/plain']) 
                ? output.data['text/plain'].join('') 
                : output.data['text/plain'];
            const pre = document.createElement('pre');
            pre.textContent = text;
            div.appendChild(pre);
        }
    } else if (output.output_type === 'error') {
        const errorText = output.traceback ? output.traceback.join('\n') : 
                         `${output.ename}: ${output.evalue}`;
        const pre = document.createElement('pre');
        pre.style.color = '#ef4444';
        pre.textContent = errorText;
        div.appendChild(pre);
    }
    
    return div;
}

// Toggle Section
function toggleSection(sectionId, isCompleted) {
    const courseProgress = getCourseProgress(APP.currentCourse.id);
    courseProgress[sectionId] = isCompleted;
    saveProgress();
    
    const section = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (section) {
        if (isCompleted) {
            section.classList.add('completed');
        } else {
            section.classList.remove('completed');
        }
    }
    
    updateProgressDisplay();
    
    // Vérifier si la semaine est complétée à 100%
    if (isCompleted && APP.currentWeek) {
        const weekProgress = calculateWeekProgress(APP.currentWeek);
        if (weekProgress === 100) {
            // Déclencher l'événement de semaine complétée
            window.dispatchEvent(new Event('weekCompleted'));
        }
    }
}

// Update Progress Display
function updateProgressDisplay() {
    const progress = calculateCourseProgress();
    
    document.getElementById('courseProgress').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${progress}%`;
    
    // Update week progress in sidebar
    Object.keys(APP.courseData).forEach(weekNumber => {
        const weekProgress = calculateWeekProgress(weekNumber);
        const weekElement = document.querySelector(`[data-week="${weekNumber}"] .week-progress`);
        if (weekElement) {
            weekElement.textContent = `${weekProgress}%`;
        }
    });
}

// Reset Course Progress
function resetCourseProgress() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser votre progression pour ce cours ?')) {
        APP.progress[APP.currentCourse.id] = {};
        saveProgress();
        
        document.querySelectorAll('.section-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelectorAll('.section-item').forEach(section => {
            section.classList.remove('completed');
        });
        
        updateProgressDisplay();
    }
}

// View Management
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
}

function goHome() {
    showView('homeView');
    APP.currentCourse = null;
    APP.currentWeek = null;
    APP.courseData = null;
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('backBtn').addEventListener('click', goHome);
    document.getElementById('resetCourseBtn').addEventListener('click', resetCourseProgress);
}

// Marked.js Configuration
marked.setOptions({
    breaks: true,
    gfm: true
});
