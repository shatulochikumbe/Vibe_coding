// Course Data - Stored in a JavaScript array as requested
const courses = [
    {
        id: 1,
        title: "Introduction to Web Development",
        description: "Learn the fundamentals of HTML, CSS, and JavaScript to build your first website.",
        image: "Web Dev",
        lessons: [
            "Understanding HTML Structure",
            "Styling with CSS",
            "JavaScript Basics",
            "Building a Simple Website"
        ]
    },
    {
        id: 2,
        title: "CSS & Responsive Design",
        description: "Master CSS layouts, Flexbox, Grid, and create websites that work on all devices.",
        image: "CSS",
        lessons: [
            "CSS Selectors and Specificity",
            "Flexbox Layouts",
            "CSS Grid Systems",
            "Media Queries and Responsive Design"
        ]
    },
    {
        id: 3,
        title: "JavaScript Fundamentals",
        description: "Dive deep into JavaScript programming concepts, from variables to functions and DOM manipulation.",
        image: "JavaScript",
        lessons: [
            "Variables and Data Types",
            "Functions and Scope",
            "DOM Manipulation",
            "Event Handling"
        ]
    }
];

// Track user progress
let userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};
let currentView = 'home';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    renderCourses();
    setupEventListeners();
    
    // Check if we're on a course detail page
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course');
    if (courseId) {
        showCourseDetail(parseInt(courseId));
        currentView = 'course';
    }
});

// Setup all event listeners
function setupEventListeners() {
    // Auth modal handlers
    document.getElementById('loginBtn').addEventListener('click', function() {
        showAuthModal('login');
    });
    
    document.getElementById('signupBtn').addEventListener('click', function() {
        showAuthModal('signup');
    });
    
    document.querySelector('.close-btn').addEventListener('click', hideAuthModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('authModal');
        if (event.target === modal) {
            hideAuthModal();
        }
    });
    
    // Auth form submission
    document.getElementById('authForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Authentication would be implemented in a full version. For this prototype, you are now "logged in".');
        hideAuthModal();
    });
}

// Render courses on the homepage
function renderCourses() {
    if (currentView !== 'home') return;
    
    const coursesContainer = document.getElementById('coursesContainer');
    coursesContainer.innerHTML = '';
    
    courses.forEach(course => {
        const completed = userProgress[course.id] && userProgress[course.id].completed;
        
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <div class="course-card-image">${course.image}</div>
            <div class="course-card-content">
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <button class="btn-primary view-course" data-id="${course.id}">
                    ${completed ? 'View Progress' : 'View Course'}
                </button>
                ${completed ? '<div class="completed-badge">Completed</div>' : ''}
            </div>
        `;
        
        coursesContainer.appendChild(courseCard);
    });
    
    // Add event listeners to course buttons
    document.querySelectorAll('.view-course').forEach(button => {
        button.addEventListener('click', function() {
            const courseId = parseInt(this.getAttribute('data-id'));
            showCourseDetail(courseId);
        });
    });
}

// Show course detail page
function showCourseDetail(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    currentView = 'course';
    
    // Update URL without reloading page
    window.history.pushState({}, '', `?course=${courseId}`);
    
    const completedLessons = userProgress[courseId] ? userProgress[courseId].completedLessons || [] : [];
    const allCompleted = completedLessons.length === course.lessons.length;
    
    document.querySelector('main').innerHTML = `
        <section class="course-detail">
            <a href="#" class="back-button" id="backButton">← Back to Courses</a>
            
            <div class="course-hero">
                <h2>${course.title}</h2>
                <p>${course.description}</p>
            </div>
            
            <div class="course-description">
                <p>This course contains ${course.lessons.length} lessons designed to help you master the topic. 
                Work through each lesson and mark them as complete as you progress.</p>
            </div>
            
            <div class="lessons-list">
                <h3>Course Lessons</h3>
                ${course.lessons.map((lesson, index) => `
                    <div class="lesson-item ${completedLessons.includes(index) ? 'completed' : ''}">
                        <input type="checkbox" class="lesson-checkbox" 
                               data-course="${courseId}" data-lesson="${index}" 
                               ${completedLessons.includes(index) ? 'checked' : ''}>
                        <span>${lesson}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="completion-section">
                <p class="progress-text">
                    Progress: ${completedLessons.length} of ${course.lessons.length} lessons completed
                </p>
                ${!allCompleted ? 
                    `<button class="btn-primary" id="markCompleteBtn">Mark Course as Completed</button>` :
                    `<div class="completed-badge">Course Completed!</div>`
                }
            </div>
        </section>
    `;
    
    // Add event listeners for the course detail page
    document.getElementById('backButton').addEventListener('click', function(e) {
        e.preventDefault();
        showHomePage();
    });
    
    // Lesson checkbox handlers
    document.querySelectorAll('.lesson-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            toggleLessonCompletion(
                parseInt(this.getAttribute('data-course')),
                parseInt(this.getAttribute('data-lesson')),
                this.checked
            );
        });
    });
    
    // Course completion button
    if (!allCompleted) {
        document.getElementById('markCompleteBtn').addEventListener('click', function() {
            markCourseCompleted(courseId);
        });
    }
}

