/**
 * ============================================
 * TRUTH LENS - Main Application Script
 * Version: 2.0.1
 * Perfect Interactive Experience
 * ============================================
 */

// ============================================
// GLOBAL STATE MANAGEMENT
// ============================================

const AppState = {
    currentAnalysis: null,
    analysisHistory: [],
    liveCheckEnabled: false,
    currentTheme: 'dark',
    isAnalyzing: false,
    newsCache: new Map(),
    
    // Load from localStorage
    init() {
        const saved = localStorage.getItem('truthlens_history');
        if (saved) {
            try {
                this.analysisHistory = JSON.parse(saved);
            } catch (e) {
                this.analysisHistory = [];
            }
        }
    },
    
    // Save to localStorage
    saveHistory() {
        try {
            localStorage.setItem('truthlens_history', JSON.stringify(this.analysisHistory.slice(0, 50)));
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    },
    
    // Add to history
    addToHistory(item) {
        this.analysisHistory.unshift({
            ...item,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });
        this.saveHistory();
        renderHistory();
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Truth Lens Initializing...');
    
    // Initialize app state
    AppState.init();
    
    // Initialize all features
    initNavigation();
    initHeroAnimations();
    initFakeNewsDetector();
    initSourceCredibilityChecker();
    initImageVerification();
    initLiveFactCheck();
    initNewsFeed();
    initHotTopics();
    initHistory();
    initThemeToggle();
    initParticles();
    initToastSystem();
    initScrollAnimations();
    
    console.log('✅ Truth Lens Ready!');
    
    // Show welcome toast
    showToast('Truth Lens AI Engine Activated', 'System ready for analysis', 'success');
});

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Smooth scroll to sections
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    // Update active state
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    
                    // Close mobile menu
                    if (window.innerWidth <= 768) {
                        navMenu.classList.remove('active');
                    }
                }
            }
        });
    });
    
    // Mobile menu toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }
    
    // Active section on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ============================================
// HERO ANIMATIONS
// ============================================

function initHeroAnimations() {
    // Animate stats counters
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const isDecimal = target.toString().includes('.');
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                if (isDecimal) {
                    element.textContent = current.toFixed(1);
                } else {
                    element.textContent = Math.floor(current).toLocaleString();
                }
                requestAnimationFrame(updateCounter);
            } else {
                if (isDecimal) {
                    element.textContent = target.toFixed(1);
                } else {
                    element.textContent = target.toLocaleString();
                }
            }
        };
        
        updateCounter();
    };
    
    // Intersection Observer for counter animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
    
    // Terminal typing animation
    animateTerminal();
}

function animateTerminal() {
    const terminalBody = document.querySelector('.terminal-body');
    if (!terminalBody) return;
    
    const lines = terminalBody.querySelectorAll('.terminal-line');
    
    lines.forEach((line, index) => {
        line.style.opacity = '0';
        setTimeout(() => {
            line.style.transition = 'opacity 0.3s ease';
            line.style.opacity = '1';
        }, index * 400);
    });
}

// ============================================
// FAKE NEWS DETECTOR
// ============================================

