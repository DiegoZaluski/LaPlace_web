document.addEventListener('DOMContentLoaded', () => {
    //. configuração Inicial 
    i18n.updatePage();// rever esta parte talvez precise de melhorias 

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

// -------------------------------------> events button
const languageDropdown = document.querySelector('.language-dropdown');// Bubbling assim que é avisado para qual button deve ser chamado da classe
// deve chamar o conteiner pai para funcionar e poder ver os buttons filhos

if (languageDropdown) {
    languageDropdown.addEventListener('click', changeButton);// handler avisa para função o evento click e passa para o argumento de forma automatica
} else {
    console.error('Elemento .language-dropdown não encontrado');
}


function changeButton(e) { // usando o contains para verificar se o elemento tem classe
    e.preventDefault();
    if (e.target.classList.contains('language-buttons')) {
        // pega o valor do atributo data-language
        const lang = e.target.dataset.language;// dataset que faz a magica principal
        // chama a função para trocar o idioma 
        i18n.changeLanguage(lang); 
    };
}

