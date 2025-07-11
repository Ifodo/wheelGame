// Analytics tracking
const analytics = {
    totalSpins: parseInt(localStorage.getItem('totalSpins') || '0'),
    prizeStats: JSON.parse(localStorage.getItem('prizeStats') || '{}'),
    conversions: parseInt(localStorage.getItem('conversions') || '0')
};

// Wheel configuration
let theWheel = null;

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
            {'fillStyle' : '#f0f0f0', 'text' : 'Raffle\nEntry', 'textFontFamily': 'Arial', 'textFillStyle': '#000000'},
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

// Variables
let spinning = false;
let userDetails = null;
let wheelInitialized = false;
let resultModal = null;
let wheelModal = null;
let container = null;
let audio = null;

// Initialize DOM elements
function initializeDOMElements() {
    resultModal = document.getElementById('result-modal');
    wheelModal = document.getElementById('wheel-modal');
    container = document.querySelector('.container');
    audio = document.getElementById('tick-sound');

    // Set up wheel modal controls
    document.getElementById('open-wheel-btn').addEventListener('click', () => {
        wheelModal.style.display = 'block';
        if (!wheelInitialized) {
            initializeWheel();
            wheelInitialized = true;
        }
    });

    // Close button functionality
    document.querySelector('.close-btn').addEventListener('click', () => {
        wheelModal.style.display = 'none';
    });
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
        wheelModal.style.display = 'none';

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

        resultModal.style.display = 'block';

        if (userDetails) {
            storeLead(prizeText);
        }
    }, 1000);
}

// Function to handle retry
function retryWheel() {
    // Close the result modal
    resultModal.style.display = 'none';
    
    // Show the wheel modal again
    wheelModal.style.display = 'block';
    
    // Reset the wheel for another spin
    for (let i = 1; i <= theWheel.numSegments; i++) {
        if (theWheel.segments[i].originalFillStyle) {
            theWheel.segments[i].fillStyle = theWheel.segments[i].originalFillStyle;
        }
    }
    theWheel.draw();
}

// Handle prize claim
function handleClaim(prize) {
    analytics.conversions++;
    localStorage.setItem('conversions', analytics.conversions.toString());
    
    // Close the modal
    resultModal.style.display = 'none';
    
    alert('Thank you! We will contact you shortly with your prize details.');
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

// Store lead information
function storeLead(prize) {
    // Here you would typically send this to your backend
    const lead = {
        ...userDetails,
        prize,
        timestamp: new Date().toISOString()
    };
    
    console.log('Lead captured:', lead);
    // Add your API call here to store the lead
}

// Show wheel and hide form
function showWheel() {
    const leadForm = document.getElementById('lead-form');
    const prizeSection = document.getElementById('prize-section');
    const openWheelBtn = document.getElementById('open-wheel-btn');
    const title = document.querySelector('.title');
    
    if (leadForm) {
        // Add fade-out effect
        leadForm.style.opacity = '0';
        leadForm.style.transform = 'translateY(20px)';
        
        // Hide form after fade animation
        setTimeout(() => {
            leadForm.style.display = 'none';
            
            // Show title
            if (title) {
                title.style.display = 'block';
            }

            // Show prizes and spin button with animation
            prizeSection.classList.remove('hidden');
            openWheelBtn.classList.remove('hidden');
            
            // Trigger reflow
            void prizeSection.offsetHeight;
            void openWheelBtn.offsetHeight;
            
            // Add fade-in animation
            prizeSection.classList.add('fade-in');
            openWheelBtn.classList.add('fade-in');
        }, 300);
    }
}

// Create lead capture form with skip option
function createLeadForm() {
    // Hide the title initially
    const title = document.querySelector('.title');
    if (title) {
        title.style.display = 'none';
    }

    const formHTML = `
        <div class="lead-form" id="lead-form">
            <h2>Enter Your Details to Play! 🎉</h2>
            <form id="user-form">
                <input type="text" id="name" placeholder="Your Name" required>
                <input type="email" id="email" placeholder="Your Email" required>
                <input type="tel" id="phone" placeholder="Phone Number (Optional)">
                <select id="interest-area" required>
                    <option value="">Select Property Interest Area</option>
                    <option value="residential">Residential Property</option>
                    <option value="commercial">Commercial Property</option>
                    <option value="investment">Investment Property</option>
                </select>
                <button type="submit" class="submit-btn">
                    <i class="fas fa-play-circle"></i> Continue to Spin
                </button>
            </form>
            <button id="skip-btn" class="skip-btn">
                <i class="fas fa-forward"></i> Skip & Play Now
            </button>
        </div>
    `;
    container.insertAdjacentHTML('afterbegin', formHTML);
    
    // Handle form submission
    document.getElementById('user-form').addEventListener('submit', (e) => {
        e.preventDefault();
        userDetails = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            interestArea: document.getElementById('interest-area').value
        };
        showWheel();
    });

    // Handle skip button
    document.getElementById('skip-btn').addEventListener('click', () => {
        userDetails = null;
        showWheel();
    });
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    initializeDOMElements();
    
    // Create lead form
    createLeadForm();
    
    // Set up spin button click handler
    document.getElementById('spin-button').addEventListener('click', startSpin);
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === resultModal) {
            resultModal.style.display = 'none';
        }
        if (event.target === wheelModal) {
            wheelModal.style.display = 'none';
        }
    });
}); 