/**
 * Shared ChromaDB Service Instance
 * Ensures all components use the same ChromaDB service instance
 */

import ChromaDBService from './ChromaDBService.js';

// Create a single shared instance
let sharedInstance = null;

export const getSharedChromaDBService = () => {
    if (!sharedInstance) {
        sharedInstance = new ChromaDBService();
        console.log('🔧 Created shared ChromaDB service instance');
    }
    return sharedInstance;
};

export default getSharedChromaDBService;