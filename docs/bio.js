import Paper from './Paper.js';

//write diagram the flow of the code
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode') || 'downloads'; 

const container = document.querySelector('.container');
if (!container) {
    throw new Error('Element .container not found in DOM');
}

container.innerHTML = '<p>Loading model information...</p>';

//split to another file
function initApp() { // function to initialize the application
    const paper = new Paper(container);
    document.addEventListener('i18n:ready',(e) => onI18nReady(e, paper)); // changed to not be called immediately
    let modelsProcessed = false; // variable to check if models were processed
    
    if (window.i18n) {     
        if (window.i18n?.translations?.models) { // check if models were loaded
            modelsProcessed = processModels(window.i18n.translations.models, paper); // pass to processModels
        } else {
            if (typeof window.i18n.look === 'function') {
                window.i18n.look();
            } else if (typeof window.i18n.loadTranslations === 'function') {
                window.i18n.loadTranslations();
            }
        }
    }
    const fallbackTimer = setTimeout(() => {
        if (!modelsProcessed) {
            tryLoadModelsDirectly(true, paper).then(success => {
                if (!success) {
                    console.warn('[bio.js] Fallback: Failed to load models directly');
                    container.innerHTML = `
                        <p>Could not load model information.</p>
                        <p>Please check your connection and <a href="javascript:window.location.reload()">reload the page</a>.</p>
                    `;
                }
            });
        }
    },500);
    

    if (modelsProcessed) {
        clearTimeout(fallbackTimer);
    }
}

//---------------------------------------------------------------------------------------------------->1
function processModels(models, paper) {
        
    if (!Array.isArray(models)) {
        console.error('[bio.js] Error: Invalid model data (not an array):', models);
        container.innerHTML = '<p>Error: Invalid model data.</p>';
        return false;
    }
    
    if (models.length === 0) {
        console.error('[bio.js] Error: Empty model list');
        container.innerHTML = '<p>Error: No models available.</p>';
        return false;
    }
    const model = models.find(item => item && item.id === mode);
    
    if (!model) {
        console.error(`[bio.js] Model with ID "${mode}" not found`);
        container.innerHTML = `
            <p>Model "${mode}" not found. Available models:</p>
            <ul>
                ${models.map(m => m ? `<li><a href="?mode=${m.id}">${m.title || m.id}</a></li>` : '').join('')}
            </ul>
        `;
        return false;
    }
    try {
        paper.setData({
            title: model.title || 'No title',
            description: model.description || 'No description',
            footer: model.footer || ''
        }).render();
        
        return true;
    } catch (error) {
        console.error('[bio.js] Error rendering model:', error);
        container.innerHTML = '<p>Error displaying model information.</p>';
        return false;
    }
}
//------------------------------------------------------------------------------------------------------------------------->2
// reduce IFs
function tryLoadModelsDirectly(forceReload = false, paper) {
    if (window.i18n) {
        if (window.i18n.translations && window.i18n.translations.models) {
            console.log('[bio.js] Models found directly in i18n:', window.i18n.translations.models);
            return processModels(window.i18n.translations.models, paper);
        } else {
            console.log('[bio.js] i18n.translations.models not available:', window.i18n.translations);

            if (forceReload && typeof window.i18n.loadTranslations === 'function') {
                console.log('[bio.js] Trying to force reload translations...');
                window.i18n.loadTranslations().then(() => {
                    if (window.i18n.translations && window.i18n.translations.models) {
                        console.log('[bio.js] Models loaded after forced reload:', window.i18n.translations.models);
                        return processModels(window.i18n.translations.models);
                    }
                }).catch(error => {
                    console.error('[bio.js] Error forcing reload:', error);
                });
            }
        }
    }
    return fetch(`locales/pt/inf.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(models => {
            const result = processModels(models, paper);
            
            if (result && window.i18n) {
                window.i18n.translations = window.i18n.translations || {};
                window.i18n.translations.models = models;
            }
            
            return result;
        })
        .catch(error => {
            container.innerHTML = `
                <p>Error loading model data.</p>
                <p>${error.message || 'Try reloading the page or check your connection.'}</p>
            `;
            return false;
        });
}
// --------------------------------------------------------------------------------------------------->3
function onI18nReady(e, paper) {
    document.removeEventListener('i18n:ready', onI18nReady);
    
    if (e.detail && e.detail.models) {
        const success = processModels(e.detail.models, paper);
        
        if (!success) {
            tryLoadModelsDirectly(true); 
        }
    } else {
        tryLoadModelsDirectly(true); 
    }
}
//----------------------------------------------------------> the end 
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