function initFakeNewsDetector() {
    const newsInput = document.getElementById('newsInput');
    const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearTextBtn = document.getElementById('clearText');
    const pasteTextBtn = document.getElementById('pasteText');
    const fetchUrlBtn = document.getElementById('fetchUrl');
    const charCount = document.getElementById('charCount');
    const resultsContainer = document.getElementById('resultsContainer');
    const closeResults = document.getElementById('closeResults');
    
    // Character counter
    if (newsInput && charCount) {
        newsInput.addEventListener('input', () => {
            const count = newsInput.value.length;
            charCount.textContent = count;
            
            if (count > 5000) {
                charCount.style.color = 'var(--danger-red)';
            } else if (count > 4000) {
                charCount.style.color = 'var(--warning-yellow)';
            } else {
                charCount.style.color = 'var(--neon-cyan)';
            }
        });
    }
    
    // Clear text
    if (clearTextBtn && newsInput) {
        clearTextBtn.addEventListener('click', () => {
            newsInput.value = '';
            charCount.textContent = '0';
            showToast('Text Cleared', 'Input field has been cleared', 'success');
        });
    }
    
    // Paste text
    if (pasteTextBtn && newsInput) {
        pasteTextBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                newsInput.value = text;
                newsInput.dispatchEvent(new Event('input'));
                showToast('Text Pasted', 'Content pasted from clipboard', 'success');
            } catch (err) {
                showToast('Paste Failed', 'Unable to access clipboard. Please paste manually (Ctrl+V)', 'error');
            }
        });
    }
    
    // Fetch from URL
    if (fetchUrlBtn && urlInput) {
        fetchUrlBtn.addEventListener('click', async () => {
            const url = urlInput.value.trim();
            
            if (!url) {
                showToast('Invalid URL', 'Please enter a valid URL', 'error');
                return;
            }
            
            if (!isValidURL(url)) {
                showToast('Invalid URL Format', 'Please enter a complete URL (e.g., https://example.com)', 'error');
                return;
            }
            
            showLoading('Fetching article content...');
            
            try {
                // Simulate fetching (in production, use a backend proxy)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Simulated content
                const simulatedContent = `Breaking News: Major Development in Technology Sector

According to recent reports, artificial intelligence continues to advance at unprecedented rates. Industry experts suggest this trend will continue throughout 2024.

"The implications are significant," said Dr. Jane Smith, AI researcher at Tech University. Studies show increased adoption across multiple sectors.

However, some analysts remain cautious about potential challenges. Data from the Technology Research Institute indicates mixed results in certain applications.

The debate continues among professionals in the field.`;
                
                newsInput.value = simulatedContent;
                newsInput.dispatchEvent(new Event('input'));
                hideLoading();
                showToast('Article Fetched', 'Content loaded successfully', 'success');
                
            } catch (error) {
                hideLoading();
                showToast('Fetch Failed', 'Unable to fetch article. You can paste the content manually.', 'error');
            }
        });
    }
    
    // Analyze button
    if (analyzeBtn && newsInput) {
        analyzeBtn.addEventListener('click', async () => {
            const text = newsInput.value.trim();
            const url = urlInput?.value.trim() || null;
            
            if (!text) {
                showToast('No Content', 'Please enter some text to analyze', 'error');
                return;
            }
            
            if (text.length < 50) {
                showToast('Text Too Short', 'Please enter at least 50 characters for accurate analysis', 'warning');
                return;
            }
            
            await analyzeNewsContent(text, url);
        });
        
        // Also allow Enter to submit (Ctrl+Enter)
        newsInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                analyzeBtn.click();
            }
        });
    }
    
    // Close results
    if (closeResults && resultsContainer) {
        closeResults.addEventListener('click', () => {
            resultsContainer.style.display = 'none';
        });
    }
}

