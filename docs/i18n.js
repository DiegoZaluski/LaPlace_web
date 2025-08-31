// i18n 🌐 
class I18n {
    // Defines the current language, prioritizing:
    // 1. Language saved in localStorage
    // 2. Browser's first preferred language (navigator.languages[0])
    // 3. Browser's language (navigator.language)
    // 4. Default 'pt' (Portuguese)
//--------------------------------------------------------------------------->
    constructor() {
        this.locale = localStorage.getItem('userLanguage') || 
            (navigator.languages && navigator.languages[0]) || // usar desta for ( &&) garante que não de erros e iterrompa o codigo em navegadores antigos 
            navigator.language || 
            'pt';
// ------------> -----------> -----------> ----------->   
        this.translations = {}; 
        this.fallbackLocale = 'en'; 
        this.loadTranslations();
        this.copy;
        window.addEventListener('storage', (e) => {
            if (e.key === 'userLanguage' && e.newValue !== this.locale) { // verify if this function is really useful in the code cleaning and review 
                this.changeLanguage(e.newValue);
            }
        });
    }
    look() {
        if (!this.translations || !this.translations.models) {
            console.warn('Dados de modelos não carregados ainda');
            console.warn('this.translations:', this.translations);
            return;
        }
        
        if (this.copy !== this.locale) {
            try {
                const event = new CustomEvent('i18n:ready', {
                    detail: {
                        models: Array.isArray(this.translations.models) ? this.translations.models : [],
                        locale: this.locale
                    },
                    bubbles: true,
                    cancelable: true
                });//➕➕🫨
                
                this.copy = this.locale;
                const dispatched = document.dispatchEvent(event);//let's go
                const hasListeners = document.getEventListeners && typeof document.getEventListeners === 'function' && document.getEventListeners('i18n:ready').length > 0;//🫨  
                
                if (!hasListeners) {
                    console.warn('Nenhum listener registrado para o evento i18n:ready');
                }
            } catch (error) {
                console.error('Erro ao disparar evento i18n:ready:', error);
            }
        }
    }
    async loadTranslations() { // get translations from json file
        try {
            console.log(`[i18n] Iniciando carregamento de traduções para o locale: ${this.locale}`);
            
            // Carrega auth.json e models.json em paralelo
            console.log(`[i18n] Fazendo requisições para auth.json e models.json`);
            const [authResponse, modelsResponse] = await Promise.all([
                fetch(`locales/${this.locale}/auth.json`).catch(err => {
                    console.error(`[i18n] Erro ao buscar auth.json:`, err);
                    throw err;
                }),
                fetch(`locales/${this.locale}/models.json`).catch(err => {
                    console.error(`[i18n] Erro ao buscar models.json:`, err);
                    throw err;
                })
            ]);

            console.log(`[i18n] Respostas recebidas:`, {
                authOk: authResponse.ok,
                modelsOk: modelsResponse.ok
            });

            // Verifica se as respostas são válidas
            if (!authResponse.ok) {
                throw new Error(`[i18n] Erro ao carregar auth.json: ${authResponse.status}`);
            }
            if (!modelsResponse.ok) {
                throw new Error(`[i18n] Erro ao carregar models.json: ${modelsResponse.status}`);
            }

            console.log(`[i18n] Convertendo respostas para JSON...`);
            
            // Converte as respostas para JSON
            let auth, models;
            try {
                [auth, models] = await Promise.all([
                    authResponse.json(),
                    modelsResponse.json()
                ]);
                console.log(`[i18n] Dados convertidos com sucesso`);
            } catch (jsonError) {
                console.error(`[i18n] Erro ao converter JSON:`, jsonError);
                throw new Error(`[i18n] Erro ao processar os arquivos de tradução`);
            }

            console.log('[i18n] Dados carregados:', { 
                auth: auth ? 'OK' : 'Falha', 
                models: models ? `Array(${Array.isArray(models) ? models.length : 'não-array'})` : 'Falha' 
            });
            
            if (!Array.isArray(models)) {
                console.error(`[i18n] Erro: models não é um array:`, models);
                throw new Error(`[i18n] Formato inválido para models.json`);
            }

            this.translations = { 
                ...(auth || {}), 
                models: models
            };
            
            console.log('[i18n] Traduções atualizadas com sucesso');
            console.log('[i18n] Chamando this.look()...');
            this.look();

            this.updatePage();
            
            console.log('[i18n] loadTranslations concluído com sucesso');
        } catch (error) {
            console.warn(`Falha ao carregar ${this.locale}, tentando ${this.fallbackLocale}...`, error);
            
// ---------> call fallback language
            if (this.locale !== this.fallbackLocale) {
//---------------------------------------------------->🧐
                const originalLocale = this.locale;
                this.locale = this.fallbackLocale;
// 🫂
                try { // treating fallback
                    await this.loadTranslations();
                } finally {
                    this.locale = originalLocale;   
                }
            }
        }
    }
// -----------------------------------------------------------------------------------------> hello world

