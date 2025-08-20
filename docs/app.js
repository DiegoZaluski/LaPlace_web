document.addEventListener('DOMContentLoaded', () => {
    //. configuração Inicial 
    i18n.updatePage();// rever esta parte talvez precise de melhorias 

    // 2. Seletor de idioma
    const languageSelector = document.querySelector('.language-selector');

    if (languageSelector) {
        languageSelector.addEventListener('change', (e) => {
            try {

                i18n.changeLanguage(e.target.value); // entender aqui ➕➕➕
            } catch (Err) {
                console.error('Erro ao alterar idioma:', Err);
            }
            
        });
    }

    // 3. exemplo de atualização de dinâmica 
    const updateGreeting = (name) => {
        const greetingElement = document.getElementById('greeting');
        if (greetingElement) {
            greetingElement.textContent = i18n.t('greeting', {nome: name || 'Visitante'});
        }
    };

    // 4. Inicializando componentes
    // adicione aqui a incialização dos outros componentes da aplicação
    // que precisam de tradução
});