async function analyzeNewsContent(text, url) {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    
    // Set loading state
    analyzeBtn.classList.add('loading');
    analyzeBtn.disabled = true;
    AppState.isAnalyzing = true;
    
    showLoading('AI analyzing content...');
    
    try {
        // Call AI engine
        const result = await truthLensAI.analyzeNews(text, url);
        
        // Store in state
        AppState.currentAnalysis = result;
        
        // Add to history
        AppState.addToHistory({
            type: 'text',
            content: text.substring(0, 200) + '...',
            url: url,
            result: {
                truthPercentage: result.truthPercentage,
                verdict: result.verdict
            }
        });
        
        // Display results
        displayAnalysisResults(result);
        
        // Show results container
        resultsContainer.style.display = 'block';
        
        // Smooth scroll to results
        setTimeout(() => {
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
        
        hideLoading();
        showToast('Analysis Complete', `Truth Score: ${result.truthPercentage}%`, 'success');
        
    } catch (error) {
        console.error('Analysis error:', error);
        hideLoading();
        showToast('Analysis Failed', 'An error occurred during analysis. Please try again.', 'error');
    } finally {
        analyzeBtn.classList.remove('loading');
        analyzeBtn.disabled = false;
        AppState.isAnalyzing = false;
    }
}

function displayAnalysisResults(result) {
    // Update truth meter
    const truthPercentage = document.getElementById('truthPercentage');
    const progressCircle = document.getElementById('progressCircle');
    const verdictBadge = document.getElementById('verdictBadge');
    const verdictText = document.getElementById('verdictText');
    
    // Animate percentage
    animateNumber(truthPercentage, 0, result.truthPercentage, 2000);
    
    // Animate circular progress
    const circumference = 2 * Math.PI * 90; // radius = 90
    const offset = circumference - (result.truthPercentage / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
    
    // Set color based on score
    let color = 'var(--success-green)';
    let verdictClass = '';
    
    if (result.truthPercentage >= 70) {
        color = 'var(--success-green)';
        verdictClass = '';
    } else if (result.truthPercentage >= 40) {
        color = 'var(--warning-yellow)';
        verdictClass = 'uncertain';
    } else {
        color = 'var(--danger-red)';
        verdictClass = 'fake';
    }
    
    progressCircle.style.stroke = color;
    verdictBadge.className = `verdict-badge ${verdictClass}`;
    verdictText.textContent = result.verdict;
    
    // Update summary
    const aiSummary = document.getElementById('aiSummary');
    aiSummary.innerHTML = `<p>${result.summary}</p>`;
    
    // Update evidence
    const evidenceList = document.getElementById('evidenceList');
    evidenceList.innerHTML = '';
    
    if (result.evidence && result.evidence.length > 0) {
        result.evidence.forEach(item => {
            const evidenceItem = document.createElement('div');
            evidenceItem.className = 'evidence-item';
            evidenceItem.innerHTML = `
                <div class="evidence-icon ${item.type}">
                    <i class="fas fa-${item.type === 'positive' ? 'check' : 'times'}"></i>
                </div>
                <div class="evidence-content">
                    <p class="evidence-text">${item.text}</p>
                </div>
            `;
            evidenceList.appendChild(evidenceItem);
        });
    } else {
        evidenceList.innerHTML = '<p class="loading-text">No specific evidence points identified</p>';
    }
    
    // Update credibility scores
    const credibilityScores = document.getElementById('credibilityScores');
    credibilityScores.innerHTML = '';
    
    if (result.breakdown) {
        Object.entries(result.breakdown).forEach(([key, value]) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            scoreItem.innerHTML = `
                <span class="score-label">${capitalizeFirst(key)}:</span>
                <div class="score-bar-container">
                    <div class="score-bar" style="width: ${value}%"></div>
                </div>
                <span class="score-value">${Math.round(value)}%</span>
            `;
            credibilityScores.appendChild(scoreItem);
        });
    }
    
    // Update red flags
    const redFlags = document.getElementById('redFlags');
    redFlags.innerHTML = '';
    
    if (result.redFlags && result.redFlags.length > 0) {
        result.redFlags.forEach(flag => {
            const flagItem = document.createElement('div');
            flagItem.className = 'flag-item';
            flagItem.innerHTML = `
                <div class="flag-icon">
                    <i class="fas fa-flag"></i>
                </div>
                <div class="flag-content">
                    <strong>${flag.type}</strong>
                    <p class="flag-text">${flag.description}</p>
                </div>
            `;
            redFlags.appendChild(flagItem);
        });
    } else {
        redFlags.innerHTML = '<p class="loading-text">No major red flags detected</p>';
    }
    
    // Setup share and download buttons
    setupResultActions(result);
}

function setupResultActions(result) {
    const shareBtn = document.getElementById('shareResult');
    const downloadBtn = document.getElementById('downloadReport');
    
    if (shareBtn) {
        shareBtn.onclick = () => shareResults(result);
    }
    
    if (downloadBtn) {
        downloadBtn.onclick = () => downloadReport(result);
    }
}

function shareResults(result) {
    const shareText = `Truth Lens Analysis: ${result.verdict} (${result.truthPercentage}% credibility)\n\nVerified by AI fact-checking engine.`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Truth Lens Analysis',
            text: shareText,
            url: window.location.href
        }).then(() => {
            showToast('Shared Successfully', 'Analysis shared', 'success');
        }).catch(() => {
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

function downloadReport(result) {
    const report = generatePDFReport(result);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truthlens-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Report Downloaded', 'Analysis report saved to your device', 'success');
}

function generatePDFReport(result) {
    return `
TRUTH LENS - AI FACT VERIFICATION REPORT
Generated: ${new Date().toLocaleString()}
═══════════════════════════════════════════

VERDICT: ${result.verdict}
TRUTH SCORE: ${result.truthPercentage}%
CONFIDENCE: ${result.confidence}%

═══════════════════════════════════════════
SUMMARY
═══════════════════════════════════════════
${result.summary}

═══════════════════════════════════════════
EVIDENCE POINTS
═══════════════════════════════════════════
${result.evidence?.map((e, i) => `${i + 1}. [${e.type.toUpperCase()}] ${e.text}`).join('\n') || 'No evidence points'}

═══════════════════════════════════════════
CREDIBILITY BREAKDOWN
═══════════════════════════════════════════
${Object.entries(result.breakdown || {}).map(([k, v]) => `${capitalizeFirst(k)}: ${Math.round(v)}%`).join('\n')}

═══════════════════════════════════════════
RED FLAGS
═══════════════════════════════════════════
${result.redFlags?.map((f, i) => `${i + 1}. ${f.type}: ${f.description}`).join('\n') || 'No major red flags'}

═══════════════════════════════════════════
This report was generated by Truth Lens AI
Fact Verification Engine v2.0.1
═══════════════════════════════════════════
    `.trim();
}

// ============================================
// SOURCE CREDIBILITY CHECKER
// ============================================

function initSourceCredibilityChecker() {
    const sourceInput = document.getElementById('sourceInput');
    const checkSourceBtn = document.getElementById('checkSourceBtn');
    const sourceResults = document.getElementById('sourceResults');
    
    if (checkSourceBtn && sourceInput) {
        checkSourceBtn.addEventListener('click', async () => {
            const source = sourceInput.value.trim();
            
            if (!source) {
                showToast('Invalid Input', 'Please enter a source name or URL', 'error');
                return;
            }
            
            checkSourceBtn.classList.add('loading');
            checkSourceBtn.disabled = true;
            
            try {
                // Extract domain if URL
                let domain = source;
                if (source.includes('://')) {
                    domain = new URL(source).hostname.replace('www.', '');
                }
                
                // Analyze source
                const result = await truthLensAI.analyzeSource(`https://${domain}`);
                
                displaySourceResults(result);
                sourceResults.style.display = 'block';
                
                showToast('Source Checked', `Credibility: ${result.score}/100`, 'success');
                
            } catch (error) {
                showToast('Check Failed', 'Unable to analyze source', 'error');
            } finally {
                checkSourceBtn.classList.remove('loading');
                checkSourceBtn.disabled = false;
            }
        });
        
        // Enter key support
        sourceInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                checkSourceBtn.click();
            }
        });
    }
}

