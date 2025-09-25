// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.isLoggedIn = false;
        this.currentSection = 'overview';
        this.programData = {};
        this.pageData = {};
        this.currentEditingProgram = null;
        this.currentEditingPage = null;
        this.currentProgramTab = 'all';
        this.currentPageTab = 'all';
        this.currentProgramView = 'grid';
        this.currentPageView = 'cards';
        this.searchTerm = '';
        this.pageSearchTerm = '';
        
        this.init();
    }

    init() {
        console.log('Initializing Admin Panel...');
        this.loadProgramData();
        this.loadPageData();
        this.bindEvents();
        this.checkLoginStatus();
        
        // Initialize image management after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.initImageManagement();
        }, 100);
    }

    // Load program data from localStorage or initialize default data
    loadProgramData() {
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
    }

    // Load from JSON file
    async loadFromJSON() {
        try {
            const response = await fetch('data/programs-data.json');
            if (response.ok) {
                const data = await response.json();
                if (data && data.programs) {
                    this.programData = data.programs;
                    this.pageData = data.pages || {};
                    console.log('Loaded data from JSON file:', this.programData);
                    return data;
                }
            }
            throw new Error('JSON file not found or invalid format');
        } catch (error) {
            console.warn('Could not load from JSON file:', error);
            return false;
        }
    }

    // Fallback to localStorage
    loadFromLocalStorage() {
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
    }

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
    }

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
    }

    async updateMainWebsite() {
        // Generate program pages
        for (const [key, program] of Object.entries(this.programData)) {
            await this.generateProgramPage(key, program);
        }

        // Update main index.html if needed
        await this.updateMainIndex();
    }

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

            if (!response.ok) 
                {
                console.warn('Could not save page to server, using client-side storage');
                localStorage.setItem(`page_${programKey}`, pageTemplate);
            }
        } catch (error) {
            console.warn('Could not save page:', error);
            localStorage.setItem(`page_${programKey}`, pageTemplate);
        }
    }

    async syncAssets() 
    {
        // Sync images and other assets
        console.log('Syncing assets...');
        
        // This would typically involve server-side operations
        // For now, we'll implement client-side asset management
    }

    // Image management functions
    initImageManagement() 
    {
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', this.handleImageUpload.bind(this));
        }
        this.loadImageGallery();
    }

    handleImageUpload(event)
    {
        const files = event.target.files;
        for (let file of files) {
            if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
                this.uploadImage(file);
            } else {
                this.showNotification('Invalid file. Please upload images under 5MB.', 'error');
            }
        }
    }

    uploadImage(file) 
    {
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
    }

    loadImageGallery() 
    {
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
                <button class="delete-btn" onclick="adminManager.deleteImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    deleteImage(index) {
        let images = JSON.parse(localStorage.getItem('yakkai_neri_images') || '[]');
        images.splice(index, 1);
        localStorage.setItem('yakkai_neri_images', JSON.stringify(images));
        this.loadImageGallery();
        this.showNotification('Image deleted successfully!', 'success');
    }

    // Website synchronization functions
    async syncWebsite() 
    {
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
    }

    updateSyncStatus(elementId, type, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.className = `status-badge ${type}`;
            element.textContent = text;
        }
    }

    async syncProgramData() 
    {
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
    }

    async generateAllProgramPages() 
    {
        for (const [key, program] of Object.entries(this.programData)) {
            await this.generateProgramPage(key, program);
        }
    }

    exportWebsite() 
    {
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
    }

    backupWebsite() 
    {
        const backupData = {
            programs: this.programData,
            images: JSON.parse(localStorage.getItem('yakkai_neri_images') || '[]'),
            backupDate: new Date().toISOString(),
            type: 'backup'
        };
        
        localStorage.setItem('yakkai_neri_backup', JSON.stringify(backupData));
        this.showNotification('Backup created successfully!', 'success');
    }

    clearCache() 
    {
        localStorage.removeItem('yakkai_neri_programs');
        localStorage.removeItem('yakkai_neri_images');
        this.showNotification('Cache cleared successfully!', 'success');
        setTimeout(() => location.reload(), 1000);
    }

    refreshData() {
        this.loadProgramData();
        this.loadImageGallery();
        this.renderProgramsGrid();
        this.showNotification('Data refreshed successfully!', 'success');
    }

    // Load page data from localStorage or initialize default data
    loadPageData() {
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
                    content: '# Corporate Yoga\\n\\nModern workplaces face unprecedented stress levels, with **76% of employees** reporting workplace stress affects their mental health.\\n\\n## Proven Results\\n\\nOur corporate yoga programs have demonstrated measurable results:\\n\\n- **65% reduction** in stress-related sick days\\n- **40% improvement** in employee satisfaction\\n- **25% increase** in productivity\\n\\n## Our Services\\n\\n- On-site training sessions\\n- Stress management workshops\\n- Ongoing wellness support\\n- Customized programs for different departments\\n\\n## What Makes Us Different\\n\\nWe provide on-site corporate training with measurable wellness outcomes and productivity improvements.',
                    status: 'published'
                },
                'yoga-for-sport': {
                    title: 'Yoga for Sport',
                    content: '# Yoga for Sport\\n\\nAthletic performance optimization through yoga is scientifically proven to enhance flexibility, balance, core strength, and mental focus.\\n\\n## Sport-Specific Programs\\n\\nOur specialized programs are designed for:\\n\\n- Cricket\\n- Football\\n- Tennis\\n- Swimming\\n- Other athletic disciplines\\n\\n## Performance Benefits\\n\\nProfessional athletes training with us report:\\n\\n- **30% fewer injuries**\\n- **20% performance improvement**\\n\\n## What Makes Us Different\\n\\nWe combine ancient yoga wisdom with modern sports science to create targeted training programs.',
                    status: 'published'
                },
                'women-wellness': {
                    title: 'Women Wellness',
                    content: '# Women Wellness\\n\\nWomen face unique physiological challenges throughout their lives. Our specialized programs address these specific health needs.\\n\\n## Areas of Focus\\n\\n- Menstrual irregularities\\n- PCOD/PCOS management\\n- Fertility enhancement\\n- Pre-menopause preparation\\n- Post-menopause adaptation\\n\\n## Holistic Approach\\n\\nWe combine traditional yoga wisdom with modern medical understanding to provide comprehensive care.\\n\\n## What Makes Us Different\\n\\nOur programs are designed specifically for women\'s unique health challenges and life stages.',
                    status: 'published'
                },
                'prenatal-postnatal': {
                    title: 'Prenatal & Postnatal',
                    content: '# Prenatal & Postnatal Yoga\\n\\nPregnancy and childbirth represent profound physical and emotional transformations.\\n\\n## Safe Practices\\n\\nOur certified prenatal yoga instructors guide expectant mothers through:\\n\\n- Safe practices for each trimester\\n- Preparation for easier labor\\n- Faster postpartum recovery\\n- Emotional support during transition\\n\\n## Medical Approval\\n\\nAll our programs are medically approved and adapted for each trimester\'s specific needs.\\n\\n## What Makes Us Different\\n\\nWe provide comprehensive support for the entire journey from pregnancy through early motherhood.',
                    status: 'published'
                },
                'adolescence': {
                    title: 'Adolescence',
                    content: '# Adolescence Yoga\\n\\nTeenagers face complex hormonal, physical, and emotional changes that can significantly impact their development.\\n\\n## Areas We Address\\n\\n- Anxiety and stress management\\n- Mood regulation\\n- Body image issues\\n- Social pressures\\n- Academic stress\\n\\n## Age-Appropriate Practices\\n\\nOur programs provide tools for:\\n\\n- Emotional regulation\\n- Healthy coping mechanisms\\n- Building self-confidence\\n- Developing resilience\\n\\n## What Makes Us Different\\n\\nWe understand the unique challenges teenagers face and provide supportive, non-judgmental guidance.',
                    status: 'published'
                },
                'therapy': {
                    title: 'Therapy',
                    content: '# Therapeutic Yoga\\n\\nNon-communicable diseases, particularly diabetes, represent major health threats in modern society.\\n\\n## Medical Collaboration\\n\\nOur therapeutic yoga programs are designed in consultation with medical professionals to address:\\n\\n- Chronic conditions\\n- Metabolic function improvement\\n- Overall health enhancement\\n- Pain management\\n\\n## Evidence-Based Approach\\n\\nEvidence-based practices support traditional medical treatments for better outcomes.\\n\\n## What Makes Us Different\\n\\nWe combine yoga therapy with medical expertise to provide comprehensive healing approaches.',
                    status: 'published'
                },
                'tech-supported': {
                    title: 'Tech-supported Yoga',
                    content: '# Tech-supported Yoga\\n\\nInnovation meets tradition in our tech-supported yoga programs.\\n\\n## Advanced Technology\\n\\n### Our Proprietary Mobile App\\n- AI-powered personalized practice recommendations\\n- Progress tracking and analytics\\n- Interactive learning modules\\n\\n### IoT Integration\\n- Real-time posture feedback\\n- Breathing pattern analysis\\n- Performance metrics\\n\\n## Learning Enhancement\\n\\nThis technology enhances learning efficiency and makes us pioneers in the intersection of ancient wisdom and modern innovation.\\n\\n## What Makes Us Different\\n\\nWe are the first academy to successfully integrate AI and IoT technology with traditional yoga practices.',
                    status: 'published'
                }
            };
            this.savePageData();
        }
    }

    // Save program data to localStorage
    saveProgramData() {
        localStorage.setItem('yakkai_neri_programs', JSON.stringify(this.programData));
    }

    // Save page data to localStorage
    savePageData() {
        localStorage.setItem('yakkai_neri_pages', JSON.stringify(this.pageData));
    }

    bindEvents() {
        console.log('Binding events...');
        
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

        // Navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Program management buttons
        this.bindProgramEvents();
        
        // Page management buttons
        this.bindPageEvents();

        // Modal events
        this.bindModalEvents();

        // Form submissions
        this.bindFormEvents();

        // Tab functionality
        this.bindTabEvents();

        // Search functionality  
        this.bindSearchEvents();

        // Add program button
        const addProgramBtn = document.getElementById('addProgramBtn');
        if (addProgramBtn) {
            addProgramBtn.addEventListener('click', () => this.openProgramModal());
        }

        // Add page button
        const addPageBtn = document.getElementById('addPageBtn');
        if (addPageBtn) {
            addPageBtn.addEventListener('click', () => this.openPageModal());
        }

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
                this.closePageModal();
            }
        });
    }

    bindProgramEvents() {
        // Use event delegation for dynamic content
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const programId = e.target.closest('.edit-btn').dataset.program;
                console.log('Edit program:', programId);
                this.openProgramModal(programId);
            }
            
            if (e.target.closest('.delete-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const programId = e.target.closest('.delete-btn').dataset.program;
                console.log('Delete program:', programId);
                this.deleteProgram(programId);
            }
        });
    }

    bindPageEvents() {
        // Use event delegation for page events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-page-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const pageId = e.target.closest('.edit-page-btn').dataset.page;
                console.log('Edit page:', pageId);
                this.openPageModal(pageId);
            }

            if (e.target.closest('.preview-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const pageId = e.target.closest('.preview-btn').dataset.page;
                console.log('Preview page:', pageId);
                this.previewPage(pageId);
            }
        });
    }

    bindModalEvents() {
        const closeModal = document.getElementById('closeModal');
        const closePageModal = document.getElementById('closePageModal');
        const cancelEdit = document.getElementById('cancelEdit');
        const cancelPageEdit = document.getElementById('cancelPageEdit');

        if (closeModal) closeModal.addEventListener('click', () => this.closeModal());
        if (closePageModal) closePageModal.addEventListener('click', () => this.closePageModal());
        if (cancelEdit) cancelEdit.addEventListener('click', () => this.closeModal());
        if (cancelPageEdit) cancelPageEdit.addEventListener('click', () => this.closePageModal());
    }

    bindFormEvents() {
        const programForm = document.getElementById('programForm');
        const pageForm = document.getElementById('pageForm');

        if (programForm) {
            programForm.addEventListener('submit', (e) => this.handleProgramSave(e));
        }

        if (pageForm) {
            pageForm.addEventListener('submit', (e) => this.handlePageSave(e));
        }
    }

    bindTabEvents() {
        // Program tabs
        document.addEventListener('click', (e) => {
            if (e.target.closest('.tab-btn[data-tab]')) {
                const tab = e.target.closest('.tab-btn[data-tab]').dataset.tab;
                this.switchProgramTab(tab);
            }
            
            if (e.target.closest('.tab-btn[data-page-tab]')) {
                const tab = e.target.closest('.tab-btn[data-page-tab]').dataset.pageTab;
                this.switchPageTab(tab);
            }
        });
    }

    bindSearchEvents() {
        // Program search
        const programSearch = document.getElementById('programSearch');
        if (programSearch) {
            programSearch.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.updateProgramsDisplay();
            });
        }

        // Page search
        const pageSearch = document.getElementById('pageSearch');
        if (pageSearch) {
            pageSearch.addEventListener('input', (e) => {
                this.pageSearchTerm = e.target.value.toLowerCase();
                this.updatePagesDisplay();
            });
        }
    }

    switchProgramTab(tab) {
        // Update active tab
        document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
            btn.classList.remove('active');
        });
        const targetTab = document.querySelector(`[data-tab="${tab}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        this.currentProgramTab = tab;
        this.updateProgramsDisplay();
    }

    switchPageTab(tab) {
        // Update active tab
        document.querySelectorAll('.tab-btn[data-page-tab]').forEach(btn => {
            btn.classList.remove('active');
        });
        const targetTab = document.querySelector(`[data-page-tab="${tab}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        this.currentPageTab = tab;
        this.updatePagesDisplay();
    }

    // Check if user is already logged in
    checkLoginStatus() {
        const loggedIn = localStorage.getItem('yakkai_neri_admin_logged_in');
        if (loggedIn === 'true') {
            this.isLoggedIn = true;
            // Initialize dashboard data before showing
            this.loadProgramData();
            this.loadPageData();
            setTimeout(() => {
                this.showDashboard();
            }, 100);
        } else {
            this.isLoggedIn = false;
            this.showLogin();
        }
    }

    // Handle login form submission
    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple authentication (in production, use proper authentication)
        if (username === 'admin' && password === '123') {
            this.isLoggedIn = true;
            localStorage.setItem('yakkai_neri_admin_logged_in', 'true');
            this.showDashboard();
        } else {
            const errorDiv = document.getElementById('loginError');
            errorDiv.classList.remove('hidden');
            setTimeout(() => {
                errorDiv.classList.add('hidden');
            }, 3000);
        }
    }

    // Handle logout
    handleLogout() {
        this.isLoggedIn = false;
        localStorage.removeItem('yakkai_neri_admin_logged_in');
        this.showLogin();
    }

    // Show login screen
    showLogin() {
        const loginScreen = document.getElementById('loginScreen');
        const adminDashboard = document.getElementById('adminDashboard');
        
        if (loginScreen && adminDashboard) {
            loginScreen.classList.remove('hidden');
            adminDashboard.classList.add('hidden');
            // Clear form fields
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            if (usernameInput && passwordInput) {
                usernameInput.value = '';
                passwordInput.value = '';
            }
        } else {
            console.error('Login screen elements not found');
        }
    }

    // Show dashboard
    showDashboard() {
        const loginScreen = document.getElementById('loginScreen');
        const adminDashboard = document.getElementById('adminDashboard');
        
        if (loginScreen && adminDashboard) {
            loginScreen.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            // Ensure dashboard data is loaded
            this.loadProgramData();
            this.loadPageData();
            this.updateProgramsDisplay();
            this.updatePagesDisplay();
        } else {
            console.error('Dashboard elements not found');
        }
    }

    // Handle navigation between sections
    handleNavigation(e) {
        e.preventDefault();
        const section = e.target.closest('.nav-item').dataset.section;
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        e.target.closest('.nav-item').classList.add('active');
        
        // Update content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');
        
        this.currentSection = section;
        
        // Refresh data when switching to specific sections
        if (section === 'programs') {
            this.updateProgramsDisplay();
        } else if (section === 'pages') {
            this.updatePagesDisplay();
        }
    }

    // Switch to a specific section (used by quick actions)
    switchSection(section) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');
        
        this.currentSection = section;
        
        // Refresh data when switching to specific sections
        if (section === 'programs') {
            this.updateProgramsDisplay();
        } else if (section === 'pages') {
            this.updatePagesDisplay();
        }
    }

    // Open program edit modal
    openProgramModal(programId = null) {
        console.log('Opening program modal for:', programId);
        const modal = document.getElementById('programModal');
        const form = document.getElementById('programForm');
        
        if (!modal || !form) {
            console.error('Program modal or form not found');
            return;
        }
        
        if (programId) {
            // Editing existing program
            this.currentEditingProgram = programId;
            
            if (this.programData[programId]) {
                const program = this.programData[programId];
                console.log('Loading program data:', program);
                
                document.getElementById('modalTitle').textContent = 'Edit Program';
                document.getElementById('programTitle').value = program.title || '';
                document.getElementById('programIcon').value = program.icon || '';
                document.getElementById('programDescription').value = program.description || '';
                document.getElementById('programContent').value = program.content || '';
                document.getElementById('programHighlight').value = program.highlight || '';
                document.getElementById('programStatus').value = program.status || 'active';
                form.dataset.programId = programId;
            }
        } else {
            // Creating new program
            this.currentEditingProgram = `program-${Date.now()}`;
            document.getElementById('modalTitle').textContent = 'Add New Program';
            document.getElementById('programTitle').value = '';
            document.getElementById('programIcon').value = '';
            document.getElementById('programDescription').value = '';
            document.getElementById('programContent').value = '';
            document.getElementById('programHighlight').value = '';
            document.getElementById('programStatus').value = 'active';
            form.dataset.programId = this.currentEditingProgram;
        }
        
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        
        // Focus on title field
        setTimeout(() => {
            document.getElementById('programTitle').focus();
        }, 100);
    }

    // Open page edit modal
    openPageModal(pageId = null) {
        console.log('Opening page modal for:', pageId);
        const modal = document.getElementById('pageModal');
        const form = document.getElementById('pageForm');
        
        if (!modal || !form) {
            console.error('Page modal or form not found');
            return;
        }
        
        if (pageId) {
            // Editing existing page
            this.currentEditingPage = pageId;
            
            if (this.pageData[pageId]) {
                const page = this.pageData[pageId];
                console.log('Loading page data:', page);
                
                document.getElementById('pageModalTitle').textContent = `Edit Page: ${page.title || pageId}`;
                document.getElementById('pageTitle').value = page.title || '';
                document.getElementById('pageContent').value = page.content || '';
            } else {
                console.log('Page data not found for:', pageId, '- creating new entry');
                document.getElementById('pageModalTitle').textContent = `Create Page: ${pageId}`;
                document.getElementById('pageTitle').value = '';
                document.getElementById('pageContent').value = '';
            }
            form.dataset.pageId = pageId;
        } else {
            // Creating new page
            this.currentEditingPage = `page-${Date.now()}`;
            document.getElementById('pageModalTitle').textContent = 'Create New Page';
            document.getElementById('pageTitle').value = '';
            document.getElementById('pageContent').value = '';
            form.dataset.pageId = this.currentEditingPage;
        }
        
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        
        // Focus on title field
        setTimeout(() => {
            document.getElementById('pageTitle').focus();
        }, 100);
    }

    // Close program modal
    closeModal() {
        const modal = document.getElementById('programModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        this.currentEditingProgram = null;
    }

    // Close page modal
    closePageModal() {
        const modal = document.getElementById('pageModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        this.currentEditingPage = null;
    }

    // Handle program form submission
    handleProgramSave(e) {
        e.preventDefault();
        console.log('Saving program...');
        
        const programId = this.currentEditingProgram;
        if (!programId) {
            this.showNotification('No program selected for editing!', 'error');
            return;
        }
        
        const title = document.getElementById('programTitle').value.trim();
        const icon = document.getElementById('programIcon').value.trim();
        const description = document.getElementById('programDescription').value.trim();
        const content = document.getElementById('programContent').value.trim();
        const highlight = document.getElementById('programHighlight').value.trim();
        const status = document.getElementById('programStatus').value;
        
        if (!title || !description) {
            this.showNotification('Please fill in all required fields!', 'error');
            return;
        }
        
        this.programData[programId] = {
            title: title,
            icon: icon || 'fas fa-book',
            description: description,
            content: content,
            highlight: highlight,
            status: status,
            lastUpdated: 'Today'
        };
        
        console.log('Program data saved:', this.programData[programId]);
        
        this.saveProgramData();
        this.closeModal();
        this.updateProgramsDisplay();
        
        this.showNotification('Program saved successfully!', 'success');
        
        // Trigger website refresh
        this.triggerWebsiteRefresh();
    }

    // Handle page form submission
    handlePageSave(e) {
        e.preventDefault();
        console.log('Saving page...');
        
        const pageId = this.currentEditingPage;
        if (!pageId) {
            this.showNotification('No page selected for editing!', 'error');
            return;
        }
        
        const title = document.getElementById('pageTitle').value.trim();
        const content = document.getElementById('pageContent').value.trim();
        
        if (!title || !content) {
            this.showNotification('Please fill in all required fields!', 'error');
            return;
        }
        
        this.pageData[pageId] = {
            title: title,
            content: content,
            status: 'published',
            lastUpdated: 'Today'
        };
        
        console.log('Page data saved:', this.pageData[pageId]);
        
        this.savePageData();
        this.closePageModal();
        this.updatePagesDisplay();
        
        this.showNotification('Page saved successfully!', 'success');
    }

    // Delete a program
    deleteProgram(programId) {
        if (confirm('Are you sure you want to delete this program?')) {
            delete this.programData[programId];
            this.saveProgramData();
            this.updateProgramsDisplay();
            this.showNotification('Program deleted successfully!', 'success');
            
            // Trigger website refresh
            this.triggerWebsiteRefresh();
        }
    }

    // Preview a page
    previewPage(pageId) {
        if (this.pageData[pageId]) {
            const page = this.pageData[pageId];
            const newWindow = window.open('', '_blank');
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${page.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                        h1 { color: #27ae60; }
                        h2 { color: #2980b9; }
                        h3 { color: #8e44ad; }
                    </style>
                </head>
                <body>
                    <h1>${page.title}</h1>
                    <div>${this.markdownToHtml(page.content)}</div>
                </body>
                </html>
            `);
        }
    }

    // Update programs display
    updateProgramsDisplay() {
        const container = document.getElementById('programsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Filter programs based on current tab and search
        const filteredPrograms = this.filterPrograms();
        
        if (filteredPrograms.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><h3>No Programs Found</h3><p>No programs match your current filter.</p></div>';
            return;
        }
        
        filteredPrograms.forEach(([id, program]) => {
            const card = this.createProgramCard(id, program);
            container.appendChild(card);
        });
        
        // Update tab counts
        this.updateTabCounts();
    }

    filterPrograms() {
        const programs = Object.entries(this.programData);
        
        return programs.filter(([id, program]) => {
            // Tab filter
            if (this.currentProgramTab !== 'all' && program.status !== this.currentProgramTab) {
                return false;
            }
            
            // Search filter
            if (this.searchTerm) {
                const searchableText = `${program.title} ${program.description} ${program.content || ''}`.toLowerCase();
                if (!searchableText.includes(this.searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
    }

    createProgramCard(id, program) {
        const card = document.createElement('div');
        card.className = 'program-item';
        card.dataset.programId = id;
        
        const statusClass = program.status === 'active' ? 'status-active' : 
                           program.status === 'draft' ? 'status-draft' : 'status-inactive';
        
        card.innerHTML = `
            <div class="program-header">
                <div class="program-icon">
                    <i class="${program.icon || 'fas fa-book'}"></i>
                </div>
                <div class="program-status ${statusClass}">
                    ${program.status}
                </div>
            </div>
            <div class="program-info">
                <h3>${program.title}</h3>
                <p>${program.description}</p>
                <div class="program-meta">
                    <span class="last-updated">Updated: ${program.lastUpdated || 'Recently'}</span>
                </div>
            </div>
            <div class="program-actions">
                <button class="edit-btn" data-program="${id}">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                <button class="delete-btn" data-program="${id}">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        `;
        
        return card;
    }
    
    updateTabCounts() {
        const programs = Object.entries(this.programData);
        const counts = {
            all: programs.length,
            active: programs.filter(([_, p]) => p.status === 'active').length,
            draft: programs.filter(([_, p]) => p.status === 'draft').length,
            inactive: programs.filter(([_, p]) => p.status === 'inactive').length
        };
        
        Object.entries(counts).forEach(([status, count]) => {
            const countEl = document.getElementById(`${status}-count`);
            if (countEl) countEl.textContent = count;
        });
    }
    
    updatePagesDisplay() {
        console.log('Updating pages display...');
        console.log('Page data:', this.pageData);
        
        const container = document.getElementById('pagesContainer');
        if (!container) {
            console.error('Pages container not found');
            return;
        }
        
        container.innerHTML = '';
        
        // Filter pages based on current tab and search
        const filteredPages = this.filterPages();
        console.log('Filtered pages:', filteredPages.length);
        
        if (filteredPages.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-file-alt"></i><h3>No Pages Found</h3><p>No pages match your current filter.</p></div>';
            return;
        }
        
        filteredPages.forEach(([id, page]) => {
            const card = this.createPageCard(id, page);
            container.appendChild(card);
        });
        
        // Update page tab counts
        this.updatePageTabCounts();
    }
    
    filterPages() {
        const pages = Object.entries(this.pageData);
        console.log('Filtering pages:', pages.length, 'total pages');
        console.log('Current page tab:', this.currentPageTab);
        console.log('Page search term:', this.pageSearchTerm);
        
        return pages.filter(([id, page]) => {
            // Tab filter
            if (this.currentPageTab === 'draft') {
                return page.status === 'draft';
            } else if (this.currentPageTab === 'published') {
                return page.status !== 'draft';
            }
            // For 'all' tab, show all pages
            
            // Search filter
            if (this.pageSearchTerm) {
                const searchableText = `${page.title} ${page.content || ''}`.toLowerCase();
                if (!searchableText.includes(this.pageSearchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    createPageCard(id, page) {
        const card = document.createElement('div');
        card.className = 'page-item';
        card.dataset.pageId = id;
        
        const contentPreview = page.content ? 
            page.content.substring(0, 100) + (page.content.length > 100 ? '...' : '') : 
            'No content';
        
        card.innerHTML = `
            <div class="page-info">
                <h3>${page.title}</h3>
                <p>${contentPreview}</p>
                <div class="page-meta">
                    <span class="word-count">${this.getWordCount(page.content)} words</span>
                    <span class="last-updated">Updated: ${page.lastUpdated || 'Recently'}</span>
                </div>
            </div>
            <div class="page-actions">
                <button class="edit-page-btn" data-page="${id}">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                <button class="preview-btn" data-page="${id}">
                    <i class="fas fa-eye"></i>
                    Preview
                </button>
                <button class="duplicate-btn" data-page="${id}">
                    <i class="fas fa-copy"></i>
                    Duplicate
                </button>
            </div>
        `;
        
        return card;
    }
    
    getWordCount(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).length;
    }
    
    updatePageTabCounts() {
        const pages = Object.entries(this.pageData);
        const counts = {
            all: pages.length,
            published: pages.filter(([_, p]) => p.status !== 'draft').length,
            draft: pages.filter(([_, p]) => p.status === 'draft').length
        };
        
        document.getElementById('pages-all-count').textContent = counts.all;
        document.getElementById('pages-published-count').textContent = counts.published;
        document.getElementById('pages-draft-count').textContent = counts.draft;
    }

    // Trigger website refresh for dynamic content
    triggerWebsiteRefresh() {
        // Trigger storage event to refresh the main website
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'yakkai_neri_programs',
            newValue: JSON.stringify(this.programData)
        }));
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show and auto-hide
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Simple markdown to HTML converter
    markdownToHtml(markdown) {
        if (!markdown) return '';
        
        let html = markdown;
        
        // Headings
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Bold and italic
        html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');
        
        // Code blocks
        html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
        
        // Blockquotes
        html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
        
        // Lists
        html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
        
        // Wrap consecutive li elements in ul
        html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
        html = html.replace(/<\/ul>\s*<ul>/gim, '');
        
        // Paragraphs
        const lines = html.split('\n\n');
        const processedLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && 
                !line.includes('<h') && 
                !line.includes('<ul>') && 
                !line.includes('<blockquote>') &&
                !line.includes('<pre>')) {
                processedLines.push(`<p>${line}</p>`);
            } else {
                processedLines.push(line);
            }
        }
        
        return processedLines.join('\n\n');
    }

    // Website Control Methods
    editPage(pageId) {
        console.log('Editing page:', pageId);
        this.showNotification(`Opening editor for ${pageId}...`, 'info');
        // This would open a page editor - for now, show a placeholder
        this.showNotification('Page editor coming soon!', 'info');
    }

    previewPage(pageId) {
        console.log('Previewing page:', pageId);
        
        // Open the page in a new window/tab
        const pageUrls = {
            'index': 'index.html',
            'courses': 'Courses.html',
            'contact': 'contact.html'
        };
        
        const url = pageUrls[pageId] || `${pageId}.html`;
        window.open(url, '_blank');
        this.showNotification(`Previewing ${pageId} page`, 'success');
    }

    createNewPage() {
        const pageName = prompt('Enter new page name (without .html):');
        if (pageName) {
            console.log('Creating new page:', pageName);
            this.showNotification(`Creating ${pageName}.html...`, 'info');
            // This would create a new page - for now, show a placeholder
            this.showNotification('Page creation coming soon!', 'info');
        }
    }

    async syncWebsite() {
        try {
            this.showNotification('Starting full website sync...', 'info');
            
            // Update status indicators
            this.updateSyncStatus('programsStatus', 'warning', 'Syncing...');
            this.updateSyncStatus('pagesStatus', 'warning', 'Syncing...');
            this.updateSyncStatus('assetsStatus', 'warning', 'Syncing...');
            
            // Simulate sync process
            await this.delay(1000);
            this.updateSyncStatus('programsStatus', 'success', 'Synced');
            
            await this.delay(1000);
            this.updateSyncStatus('pagesStatus', 'success', 'Synced');
            
            await this.delay(1000);
            this.updateSyncStatus('assetsStatus', 'success', 'Synced');
            
            this.showNotification('Website synchronized successfully!', 'success');
        } catch (error) {
            console.error('Sync error:', error);
            this.showNotification('Sync failed: ' + error.message, 'error');
        }
    }

    updateSyncStatus(elementId, type, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.className = `status-badge ${type}`;
            element.textContent = text;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    exportWebsite() {
        const exportData = {
            programs: this.programData || {},
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
    }

    backupWebsite() {
        const backupData = {
            programs: this.programData || {},
            images: JSON.parse(localStorage.getItem('yakkai_neri_images') || '[]'),
            backupDate: new Date().toISOString(),
            type: 'backup'
        };
        
        localStorage.setItem('yakkai_neri_backup', JSON.stringify(backupData));
        this.showNotification('Backup created successfully!', 'success');
    }

    clearCache() {
        if (confirm('Are you sure you want to clear all cached data? This cannot be undone.')) {
            localStorage.removeItem('yakkai_neri_programs');
            localStorage.removeItem('yakkai_neri_images');
            localStorage.removeItem('yakkai_neri_backup');
            this.showNotification('Cache cleared successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
        }
    }

    refreshData() {
        try {
            // Refresh all data
            if (this.programManager) {
                this.programManager.refresh();
            }
            
            // Reload image gallery if it exists
            this.loadImageGallery();
            
            this.showNotification('Data refreshed successfully!', 'success');
        } catch (error) {
            console.error('Refresh error:', error);
            this.showNotification('Failed to refresh data', 'error');
        }
    }

    // Image management methods
    initImageManagement() {
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', this.handleImageUpload.bind(this));
        }
        this.loadImageGallery();
    }

    handleImageUpload(event) {
        const files = event.target.files;
        for (let file of files) {
            if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
                this.uploadImage(file);
            } else {
                this.showNotification('Invalid file. Please upload images under 5MB.', 'error');
            }
        }
    }

    uploadImage(file) {
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
    }

    loadImageGallery() {
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
                <button class="delete-btn" onclick="window.adminPanel.deleteImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    deleteImage(index) {
        if (confirm('Are you sure you want to delete this image?')) {
            let images = JSON.parse(localStorage.getItem('yakkai_neri_images') || '[]');
            images.splice(index, 1);
            localStorage.setItem('yakkai_neri_images', JSON.stringify(images));
            this.loadImageGallery();
            this.showNotification('Image deleted successfully!', 'success');
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// Global function to refresh programs (useful for testing)
function refreshPrograms() {
    if (window.programManager) {
        window.programManager.refresh();
        console.log('Programs refreshed manually');
    }
}

// Global functions for website control
function editPage(pageId) {
    if (window.adminPanel) {
        window.adminPanel.editPage(pageId);
    }
}

function previewPage(pageId) {
    if (window.adminPanel) {
        window.adminPanel.previewPage(pageId);
    }
}

function createNewPage() {
    if (window.adminPanel) {
        window.adminPanel.createNewPage();
    }
}

function syncWebsite() {
    if (window.adminPanel) {
        window.adminPanel.syncWebsite();
    }
}

function exportWebsite() {
    if (window.adminPanel) {
        window.adminPanel.exportWebsite();
    }
}

function backupWebsite() {
    if (window.adminPanel) {
        window.adminPanel.backupWebsite();
    }
}

function clearCache() {
    if (window.adminPanel) {
        window.adminPanel.clearCache();
    }
}

function refreshData() {
    if (window.adminPanel) {
        window.adminPanel.refreshData();
    }
}
