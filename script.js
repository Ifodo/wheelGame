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
    // Initialize DOM elements
    initializeDOMElements();
    
    // Initialize wheel
    initializeWheel();
    wheelInitialized = true;
    
    // Set up spin button click handler
    document.getElementById('spin-button').addEventListener('click', startSpin);
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === resultModal) {
            hideModal(resultModal);
        }
        if (event.target === wheelModal) {
            hideModal(wheelModal);
        }
    });
});

// Function to show modal with animation
function showModal(modal) {
    modal.style.display = 'flex';
    // Trigger reflow
    void modal.offsetHeight;
    modal.classList.add('show');
}

// Function to hide modal with animation
function hideModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // Match the CSS transition duration
}

function initializeWheel() {
    theWheel = new Winwheel({
        'canvasId'       : 'wheel-canvas',
        'outerRadius'    : 200,        // Outer radius
        'innerRadius'    : 35,         // Inner radius
        'textFontSize'   : 14,         // Font size
        'textOrientation': 'horizontal', // Changed to horizontal
        'textAlignment'  : 'center',    // Center align the text
        'textMargin'     : 20,         // Margin for text
        'rotationAngle'  : 22.5,       // Rotate wheel so text is more centered in segments
        'numSegments'    : 8,          // Number of segments
        'segments'       : [           // Define segments
            {'fillStyle' : '#FF4B4B', 'text' : 'Free Property\nValuation', 'textFontFamily': 'Arial', 'textFillStyle': '#FFFFFF'},
            {'fillStyle' : '#4BB4FF', 'text' : '5% Agency\nFees Discount', 'textFontFamily': 'Arial', 'textFillStyle': '#FFFFFF'},
            {'fillStyle' : '#FF9E4B', 'text' : 'Free\nE-book', 'textFontFamily': 'Arial', 'textFillStyle': '#FFFFFF'},
            {'fillStyle' : '#4BFF91', 'text' : 'VIP Property\nTour', 'textFontFamily': 'Arial', 'textFillStyle': '#FFFFFF'},
            {'fillStyle' : '#025940', 'text' : 'Raffle\nEntry', 'textFontFamily': 'Arial', 'textFillStyle': '#FFFFFF'},
            {'fillStyle' : '#4BFF91', 'text' : 'N100k\nGift Card', 'textFontFamily': 'Arial', 'textFillStyle': '#FFFFFF'},
            {'fillStyle' : '#FF4B4B', 'text' : 'Priority\nAccess', 'textFontFamily': 'Arial', 'textFillStyle': '#FFFFFF'},
            {'fillStyle' : '#FF9E4B', 'text' : 'Try\nAgain', 'textFontFamily': 'Arial', 'textFillStyle': '#FFFFFF'}
        ],
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
    // Stop and rewind the sound if it already happens to be playing
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.play();
    }
}

// Show the result modal
function showResult(indicatedSegment) {
    spinning = false;
    document.getElementById('spin-button').disabled = false;

    // Get the prize details
    const prizeText = indicatedSegment.text.replace('\n', ' ');
    
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
        
        if (prizeText.toLowerCase().includes('try again')) {
            modalContent.innerHTML = `
                <h2>Another Chance! 🎲</h2>
                <p>You've got another chance to win amazing prizes!</p>
                <button onclick="retryWheel()" class="claim-btn">
                    <i class="fas fa-redo"></i> Spin Again
                </button>
            `;
        } else {
            modalContent.innerHTML = `
                <h2>Congratulations! 🎉</h2>
                <p>You've won: <span class="prize-text">${prizeText}</span></p>
                <button onclick="handleClaim('${prizeText}')" class="claim-btn">
                    <i class="fas fa-gift"></i> Claim Prize
                </button>
            `;

            // Trigger confetti effect for wins
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FF4B4B', '#4BB4FF', '#4BFF91', '#FFD700']
            });
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
        
        // Reset the wheel for another spin
        for (let i = 1; i <= theWheel.numSegments; i++) {
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
    
    // Close the modal
    hideModal(resultModal);
    
    alert('Congratulations! You can claim your prize by contacting our support team.');
}

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