function displaySourceResults(result) {
    const sourceScore = document.getElementById('sourceScore');
    const biasLevel = document.getElementById('biasLevel');
    const reliability = document.getElementById('reliability');
    const trackRecord = document.getElementById('trackRecord');
    const sourceInfo = document.getElementById('sourceInfo');
    
    // Animate score
    if (sourceScore) {
        const scoreValue = sourceScore.querySelector('.score-value');
        animateNumber(scoreValue, 0, result.score, 1500);
        
        // Set color based on score
        let color = 'var(--success-green)';
        if (result.score < 50) color = 'var(--danger-red)';
        else if (result.score < 70) color = 'var(--warning-yellow)';
        
        sourceScore.style.borderColor = color;
    }
    
    // Update bias
    if (biasLevel) {
        const biasLabel = biasLevel.querySelector('.bias-label');
        const biasFill = biasLevel.querySelector('.bias-fill');
        
        biasLabel.textContent = capitalizeFirst(result.bias.replace('-', ' '));
        
        // Calculate bias position (0-100 scale, 50 = center)
        const biasMap = {
            'extreme-left': 10,
            'left': 30,
            'center-left': 45,
            'center': 50,
            'center-right': 55,
            'right': 70,
            'extreme-right': 90,
            'unknown': 50,
            'satire': 50
        };
        
        const biasPosition = biasMap[result.bias] || 50;
        biasFill.style.width = `${biasPosition}%`;
    }
    
    // Update reliability stars
    if (reliability) {
        const stars = Math.round((result.score / 100) * 5);
        reliability.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('i');
            star.className = i < stars ? 'fas fa-star' : 'far fa-star';
            reliability.appendChild(star);
        }
    }
    
    // Update track record
    if (trackRecord) {
        let status = 'Excellent';
        if (result.score < 50) status = 'Poor';
        else if (result.score < 70) status = 'Fair';
        else if (result.score < 85) status = 'Good';
        
        trackRecord.textContent = status;
        trackRecord.style.color = result.score >= 70 ? 'var(--success-green)' : 
                                   result.score >= 50 ? 'var(--warning-yellow)' : 'var(--danger-red)';
    }
    
    // Update source info
    if (sourceInfo) {
        sourceInfo.innerHTML = `
            <p><strong>${result.domain}</strong></p>
            <p>${result.description || 'Source credibility assessed based on available data.'}</p>
            ${result.inDatabase ? '<p style="color: var(--success-green); margin-top: 10px;"><i class="fas fa-check-circle"></i> Verified in our database</p>' : '<p style="color: var(--text-muted); margin-top: 10px;"><i class="fas fa-info-circle"></i> Estimated credibility (not in database)</p>'}
        `;
    }
}

// ============================================
// IMAGE VERIFICATION
// ============================================

