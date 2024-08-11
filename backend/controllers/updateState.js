const CurrState = require('./models/CurrState');

// Update or create the current state
async function updateCurrState(newState) {
    try {
        const currState = await CurrState.findOneAndUpdate(
            {}, // Empty filter object to match the single document
            { state: newState }, // The new state to set
            { upsert: true, new: true } // Create a new document if none exists
        );
        console.log('Current state updated:', currState);
    } catch (err) {
        console.error('Error updating current state:', err.message);
    }
}