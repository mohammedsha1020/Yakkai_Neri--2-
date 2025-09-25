// Admin Panel JavaScript
const AdminPanel = {
    isLoggedIn: false,
    currentSection: 'overview',
    programData: {},
    pageData: {},
    currentEditingProgram: null,
    currentEditingPage: null,
    currentProgramTab: 'all',
    currentPageTab: 'all',
    currentProgramView: 'grid',
    currentPageView: 'cards',
    searchTerm: '',
    pageSearchTerm: '',

    init: function() {
        console.log('Initializing Admin Panel...');
        this.loadProgramData();
        this.loadPageData();
        this.bindEvents();
        this.checkLoginStatus();
        
        // Initialize image management after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.initImageManagement();
        }, 100);
    },

    // Load program data from localStorage or initialize default data
    loadProgramData: function() {
        // First try to load from external JSON file
        this.loadFromJSON()
            .then(data => {
                if (data && data.programs) {
                    this.programData = data.programs;
                    this.pageData = data.pages || {};
                    console.log('Loaded data from JSON file:', this.programData);
                } else {
                    this.loadFromLocalStorage();
                }
            })
            .catch(error => {
                console.log('JSON file not accessible, loading from localStorage:', error);
                this.loadFromLocalStorage();
            });
    },

    // Load from JSON file
    loadFromJSON: async function() {
        try {
            const response = await fetch('data/programs-data.json');
            if (response.ok) {
                const data = await response.json();
                this.programData = data;
                console.log('Loaded program data from JSON file');
                return data;
            }
            throw new Error('JSON file not found');
        } catch (error) {
            console.warn('Could not load from JSON file:', error);
            throw error;
        }
    },

    // Fallback to localStorage
    loadFromLocalStorage: function() {
        const stored = localStorage.getItem('yakkai_neri_programs');
        if (stored) {
            this.programData = JSON.parse(stored);
        } else {
            // Use simplified default data
            this.programData = {
                'yoga-as-sport': {
                    title: 'Yoga as Sport',
                    icon: 'fas fa-medal',
                    description: 'Competitive yoga training for tournaments and championships',
                    shortContent: 'Yoga has evolved beyond a mere spiritual and physical practice to become a recognized competitive sport.',
                    detailedContent: {
                        overview: 'Our competitive yoga program is designed for students who wish to excel in yoga competitions.',
                        keyComponents: [
                            'Technical Mastery: Perfect execution of advanced asanas',
                            'Performance Sequences: Choreographed routines',
                            'Mental Conditioning: Psychological preparation'
                        ]
                    },
                    highlight: 'We are the only academy in the region with certified competitive yoga judges.',
                    status: 'active',
                    lastUpdated: '2 days ago',
                    pageUrl: 'program-yoga-as-sport.html'
                }
            };
            this.saveProgramData();
        }
    },

    // Website-wide data management
    async syncWebsiteData() {
        try {
            // Load all website data
            const websiteData = await this.loadWebsiteData();
            
            // Update main website with current program data
            await this.updateMainWebsite();
            
            // Sync images and assets
            await this.syncAssets();
            
            console.log('Website synchronization completed');
            this.showNotification('Website fully synchronized!', 'success');
        } catch (error) {
            console.error('Sync error:', error);
            this.showNotification('Sync failed: ' + error.message, 'error');
        }
    },

    async loadWebsiteData() {
        const websiteData = {
            programs: this.programData,
            images: {},
            pages: {},
            assets: {}
        };

        // Load image data
        try {
            const imageResponse = await fetch('api/images.json');
            if (imageResponse.ok) {
                websiteData.images = await imageResponse.json();
            }
        } catch (error) {
            console.log('No image data found, using defaults');
        }

        return websiteData;
    },

    async updateMainWebsite() {
        // Generate program pages
        for (const [key, program] of Object.entries(this.programData)) {
            await this.generateProgramPage(key, program);
        }

        // Update main index.html if needed
        // The following line was causing an error because the function doesn't exist.
        // await this.updateMainIndex(); 
    },

    async generateProgramPage(programKey, programData) {
        const pageTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${programData.title} - Yakkai Neri</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <header>
        <nav class="navbar">
            <div class="container">
                <a href="index.html" class="logo">Yakkai Neri</a>
                <ul class="nav-menu">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="Courses.html">Our Programs</a></li>
                    <li><a href="meet-the-trainer.html">Meet the Trainer</a></li>
                    <li><a href="contact.html">Contact</a></li>
                </ul>
            </div>
        </nav>
    </header>

    <main>
        <section class="program-hero">
            <div class="container">
                <div class="program-header">
                    <h1><i class="${programData.icon}"></i> ${programData.title}</h1>
                    <p class="program-description">${programData.description}</p>
                </div>
            </div>
        </section>

        <section class="program-content">
            <div class="container">
                <div class="content-grid">
                    <div class="main-content">
                        <div class="content-section">
                            <h2>Overview</h2>
                            <p>${programData.shortContent || programData.description}</p>
                        </div>

                        ${programData.detailedContent ? `
                        <div class="content-section">
                            <h2>Program Details</h2>
                            <p>${programData.detailedContent.overview || ''}</p>
                            
                            ${programData.detailedContent.keyComponents ? `
                            <h3>Key Components</h3>
                            <ul>
                                ${programData.detailedContent.keyComponents.map(component => `<li>${component}</li>`).join('')}
                            </ul>
                            ` : ''}
                        </div>
                        ` : ''}

                        ${programData.highlight ? `
                        <div class="highlight-section">
                            <h3>Program Highlight</h3>
                            <p class="highlight-text">${programData.highlight}</p>
                        </div>
                        ` : ''}
                    </div>

                    <div class="sidebar">
                        <div class="sidebar-card">
                            <h3>Program Information</h3>
                            <ul class="program-info">
                                <li><strong>Status:</strong> <span class="status ${programData.status}">${programData.status || 'Active'}</span></li>
                                <li><strong>Last Updated:</strong> ${programData.lastUpdated || 'Recently'}</li>
                            </ul>
                        </div>

                        <div class="sidebar-card">
                            <h3>Get Started</h3>
                            <a href="contact.html" class="btn btn-primary">Contact Us</a>
                            <a href="Courses.html" class="btn btn-secondary">View All Programs</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2024 Yakkai Neri. All rights reserved.</p>
        </div>
    </footer>

    <script src="js/script.js"></script>
</body>
</html>`;

        // Save the generated page
        try {
            const response = await fetch('api/save-page.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: programData.pageUrl || `program-${programKey}.html`,
                    content: pageTemplate
                })
            });

            if (!response.ok) {
                console.warn('Could not save page to server, using client-side storage');
                localStorage.setItem(`page_${programKey}`, pageTemplate);
            }
        } catch (error) {
            console.warn('Could not save page:', error);
            localStorage.setItem(`page_${programKey}`, pageTemplate);
        }
    },

    async syncAssets() {
        // Sync images and other assets
        console.log('Syncing assets...');
        
        // This would typically involve server-side operations
        // For now, we'll implement client-side asset management
    },

    // Image management functions
    initImageManagement: function() {
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', this.handleImageUpload.bind(this));
        }
        this.loadImageGallery();
    },

    handleImageUpload: function(event) {
        const files = event.target.files;
        for (let file of files) {
            if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
                this.uploadImage(file);
            } else {
                this.showNotification('Invalid file. Please upload images under 5MB.', 'error');
            }
        }
    },

    uploadImage: function(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                name: file.name,
                data: e.target.result,
                size: file.size,
                uploadDate: new Date().toISOString()
            };
            
            // Store in localStorage for now
            let images = JSON.parse(localStorage.getItem('yakkai_neri_images') || '[]');
            images.push(imageData);
            localStorage.setItem('yakkai_neri_images', JSON.stringify(images));
            
            this.loadImageGallery();
            this.showNotification('Image uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    },

    loadImageGallery: function() {
        const gallery = document.getElementById('imageGallery');
        if (!gallery) return;

        const images = JSON.parse(localStorage.getItem('yakkai_neri_images') || '[]');
        
        if (images.length === 0) {
            gallery.innerHTML = '<p style="text-align: center; color: #718096;">No images uploaded yet</p>';
            return;
        }

        gallery.innerHTML = images.map((image, index) => `
            <div class="image-item">
                <img src="${image.data}" alt="${image.name}" title="${image.name}">
                <button class="delete-btn" onclick="AdminPanel.deleteImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    },

    deleteImage: function(index) {
        let images = JSON.parse(localStorage.getItem('yakkai_neri_images') || '[]');
        images.splice(index, 1);
        localStorage.setItem('yakkai_neri_images', JSON.stringify(images));
        this.loadImageGallery();
        this.showNotification('Image deleted successfully!', 'success');
    },

    // Website synchronization functions
    syncWebsite: async function() {
        try {
            this.showNotification('Starting full website sync...', 'info');
            
            // Update status indicators
            this.updateSyncStatus('programsStatus', 'warning', 'Syncing...');
            this.updateSyncStatus('pagesStatus', 'warning', 'Syncing...');
            this.updateSyncStatus('assetsStatus', 'warning', 'Syncing...');
            
            // Sync program data
            await this.syncProgramData();
            this.updateSyncStatus('programsStatus', 'success', 'Synced');
            
            // Generate program pages
            await this.generateAllProgramPages();
            this.updateSyncStatus('pagesStatus', 'success', 'Synced');
            
            // Sync assets
            await this.syncAssets();
            this.updateSyncStatus('assetsStatus', 'success', 'Synced');
            
            this.showNotification('Website synchronized successfully!', 'success');
        } catch (error) {
            console.error('Sync error:', error);
            this.showNotification('Sync failed: ' + error.message, 'error');
        }
    },

    updateSyncStatus: function(elementId, type, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.className = `status-badge ${type}`;
            element.textContent = text;
        }
    },

    async syncProgramData() {
        // Save current program data to JSON
        const dataToSave = JSON.stringify(this.programData, null, 2);
        
        try {
            // Try to save to file system (would need server-side support)
            const response = await fetch('api/save-data.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: 'data/programs-data.json',
                    content: dataToSave
                })
            });
            
            if (!response.ok) {
                throw new Error('Could not save to server');
            }
        } catch (error) {
            console.warn('Could not save to server, using localStorage');
            localStorage.setItem('yakkai_neri_programs', JSON.stringify(this.programData));
        }
    },

    async generateAllProgramPages() {
        for (const [key, program] of Object.entries(this.programData)) {
            await this.generateProgramPage(key, program);
        }
    },

    exportWebsite: function() {
        const exportData = {
            programs: this.programData,
            images: JSON.parse(localStorage.getItem('yakkai_neri_images') || '[]'),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `yakkai-neri-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Website data exported successfully!', 'success');
    },

    backupWebsite: function() {
        const backupData = {
            programs: this.programData,
            images: JSON.parse(localStorage.getItem('yakkai_neri_images') || '[]'),
            backupDate: new Date().toISOString(),
            type: 'backup'
        };
        
        localStorage.setItem('yakkai_neri_backup', JSON.stringify(backupData));
        this.showNotification('Backup created successfully!', 'success');
    },

    clearCache: function() {
        localStorage.removeItem('yakkai_neri_programs');
        localStorage.removeItem('yakkai_neri_images');
        this.showNotification('Cache cleared successfully!', 'success');
        setTimeout(() => location.reload(), 1000);
    },

    refreshData: function() {
        this.loadProgramData();
        this.loadImageGallery();
        this.renderProgramsGrid();
        this.showNotification('Data refreshed successfully!', 'success');
    },

    // Load page data from localStorage or initialize default data
    loadPageData: function() {
        const stored = localStorage.getItem('yakkai_neri_pages');
        if (stored) {
            this.pageData = JSON.parse(stored);
        } else {
            this.pageData = {
                'cover': {
                    title: 'Cover Page - Program Overview',
                    content: 'Welcome to Yakkai Neri Yoga Academy\'s comprehensive program portfolio. We offer specialized yoga training across multiple disciplines, each designed to address specific needs and goals.',
                    status: 'published'
                },
                'yoga-as-sport': {
                    title: 'Yoga as Sport',
                    content: '# Yoga as Sport\\n\\nCompetitive yoga has gained significant recognition as a legitimate sport requiring **strength**, **flexibility**, **focus**, and **technical precision**.\\n\\n## Our Approach\\n\\nOur program prepares students for national and international yoga competitions, focusing on:\\n\\n- Perfect form and alignment\\n- Advanced breath control techniques\\n- Mental discipline and concentration\\n- Competition strategies\\n\\n## Achievements\\n\\nWe have produced multiple championship winners and maintain partnerships with major yoga sporting bodies.\\n\\n## What Makes Us Different\\n\\nOur specialized approach to competitive yoga combines traditional techniques with modern athletic training methods.',
                    status: 'published'
                },
                'corporate-yoga': {
                    title: 'Corporate Yoga',
                    content: '# Corporate Yoga\\n\\nModern workplaces face unprecedented stress levels, with **76% of employees** reporting workplace stress affects their mental health.\\n\\n## Proven Results\\n\\nOur corporate yoga programs have demonstrated measurable results:\\n\\n- **65% reduction** in stress-related sick days\\n- **42% improvement** in team collaboration\\n- **31% increase** in productivity\\n- **89% employee satisfaction** with wellness programs\\n\\n## Program Structure\\n\\nWe offer flexible scheduling options including:\\n\\n- On-site sessions during lunch breaks\\n- Pre-work energizing sessions\\n- Post-work relaxation classes\\n- Weekend intensive workshops\\n\\n## Client Testimonials\\n\\n> "The Yakkai Neri program transformed our workplace culture. We\'ve seen remarkable improvements in team cohesion and individual well-being." - Sarah Kim, HR Director\\n\\n> "Our employees look forward to yoga sessions. It\'s become the highlight of our wellness program." - Michael Chen, CEO',
                    status: 'published'
                }
            };
            this.savePageData();
        }
    },

    // Save program data to localStorage
    saveProgramData: function() {
        localStorage.setItem('yakkai_neri_programs', JSON.stringify(this.programData));
    },

    // Save page data to localStorage
    savePageData: function() {
        localStorage.setItem('yakkai_neri_pages', JSON.stringify(this.pageData));
    },

    // Bind event listeners
    bindEvents: function() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
            }
        });

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Program form
        const programForm = document.getElementById('programForm');
        if (programForm) {
            programForm.addEventListener('submit', (e) => this.handleProgramSubmit(e));
        }

        // Page form
        const pageForm = document.getElementById('pageForm');
        if (pageForm) {
            pageForm.addEventListener('submit', (e) => this.handlePageSubmit(e));
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.renderProgramsGrid();
            });
        }

        const pageSearchInput = document.getElementById('pageSearchInput');
        if (pageSearchInput) {
            pageSearchInput.addEventListener('input', (e) => {
                this.pageSearchTerm = e.target.value.toLowerCase();
                this.renderPagesGrid();
            });
        }

        // View toggles
        const programViewToggle = document.getElementById('programViewToggle');
        if (programViewToggle) {
            programViewToggle.addEventListener('click', (e) => {
                if (e.target.matches('.view-option')) {
                    this.currentProgramView = e.target.getAttribute('data-view');
                    this.renderProgramsGrid();
                }
            });
        }

        const pageViewToggle = document.getElementById('pageViewToggle');
        if (pageViewToggle) {
            pageViewToggle.addEventListener('click', (e) => {
                if (e.target.matches('.view-option')) {
                    this.currentPageView = e.target.getAttribute('data-view');
                    this.renderPagesGrid();
                }
            });
        }

        // Tab switching
        const programTabs = document.querySelectorAll('.program-tab');
        if (programTabs) {
            programTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const tabName = e.target.getAttribute('data-tab');
                    this.currentProgramTab = tabName;
                    this.renderProgramsGrid();
                });
            });
        }

        const pageTabs = document.querySelectorAll('.page-tab');
        if (pageTabs) {
            pageTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const tabName = e.target.getAttribute('data-tab');
                    this.currentPageTab = tabName;
                    this.renderPagesGrid();
                });
            });
        }

        // Sync buttons
        const syncBtn = document.getElementById('syncBtn');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.syncWebsite());
        }

        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportWebsite());
        }

        const backupBtn = document.getElementById('backupBtn');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.backupWebsite());
        }

        const clearCacheBtn = document.getElementById('clearCacheBtn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this.clearCache());
        }

        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        // Initialize program and page grids
        this.renderProgramsGrid();
        this.renderPagesGrid();
    },

    // Check login status
    checkLoginStatus: function() {
        const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
        this.isLoggedIn = isLoggedIn;
        
        if (isLoggedIn) {
            this.showAdminPanel();
        } else {
            this.showLoginForm();
        }
    },

    // Handle login
    handleLogin: async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple validation (in a real app, this would be server-side)
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('admin_logged_in', 'true');
            this.isLoggedIn = true;
            this.showAdminPanel();
            this.showNotification('Login successful!', 'success');
        } else {
            this.showNotification('Invalid credentials. Try admin/admin123', 'error');
        }
    },

    // Handle logout
    handleLogout: function() {
        localStorage.removeItem('admin_logged_in');
        this.isLoggedIn = false;
        this.showLoginForm();
        this.showNotification('Logged out successfully', 'info');
    },

    // Show login form
    showLoginForm: function() {
        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById('loginSection').style.display = 'block';
    },

    // Show admin panel
    showAdminPanel: function() {
        document.getElementById('loginSection').style.display = 'none';
        this.showSection('overview');
    },

    // Show specific section
    showSection: function(sectionName) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show requested section
        const targetSection = document.getElementById(`${sectionName}Section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        this.currentSection = sectionName;
        
        // Load section-specific content
        if (sectionName === 'programs') {
            this.renderProgramsGrid();
        } else if (sectionName === 'pages') {
            this.renderPagesGrid();
        }
    },

    // Handle program form submission
    handleProgramSubmit: function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const programData = {
            title: formData.get('title'),
            icon: formData.get('icon'),
            description: formData.get('description'),
            shortContent: formData.get('shortContent'),
            detailedContent: {
                overview: formData.get('overview'),
                keyComponents: formData.get('keyComponents').split('\n').filter(item => item.trim() !== '')
            },
            highlight: formData.get('highlight'),
            status: formData.get('status'),
            lastUpdated: new Date().toLocaleDateString(),
            pageUrl: `program-${formData.get('key')}.html`
        };
        
        const programKey = formData.get('key') || this.generateKey(programData.title);
        
        if (this.currentEditingProgram) {
            // Update existing program
            this.programData[this.currentEditingProgram] = programData;
            this.showNotification('Program updated successfully!', 'success');
        } else {
            // Add new program
            this.programData[programKey] = programData;
            this.showNotification('Program added successfully!', 'success');
        }
        
        this.saveProgramData();
        this.renderProgramsGrid();
        this.resetProgramForm();
    },

    // Handle page form submission
    handlePageSubmit: function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const pageData = {
            title: formData.get('title'),
            content: formData.get('content'),
            status: formData.get('status')
        };
        
        const pageKey = formData.get('key') || this.generateKey(pageData.title);
        
        if (this.currentEditingPage) {
            // Update existing page
            this.pageData[this.currentEditingPage] = pageData;
            this.showNotification('Page updated successfully!', 'success');
        } else {
            // Add new page
            this.pageData[pageKey] = pageData;
            this.showNotification('Page added successfully!', 'success');
        }
        
        this.savePageData();
        this.renderPagesGrid();
        this.resetPageForm();
    },

    // Generate URL key from title
    generateKey: function(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    },

    // Reset program form
    resetProgramForm: function() {
        document.getElementById('programForm').reset();
        this.currentEditingProgram = null;
        document.getElementById('programFormTitle').textContent = 'Add New Program';
        document.getElementById('programSubmitBtn').textContent = 'Add Program';
    },

    // Reset page form
    resetPageForm: function() {
        document.getElementById('pageForm').reset();
        this.currentEditingPage = null;
        document.getElementById('pageFormTitle').textContent = 'Add New Page';
        document.getElementById('pageSubmitBtn').textContent = 'Add Page';
    },

    // Render programs grid
    renderProgramsGrid: function() {
        const gridContainer = document.getElementById('programsGrid');
        if (!gridContainer) return;
        
        let programs = Object.entries(this.programData);
        
        // Apply search filter
        if (this.searchTerm) {
            programs = programs.filter(([key, program]) => 
                program.title.toLowerCase().includes(this.searchTerm) ||
                program.description.toLowerCase().includes(this.searchTerm)
            );
        }
        
        // Apply status filter
        if (this.currentProgramTab !== 'all') {
            programs = programs.filter(([key, program]) => 
                program.status === this.currentProgramTab
            );
        }
        
        if (programs.length === 0) {
            gridContainer.innerHTML = '<div class="empty-state"><p>No programs found</p></div>';
            return;
        }
        
        if (this.currentProgramView === 'grid') {
            gridContainer.innerHTML = programs.map(([key, program]) => `
                <div class="program-card">
                    <div class="program-card-header">
                        <i class="${program.icon}"></i>
                        <h3>${program.title}</h3>
                        <span class="status ${program.status}">${program.status}</span>
                    </div>
                    <p class="program-description">${program.description}</p>
                    <div class="program-card-actions">
                        <button class="btn btn-sm btn-primary" onclick="AdminPanel.editProgram('${key}')">Edit</button>
                        <button class="btn btn-sm btn-secondary" onclick="AdminPanel.previewProgram('${key}')">Preview</button>
                        <button class="btn btn-sm btn-danger" onclick="AdminPanel.deleteProgram('${key}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } else {
            // List view
            gridContainer.innerHTML = `
                <table class="programs-table">
                    <thead>
                        <tr>
                            <th>Program</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${programs.map(([key, program]) => `
                            <tr>
                                <td>
                                    <div class="program-info">
                                        <i class="${program.icon}"></i>
                                        <div>
                                            <strong>${program.title}</strong>
                                            <small>${key}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>${program.description}</td>
                                <td><span class="status ${program.status}">${program.status}</span></td>
                                <td>${program.lastUpdated}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn btn-sm btn-primary" onclick="AdminPanel.editProgram('${key}')">Edit</button>
                                        <button class="btn btn-sm btn-secondary" onclick="AdminPanel.previewProgram('${key}')">Preview</button>
                                        <button class="btn btn-sm btn-danger" onclick="AdminPanel.deleteProgram('${key}')">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    },

    // Render pages grid
    renderPagesGrid: function() {
        const gridContainer = document.getElementById('pagesGrid');
        if (!gridContainer) return;
        
        let pages = Object.entries(this.pageData);
        
        // Apply search filter
        if (this.pageSearchTerm) {
            pages = pages.filter(([key, page]) => 
                page.title.toLowerCase().includes(this.pageSearchTerm)
            );
        }
        
        // Apply status filter
        if (this.currentPageTab !== 'all') {
            pages = pages.filter(([key, page]) => 
                page.status === this.currentPageTab
            );
        }
        
        if (pages.length === 0) {
            gridContainer.innerHTML = '<div class="empty-state"><p>No pages found</p></div>';
            return;
        }
        
        if (this.currentPageView === 'cards') {
            gridContainer.innerHTML = pages.map(([key, page]) => `
                <div class="page-card">
                    <div class="page-card-header">
                        <h3>${page.title}</h3>
                        <span class="status ${page.status}">${page.status}</span>
                    </div>
                    <div class="page-content-preview">
                        ${page.content.substring(0, 100)}...
                    </div>
                    <div class="page-card-actions">
                        <button class="btn btn-sm btn-primary" onclick="AdminPanel.editPage('${key}')">Edit</button>
                        <button class="btn btn-sm btn-secondary" onclick="AdminPanel.previewPage('${key}')">Preview</button>
                        <button class="btn btn-sm btn-danger" onclick="AdminPanel.deletePage('${key}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } else {
            // List view
            gridContainer.innerHTML = `
                <table class="pages-table">
                    <thead>
                        <tr>
                            <th>Page</th>
                            <th>Content Preview</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pages.map(([key, page]) => `
                            <tr>
                                <td>
                                    <strong>${page.title}</strong>
                                    <small>${key}</small>
                                </div>
                                </td>
                                <td>${page.content.substring(0, 50)}...</td>
                                <td><span class="status ${page.status}">${page.status}</span></td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn btn-sm btn-primary" onclick="AdminPanel.editPage('${key}')">Edit</button>
                                        <button class="btn btn-sm btn-secondary" onclick="AdminPanel.previewPage('${key}')">Preview</button>
                                        <button class="btn btn-sm btn-danger" onclick="AdminPanel.deletePage('${key}')">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    },

    // Edit program
    editProgram: function(key) {
        const program = this.programData[key];
        if (!program) return;
        
        this.currentEditingProgram = key;
        
        // Fill the form
        document.getElementById('programKey').value = key;
        document.getElementById('programTitle').value = program.title;
        document.getElementById('programIcon').value = program.icon;
        document.getElementById('programDescription').value = program.description;
        document.getElementById('programShortContent').value = program.shortContent || '';
        document.getElementById('programOverview').value = program.detailedContent?.overview || '';
        document.getElementById('programKeyComponents').value = program.detailedContent?.keyComponents?.join('\n') || '';
        document.getElementById('programHighlight').value = program.highlight || '';
        document.getElementById('programStatus').value = program.status || 'active';
        
        // Update form title and button
        document.getElementById('programFormTitle').textContent = 'Edit Program';
        document.getElementById('programSubmitBtn').textContent = 'Update Program';
        
        // Show the programs form section
        this.showSection('programs-form');
    },

    // Edit page
    editPage: function(key) {
        const page = this.pageData[key];
        if (!page) return;
        
        this.currentEditingPage = key;
        
        // Fill the form
        document.getElementById('pageKey').value = key;
        document.getElementById('pageTitle').value = page.title;
        document.getElementById('pageContent').value = page.content;
        document.getElementById('pageStatus').value = page.status || 'draft';
        
        // Update form title and button
        document.getElementById('pageFormTitle').textContent = 'Edit Page';
        document.getElementById('pageSubmitBtn').textContent = 'Update Page';
        
        // Show the pages form section
        this.showSection('pages-form');
    },

    // Delete program
    deleteProgram: function(key) {
        if (confirm('Are you sure you want to delete this program?')) {
            delete this.programData[key];
            this.saveProgramData();
            this.renderProgramsGrid();
            this.showNotification('Program deleted successfully!', 'success');
        }
    },

    // Delete page
    deletePage: function(key) {
        if (confirm('Are you sure you want to delete this page?')) {
            delete this.pageData[key];
            this.savePageData();
            this.renderPagesGrid();
            this.showNotification('Page deleted successfully!', 'success');
        }
    },

    // Preview program
    previewProgram: function(key) {
        const program = this.programData[key];
        if (!program) return;
        
        // Create a preview modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${program.title} - Preview</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="preview-header">
                        <i class="${program.icon}"></i>
                        <p class="program-description">${program.description}</p>
                    </div>
                    <div class="preview-content">
                        <h3>Short Content</h3>
                        <p>${program.shortContent || program.description}</p>
                        
                        ${program.detailedContent ? `
                        <h3>Detailed Content</h3>
                        <p>${program.detailedContent.overview || ''}</p>
                        
                        ${program.detailedContent.keyComponents ? `
                        <h4>Key Components</h4>
                        <ul>
                            ${program.detailedContent.keyComponents.map(component => `<li>${component}</li>`).join('')}
                        </ul>
                        ` : ''}
                        ` : ''}
                        
                        ${program.highlight ? `
                        <div class="highlight-section">
                            <h3>Program Highlight</h3>
                            <p>${program.highlight}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal functionality
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => document.body.removeChild(modal);
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    },

    // Preview page
    previewPage: function(key) {
        const page = this.pageData[key];
        if (!page) return;
        
        // Create a preview modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${page.title} - Preview</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="preview-content">
                        ${page.content.replace(/\n/g, '<br>')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal functionality
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => document.body.removeChild(modal);
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    },

    // Show notification
    showNotification: function(message, type) {
        // Remove any existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.onclick = () => notification.remove();
    }
};

// **BEGIN OF ADDED CODE FOR MULTI-STEP FORM**

// Global function to control form steps and validate inputs
function goToStep(step) {
  // Check if the current step is valid before moving on
  if (validateStep(step - 1)) {
    // Hide all steps
    var formSteps = document.querySelectorAll('.form-step');
    formSteps.forEach(function(el) {
      el.style.display = 'none';
    });

    // Show the current step
    var activeStep = document.getElementById('step' + step);
    if (activeStep) {
      activeStep.style.display = 'block';
    }

    // Update progress indicators
    for (var i = 1; i <= 3; i++) {
      var indicator = document.getElementById('stepIndicator' + i);
      if (indicator) {
        if (i <= step) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      }
    }
  }
}

// A simple validation function for each step
function validateStep(step) {
  if (step === 0) {
    // No validation needed for the start
    return true;
  }
  
  var currentStepId = 'step' + step;
  var currentStepDiv = document.getElementById(currentStepId);
  if (!currentStepDiv) return false;

  var requiredInputs = currentStepDiv.querySelectorAll('input[required]');
  var isValid = true;

  // Check if all required radio buttons are selected
  var radioGroups = {};
  requiredInputs.forEach(input => {
    if (input.type === 'radio') {
      let groupName = input.name;
      if (!radioGroups[groupName]) {
        radioGroups[groupName] = false;
      }
      if (input.checked) {
        radioGroups[groupName] = true;
      }
    } else if (input.value.trim() === '') {
      isValid = false;
    }
  });

  for (const group in radioGroups) {
    if (!radioGroups[group]) {
      isValid = false;
    }
  }

  return isValid;
}

// **END OF ADDED CODE FOR MULTI-STEP FORM**

// Initialize the admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  AdminPanel.init();
});