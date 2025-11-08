// Special prizes with short and full descriptions
const specialPrizes = [
    {
        short: 'Décor\nMoodboard',
        full: 'Personalised Home Décor Moodboard - Get a custom-designed mood board for your dream home interior!'
    },
    {
        short: 'AI Home\nBlueprint',
        full: 'My Dream Home AI Blueprint Generator - Visualize your perfect home with our AI-powered blueprint creator!'
    },
    {
        short: 'Investment\nStarter Kit',
        full: 'Property Investment Starter Kit - Digital Pack + ₦50k Voucher to kickstart your real estate journey!'
    },
    {
        short: 'Coaching\nSession',
        full: '1-on-1 Real Estate Coaching Session - Personal guidance from our expert property consultants!'
    },
    {
        short: 'Free\nPhotoshoot',
        full: 'Free Professional Photoshoot - Capture your new home purchased through our platform in stunning detail!'
    }
];

// Shuffle special prizes on page load
function shuffleSpecialPrizes() {
    for (let i = specialPrizes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [specialPrizes[i], specialPrizes[j]] = [specialPrizes[j], specialPrizes[i]];
    }
}

// Property tips categories and content
const propertyTips = {
    investment: [
        'High ROI Areas:\nCheck Growth Zones',
        'Rental Yield:\nAnalyze Returns',
        'Market Timing:\nBest Buy Period',
        'Property Type:\nMatch Market Need',
        'Value Add:\nUpgrade Options'
    ],
    inspection: [
        'Check Drainage:\nRainy Season Ready',
        'Visit Different\nTimes of Day',
        'Neighborhood:\nSafety Check',
        'Power Supply:\nBackup Options',
        'Water Source:\nReliability Test'
    ],
    legal: [
        'Title Check:\nVerify Status',
        'Land Use:\nZoning Rules',
        'Survey Plan:\nConfirm Bounds',
        'C of O Status:\nVerify Now',
        'Building Plan:\nApproval Check'
    ],
    financial: [
        'Hidden Costs:\nBe Prepared',
        'Payment Plan:\nFlexible Terms',
        'Mortgage Rate:\nCompare Banks',
        'Tax Benefits:\nKnow Your Rights',
        'Insurance:\nProtect Asset'
    ],
    location: [
        'Schools Nearby:\nQuality Check',
        'Transport Links:\nAccessibility',
        'Future Projects:\nArea Growth',
        'Social Amenities:\nConvenience',
        'Work Distance:\nCommute Time'
    ],
    negotiation: [
        'Market Price:\nResearch First',
        'Comp Sales:\nKnow Values',
        'Offer Strategy:\nBe Smart',
        'Terms Power:\nLeverage Well',
        'Agent Tips:\nPro Insights'
    ]
};

// Function to get random property tip
function getRandomPropertyTip() {
    // Get random category
    const categories = Object.keys(propertyTips);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Get random tip from category
    const categoryTips = propertyTips[randomCategory];
    return categoryTips[Math.floor(Math.random() * categoryTips.length)];
}

let currentSpecialPrizeIndex = 0;

// Function to get the next special prize
function getNextSpecialPrize() {
    const prize = specialPrizes[currentSpecialPrizeIndex];
    currentSpecialPrizeIndex = (currentSpecialPrizeIndex + 1) % specialPrizes.length;
    return prize.short;
}

// Function to get full prize description
function getFullPrizeDescription(shortText) {
    const prize = specialPrizes.find(p => p.short === shortText);
    return prize ? prize.full : shortText;
}

// Function to get random property tip
function getRandomPropertyTip() {
    // Get random category
    const categories = Object.keys(propertyTips);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Get random tip from category
    const categoryTips = propertyTips[randomCategory];
    return categoryTips[Math.floor(Math.random() * categoryTips.length)];
}

// Analytics tracking
const analytics = {
    totalSpins: parseInt(localStorage.getItem('totalSpins') || '0'),
    prizeStats: JSON.parse(localStorage.getItem('prizeStats') || '{}'),
    conversions: parseInt(localStorage.getItem('conversions') || '0')
};

// Wheel configuration
let theWheel = null;

