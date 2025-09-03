import Paper from './Paper.js';
// tasks  📝
// manter o codigo limpo e organizado
// adicionar comnetarios para deixa mais facil de entender ele no futuro 
// mudar comentario para ingles para padronizar linguagem
// resolver lentidão 

//write diagram the flow of the code🗺️
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode') || 'mistral'; 

const container = document.querySelector('.container');
if (!container) {
    throw new Error('Elemento .container não encontrado no DOM');
}

container.innerHTML = '<p>Carregando informações do modelo...</p>';

//split to another file😕
function initApp() {// function para iniciar a aplicação
    const paper = new Paper(container);
    document.addEventListener('i18n:ready',(e) => onI18nReady(e, paper)); // mudado para não ser chamado imediatamente 
    let modelsProcessed = false; // variavel para verifica se os modelos foram processados
    
    if (window.i18n) {     
        if (window.i18n?.translations?.models) {// verifica se models foram carregados 
            modelsProcessed = processModels(window.i18n.translations.models, paper);// joga para processModels🦖🍃
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
                    console.warn('[bio.js] Fallback: Falha ao carregar modelos diretamente');
                    container.innerHTML = `
                        <p>Não foi possível carregar as informações do modelo.</p>
                        <p>Por favor, verifique sua conexão e <a href="javascript:window.location.reload()">recarregue a página</a>.</p>
                    `;
                }
            });
        }
    },500);
    

    if (modelsProcessed) {
        clearTimeout(fallbackTimer);
    }
}

//---------------------------------------------------------------------------------------------------->1-🦖
function processModels(models, paper) {
        
    if (!Array.isArray(models)) {
        console.error('[bio.js] Erro: Dados de modelos inválidos (não é um array):', models);
        container.innerHTML = '<p>Erro: Dados de modelos inválidos.</p>';
        return false;
    }
    
    if (models.length === 0) {
        console.error('[bio.js] Erro: Lista de modelos vazia');
        container.innerHTML = '<p>Erro: Nenhum modelo disponível.</p>';
        return false;
    }
    const model = models.find(item => item && item.id === mode);
    
    if (!model) {
        console.error(`[bio.js] Modelo com ID "${mode}" não encontrado`);
        container.innerHTML = `
            <p>Modelo "${mode}" não encontrado. Modelos disponíveis:</p>
            <ul>
                ${models.map(m => m ? `<li><a href="?mode=${m.id}">${m.title || m.id}</a></li>` : '').join('')}
            </ul>
        `;
        return false;
    }
    try {
        paper.setData({
            title: model.title || 'Sem título',
            description: model.description || 'Sem descrição',
            footer: model.footer || ''
        }).render();
        
        return true;
    } catch (error) {
        console.error('[bio.js] Erro ao renderizar o modelo:', error);
        container.innerHTML = '<p>Erro ao exibir as informações do modelo.</p>';
        return false;
    }
}
//------------------------------------------------------------------------------------------------------------------------->2-🦖
// reduce IFs 🫨😕
function tryLoadModelsDirectly(forceReload = false, paper) {
    console.log('[bio.js] Tentando carregar modelos diretamente...');

    if (window.i18n) {
        console.log('[bio.js] i18n disponível no objeto window');

        if (window.i18n.translations && window.i18n.translations.models) {
            console.log('[bio.js] Modelos encontrados diretamente no i18n:', window.i18n.translations.models);
            return processModels(window.i18n.translations.models, paper);
        } else {
            console.log('[bio.js] i18n.translations.models não disponível:', window.i18n.translations);

            if (forceReload && typeof window.i18n.loadTranslations === 'function') {
                console.log('[bio.js] Tentando forçar recarregamento das traduções...');
                window.i18n.loadTranslations().then(() => {
                    if (window.i18n.translations && window.i18n.translations.models) {
                        console.log('[bio.js] Modelos carregados após recarregamento forçado:', window.i18n.translations.models);
                        return processModels(window.i18n.translations.models);
                    }
                }).catch(error => {
                    console.error('[bio.js] Erro ao forçar recarregamento:', error);
                });
            }
        }
    }
    return fetch(`locales/pt/models.json`)
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
                <p>Erro ao carregar os dados do modelo.</p>
                <p>${error.message || 'Tente recarregar a página ou verificar sua conexão.'}</p>
            `;
            return false;
        });
}
// --------------------------------------------------------------------------------------------------->3-🦖
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
//----------------------------------------------------------> the end 🦖
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}


// obs verifica todos os pontos se foram reconectados de forma correta sempre