// Show homepage
function showHomePage() {
    currentView = 'home';
    window.history.pushState({}, '', window.location.pathname);
    location.reload(); // Simple way to reset to initial state
}

// Toggle lesson completion
function toggleLessonCompletion(courseId, lessonIndex, completed) {
    if (!userProgress[courseId]) {
        userProgress[courseId] = { completedLessons: [] };
    }
    
    if (completed && !userProgress[courseId].completedLessons.includes(lessonIndex)) {
        userProgress[courseId].completedLessons.push(lessonIndex);
    } else if (!completed) {
        userProgress[courseId].completedLessons = userProgress[courseId].completedLessons.filter(
            idx => idx !== lessonIndex
        );
    }
    
    // Remove completed status if all lessons aren't completed
    if (userProgress[courseId].completed) {
        const course = courses.find(c => c.id === courseId);
        if (userProgress[courseId].completedLessons.length !== course.lessons.length) {
            userProgress[courseId].completed = false;
        }
    }
    
    saveProgress();
    
    // Update completion button visibility
    const allCompleted = userProgress[courseId].completedLessons.length === 
                        courses.find(c => c.id === courseId).lessons.length;
    
    if (allCompleted && !userProgress[courseId].completed) {
        document.getElementById('markCompleteBtn').style.display = 'block';
    }
}

// Mark entire course as completed
function markCourseCompleted(courseId) {
    if (!userProgress[courseId]) {
        userProgress[courseId] = { completedLessons: [] };
    }
    
    const course = courses.find(c => c.id === courseId);
    userProgress[courseId].completedLessons = [...Array(course.lessons.length).keys()];
    userProgress[courseId].completed = true;
    
    saveProgress();
    showCourseDetail(courseId); // Refresh the view
}

// Save progress to localStorage
function saveProgress() {
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
}

// Auth modal functions
function showAuthModal(type) {
    const modal = document.getElementById('authModal');
    const modalTitle = document.getElementById('modalTitle');
    const loginFields = document.getElementById('loginFields');
    const signupFields = document.getElementById('signupFields');
    
    if (type === 'login') {
        modalTitle.textContent = 'Welcome Back';
        loginFields.style.display = 'block';
        signupFields.style.display = 'none';
    } else {
        modalTitle.textContent = 'Create Account';
        loginFields.style.display = 'none';
        signupFields.style.display = 'block';
    }
    
    modal.style.display = 'flex';
}

function hideAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course');
    
    if (courseId) {
        showCourseDetail(parseInt(courseId));
    } else {
        showHomePage();
    }
});