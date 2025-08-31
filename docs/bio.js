console.log('[bio.js] Iniciando carregamento do script bio.js');
//write diagram the flow of the code🗺️
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode') || 'mistral'; 
console.log('[bio.js] Parâmetro mode:', mode);

const container = document.querySelector('.container');
if (!container) {
    console.error('[bio.js] Erro: Elemento .container não encontrado no DOM');
    throw new Error('Elemento .container não encontrado no DOM');
}


container.innerHTML = '<p>Carregando informações do modelo...</p>';

class Paper {
    constructor() {
        this.title = '';
        this.text = '';
        this.footer = '';
    }

    setData({ title = '', description = '', footer = '' } = {}) {
        this.title = title;
        this.text = description; 
        this.footer = footer;
        return this; 
    }

    createTitle() {
        if (!this.title) return;
        const h1 = document.createElement('h1');
        h1.className = 'model-title';
        h1.textContent = this.title;
        container.appendChild(h1);
    }

    createText() {
        if (!this.text) return;
        const p = document.createElement('p');
        p.className = 'model-description';
        p.textContent = this.text;
        container.appendChild(p);
    }

    createFooter() {
        if (!this.footer) return;
        const footer = document.createElement('footer');
        footer.textContent = this.footer;
        container.appendChild(footer);
    }

    clear() {
        container.innerHTML = '';
    }

    render() {
        this.clear();
        this.createTitle();
        this.createText();
        this.createFooter();
    }
}
//split to another file😕
function initApp() {
    console.log('[bio.js] Iniciando aplicação...');
    console.log('[bio.js] Modo:', mode);
    console.log('[bio.js] URL atual:', window.location.href);
    
    const paper = new Paper();
    
    function processModels(models) {
        
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

        console.log(`[bio.js] Procurando modelo com ID: ${mode}`);
        const model = models.find(item => item && item.id === mode);
        
        if (!model) {
            console.error(`[bio.js] Modelo com ID "${mode}" não encontrado`);
            console.log(`[bio.js] Modelos disponíveis:`, models.map(m => m.id));
            
            container.innerHTML = `
                <p>Modelo "${mode}" não encontrado. Modelos disponíveis:</p>
                <ul>
                    ${models.map(m => m ? `<li><a href="?mode=${m.id}">${m.title || m.id}</a></li>` : '').join('')}
                </ul>
            `;
            return false;
        }
        
        console.log('[bio.js] Modelo encontrado:', model);
        
        try {
            paper.setData({
                title: model.title || 'Sem título',
                description: model.description || 'Sem descrição',
                footer: model.footer || ''
            }).render();
            
            console.log('[bio.js] Conteúdo renderizado com sucesso');
            return true;
        } catch (error) {
            console.error('[bio.js] Erro ao renderizar o modelo:', error);
            container.innerHTML = '<p>Erro ao exibir as informações do modelo.</p>';
            return false;
        }
    }
    
// reduce IFs 🫨😕
    function tryLoadModelsDirectly(forceReload = false) {
        console.log('[bio.js] Tentando carregar modelos diretamente...');

        if (window.i18n) {
            console.log('[bio.js] i18n disponível no objeto window');

            if (window.i18n.translations && window.i18n.translations.models) {
                console.log('[bio.js] Modelos encontrados diretamente no i18n:', window.i18n.translations.models);
                return processModels(window.i18n.translations.models);
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
        } else {
            console.log('[bio.js] i18n não está disponível no objeto window');
        }
        console.log('[bio.js] Tentando carregar models.json diretamente...');
        
        return fetch(`locales/pt/models.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(models => {
                console.log('[bio.js] Models carregados diretamente:', models);
                const result = processModels(models);
                
                if (result && window.i18n) {
                    console.log('[bio.js] Salvando modelos no i18n para uso futuro');
                    window.i18n.translations = window.i18n.translations || {};
                    window.i18n.translations.models = models;
                }
                
                return result;
            })
            .catch(error => {
                console.error('[bio.js] Erro ao carregar models.json diretamente:', error);
                container.innerHTML = `
                    <p>Erro ao carregar os dados do modelo.</p>
                    <p>${error.message || 'Tente recarregar a página ou verificar sua conexão.'}</p>
                `;
                return false;
            });
    }
    
    function onI18nReady(e) {
        console.log('[bio.js] Evento i18n:ready recebido:', e.detail);
        
        document.removeEventListener('i18n:ready', onI18nReady);
        
        if (e.detail && e.detail.models) {
            console.log('[bio.js] Modelos recebidos no evento:', e.detail.models);
            const success = processModels(e.detail.models);
            
            if (!success) {
                console.warn('[bio.js] Falha ao processar modelos do evento, tentando carregar diretamente...');
                tryLoadModelsDirectly(true); 
            }
        } else {
            console.warn('[bio.js] Evento i18n:ready sem modelos válidos, tentando carregar diretamente...');
            tryLoadModelsDirectly(true); 
        }
    }
    document.addEventListener('i18n:ready', onI18nReady);
    
    let modelsProcessed = false;
    
    if (window.i18n) {
        console.log('[bio.js] i18n já está disponível no objeto window');
        
        if (window.i18n.translations && window.i18n.translations.models) {
            console.log('[bio.js] Modelos já carregados no i18n:', window.i18n.translations.models);
            modelsProcessed = processModels(window.i18n.translations.models);
        } else {
            console.log('[bio.js] Nenhum modelo carregado no i18n, forçando look()...');
            if (typeof window.i18n.look === 'function') {
                window.i18n.look();
            } else if (typeof window.i18n.loadTranslations === 'function') {
                window.i18n.loadTranslations();
            }
        }
    } else {
        console.log('[bio.js] i18n ainda não está disponível no objeto window');
    }
    const fallbackDelay = 1500; 
    console.log(`[bio.js] Configurando fallback para tentar novamente em ${fallbackDelay}ms`);
    
    const fallbackTimer = setTimeout(() => {
        if (!modelsProcessed) {
            console.log('[bio.js] Fallback: Tempo limite excedido, tentando carregar os modelos diretamente...');
            tryLoadModelsDirectly(true).then(success => {
                if (!success) {
                    console.warn('[bio.js] Fallback: Falha ao carregar modelos diretamente');
                    container.innerHTML = `
                        <p>Não foi possível carregar as informações do modelo.</p>
                        <p>Por favor, verifique sua conexão e <a href="javascript:window.location.reload()">recarregue a página</a>.</p>
                    `;
                }
            });
        }
    }, fallbackDelay);
    

    if (modelsProcessed) {
        clearTimeout(fallbackTimer);
    }
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}