// Variables
let spinning = false;
let wheelInitialized = false;
let resultModal = null;
let wheelModal = null;
let container = null;
let audio = null;

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Shuffle special prizes on load
    shuffleSpecialPrizes();
    
    // Initialize DOM elements
    initializeDOMElements();
    
    // Initialize wheel
    initializeWheel();
    wheelInitialized = true;
    
    // Set up spin button handlers (both click and touch)
    const spinButton = document.getElementById('spin-button');
    spinButton.addEventListener('click', startSpin);
    spinButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        startSpin();
    });
    
    // Close modals when clicking/tapping outside
    window.addEventListener('click', (event) => {
        if (event.target === resultModal) {
            hideModal(resultModal);
        }
        if (event.target === wheelModal) {
            hideModal(wheelModal);
        }
    });
    
    // Recalculate wheel on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (theWheel && !spinning) {
                initializeWheel();
            }
        }, 250);
    });
    
    // Prevent double-tap zoom on mobile
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Prevent pull-to-refresh on mobile
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        if (window.scrollY === 0 && e.touches[0].clientY > touchStartY) {
            e.preventDefault();
        }
    }, { passive: false });
});

// Function to show modal with animation
function showModal(modal) {
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    // Trigger reflow
    void modal.offsetHeight;
    modal.classList.add('show');
}

// Function to hide modal with animation
function hideModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }, 300); // Match the CSS transition duration
}

function updatePrizeSectorDisplay(sectorNumber) {
    const prizeSectorElement = document.getElementById('prize-sector');
    if (prizeSectorElement) {
        prizeSectorElement.textContent = sectorNumber;
    }
}

function initializeWheel() {
    // Get canvas element and calculate responsive size
    const canvas = document.getElementById('wheel-canvas');
    const container = canvas.parentElement;
    
    // Calculate responsive dimensions
    let wheelSize, outerRadius, innerRadius, fontSize, textMargin;
    
    if (window.innerWidth <= 480) {
        // Small mobile devices
        wheelSize = Math.min(window.innerWidth * 0.85, 320);
        outerRadius = wheelSize / 2.1;
        innerRadius = wheelSize / 12;
        fontSize = 11;
        textMargin = 15;
    } else if (window.innerWidth <= 768) {
        // Tablets and larger phones
        wheelSize = Math.min(window.innerWidth * 0.9, 380);
        outerRadius = wheelSize / 2.1;
        innerRadius = wheelSize / 11;
        fontSize = 12;
        textMargin = 18;
    } else {
        // Desktop
        wheelSize = 420;
        outerRadius = 200;
        innerRadius = 35;
        fontSize = 14;
        textMargin = 20;
    }
    
    // Set canvas size
    canvas.width = wheelSize;
    canvas.height = wheelSize;
    canvas.style.width = wheelSize + 'px';
    canvas.style.height = wheelSize + 'px';
    
    // Randomly choose which sector will have the special prize (1-8)
    const specialPrizeSector = Math.floor(Math.random() * 8) + 1;
    updatePrizeSectorDisplay(specialPrizeSector);
    
    // Get the initial special prize
    const specialPrize = getNextSpecialPrize();
    
    // Create segments array with the special prize in the random sector
    const segments = new Array(8).fill(null).map((_, index) => {
        const sectorNum = index + 1;
        if (sectorNum === specialPrizeSector) {
            return {
                'fillStyle' : '#FF4B4B',
                'text' : `${sectorNum}. ${specialPrize}`,
                'textFontFamily': 'Arial',
                'textFillStyle': '#FFFFFF',
                'isSpecialPrize': true
            };
        }
        return {
            'fillStyle' : ['#4BB4FF', '#FF9E4B', '#4BFF91', '#025940', '#4BFF91', '#FF4B4B', '#FF9E4B'][index % 7],
            'text' : `${sectorNum}. ${getRandomPropertyTip()}`,
            'textFontFamily': 'Arial',
            'textFillStyle': '#FFFFFF'
        };
    });

    theWheel = new Winwheel({
        'canvasId'       : 'wheel-canvas',
        'outerRadius'    : outerRadius,
        'innerRadius'    : innerRadius,
        'textFontSize'   : fontSize,
        'textOrientation': 'horizontal',
        'textAlignment'  : 'center',
        'textMargin'     : textMargin,
        'rotationAngle'  : 22.5,
        'numSegments'    : 8,
        'segments'       : segments,
        'animation' : {
            'type'     : 'spinToStop',
            'duration' : 5,
            'spins'    : 8,
            'easing'   : 'Power4.easeOut',
            'callbackFinished' : showResult,
            'callbackSound'    : playSound,
            'soundTrigger'     : 'pin'
        },
        'pins' : {
            'number'     : 16,
            'fillStyle'  : 'silver',
            'outerRadius': 3,
            'responsive' : true
        }
    });

    // Draw the wheel initially
    theWheel.draw();
}