    t(key, params = {}) { // return, BETTER ➕➕➕
// ----------------> split key for points ex: 'auth.login' -> ['auth', 'login']
        let translation = key.split('.').reduce((obj, k) => 
            (obj && obj[k] !== undefined) ? obj[k] : null, 
        this.translations) || key; //➕➕➕
//--------> 🕹️
// ----------------> if translation is object return object (useful for complex objects)
        if (typeof translation === 'object') {
            return translation;
        }

        // replace params 🫡
        // Ex: t('welcome', {name: 'João'}) substitui 'Olá, {{name}}!' por 'Olá, João!' <---
        Object.keys(params).forEach(param => {
            translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);// emtender esta parte melhor o RegExp➕➕➕
        });

        return translation;
    }

    changeLanguage(locale) {
//------> change language if not equal to current language
        if (this.locale !== locale) {
            this.locale = locale;
//------> save user preference
            localStorage.setItem('userLanguage', locale);
//------> reload translations
            this.loadTranslations();
        }
    }
    updatePage() {
//------> find all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);        
//------> update element according to its type
            if (element.placeholder !== undefined) {
                element.placeholder = translation;
            } else if (element.value && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
                element.value = translation;
            } else if (element.hasAttribute('data-i18n-html')) {
                element.innerHTML = DOMPurify.sanitize(translation);
            } else {
                element.textContent = translation;
            }          
//------> update other attributes that start with data-i18n-*
            element.getAttributeNames().forEach(attr => {
                if (attr.startsWith('data-i18n-') && attr !== 'data-i18n') {
                    const attrName = attr.replace('data-i18n-', '');
                    element.setAttribute(attrName, this.t(element.getAttribute(attr)));
                }
            });
        });
    }
//------> format date and number
    formatDate(data,options={}) {
        if (typeof data === 'string') {
            data = new Date(data); 
        }
        if (!(data instanceof Date) || isNaN(data)) {
            console.warn('Formato de data inválido'); // warn a error not critical, does not interrupt the code
            return String(data);// returns the date as string     
        }

        try {
            return new Intl.DateTimeFormat  
            (this.locale, options).format(data);
        } catch (Err) {
            console.error('Err',Err);
            return data.toLocaleString();// returns the date as string but not formatted
        }
    };

    formatNumber(number, options={}) { // format number
        const num = Number(number);
        if (isNaN(num)) {
            console.warn('Valor numérico inválido');
            return String(number);// returns the number as string
        }

        try {
            return new Intl.NumberFormat
            (this.locale, options).format(number);
        } catch (Err) {
            console.error('Erro ao formatar número',Err);
            return String(number);
        }
    };

}// ➕➕➕
window.i18n = new I18n();

