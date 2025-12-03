// ========================================
// APPLICATION STATE
// ========================================

const APP = {
    currentCourse: null,
    currentWeek: null,
    courses: [],
    courseData: null,
    progress: {},
    theme: 'light'
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    loadTheme();
    loadProgress();
    await loadCourses();
    setupEventListeners();
    displayCourses();
    initMobileMenu();
});

// ========================================
// THEME MANAGEMENT
// ========================================

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

// ========================================
// PROGRESS MANAGEMENT
// ========================================

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

// ========================================
// COURSES LOADING
// ========================================

async function loadCourses() {
    try {
        const response = await fetch('courses.json');
        const data = await response.json();
        APP.courses = data.courses;
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// ========================================
// HOME VIEW
// ========================================

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

function showHomeView() {
    showView('homeView');
    APP.currentCourse = null;
    APP.currentWeek = null;
    APP.courseData = null;
}

// ========================================
// COURSE VIEW
// ========================================

async function openCourse(course) {
    APP.currentCourse = course;
    
    try {
        const response = await fetch(course.contentFile);
        APP.courseData = await response.json();
        
        showView('courseView');
        setupCourseSidebar();
        
        const firstWeek = Object.keys(APP.courseData)[0];
        displayWeek(firstWeek);
        
        initMobileSidebar();
        
    } catch (error) {
        console.error('Error loading course content:', error);
        alert('Impossible de charger le contenu du cours.');
    }
}

async function openCourseByName(courseName) {
    const course = APP.courses.find(c => c.id === courseName);
    if (course && course.status === 'active') {
        await openCourse(course);
    } else if (course && course.status === 'coming-soon') {
        alert('Cette formation sera bientôt disponible !');
    } else {
        alert('Formation non trouvée');
    }
}

// Ajoutez cette fonction dans app.js après la fonction openCourse

// Détecter le type de fichier et charger en conséquence
async function openCourse(course) {
    APP.currentCourse = course;
    
    try {
        const fileExtension = course.contentFile.split('.').pop().toLowerCase();
        
        if (fileExtension === 'html') {
            // Charger le contenu HTML
            const response = await fetch(course.contentFile);
            const htmlContent = await response.text();
            
            showView('courseView');
            displayHTMLCourse(htmlContent);
            
        } else {
            // Charger le JSON (Jupyter Notebook)
            const response = await fetch(course.contentFile);
            APP.courseData = await response.json();
            
            showView('courseView');
            setupCourseSidebar();
            
            const firstWeek = Object.keys(APP.courseData)[0];
            displayWeek(firstWeek);
            
            initMobileSidebar();
        }
        
    } catch (error) {
        console.error('Error loading course content:', error);
        alert('Impossible de charger le contenu du cours.');
    }
}

// Afficher un cours HTML
function displayHTMLCourse(htmlContent) {
    // Cacher la sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.style.display = 'none';
    }
    
    // Afficher le contenu HTML
    const contentArea = document.querySelector('.content-area');
    contentArea.innerHTML = `
        <div class="content-header">
            <div>
                <h2>${APP.currentCourse.title}</h2>
                <p class="content-subtitle">Formation HTML</p>
            </div>
        </div>
        <div class="html-course-content">
            ${htmlContent}
        </div>
    `;
    
    // Réafficher la sidebar si on revient à un cours JSON
    const originalGoHome = goHome;
    window.goHome = function() {
        if (sidebar) {
            sidebar.style.display = '';
        }
        originalGoHome();
    };
}


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

// ========================================
// SECTIONS EXTRACTION
// ========================================

function extractSections(weekData) {
    const sections = [];
    let currentSection = null;
    
    weekData.cells.forEach((cell, index) => {
        if (cell.cell_type === 'markdown') {
            const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
            const lines = source.split('\n');
            
            for (let line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('####') || trimmed.startsWith('###') || trimmed.startsWith('##')) {
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

// ========================================
// PROGRESS CALCULATION
// ========================================

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

function updateProgressDisplay() {
    const progress = calculateCourseProgress();
    
    document.getElementById('courseProgress').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${progress}%`;
    
    Object.keys(APP.courseData).forEach(weekNumber => {
        const weekProgress = calculateWeekProgress(weekNumber);
        const weekElement = document.querySelector(`[data-week="${weekNumber}"] .week-progress`);
        if (weekElement) {
            weekElement.textContent = `${weekProgress}%`;
        }
    });
}

// ========================================
// WEEK DISPLAY
// ========================================

function displayWeek(weekNumber) {
    APP.currentWeek = weekNumber;
    const weekData = APP.courseData[weekNumber];
    
    document.querySelectorAll('.week-header').forEach(header => {
        header.classList.remove('active');
    });
    document.querySelector(`[data-week="${weekNumber}"]`).classList.add('active');
    
    const sections = extractSections(weekData);
    document.getElementById('contentTitle').textContent = weekData.title;
    document.getElementById('contentSubtitle').textContent = `${sections.length} sections`;
    
    renderWeekContent(weekNumber, weekData);
    updateProgressDisplay();
    
    // Fermer la sidebar sur mobile après sélection
    if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.add('collapsed');
            sidebar.classList.remove('expanded');
        }
    }
}

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

// ========================================
// RENDERING
// ========================================

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
    
    if (cell.outputs && cell.outputs.length > 0) {
        cell.outputs.forEach(output => {
            const outputDiv = renderOutput(output);
            if (outputDiv) {
                container.appendChild(outputDiv);
            }
        });
    }
    
    setTimeout(() => {
        hljs.highlightElement(code);
    }, 0);
    
    return container;
}

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

// ========================================
// SECTION TOGGLE
// ========================================

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
    
    if (isCompleted && APP.currentWeek) {
        const weekProgress = calculateWeekProgress(APP.currentWeek);
        if (weekProgress === 100) {
            window.dispatchEvent(new Event('weekCompleted'));
        }
    }
}

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

// ========================================
// VIEW MANAGEMENT
// ========================================

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

// ========================================
// MOBILE MENU
// ========================================

function initMobileMenu() {
    if (window.innerWidth <= 768) {
        const header = document.querySelector('.header-container');
        const nav = document.querySelector('.main-nav');
        
        if (!nav) return;
        
        nav.style.display = 'none';
        
        if (!document.querySelector('.hamburger-menu')) {
            const hamburger = document.createElement('button');
            hamburger.className = 'hamburger-menu';
            hamburger.innerHTML = '☰';
            hamburger.setAttribute('aria-label', 'Menu');
            
            const logo = document.querySelector('.logo');
            header.insertBefore(hamburger, logo);
            
            hamburger.addEventListener('click', function() {
                if (nav.style.display === 'none' || nav.style.display === '') {
                    nav.style.display = 'flex';
                    hamburger.innerHTML = '✕';
                } else {
                    nav.style.display = 'none';
                    hamburger.innerHTML = '☰';
                }
            });
            
            const navLinks = nav.querySelectorAll('a:not(.dropbtn)');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    nav.style.display = 'none';
                    hamburger.innerHTML = '☰';
                });
            });
            
            const dropdown = document.querySelector('.dropdown');
            const dropbtn = document.querySelector('.dropbtn');
            
            if (dropdown && dropbtn) {
                dropbtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                });
            }
        }
    }
    
    window.addEventListener('resize', function() {
        const nav = document.querySelector('.main-nav');
        if (nav) {
            if (window.innerWidth > 768) {
                nav.style.display = 'flex';
            } else {
                nav.style.display = 'none';
            }
        }
    });
}

// ========================================
// MOBILE SIDEBAR
// ========================================

function initMobileSidebar() {
    if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        const sidebarHeader = document.querySelector('.sidebar-header');
        const sidebarContent = document.querySelector('.sidebar-content');
        
        if (sidebar && sidebarHeader && sidebarContent) {
            sidebar.classList.add('collapsed');
            
            sidebarHeader.addEventListener('click', function() {
                sidebar.classList.toggle('collapsed');
                sidebar.classList.toggle('expanded');
            });
        }
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('backBtn').addEventListener('click', goHome);
    document.getElementById('resetCourseBtn').addEventListener('click', resetCourseProgress);
}

// ========================================
// MARKED.JS CONFIG
// ========================================

marked.setOptions({
    breaks: true,
    gfm: true
});