function initImageVerification() {
    const imageUploadZone = document.getElementById('imageUploadZone');
    const imageInput = document.getElementById('imageInput');
    const imageUrlInput = document.getElementById('imageUrlInput');
    const fetchImageBtn = document.getElementById('fetchImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImageBtn = document.getElementById('removeImage');
    const verifyImageBtn = document.getElementById('verifyImageBtn');
    const imageResults = document.getElementById('imageResults');
    
    let currentImageData = null;
    
    // Drag and drop
    if (imageUploadZone) {
        imageUploadZone.addEventListener('click', () => imageInput?.click());
        
        imageUploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageUploadZone.style.borderColor = 'var(--neon-cyan)';
            imageUploadZone.style.background = 'rgba(0, 212, 255, 0.1)';
        });
        
        imageUploadZone.addEventListener('dragleave', () => {
            imageUploadZone.style.borderColor = 'var(--border-color)';
            imageUploadZone.style.background = 'transparent';
        });
        
        imageUploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUploadZone.style.borderColor = 'var(--border-color)';
            imageUploadZone.style.background = 'transparent';
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImageFile(file);
            } else {
                showToast('Invalid File', 'Please upload an image file', 'error');
            }
        });
    }
    
    // File input
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleImageFile(file);
            }
        });
    }
    
    // Fetch from URL
    if (fetchImageBtn && imageUrlInput) {
        fetchImageBtn.addEventListener('click', () => {
            const url = imageUrlInput.value.trim();
            
            if (!url || !isValidURL(url)) {
                showToast('Invalid URL', 'Please enter a valid image URL', 'error');
                return;
            }
            
            handleImageURL(url);
        });
    }
    
    // Remove image
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            currentImageData = null;
            imagePreview.style.display = 'none';
            previewImg.src = '';
            verifyImageBtn.disabled = true;
            imageResults.style.display = 'none';
            if (imageInput) imageInput.value = '';
            if (imageUrlInput) imageUrlInput.value = '';
            showToast('Image Removed', 'You can upload another image', 'success');
        });
    }
    
    // Verify image
    if (verifyImageBtn) {
        verifyImageBtn.addEventListener('click', async () => {
            if (!currentImageData) {
                showToast('No Image', 'Please upload an image first', 'error');
                return;
            }
            
            const options = {
                checkManipulation: document.getElementById('checkManipulation')?.checked ?? true,
                checkAIGenerated: document.getElementById('checkAIGenerated')?.checked ?? true,
                reverseSearch: document.getElementById('reverseSearch')?.checked ?? true,
                checkDeepfake: document.getElementById('checkDeepfake')?.checked ?? false
            };
            
            await verifyImage(currentImageData, options);
        });
    }
    
    function handleImageFile(file) {
        if (file.size > 10 * 1024 * 1024) {
            showToast('File Too Large', 'Please upload an image smaller than 10MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            currentImageData = e.target.result;
            previewImg.src = currentImageData;
            imagePreview.style.display = 'block';
            verifyImageBtn.disabled = false;
            imageResults.style.display = 'none';
            showToast('Image Loaded', 'Ready for verification', 'success');
        };
        reader.readAsDataURL(file);
    }
    
    function handleImageURL(url) {
        currentImageData = url;
        previewImg.src = url;
        previewImg.onload = () => {
            imagePreview.style.display = 'block';
            verifyImageBtn.disabled = false;
            imageResults.style.display = 'none';
            showToast('Image Loaded', 'Ready for verification', 'success');
        };
        previewImg.onerror = () => {
            showToast('Load Failed', 'Unable to load image from URL', 'error');
            currentImageData = null;
        };
    }
}