// Function to highlight winning segment
function highlightSegment(segmentNumber) {
    // First restore all segments to their original state
    for (let i = 1; i <= theWheel.numSegments; i++) {
        theWheel.segments[i].fillStyle = theWheel.segments[i].originalFillStyle || theWheel.segments[i].fillStyle;
    }
    
    // Store original color if not already stored
    if (!theWheel.segments[segmentNumber].originalFillStyle) {
        theWheel.segments[segmentNumber].originalFillStyle = theWheel.segments[segmentNumber].fillStyle;
    }
    
    // Add a bright glow effect to the winning segment
    theWheel.segments[segmentNumber].fillStyle = '#FFD700'; // Golden color
    
    // Draw the wheel again to show the changes
    theWheel.draw();
}

// Initialize DOM elements
function initializeDOMElements() {
    resultModal = document.getElementById('result-modal');
    wheelModal = document.getElementById('wheel-modal');
    container = document.querySelector('.container');
    audio = document.getElementById('tick-sound');

    // Set up wheel modal controls
    document.getElementById('open-wheel-btn').addEventListener('click', () => {
        showModal(wheelModal);
    });

    // Close button functionality
    document.querySelector('.close-btn').addEventListener('click', () => {
        hideModal(wheelModal);
    });

    // Set up spin button
    document.getElementById('spin-button').addEventListener('click', startSpin);
}

// Function to handle spinning
function startSpin() {
    if (spinning) return;
    
    spinning = true;
    const spinButton = document.getElementById('spin-button');
    spinButton.disabled = true;
    
    // Stop any currently playing audio
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    
    // Reset all segments to their original colors before spinning
    for (let i = 1; i <= theWheel.numSegments; i++) {
        if (theWheel.segments[i].originalFillStyle) {
            theWheel.segments[i].fillStyle = theWheel.segments[i].originalFillStyle;
        }
    }
    theWheel.draw();
    
    // Reset animation parameters for consistent speed
    theWheel.animation.spins = 8;
    theWheel.animation.duration = 5;
    theWheel.animation.easing = 'Power4.easeOut';
    
    // Calculate a random stop angle and number of spins
    let stopAt = Math.floor(Math.random() * 360);
    
    // Important! Set the stopAngle of the animation before starting the spin
    theWheel.animation.stopAngle = stopAt;
    
    // Reset the wheel rotation before spinning again
    theWheel.rotationAngle = 0;
    
    // Start the spin animation
    theWheel.startAnimation();
}

// Play the tick sound
function playSound() {
    if (audio) {
        audio.currentTime = 0;
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Audio playback failed:', error);
            });
        }
    }
}

// Show the result modal
function showResult(indicatedSegment) {
    spinning = false;
    document.getElementById('spin-button').disabled = false;
    
    // Stop the audio
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }

    // Get the prize details
    const prizeText = indicatedSegment.text.replace('\n', ' ');
    // Remove the number prefix for display
    const displayText = prizeText.replace(/^\d+\.\s+/, '');
    
    // Update analytics
    updateAnalytics(prizeText);

    // Highlight the winning segment
    highlightSegment(theWheel.getIndicatedSegmentNumber());

    // Add a delay before showing the result modal to let users see the highlighted segment
    setTimeout(() => {
        // Hide wheel modal and show result modal
        hideModal(wheelModal);

        // Show different content based on the result
        const modalContent = document.querySelector('#result-modal .modal-content');
        
        if (indicatedSegment.isSpecialPrize) {
            const fullPrizeText = getFullPrizeDescription(indicatedSegment.text);
            // Escape HTML and quotes for safe display
            const escapedPrizeText = fullPrizeText.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
            modalContent.innerHTML = `
                <h2>🌟 Special Prize Won! 🌟</h2>
                <p>Congratulations! You've won our featured prize:</p>
                <p class="prize-text">${escapedPrizeText}</p>
                <button class="claim-btn" data-prize="${escapedPrizeText.replace(/"/g, '&quot;')}">
                    <i class="fas fa-gift"></i> Claim Your Special Prize
                </button>
            `;
            
            // Attach event listener to the claim button
            setTimeout(() => {
                const claimBtn = modalContent.querySelector('.claim-btn');
                if (claimBtn) {
                    claimBtn.addEventListener('click', () => handleClaim(fullPrizeText));
                }
            }, 0);

            // Extra special confetti effect for special prizes
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FF4B4B', '#4BB4FF']
            });
        } else {
            // Find the category of the tip
            let tipCategory = '';
            for (const [category, tips] of Object.entries(propertyTips)) {
                if (tips.includes(indicatedSegment.text)) {
                    tipCategory = category.charAt(0).toUpperCase() + category.slice(1);
                    break;
                }
            }

            modalContent.innerHTML = `
                <h2>Property Insight! 💡</h2>
                <div class="tip-category">
                    <span class="category-label">${tipCategory} Tip</span>
                </div>
                <div class="tip-content">
                    <p class="prize-text">${displayText}</p>
                    <p class="tip-description">Use this tip to make better property decisions!</p>
                </div>
                <div class="tip-actions">
                    <button onclick="retryWheel()" class="claim-btn">
                        <i class="fas fa-redo"></i> Spin for More Tips
                    </button>
                    <a href="https://igethouse.ng" target="_blank" class="more-tips-btn">
                        <i class="fas fa-home"></i> Visit iGetHouse
                    </a>
                </div>
            `;
        }

        setTimeout(() => {
            showModal(resultModal);
        }, 300);
        
        updateAnalytics(prizeText);
    }, 1000);
}