/** tenho que atualiza o diagrama 😁☕
 * -------------------------------------------->
 *      DIAGRAMA DE FLUXO DA CLASSE I18N🔰
 * <--------------------------------------------
 * 
 * 1. INICIALIZAÇÃO (constructor)
 *    ------------------------------------------->
 *    - Define o idioma seguindo a prioridade:
 *      1. localStorage.getItem('userLanguage')
 *      2. navigator.languages[0] (primeiro idioma preferido)
 *      3. navigator.language (idioma do navegador)
 *      4. 'pt' (padrão)
 *    - Inicializa this.translations = {}
 *    - Define fallbackLocale = 'en'
 *    - Chama loadTranslations()
 *    - Configura listener para mudanças no localStorage
 * 
 * 2. CARREGAMENTO DAS TRADUÇÕES (loadTranslations)
 *    ------------------------------------------->
 *    - Faz fetch do arquivo de tradução em /public/locales/{locale}/auth.json
 *    - Se sucesso:
 *      * Atualiza this.translations
 *      * Chama updatePage()
 *    - Se erro:
 *      * Tenta carregar fallbackLocale
 *      * Mantém o idioma original após carregar fallback
 * 
 * 3. TRADUÇÃO DE TEXTO (método t)
 *    ------------------------------------------->
 *    - Recebe: chave (ex: 'auth.login') e parâmetros opcionais
 *    - Processa chaves aninhadas (ex: 'auth.login' → traduções.auth.login)
 *    - Substitui placeholders (ex: {{nome}} → 'João')
 *    - Retorna: texto traduzido
 * 
 * 4. MUDANÇA DE IDIOMA (changeLanguage)
 *    ------------------------------------------->
 *    - Atualiza this.locale
 *    - Salva preferência no localStorage
 *    - Dispara recarregamento das traduções
 * 
 * 5. ATUALIZAÇÃO DA PÁGINA (updatePage)
 *    ------------------------------------------->
 *    - Encontra elementos com data-i18n
 *    - Atualiza conteúdo baseado no tipo:
 *      * placeholders de inputs
 *      * valores de inputs/textarea
 *      * innerHTML (com sanitização)
 *      * textContent (padrão)
 *    - Atualiza atributos data-i18n-*
 * 
 * 6. FORMATAÇÃO (formatDate e formatNumber)
 *    ------------------------------------------->
 *    - Usam Intl API para formatar
 *    - Tratam erros e valores inválidos
 *    - Retornam strings formatadas
 * 
 * 7. INICIALIZAÇÃO GLOBAL
 *    ------------------------------------------->
 *    - Cria instância global: window.i18n = new I18n()
 * 
 * <--------------------------------------------    
 * FLUXO TÍPICO DE USO:
 * 1. Página carrega → I18n() executa
 * 2. Carrega traduções → Atualiza interface
 * 3. Usuário muda idioma → changeLanguage() → reload traduções → updatePage()
 * --------------------------------------------> 🥳🎉    
 */

/**
 * -------------------------------------------->
 *       I18N CLASS FLOW DIAGRAM 🟦
 * <--------------------------------------------
 * 
 * 1. INITIALIZATION (constructor)
 *    ------------------------------------------->
 *    - Sets language with priority:
 *      1. localStorage.getItem('userLanguage')
 *      2. navigator.languages[0] (first preferred language)
 *      3. navigator.language (browser language)
 *      4. 'pt' (default)
 *    - Initializes this.translations = {}
 *    - Sets fallbackLocale = 'en'
 *    - Calls loadTranslations()
 *    - Sets up localStorage change listener
 * 
 * 2. TRANSLATION LOADING (loadTranslations)
 *    ------------------------------------------->
 *    - Fetches translation file from /public/locales/{locale}/auth.json
 *    - On success:
 *      * Updates this.translations
 *      * Calls updatePage()
 *    - On error:
 *      * Tries loading fallbackLocale
 *      * Restores original language after fallback
 * 
 * 3. TEXT TRANSLATION (t method)
 *    ------------------------------------------->
 *    - Input: key (e.g., 'auth.login') and optional params
 *    - Processes nested keys (e.g., 'auth.login' → translations.auth.login)
 *    - Replaces placeholders (e.g., {{name}} → 'John')
 *    - Returns: translated text
 * 
 * 4. LANGUAGE SWITCHING (changeLanguage)
 *    ------------------------------------------->
 *    - Updates this.locale
 *    - Saves preference to localStorage
 *    - Triggers translation reload
 * 
 * 5. PAGE UPDATE (updatePage)
 *    ------------------------------------------->
 *    - Finds elements with data-i18n
 *    - Updates content based on element type:
 *      * Input placeholders
 *      * Input/textarea values
 *      * innerHTML (with sanitization)
 *      * textContent (default)
 *    - Updates data-i18n-* attributes
 * 
 * 6. FORMATTING (formatDate and formatNumber)
 *    ------------------------------------------->
 *    - Uses Intl API for formatting
 *    - Handles errors and invalid values
 *    - Returns formatted strings
 * 
 * 7. GLOBAL INITIALIZATION
 *    ------------------------------------------->
 *    - Creates global instance: window.i18n = new I18n()
 * 
 * <--------------------------------------------    
 * TYPICAL USAGE FLOW:
 * 1. Page loads → I18n() executes
 * 2. Loads translations → Updates UI
 * 3. User changes language → changeLanguage() → reload translations → updatePage()
 * --------------------------------------------> 🎉    
 */