async function verifyImage(imageData, options) {
    const verifyImageBtn = document.getElementById('verifyImageBtn');
    const imageResults = document.getElementById('imageResults');
    
    verifyImageBtn.classList.add('loading');
    verifyImageBtn.disabled = true;
    
    showLoading('AI analyzing image...');
    
    try {
        const result = await truthLensAI.verifyImage(imageData, options);
        
        displayImageResults(result);
        imageResults.style.display = 'block';
        
        setTimeout(() => {
            imageResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
        
        hideLoading();
        showToast('Verification Complete', `Authenticity: ${result.authenticityScore}%`, 'success');
        
    } catch (error) {
        console.error('Image verification error:', error);
        hideLoading();
        showToast('Verification Failed', 'An error occurred. Please try again.', 'error');
    } finally {
        verifyImageBtn.classList.remove('loading');
        verifyImageBtn.disabled = false;
    }
}

function displayImageResults(result) {
    // Update score cards
    const manipulationScore = document.getElementById('manipulationScore');
    const aiGenScore = document.getElementById('aiGenScore');
    const deepfakeScore = document.getElementById('deepfakeScore');
    
    if (manipulationScore && result.manipulation) {
        manipulationScore.textContent = `${Math.round(result.manipulation.score)}%`;
    }
    
    if (aiGenScore && result.aiGenerated) {
        aiGenScore.textContent = `${Math.round(result.aiGenerated.score)}%`;
    }
    
    if (deepfakeScore && result.deepfake) {
        deepfakeScore.textContent = `${Math.round(result.deepfake.score)}%`;
    }
    
    // Update origin timeline
    const originTimeline = document.getElementById('originTimeline');
    if (originTimeline && result.reverseSearch) {
        originTimeline.innerHTML = '';
        
        if (result.reverseSearch.found && result.reverseSearch.matches) {
            result.reverseSearch.matches.forEach(match => {
                const item = document.createElement('div');
                item.className = 'timeline-item';
                item.innerHTML = `
                    <div class="timeline-date">${match.date || 'Unknown'}</div>
                    <div class="timeline-content">
                        <div class="timeline-title">${match.title}</div>
                        <div class="timeline-desc">
                            Found at: <a href="${match.url}" target="_blank">${match.url}</a><br>
                            Similarity: ${match.similarity}%
                        </div>
                    </div>
                `;
                originTimeline.appendChild(item);
            });
        } else {
            originTimeline.innerHTML = '<p class="loading-text">No previous instances found online</p>';
        }
    }
    
    // Update similar images
    const similarImages = document.getElementById('similarImages');
    if (similarImages) {
        similarImages.innerHTML = '<p class="loading-text">Reverse image search results would appear here in production</p>';
    }
}

// ============================================
// LIVE FACT-CHECK
// ============================================

function initLiveFactCheck() {
    const liveCheckToggle = document.getElementById('liveCheckToggle');
    const liveContent = document.getElementById('liveContent');
    const flaggedList = document.getElementById('flaggedList');
    const flagCount = document.getElementById('flagCount');
    
    let debounceTimer;
    let flaggedClaims = [];
    
    if (liveCheckToggle) {
        liveCheckToggle.addEventListener('change', (e) => {
            AppState.liveCheckEnabled = e.target.checked;
            
            if (e.target.checked) {
                showToast('Live Check Enabled', 'AI will scan content as you type', 'success');
                if (liveContent && liveContent.textContent.trim()) {
                    performLiveCheck();
                }
            } else {
                showToast('Live Check Disabled', 'Real-time scanning paused', 'warning');
            }
        });
    }
    
    if (liveContent) {
        liveContent.addEventListener('input', () => {
            if (AppState.liveCheckEnabled) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(performLiveCheck, 1500);
            }
        });
    }
    
    async function performLiveCheck() {
        const text = liveContent.textContent.trim();
        
        if (!text || text.length < 50) {
            flaggedClaims = [];
            updateFlaggedList();
            return;
        }
        
        // Extract and check claims
        const claims = truthLensAI.extractClaims(text);
        flaggedClaims = [];
        
        claims.forEach((claim, index) => {
            // Check for suspicious patterns
            let suspicionScore = 0;
            let reasons = [];
            
            // Check clickbait
            truthLensAI.fakeNewsIndicators.clickbait.forEach(pattern => {
                if (pattern.test(claim)) {
                    suspicionScore += 20;
                    reasons.push('Clickbait language');
                }
            });
            
            // Check conspiracy
            truthLensAI.fakeNewsIndicators.conspiracy.forEach(pattern => {
                if (pattern.test(claim)) {
                    suspicionScore += 30;
                    reasons.push('Conspiracy rhetoric');
                }
            });
            
            // Check sensationalism
            truthLensAI.fakeNewsIndicators.sensationalism.forEach(pattern => {
                if (pattern.test(claim)) {
                    suspicionScore += 25;
                    reasons.push('Sensationalist wording');
                }
            });
            
            if (suspicionScore > 20) {
                flaggedClaims.push({
                    claim,
                    score: suspicionScore,
                    reasons: [...new Set(reasons)]
                });
            }
        });
        
        updateFlaggedList();
    }
    
    function updateFlaggedList() {
        if (!flaggedList || !flagCount) return;
        
        flagCount.textContent = flaggedClaims.length;
        
        if (flaggedClaims.length === 0) {
            flaggedList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shield-check"></i>
                    <p>No suspicious claims detected yet</p>
                </div>
            `;
        } else {
            flaggedList.innerHTML = '';
            flaggedClaims.forEach((flagged, index) => {
                const item = document.createElement('div');
                item.className = 'flag-item';
                item.innerHTML = `
                    <div class="flag-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="flag-content">
                        <strong>Suspicious Claim #${index + 1}</strong>
                        <p class="flag-text">"${flagged.claim}"</p>
                        <p class="flag-text" style="color: var(--warning-yellow); font-size: 0.85rem;">
                            Issues: ${flagged.reasons.join(', ')}
                        </p>
                    </div>
                `;
                flaggedList.appendChild(item);
            });
        }
    }
}

// ============================================
// NEWS FEED
// ============================================

function initNewsFeed() {
    const topicSelect = document.getElementById('topicSelect');
    const refreshFeed = document.getElementById('refreshFeed');
    
    if (topicSelect) {
        topicSelect.addEventListener('change', loadNewsFeed);
    }
    
    if (refreshFeed) {
        refreshFeed.addEventListener('click', () => {
            refreshFeed.style.transform = 'rotate(360deg)';
            refreshFeed.style.transition = 'transform 0.5s ease';
            setTimeout(() => {
                refreshFeed.style.transform = 'rotate(0deg)';
            }, 500);
            loadNewsFeed();
        });
    }
    
    // Initial load
    loadNewsFeed();
}

async function loadNewsFeed() {
    const leftNews = document.getElementById('leftNews');
    const centerNews = document.getElementById('centerNews');
    const rightNews = document.getElementById('rightNews');
    const topicSelect = document.getElementById('topicSelect');
    
    const topic = topicSelect?.value || 'all';
    
    // Show loading
    [leftNews, centerNews, rightNews].forEach(container => {
        if (container) {
            container.innerHTML = '<p class="loading-text">Loading news...</p>';
        }
    });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock news data
    const mockNews = {
        left: [
            {
                source: 'Progressive Daily',
                title: 'Climate Action Sees Major Progress in Renewable Energy Adoption',
                snippet: 'New data shows significant increase in solar and wind power installations across the nation.',
                time: '2 hours ago',
                trust: 'high',
                url: '#'
            },
            {
                source: 'Liberal Times',
                title: 'Healthcare Reform Proposal Gains Support Among Advocates',
                snippet: 'Experts argue the new system could provide coverage for millions of uninsured citizens.',
                time: '4 hours ago',
                trust: 'medium',
                url: '#'
            }
        ],
        center: [
            {
                source: 'Reuters',
                title: 'Economic Indicators Show Mixed Signals for Q4',
                snippet: 'Analysts present varied interpretations of recent employment and inflation data.',
                time: '1 hour ago',
                trust: 'high',
                url: '#'
            },
            {
                source: 'Associated Press',
                title: 'Technology Giants Face New Regulatory Scrutiny',
                snippet: 'Bipartisan concerns emerge over data privacy and market competition practices.',
                time: '3 hours ago',
                trust: 'high',
                url: '#'
            }
        ],
        right: [
            {
                source: 'Conservative Review',
                title: 'Tax Reform Advocates Push for Simplified Code',
                snippet: 'Business leaders call for reduced regulatory burden to stimulate economic growth.',
                time: '2 hours ago',
                trust: 'medium',
                url: '#'
            },
            {
                source: 'National Observer',
                title: 'Traditional Values Groups Express Concerns Over Policy Changes',
                snippet: 'Community organizations voice opinions on recent legislative developments.',
                time: '5 hours ago',
                trust: 'medium',
                url: '#'
            }
        ]
    };
    
    // Populate feeds
    if (leftNews) renderNewsCards(leftNews, mockNews.left);
    if (centerNews) renderNewsCards(centerNews, mockNews.center);
    if (rightNews) renderNewsCards(rightNews, mockNews.right);
}

function renderNewsCards(container, newsItems) {
    container.innerHTML = '';
    
    newsItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <div class="news-meta">
                <span class="news-source">${item.source}</span>
                <span>${item.time}</span>
            </div>
            <h4 class="news-title">${item.title}</h4>
            <p class="news-snippet">${item.snippet}</p>
            <div class="news-footer">
                <div class="trust-score">
                    <div class="trust-indicator ${item.trust}"></div>
                    <span>${capitalizeFirst(item.trust)} Trust</span>
                </div>
                <a href="${item.url}" class="read-more">Read More →</a>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('read-more')) {
                showToast('News Preview', 'Full article would open here', 'success');
            }
        });
        
        container.appendChild(card);
    });
}

// ============================================
// HOT TOPICS
// ============================================

function initHotTopics() {
    loadHotTopics();
}

async function loadHotTopics() {
    const radarGrid = document.getElementById('radarGrid');
    
    if (!radarGrid) return;
    
    radarGrid.innerHTML = '<p class="loading-text">Scanning trending topics...</p>';
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockTopics = [
        {
            title: 'Artificial Intelligence Regulation',
            risk: 'medium',
            mentions: 15420,
            sources: 247,
            description: 'Ongoing debate about AI safety standards and governance frameworks across multiple countries.'
        },
        {
            title: 'Climate Summit Agreements',
            risk: 'low',
            mentions: 8932,
            sources: 189,
            description: 'International leaders discuss emission reduction targets and renewable energy commitments.'
        },
        {
            title: 'Cryptocurrency Market Volatility',
            risk: 'high',
            mentions: 22156,
            sources: 312,
            description: 'Significant price fluctuations spark debates about digital currency regulation and stability.'
        },
        {
            title: 'Healthcare System Reforms',
            risk: 'medium',
            mentions: 11245,
            sources: 201,
            description: 'Proposed changes to healthcare delivery and insurance coverage generate public discussion.'
        },
        {
            title: 'Space Exploration Milestones',
            risk: 'low',
            mentions: 6723,
            sources: 143,
            description: 'Recent achievements in space technology and upcoming missions capture public interest.'
        },
        {
            title: 'Election Security Measures',
            risk: 'high',
            mentions: 18934,
            sources: 276,
            description: 'Discussions intensify around voting systems, verification processes, and electoral integrity.'
        }
    ];
    
    radarGrid.innerHTML = '';
    
    mockTopics.forEach(topic => {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.innerHTML = `
            <div class="topic-header">
                <h4 class="topic-title">${topic.title}</h4>
                <span class="risk-badge ${topic.risk}">${topic.risk.toUpperCase()}</span>
            </div>
            <div class="topic-stats">
                <span><i class="fas fa-comment"></i> ${topic.mentions.toLocaleString()} mentions</span>
                <span><i class="fas fa-newspaper"></i> ${topic.sources} sources</span>
            </div>
            <p class="topic-description">${topic.description}</p>
        `;
        
        card.addEventListener('click', () => {
            showToast('Topic Analysis', `Analyzing "${topic.title}"...`, 'success');
        });
        
        radarGrid.appendChild(card);
    });
}

// ============================================
// HISTORY
// ============================================

function initHistory() {
    const historySearch = document.getElementById('historySearch');
    const clearHistory = document.getElementById('clearHistory');
    
    if (historySearch) {
        historySearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            renderHistory(query);
        });
    }
    
    if (clearHistory) {
        clearHistory.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all history?')) {
                AppState.analysisHistory = [];
                AppState.saveHistory();
                renderHistory();
                showToast('History Cleared', 'All analysis history has been removed', 'success');
            }
        });
    }
    
    // Initial render
    renderHistory();
}

function renderHistory(searchQuery = '') {
    const historyGrid = document.getElementById('historyGrid');
    
    if (!historyGrid) return;
    
    let items = AppState.analysisHistory;
    
    // Filter by search query
    if (searchQuery) {
        items = items.filter(item => 
            item.content?.toLowerCase().includes(searchQuery) ||
            item.url?.toLowerCase().includes(searchQuery)
        );
    }
    
    if (items.length === 0) {
        historyGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; padding: 60px; text-align: center;">
                <i class="fas fa-history" style="font-size: 4rem; color: var(--text-muted); opacity: 0.3; margin-bottom: 20px;"></i>
                <p style="color: var(--text-muted);">
                    ${searchQuery ? 'No results found' : 'No analysis history yet. Start verifying content!'}
                </p>
            </div>
        `;
        return;
    }
    
    historyGrid.innerHTML = '';
    
    items.slice(0, 20).forEach(item => {
        const card = document.createElement('div');
        card.className = 'history-card';
        
        const date = new Date(item.timestamp);
        const timeAgo = getTimeAgo(date);
        
        card.innerHTML = `
            <div class="history-icon">
                <i class="fas fa-${item.type === 'image' ? 'image' : 'file-text'}"></i>
            </div>
            <div class="history-content">
                <div class="history-title">${item.type === 'image' ? 'Image Verification' : 'News Analysis'}</div>
                <div class="history-desc">${item.content || item.url || 'No description'}</div>
                <div class="history-meta">
                    <span><i class="fas fa-clock"></i> ${timeAgo}</span>
                </div>
            </div>
            <div class="history-result">
                <div class="result-percentage">${item.result.truthPercentage}%</div>
                <div class="result-label">${item.result.verdict}</div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            showToast('History Item', 'Full details would be displayed here', 'success');
        });
        
        historyGrid.appendChild(card);
    });
}

// ============================================
// THEME TOGGLE
// ============================================

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // Currently only dark theme implemented
            showToast('Theme', 'Additional themes coming soon!', 'success');
        });
    }
}

// ============================================
// PARTICLES ANIMATION
// ============================================

function initParticles() {
    const particlesContainer = document.getElementById('particles');
    
    if (!particlesContainer) return;
    
    // Particles are handled by CSS animations
    // This function can be expanded for more complex particle systems
}

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================

let toastContainer;

function initToastSystem() {
    toastContainer = document.getElementById('toastContainer');
}

function showToast(title, message, type = 'success') {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type] || icons.info}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => removeToast(toast), 5000);
}

function removeToast(toast) {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 300);
}

// ============================================
// LOADING OVERLAY
// ============================================

function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const loaderText = overlay?.querySelector('.loader-text');
    
    if (overlay) {
        overlay.style.display = 'flex';
        if (loaderText) loaderText.textContent = message;
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe feature panels
    document.querySelectorAll('.feature-panel').forEach(panel => {
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(30px)';
        panel.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(panel);
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function animateNumber(element, start, end, duration) {
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = Math.round(end);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied!', 'Text copied to clipboard', 'success');
        });
    } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied!', 'Text copied to clipboard', 'success');
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K - Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const newsInput = document.getElementById('newsInput');
        if (newsInput) newsInput.focus();
    }
    
    // Escape - Close modals/results
    if (e.key === 'Escape') {
        const resultsContainer = document.getElementById('resultsContainer');
        if (resultsContainer && resultsContainer.style.display !== 'none') {
            resultsContainer.style.display = 'none';
        }
    }
});

// ============================================
// SERVICE WORKER (Optional - for PWA)
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable PWA features
        // navigator.serviceWorker.register('/sw.js').then(registration => {
        //     console.log('SW registered:', registration);
        // }).catch(err => {
        //     console.log('SW registration failed:', err);
        // });
    });
}

// ============================================
// EXPORT FUNCTIONS FOR GLOBAL ACCESS
// ============================================

window.TruthLensApp = {
    analyzeNews: analyzeNewsContent,
    verifyImage,
    showToast,
    scrollToSection,
    AppState
};

console.log('%c Truth Lens v2.0.1 ', 'background: #00d4ff; color: #0a0e17; font-weight: bold; padding: 10px;');
console.log('%c Protecting Truth in the Digital Age ', 'color: #00d4ff; font-style: italic;');