// Function to handle retry
function retryWheel() {
    // Close the result modal
    hideModal(resultModal);
    
    // Show the wheel modal again after a short delay
    setTimeout(() => {
        showModal(wheelModal);
        
        // Choose new random sector for special prize
        const newSpecialPrizeSector = Math.floor(Math.random() * 8) + 1;
        updatePrizeSectorDisplay(newSpecialPrizeSector);
        
        // Remove special prize flag from all segments
        for (let i = 1; i <= theWheel.numSegments; i++) {
            delete theWheel.segments[i].isSpecialPrize;
        }
        
        // Update segments with new special prize location
        for (let i = 1; i <= theWheel.numSegments; i++) {
            if (i === newSpecialPrizeSector) {
                theWheel.segments[i].text = `${i}. ${getNextSpecialPrize()}`;
                theWheel.segments[i].isSpecialPrize = true;
            } else {
                theWheel.segments[i].text = `${i}. ${getRandomPropertyTip()}`;
            }
            
            // Reset colors
            if (theWheel.segments[i].originalFillStyle) {
                theWheel.segments[i].fillStyle = theWheel.segments[i].originalFillStyle;
            }
        }
        
        theWheel.draw();
    }, 300);
}

// Handle prize claim
function handleClaim(prize) {
    analytics.conversions++;
    localStorage.setItem('conversions', analytics.conversions.toString());
    
    // Clean and encode the prize text for WhatsApp URL
    // Replace newlines with spaces and clean up the text
    const cleanPrizeText = prize.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    const whatsappMessage = `Hi! I just won a prize from the iGetHouse Spin & Win game:\n\n${cleanPrizeText}\n\nPlease help me claim my prize.`;
    const encodedPrize = encodeURIComponent(whatsappMessage);
    
    // Escape HTML for safe display
    const escapedPrize = prize.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    
    // Update the modal content to show WhatsApp contacts
    const modalContent = document.querySelector('#result-modal .modal-content');
    modalContent.innerHTML = `
        <h2>Claim Your Prize! 🎁</h2>
        <p>Contact any of our representatives on WhatsApp to claim your prize:</p>
        
        <div class="whatsapp-contacts">
            <div class="contact-person">
                <strong>Miss Smart</strong><br>
                <span>Phone: +234 916 522 6722</span><br>
                <a href="https://wa.me/2349165226722?text=${encodedPrize}" target="_blank" class="whatsapp-btn" rel="noopener noreferrer">
                    <i class="fab fa-whatsapp"></i> Chat on WhatsApp
                </a>
            </div>
            
            <div class="contact-person">
                <strong>Olayinka Okunola</strong><br>
                <span>Phone: +234 812 853 2038</span><br>
                <a href="https://wa.me/2348128532038?text=${encodedPrize}" target="_blank" class="whatsapp-btn" rel="noopener noreferrer">
                    <i class="fab fa-whatsapp"></i> Chat on WhatsApp
                </a>
            </div>
        </div>
        
        <p class="prize-reminder">Your Prize: <span class="prize-text">${escapedPrize}</span></p>
        
        <button class="close-claim-btn">
            <i class="fas fa-times"></i> Close
        </button>
    `;
    
    // Attach event listener to close button
    setTimeout(() => {
        const closeBtn = modalContent.querySelector('.close-claim-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeClaimModal);
        }
    }, 0);
}

// Function to close the claim modal (made globally accessible)
function closeClaimModal() {
    hideModal(resultModal);
}

// Make function globally accessible
window.closeClaimModal = closeClaimModal;

// Update analytics
function updateAnalytics(prize) {
    analytics.totalSpins++;
    analytics.prizeStats[prize] = (analytics.prizeStats[prize] || 0) + 1;
    
    localStorage.setItem('totalSpins', analytics.totalSpins.toString());
    localStorage.setItem('prizeStats', JSON.stringify(analytics.prizeStats));
    
    console.log('Analytics Update:', {
        totalSpins: analytics.totalSpins,
        prizeStats: analytics.prizeStats,
        conversions: analytics.conversions
    });
} 