/**
 * Sinan's Portfolio - Core Interactive Features
 * Handcrafted with high performance and pixel-perfect responsiveness.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Mobile & Desktop Menu Control
    // ==========================================
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const mainHeader = document.querySelector('.main-header');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-btn');

    if (menuToggle && navMenu) {
        // Toggle Drawer Menu
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside of the drawer panel and toggle button
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Shrink header on scroll
    window.addEventListener('scroll', () => {
        if (mainHeader) {
            if (window.scrollY > 50) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
        }
    });


    // ==========================================
    // 2. Active Section Highlighting on Scroll
    // ==========================================
    const sections = document.querySelectorAll('section');
    
    const highlightActiveSection = () => {
        if (sections.length === 0) return; // Safely exit if on a page without sections (like index.html)
        let scrollPosition = window.scrollY + 120; // offset for nav header height

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightActiveSection);


    // ==========================================
    // 3. Theme & Accent Customizer Control
    // ==========================================
    const customizerToggle = document.getElementById('customizerToggle');
    const customizerPanel = document.getElementById('customizerPanel');
    const closeCustomizer = document.getElementById('closeCustomizer');
    const colorPresets = document.querySelectorAll('.color-preset');
    const darkThemeBtn = document.getElementById('darkThemeBtn');
    const lightThemeBtn = document.getElementById('lightThemeBtn');

    // Toggle Customizer Drawer Panel
    if (customizerToggle && customizerPanel && closeCustomizer) {
        customizerToggle.addEventListener('click', () => {
            customizerPanel.classList.toggle('active');
        });

        closeCustomizer.addEventListener('click', () => {
            customizerPanel.classList.remove('active');
        });

        // Close customizer clicking outside
        document.addEventListener('click', (e) => {
            if (!customizerPanel.contains(e.target) && !customizerToggle.contains(e.target)) {
                customizerPanel.classList.remove('active');
            }
        });
    }

    // Convert hex to RGB values for glow styling
    const hexToRgb = (hex) => {
        const bigint = parseInt(hex.replace('#', ''), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `${r}, ${g}, ${b}`;
    };

    // Spiderman Theme variables and handlers
    let spideyCanvas = null;
    let ctx = null;
    let cursorGlow = null;
    let senseContainer = null;
    let hangingSpider = null;
    let spideyActive = false;
    let canvasResizeHandler = null;
    let windowClickHandler = null;
    let mouseMoveHandler = null;
    let scrollHandler = null;
    let activeWebs = [];

    // Canvas Web Physics Update and Draw Loop
    const updateAndDrawWebs = () => {
        if (!ctx || !spideyCanvas) return;
        ctx.clearRect(0, 0, spideyCanvas.width, spideyCanvas.height);
        
        let hasActiveWebs = false;
        
        activeWebs.forEach((web) => {
            web.age++;
            
            if (web.state === "shooting") {
                const dx = web.targetX - web.startX;
                const dy = web.targetY - web.startY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 5) {
                    web.currentX = web.targetX;
                    web.currentY = web.targetY;
                    web.state = "splat";
                    web.age = 0;
                } else {
                    const speed = 50; 
                    const dirX = dx / dist;
                    const dirY = dy / dist;
                    
                    web.currentX += dirX * speed;
                    web.currentY += dirY * speed;
                    
                    const distTravelled = Math.sqrt((web.currentX - web.startX)**2 + (web.currentY - web.startY)**2);
                    if (distTravelled >= dist) {
                        web.currentX = web.targetX;
                        web.currentY = web.targetY;
                        web.state = "splat";
                        web.age = 0;
                    }
                }
                hasActiveWebs = true;
            } else {
                if (web.age > web.maxAge) {
                    web.opacity = 1 - (web.age - web.maxAge) / web.fadeAge;
                    if (web.opacity <= 0) {
                        web.opacity = 0;
                    } else {
                        hasActiveWebs = true;
                    }
                } else {
                    hasActiveWebs = true;
                }
            }
            
            if (web.opacity > 0) {
                ctx.save();
                ctx.globalAlpha = web.opacity;
                ctx.strokeStyle = "#ffffff";
                ctx.shadowColor = "rgba(239, 35, 60, 0.5)";
                ctx.shadowBlur = 5;
                ctx.lineWidth = 2.5;
                
                ctx.beginPath();
                ctx.moveTo(web.startX, web.startY);
                
                // Draw dynamic wavy web string
                const midX = (web.startX + web.currentX) / 2;
                const midY = (web.startY + web.currentY) / 2;
                const normalX = -(web.currentY - web.startY) / 100;
                const normalY = (web.currentX - web.startX) / 100;
                const waveX = midX + Math.sin(web.age * 0.15) * normalX * 0.15;
                const waveY = midY + Math.sin(web.age * 0.15) * normalY * 0.15;
                
                ctx.quadraticCurveTo(waveX, waveY, web.currentX, web.currentY);
                ctx.stroke();
                
                // Draw target web splat
                if (web.state === "splat") {
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 1.5;
                    
                    web.splatLines.forEach(line => {
                        ctx.beginPath();
                        ctx.moveTo(web.targetX, web.targetY);
                        ctx.lineTo(
                            web.targetX + line.dx * Math.min(1, web.age / 5), 
                            web.targetY + line.dy * Math.min(1, web.age / 5)
                        );
                        ctx.stroke();
                    });
                    
                    ctx.lineWidth = 1;
                    const rings = 3;
                    for (let r = 1; r <= rings; r++) {
                        const ringRadius = (r * 8) * Math.min(1, web.age / 8);
                        ctx.beginPath();
                        for (let i = 0; i <= 8; i++) {
                            const angle = (i * Math.PI) / 4;
                            const x = web.targetX + Math.cos(angle) * ringRadius;
                            const y = web.targetY + Math.sin(angle) * ringRadius;
                            
                            if (i === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
                ctx.restore();
            }
        });
        
        activeWebs = activeWebs.filter(web => web.opacity > 0);
        if (hasActiveWebs && spideyActive) {
            requestAnimationFrame(updateAndDrawWebs);
        }
    };

    const shootWeb = (targetX, targetY) => {
        const clickCount = activeWebs.length;
        const startX = clickCount % 2 === 0 ? 0 : window.innerWidth;
        const startY = window.innerHeight;
        
        const splatLines = [];
        const numLines = 8;
        for (let i = 0; i < numLines; i++) {
            const angle = (i * Math.PI) / 4;
            const length = 12 + Math.random() * 18;
            splatLines.push({
                dx: Math.cos(angle) * length,
                dy: Math.sin(angle) * length
            });
        }
        
        const newWeb = {
            startX: startX,
            startY: startY,
            currentX: startX,
            currentY: startY,
            targetX: targetX,
            targetY: targetY,
            age: 0,
            maxAge: 25, 
            fadeAge: 20, 
            state: "shooting",
            splatLines: splatLines,
            opacity: 1
        };
        
        activeWebs.push(newWeb);
        if (activeWebs.length === 1) {
            requestAnimationFrame(updateAndDrawWebs);
        }
    };

    const initSpidermanTheme = () => {
        if (spideyActive) return;
        spideyActive = true;
        
        // Canvas Setup
        if (!document.getElementById('spidey-canvas')) {
            spideyCanvas = document.createElement('canvas');
            spideyCanvas.id = 'spidey-canvas';
            document.body.appendChild(spideyCanvas);
        } else {
            spideyCanvas = document.getElementById('spidey-canvas');
        }
        ctx = spideyCanvas.getContext('2d');
        
        const resizeCanvas = () => {
            if (spideyCanvas) {
                spideyCanvas.width = window.innerWidth;
                spideyCanvas.height = window.innerHeight;
            }
        };
        resizeCanvas();
        canvasResizeHandler = resizeCanvas;
        window.addEventListener('resize', canvasResizeHandler);
        
        // Shooting webs click handler
        windowClickHandler = (e) => {
            if (e.target.closest('#customizerPanel, #customizerToggle, .customizer-panel, .customizer-toggle')) return;
            shootWeb(e.clientX, e.clientY);
        };
        window.addEventListener('click', windowClickHandler);
        
        // Custom Spidey Cursor setup
        if (!document.getElementById('spidey-cursor')) {
            cursorGlow = document.createElement('div');
            cursorGlow.id = 'spidey-cursor';
            cursorGlow.className = 'spidey-cursor-glow';
            
            senseContainer = document.createElement('div');
            senseContainer.className = 'spider-sense-container';
            for (let i = 0; i < 5; i++) {
                const line = document.createElement('div');
                line.className = 'spider-sense-line';
                const angles = [-30, -15, 0, 15, 30];
                line.style.setProperty('--angle', `${angles[i]}deg`);
                senseContainer.appendChild(line);
            }
            cursorGlow.appendChild(senseContainer);
            document.body.appendChild(cursorGlow);
        } else {
            cursorGlow = document.getElementById('spidey-cursor');
        }
        
        document.body.classList.add('custom-cursor-active');
        
        mouseMoveHandler = (e) => {
            if (cursorGlow) {
                cursorGlow.style.left = e.clientX + 'px';
                cursorGlow.style.top = e.clientY + 'px';
            }
        };
        document.addEventListener('mousemove', mouseMoveHandler);
        
        // Hanging Spider Setup
        if (!document.getElementById('spidey-hanging-widget')) {
            hangingSpider = document.createElement('div');
            hangingSpider.id = 'spidey-hanging-widget';
            hangingSpider.className = 'hanging-spider-container';
            hangingSpider.innerHTML = `
                <div class="hanging-spider-thread"></div>
                <svg class="hanging-spider-body" viewBox="0 0 100 100">
                    <circle cx="50" cy="45" r="10" fill="#EF233C" />
                    <circle cx="50" cy="62" r="15" fill="#EF233C" />
                    <path d="M42 42 Q25 28 20 20 M42 46 Q20 40 15 36 M40 52 Q18 55 20 62 M40 58 Q22 70 28 76" stroke="#EF233C" stroke-width="4.5" fill="none" stroke-linecap="round" />
                    <path d="M58 42 Q75 28 80 20 M58 46 Q80 40 85 36 M60 52 Q82 55 80 62 M60 58 Q78 70 72 76" stroke="#EF233C" stroke-width="4.5" fill="none" stroke-linecap="round" />
                    <ellipse cx="46" cy="42" rx="1.5" ry="3" fill="#FFF" />
                    <ellipse cx="54" cy="42" rx="1.5" ry="3" fill="#FFF" />
                </svg>
            `;
            document.body.appendChild(hangingSpider);
        } else {
            hangingSpider = document.getElementById('spidey-hanging-widget');
        }
        
        const updateSpiderPos = () => {
            if (!hangingSpider) return;
            const scrollPercent = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            const drop = Math.min(320, scrollPercent * 500);
            hangingSpider.style.transform = `translateY(${drop - 1000}px)`;
        };
        updateSpiderPos();
        scrollHandler = updateSpiderPos;
        window.addEventListener('scroll', scrollHandler);

        // Update footer text for Spidey theme
        const footerMeta = document.querySelector('.footer-meta p');
        if (footerMeta) {
            footerMeta.innerHTML = 'Designed by Sinan &middot; Spun with spider-sense & pixel perfection';
        }
    };

    const cleanupSpidermanTheme = () => {
        if (!spideyActive) return;
        spideyActive = false;
        
        if (canvasResizeHandler) {
            window.removeEventListener('resize', canvasResizeHandler);
            canvasResizeHandler = null;
        }
        if (windowClickHandler) {
            window.removeEventListener('click', windowClickHandler);
            windowClickHandler = null;
        }
        if (mouseMoveHandler) {
            document.removeEventListener('mousemove', mouseMoveHandler);
            mouseMoveHandler = null;
        }
        if (scrollHandler) {
            window.removeEventListener('scroll', scrollHandler);
            scrollHandler = null;
        }
        
        if (spideyCanvas && spideyCanvas.parentNode) {
            spideyCanvas.parentNode.removeChild(spideyCanvas);
            spideyCanvas = null;
            ctx = null;
        }
        if (cursorGlow && cursorGlow.parentNode) {
            cursorGlow.parentNode.removeChild(cursorGlow);
            cursorGlow = null;
        }
        if (hangingSpider && hangingSpider.parentNode) {
            hangingSpider.parentNode.removeChild(hangingSpider);
            hangingSpider = null;
        }
        
        document.body.classList.remove('custom-cursor-active');
        document.body.classList.remove('spider-sense-active');
        activeWebs = [];

        // Restore normal footer text
        const footerMeta = document.querySelector('.footer-meta p');
        if (footerMeta) {
            footerMeta.innerHTML = 'Designed by Sinan &middot; WITH ELLAA KAZHIVUKALUM KOND';
        }
    };

    // Apply color accent updates
    const setAccentColor = (color) => {
        if (!color) return;
        
        if (color === 'spiderman') {
            document.documentElement.style.setProperty('--accent-color', '#ef233c');
            document.documentElement.style.setProperty('--accent-glow', 'rgba(239, 35, 60, 0.35)');
            document.documentElement.style.setProperty('--accent-rgb', '239, 35, 60');
            document.body.classList.add('spiderman-theme');
            
            localStorage.setItem('sinan-accent-color', 'spiderman');
            
            colorPresets.forEach(preset => {
                preset.classList.remove('active');
                if (preset.getAttribute('data-color') === 'spiderman') {
                    preset.classList.add('active');
                }
            });
            
            initSpidermanTheme();
            return;
        }

        if (document.body.classList.contains('spiderman-theme')) {
            document.body.classList.remove('spiderman-theme');
            cleanupSpidermanTheme();
        }

        const rgb = hexToRgb(color);
        document.documentElement.style.setProperty('--accent-color', color);
        document.documentElement.style.setProperty('--accent-glow', `rgba(${rgb}, 0.3)`);
        document.documentElement.style.setProperty('--accent-rgb', rgb);
        
        localStorage.setItem('sinan-accent-color', color);

        colorPresets.forEach(preset => {
            preset.classList.remove('active');
            if (preset.getAttribute('data-color') === color) {
                preset.classList.add('active');
            }
        });
    };

    // Event delegation for Spider-Sense warning glows
    document.addEventListener('mouseover', (e) => {
        if (!spideyActive || !cursorGlow) return;
        const clickable = e.target.closest('a, button, .color-preset, .view-project-btn, .customizer-toggle, input, textarea, [role="button"]');
        if (clickable) {
            cursorGlow.classList.add('spider-sense-active');
        } else {
            cursorGlow.classList.remove('spider-sense-active');
        }
    });

    // Color preset click events
    colorPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            const selectedColor = preset.getAttribute('data-color');
            setAccentColor(selectedColor);
        });
    });

    // Theme modes toggles
    const setThemeMode = (mode) => {
        if (mode === 'dark') {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            if (darkThemeBtn) darkThemeBtn.classList.add('active');
            if (lightThemeBtn) lightThemeBtn.classList.remove('active');
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            if (lightThemeBtn) lightThemeBtn.classList.add('active');
            if (darkThemeBtn) darkThemeBtn.classList.remove('active');
        }
        localStorage.setItem('sinan-theme-mode', mode);
    };

    if (darkThemeBtn) darkThemeBtn.addEventListener('click', () => setThemeMode('dark'));
    if (lightThemeBtn) lightThemeBtn.addEventListener('click', () => setThemeMode('light'));

    // Loading stored settings from localStorage on startup
    const savedAccent = localStorage.getItem('sinan-accent-color');
    const savedTheme = localStorage.getItem('sinan-theme-mode');

    if (savedAccent) setAccentColor(savedAccent);
    if (savedTheme) setThemeMode(savedTheme);


    // ==========================================
    // 4. Scroll Intersection Animation & Progress Bars
    // ==========================================
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    const skillBars = document.querySelectorAll('.skill-progress-bar');
    const statsContainer = document.querySelector('.about-stats');
    const stats = document.querySelectorAll('.stat-number');
    let statsTriggered = false;

    // Trigger skills bar fill animation
    const animateSkills = () => {
        skillBars.forEach(bar => {
            const progress = bar.getAttribute('data-progress');
            bar.style.width = progress;
        });
    };

    // Counting stat numbers animations
    const runStatsCounters = () => {
        if (statsTriggered) return;
        statsTriggered = true;

        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            let current = 0;
            const duration = 2000; // 2 seconds duration
            const increment = target / (duration / 16); // 60fps frame tick

            const updateCount = () => {
                current += increment;
                const suffix = stat.getAttribute('data-suffix') || '';
                if (current < target) {
                    stat.innerText = Math.ceil(current) + suffix;
                    requestAnimationFrame(updateCount);
                } else {
                    stat.innerText = target + suffix;
                }
            };
            updateCount();
        });
    };

    // Intersection observer setup for entry fades and metrics
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');

                // Trigger skills if it's the skills section
                if (entry.target.classList.contains('skills-bars-container') || (skillBars.length > 0 && entry.target.contains(skillBars[0]))) {
                    animateSkills();
                }

                // Trigger stats counters if scrolling past statistics container
                if (statsContainer && stats.length > 0 && entry.target.contains(statsContainer)) {
                    runStatsCounters();
                }
                
                // Stop observing after firing once
                scrollObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15 // element is 15% in screen
    });

    // Register all elements to observer
    elementsToAnimate.forEach(el => scrollObserver.observe(el));
    
    // Explicit registers for skills wrapper & statistics blocks
    const skillsContainer = document.querySelector('.skills-bars-container');
    if (skillsContainer) scrollObserver.observe(skillsContainer);
    if (statsContainer) scrollObserver.observe(statsContainer);


    // ==========================================
    // 5. Portfolio Filtering Logic
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if (filterButtons && filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active classes
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');

                portfolioItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    
                    if (filterValue === 'all' || category === filterValue) {
                        item.classList.remove('hidden');
                        // Add subtle scaling animations back
                        setTimeout(() => {
                            item.style.transform = 'scale(1)';
                            item.style.opacity = '1';
                        }, 50);
                    } else {
                        item.style.transform = 'scale(0.8)';
                        item.style.opacity = '0';
                        setTimeout(() => {
                            item.classList.add('hidden');
                        }, 300);
                    }
                });
            });
        });
    }


    // ==========================================
    // 6. Portfolio Modals & Dynamic Projects Data
    // ==========================================
    const projectModal = document.getElementById('projectModal');
    const closeModalBtn = document.getElementById('closeModal');
    const viewProjectBtns = document.querySelectorAll('.view-project-btn');
    
    // Modal Element Hooks
    const modalImage = document.getElementById('modalImage');
    const modalTag = document.getElementById('modalTag');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalClient = document.getElementById('modalClient');
    const modalTools = document.getElementById('modalTools');
    const modalDate = document.getElementById('modalDate');
    const modalProjectLink = document.getElementById('modalProjectLink');

    // Curated high-fidelity project data
    const projectsData = {
        '1': {
            title: 'Aesthetic Brand Identity',
            tag: 'Branding',
            image: './Home.jpg',
            client: 'Aura Cosmetics',
            tools: 'Adobe Illustrator, Photoshop, Figma',
            date: 'February 2026',
            description: 'Developed a comprehensive visual style guide including product mockups, typography selection, custom vector emblem design, and a minimalist color system. The brand strategy aligned natural textures with luxurious gold accents to capture premium market appeal.',
            link: '#'
        },
        '2': {
            title: 'Modern Digital Posters',
            tag: 'Graphics Design',
            image: './Home.jpg',
            client: 'Zenith Tech Summit',
            tools: 'Adobe Photoshop, Illustrator',
            date: 'April 2026',
            description: 'Created promotional posters and digital assets for a major global tech event. Incorporating dark glowing grids, abstract cyberpunk elements, and heavy geometrical text alignment, these graphics drove ticket engagement and visual cohesion.',
            link: '#'
        },
        '3': {
            title: 'Instagram Grid Architecture',
            tag: 'Social Media',
            image: './Home.jpg',
            client: 'Bloom Wellness Studio',
            tools: 'Figma, Adobe Photoshop, Lightroom',
            date: 'December 2025',
            description: 'Engineered a highly curated 30-day aesthetic puzzle grid layout. Combining soothing custom vectors, client testimony typography cards, and lifestyle assets, this campaign expanded account organic traffic by 125% and profile conversions.',
            link: '#'
        },
        '4': {
            title: 'Vector Illustrative Layouts',
            tag: 'Graphics Design',
            image: './Home.jpg',
            client: 'Sol Food Cafe',
            tools: 'Adobe Illustrator',
            date: 'January 2026',
            description: 'Illustrated a comprehensive graphic ecosystem including menus, custom packaging, apparel stamps, and digital graphics. Combining hand-drawn organic aesthetics with vibrant, custom modern vector elements.',
            link: '#'
        },
        '5': {
            title: 'Viral Reel Campaign Strategy',
            tag: 'Social Media',
            image: './Home.jpg',
            client: 'FitLife Global Gyms',
            tools: 'Premiere Pro, After Effects, Audition',
            date: 'March 2026',
            description: 'Directed, scripted, and edited a series of 15 high-retention short-form reels. Using dynamic hooks, clean sound engineering, and custom kinetic captions, the campaign amassed over 2.1 million aggregate views and raised membership sign-ups by 18%.',
            link: '#'
        },
        '6': {
            title: 'Typography Brand Systems',
            tag: 'Branding',
            image: './Home.jpg',
            client: 'Apex Creative Agency',
            tools: 'Adobe Illustrator, InDesign',
            date: 'May 2026',
            description: 'Crafted a typographic mark and branding toolkit for an upscale creative firm. Focused on high-end layouts, stationary sets, letterheads, and print books, ensuring precise editorial spacing and elegant visual hierarchy.',
            link: '#'
        },
        '11': {
            title: 'Craft & Capture — IEDC SIAS',
            tag: 'Graphics Design',
            image: './IEDC CRAFT & CAPTURE.jpg',
            client: 'IEDC SIAS',
            tools: 'Canva',
            date: 'June 2026',
            description: 'Poster design for an <strong>inter-college poster and reel-making competition</strong> organized by the <strong>Innovation & Entrepreneurship Development Centre, SIAS</strong>.<br><br>Designed to pull attention with <strong>high-contrast typography</strong> and a <strong>deep purple gradient aesthetic</strong>, while keeping all event information scannable at a glance.',
            link: '#'
        },
        '12': {
            title: 'Beachside Portrait',
            tag: 'Photography',
            image: './PHOTOGRAPHY/HAIFA.jpg',
            client: 'Personal Shoot',
            tools: 'Adobe Lightroom',
            date: 'June 2026',
            description: 'A beachside portrait shoot along the Kerala coastline — edited in <strong>Adobe Lightroom</strong>.<br><br>Focused on balancing the bright natural light with the subject, while keeping the waves, sand, and treeline true to the mood of the moment.',
            link: '#'
        }
    };

    // Open Modal
    if (viewProjectBtns && viewProjectBtns.length > 0) {
        viewProjectBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const projectId = btn.getAttribute('data-project-id');
                const data = projectsData[projectId];

                if (data && modalTitle && modalTag && modalImage && modalClient && modalTools && modalDate && modalDescription && modalProjectLink && projectModal) {
                    // Populate Modal Elements
                    modalTitle.innerText = data.title;
                    modalTag.innerText = data.tag;
                    modalImage.setAttribute('src', data.image);
                    modalImage.setAttribute('alt', data.title);
                    modalClient.innerText = data.client;
                    modalTools.innerText = data.tools;
                    modalDate.innerText = data.date;
                    modalDescription.innerHTML = data.description;
                    modalProjectLink.setAttribute('href', data.link);

                    // Show Modal
                    projectModal.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Lock background scrolling
                }
            });
        });
    }

    // Close Modal Function
    const closeModal = () => {
        if (projectModal) {
            projectModal.classList.remove('active');
            document.body.style.overflow = 'auto'; // Unlock scrolling
        }
    };

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close modal clicking outside card
    if (projectModal) {
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) {
                closeModal();
            }
        });
    }

    // ESC Key listener to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectModal && projectModal.classList.contains('active')) {
            closeModal();
        }
    });

    // ==========================================
    // 7. Contact Form Secure Submission
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    const formSuccessAlert = document.getElementById('formSuccess');

    if (contactForm && formSuccessAlert) {
        const submitBtn = contactForm.querySelector('.submit-btn');

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Honeypot spam check (if checkbox is checked, drop it silently as spambot)
            const botcheck = contactForm.querySelector('input[name="botcheck"]');
            if (botcheck && botcheck.checked) {
                console.log("Spambot detected!");
                return;
            }

            // Perform simple form inputs check
            const name = document.getElementById('nameInput').value.trim();
            const email = document.getElementById('emailInput').value.trim();
            const subject = document.getElementById('subjectInput') ? document.getElementById('subjectInput').value.trim() : 'No Subject';
            const message = document.getElementById('messageInput').value.trim();

            if (name && email && message) {
                // Animate button loading state
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.7';
                submitBtn.querySelector('span').innerText = 'Sending...';
                submitBtn.querySelector('i').setAttribute('class', 'fa-solid fa-spinner fa-spin');

                // Prepare FormData for Web3Forms API
                const formData = new FormData();
                // Replace 'YOUR_ACCESS_KEY_HERE' with your real Web3Forms Access Key
                formData.append("access_key", "4744405f-697d-4aef-9a59-870e86e1da43");
                formData.append("name", name);
                formData.append("email", email);
                formData.append("subject", subject);
                formData.append("message", message);
                formData.append("from_name", "Sinan Portfolio Contact Form");

                // Submit to Web3Forms API via fetch
                fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Hide Form with transition
                        contactForm.style.opacity = '0';
                        setTimeout(() => {
                            contactForm.style.display = 'none';
                            // Show custom checkmark success screen
                            formSuccessAlert.style.display = 'flex';
                        }, 300);
                    } else {
                        alert("Oops! Something went wrong: " + data.message);
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '1';
                        submitBtn.querySelector('span').innerText = 'Send Message';
                        submitBtn.querySelector('i').setAttribute('class', 'fa-solid fa-paper-plane');
                    }
                })
                .catch(error => {
                    console.error("Error submitting form:", error);
                    alert("Unable to send message. Please check your internet connection.");
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.querySelector('span').innerText = 'Send Message';
                    submitBtn.querySelector('i').setAttribute('class', 'fa-solid fa-paper-plane');
                });
            }
        });
    }

    // ==========================================
    // 8. Premium Page Transition Animations
    // ==========================================
    const setupPageTransitions = () => {
        const overlay = document.querySelector('.page-transition-overlay');
        if (!overlay) return;

        // On page load: remove entering class to slide it up out of screen
        setTimeout(() => {
            document.body.classList.remove('page-entering');
            document.body.classList.add('page-entered');
        }, 100);

        // Intercept local page links
        const links = document.querySelectorAll('a[href^="index.html"], a[href^="portfolio.html"], a[href^="tools.html"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Get page base name to check if we are navigating away
                const currentPath = window.location.pathname.split('/').pop() || 'index.html';
                const targetPath = href.split('#')[0] || currentPath;

                // If navigating to the exact same page, let browser handle normally
                if (currentPath === targetPath && href.includes('#')) {
                    return; 
                }

                e.preventDefault();
                
                // Add leaving class to slide overlay in from bottom
                document.body.classList.remove('page-entered');
                document.body.classList.add('page-leaving');

                // Redirect after transition completes
                setTimeout(() => {
                    window.location.href = href;
                }, 650); // Matches CSS transition duration
            });
        });

        // Safely reset in case of Back/Forward button cache
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                document.body.classList.remove('page-leaving');
                document.body.classList.add('page-entered');
            }
        });
    };

    setupPageTransitions();
});
