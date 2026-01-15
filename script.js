/* =====================================
   Tasbih Counter - JavaScript Logic
   Core Counter & Data Management
   ===================================== */

// ===== STATE & CONFIGURATION =====
/**
 * Application State Object
 * Manages all counter and statistics data
 */
const appState = {
    currentCount: 0,           // Current count in this cycle (0-100)
    cyclesCompleted: 0,        // Number of completed cycles
    targetCount: 100,          // Target count per cycle (customizable)
    currentType: 'tasbih',     // Currently selected counter type (tasbih or mantra)
    soundEnabled: true,        // Sound effects toggle
    vibrationEnabled: true,    // Vibration feedback toggle
};

/**
 * Counter Types Configuration
 */
const counterTypes = {
    tasbih: { 
        name: 'Tasbih Counter', 
        icon: '📿'
    },
    mantra: { 
        name: 'Mantra Counter', 
        icon: '🕉️'
    }
};

// ===== DOM ELEMENTS =====
const elements = {
    // Display Elements
    countDisplay: document.getElementById('countDisplay'),
    cyclesCompletedDisplay: document.getElementById('cyclesCompleted'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    
    // Buttons
    counterBtn: document.getElementById('counterBtn'),
    minusBtn: document.getElementById('minusBtn'),
    plusBtn: document.getElementById('plusBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    resetAllBtn: document.getElementById('resetAllBtn'),
    themeToggle: document.getElementById('themeToggle'),
    
    // Counter Type Buttons
    counterTypeBtns: document.querySelectorAll('.counter-type-btn'),
    
    // Settings
    targetCountInput: document.getElementById('targetCount'),
    soundToggle: document.getElementById('soundToggle'),
    vibrationToggle: document.getElementById('vibrationToggle'),
    
    // Notifications
    notification: document.getElementById('notification'),
};

// ===== INITIALIZATION =====
/**
 * Initialize the application on page load
 * - Load saved data from localStorage
 * - Set up event listeners
 * - Update UI
 */
function init() {
    console.log('Initializing Tasbih Counter App...');
    
    // Load saved data
    loadFromLocalStorage();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize UI
    updateDisplay();
    updateTheme();
    
    console.log('App initialized successfully!');
}

// ===== EVENT LISTENERS =====
/**
 * Set up all event listeners for buttons and inputs
 */
function setupEventListeners() {
    // Counter button
    elements.counterBtn.addEventListener('click', incrementCount);
    
    // Keyboard spacebar for counting
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && document.activeElement !== elements.targetCountInput) {
            e.preventDefault();
            incrementCount();
        }
    });
    
    // Control buttons
    elements.minusBtn.addEventListener('click', decrementCount);
    elements.plusBtn.addEventListener('click', incrementCount);
    elements.refreshBtn.addEventListener('click', refreshCycle);
    elements.resetAllBtn.addEventListener('click', resetAllData);
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Counter type selection
    elements.counterTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => selectCounterType(btn));
    });
    
    // Settings
    elements.targetCountInput.addEventListener('change', (e) => {
        appState.targetCount = Math.max(10, parseInt(e.target.value) || 100);
        elements.targetCountInput.value = appState.targetCount;
        saveToLocalStorage();
        updateDisplay();
    });
    
    elements.soundToggle.addEventListener('change', (e) => {
        appState.soundEnabled = e.target.checked;
        saveToLocalStorage();
    });
    
    elements.vibrationToggle.addEventListener('change', (e) => {
        appState.vibrationEnabled = e.target.checked;
        saveToLocalStorage();
    });
}

// ===== CORE COUNTING LOGIC =====
/**
 * Increment counter by 1
 * - Handles cycle completion (reaching target count)
 * - Provides user feedback
 */
function incrementCount() {
    appState.currentCount++;
    
    // Provide feedback
    triggerVibration();
    playBeep(800, 100);
    
    // Check if cycle is complete
    if (appState.currentCount >= appState.targetCount) {
        completeCycle();
    }
    
    updateDisplay();
    saveToLocalStorage();
}

/**
 * Decrement counter by 1
 * - Prevents going below 0
 */
function decrementCount() {
    if (appState.currentCount > 0) {
        appState.currentCount--;
        triggerVibration();
        playBeep(600, 80);
        updateDisplay();
        saveToLocalStorage();
    }
}

/**
 * Refresh/Reset current cycle only
 * - Resets current count to 0
 * - Keeps total statistics
 */
function refreshCycle() {
    appState.currentCount = 0;
    triggerVibration();
    showNotification('Cycle Refreshed', 'tasbih');
    updateDisplay();
    saveToLocalStorage();
}

/**
 * Handle completion of one counter cycle
 * - Increment cycles completed count
 * - Reset current count to 0
 * - Show completion notification
 */
function completeCycle() {
    // Reset current count
    appState.currentCount = 0;
    
    // Increment cycles completed
    appState.cyclesCompleted++;
    
    // Show notification
    const type = counterTypes[appState.currentType];
    showNotification(
        `✨ 1 Cycle Completed!\n${type.name}\nTotal Cycles: ${appState.cyclesCompleted}`,
        'tasbih'
    );
    
    // Play special sound
    playSpecialSound();
    triggerVibration(true);
    
    updateDisplay();
    saveToLocalStorage();
}

/**
 * Reset all data (with confirmation)
 */
function resetAllData() {
    if (confirm('Are you sure you want to reset ALL data?\n\nThis will clear:\n- Current count\n- Cycles completed\n\nThis action cannot be undone.')) {
        appState.currentCount = 0;
        appState.cyclesCompleted = 0;
        
        saveToLocalStorage();
        updateDisplay();
        
        showNotification('All data has been reset', 'tasbih');
        playBeep(1000, 150);
    }
}

