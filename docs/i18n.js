/**
 * Classe I18n - Sistema de internacionalização
 * Gerencia a tradução de textos na aplicação
 */
class I18n {
    /**
     * Inicializa o sistema de internacionalização
     */
    constructor() {
        // Define o idioma atual, priorizando:
        // 1. Idioma salvo no localStorage
        // 2. Primeiro idioma do navegador (navigator.languages[0])
        // 3. Idioma do navegador (navigator.language)
        // 4. Padrão 'pt' (português)
        this.locale = localStorage.getItem('userLanguage') || 
            (navigator.languages && navigator.languages[0]) ||
            navigator.language || 
            'pt';
            
        this.translations = {}; // Armazena as traduções carregadas
        this.fallbackLocale = 'en'; // Idioma de fallback caso o principal falhe
        
        // Carrega as traduções ao inicializar
        this.loadTranslations();
    }

    /**
     * Carrega as traduções do arquivo JSON correspondente ao idioma atual
     * @async
     */
    async loadTranslations() {
        try {
            // Tenta carregar o arquivo de tradução do idioma atual
            const response = await fetch(`/locales/${this.locale}.json`);
            
            // Verifica se a resposta foi bem-sucedida (status 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Converte a resposta para JSON e armazena as traduções
            this.translations = await response.json();
            
            // Atualiza os elementos da página com as novas traduções
            this.updatePage();
        } catch (error) {
            console.warn(`Falha ao carregar ${this.locale}, tentando ${this.fallbackLocale}...`, error);
            
            // Se o idioma principal falhar, tenta carregar o fallback
            if (this.locale !== this.fallbackLocale) {
                this.locale = this.fallbackLocale;
                this.loadTranslations();
            }
        }
    }

    /**
     * Obtém a tradução de uma chave
     * @param {string} key - Chave da tradução (pode usar notação de ponto para objetos aninhados)
     * @param {Object} [params={}] - Parâmetros para substituição na string de tradução
     * @returns {string} Texto traduzido
     */
    t(key, params = {}) {
        // Divide a chave por pontos para navegar em objetos aninhados
        // Exemplo: 'user.profile.name' -> ['user', 'profile', 'name']
        let translation = key.split('.').reduce((obj, k) => 
            (obj && obj[k] !== undefined) ? obj[k] : null, 
        this.translations) || key; // Retorna a própria chave se não encontrar a tradução

        // Se for um objeto, retorna o objeto (útil para objetos complexos)
        if (typeof translation === 'object') {
            return translation;
        }

        // Substitui os parâmetros na string de tradução
        // Exemplo: t('welcome', {name: 'João'}) substitui 'Olá, {{name}}!' por 'Olá, João!'
        Object.keys(params).forEach(param => {
            translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
        });

        return translation;
    }

    /**
     * Altera o idioma da aplicação
     * @param {string} locale - Código do idioma para o qual mudar (ex: 'pt', 'en')
     */
    changeLanguage(locale) {
        // Evita recarregar se já estiver no idioma solicitado
        if (this.locale !== locale) {
            this.locale = locale;
            // Salva a preferência do usuário
            localStorage.setItem('userLanguage', locale);
            // Recarrega as traduções
            this.loadTranslations();
        }
    }

    /**
     * Atualiza todos os elementos da página com as traduções atuais
     */
    updatePage() {
        // Encontra todos os elementos com o atributo data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            // Atualiza o elemento de acordo com seu tipo
            if (element.placeholder !== undefined) {
                element.placeholder = translation;
            } else if (element.value && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
                element.value = translation;
            } else if (element.hasAttribute('data-i18n-html')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
            
            // Atualiza outros atributos que começam com data-i18n-*
            element.getAttributeNames().forEach(attr => {
                if (attr.startsWith('data-i18n-') && attr !== 'data-i18n') {
                    const attrName = attr.replace('data-i18n-', '');
                    element.setAttribute(attrName, this.t(element.getAttribute(attr)));
                }
            });
        });
    }
}

// Cria uma instância global do i18n
window.i18n = new I18n();