// ===== TASBIH TYPE SELECTION =====
/**
 * Select a counter type
 * @param {HTMLElement} btn - The counter type button clicked
 */
function selectCounterType(btn) {
    // Remove active class from all buttons
    elements.counterTypeBtns.forEach(b => b.classList.remove('active'));
    
    // Add active class to clicked button
    btn.classList.add('active');
    
    // Update current type
    appState.currentType = btn.dataset.type;
    
    // Show notification
    const type = counterTypes[appState.currentType];
    showNotification(
        `${type.icon} ${type.name}`,
        'tasbih'
    );
    
    triggerVibration();
    playBeep(700, 200);
    
    saveToLocalStorage();
}

// ===== DISPLAY & UI UPDATES =====
/**
 * Update all display elements
 */
function updateDisplay() {
    // Update counter display
    elements.countDisplay.textContent = appState.currentCount;
    
    // Update cycles completed
    elements.cyclesCompletedDisplay.textContent = appState.cyclesCompleted;
    
    // Update progress indicator
    updateProgress();
}

/**
 * Update progress circle and percentage
 */
function updateProgress() {
    // Calculate percentage
    const percentage = (appState.currentCount / appState.targetCount) * 100;
    const cappedPercentage = Math.min(percentage, 100);
    
    // Update progress text
    elements.progressText.textContent = `${Math.floor(cappedPercentage)}%`;
    
    // Calculate stroke offset for circle
    // Circle circumference = 2πr = 2π(45) ≈ 283
    const circumference = 283;
    const offset = circumference - (cappedPercentage / 100) * circumference;
    
    // Animate progress fill
    elements.progressFill.style.strokeDashoffset = offset;
    
    // Add glow effect on near completion
    if (cappedPercentage > 80) {
        elements.progressFill.style.opacity = '0.8';
    } else {
        elements.progressFill.style.opacity = '1';
    }
}

/**
 * Show notification message
 * @param {string} message - Message to display
 * @param {string} type - Notification type ('tasbih' or 'goal')
 */
function showNotification(message, type = 'tasbih') {
    const notification = elements.notification;
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ===== THEME MANAGEMENT =====
/**
 * Update theme based on saved preference
 */
function updateTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) {
        document.body.classList.add('dark-theme');
        elements.themeToggle.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        elements.themeToggle.textContent = '🌙';
    }
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    elements.themeToggle.textContent = isDark ? '☀️' : '🌙';
}

// ===== FEEDBACK FUNCTIONS =====
/**
 * Trigger device vibration
 * @param {boolean} strong - Whether to use strong vibration
 * @param {number} count - Number of vibration pulses
 */
function triggerVibration(strong = false, count = 1) {
    if (!appState.vibrationEnabled || !navigator.vibrate) return;
    
    if (strong) {
        // Strong celebration vibration
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                navigator.vibrate([100, 50, 100]);
            }, i * 300);
        }
    } else {
        // Light tap vibration
        navigator.vibrate(30);
    }
}

// ===== LOCAL STORAGE =====
/**
 * Save application state to localStorage
 */
function saveToLocalStorage() {
    try {
        const dataToSave = {
            currentCount: appState.currentCount,
            cyclesCompleted: appState.cyclesCompleted,
            targetCount: appState.targetCount,
            currentType: appState.currentType,
            soundEnabled: appState.soundEnabled,
            vibrationEnabled: appState.vibrationEnabled,
        };
        localStorage.setItem('tasbihCounterData', JSON.stringify(dataToSave));
        console.log('Data saved to localStorage');
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

/**
 * Load application state from localStorage
 */
function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('tasbihCounterData');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.assign(appState, data);
            console.log('Data loaded from localStorage:', data);
        }
    } catch (e) {
        console.error('Failed to load from localStorage:', e);
    }
    
    // Update UI elements with loaded values
    elements.targetCountInput.value = appState.targetCount;
    elements.soundToggle.checked = appState.soundEnabled;
    elements.vibrationToggle.checked = appState.vibrationEnabled;
    
    // Set active counter type button
    const activeBtn = document.querySelector(`[data-type="${appState.currentType}"]`);
    if (activeBtn) {
        elements.counterTypeBtns.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }
}

// ===== UTILITY FUNCTIONS =====
/**
 * Log application statistics to console
 * Useful for debugging
 */
function logStatistics() {
    console.log('=== TASBIH COUNTER STATISTICS ===');
    console.log(`Current Count: ${appState.currentCount}`);
    console.log(`Total Tasbih: ${appState.totalTasbih}`);
    console.log(`Total Goals: ${appState.totalGoals}`);
    console.log(`Target Count: ${appState.targetCount}`);
    console.log(`Current Tasbih: ${appState.currentTasbih}`);
    console.log('================================');
}

/**
 * Export data as JSON (for backup)
 */
function exportData() {
    const dataStr = JSON.stringify(appState, null, 2);
    console.log('Exported data:', dataStr);
    return dataStr;
}

/**
 * Import data from JSON
 * @param {string} jsonStr - JSON string of data to import
 */
function importData(jsonStr) {
    try {
        const data = JSON.parse(jsonStr);
        Object.assign(appState, data);
        saveToLocalStorage();
        updateDisplay();
        console.log('Data imported successfully');
    } catch (e) {
        console.error('Failed to import data:', e);
    }
}

// ===== INITIALIZATION ON PAGE LOAD =====
/**
 * Run initialization when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', init);

// Make some functions globally available for console testing
window.tasbihCounter = {
    incrementCount,
    decrementCount,
    resetAllData,
    logStatistics,
    exportData,
    importData,
    getState: () => appState,
};
