document.addEventListener('DOMContentLoaded', () => {
// ----------------> i18n 
    i18n.updatePage();//➕➕➕

// ----------------> exemplo de atualização de dinâmica 
    const updateGreeting = (name) => {
        const greetingElement = document.getElementById('greeting');
        if (greetingElement) {
            greetingElement.textContent = i18n.t('greeting', {nome: name || 'Visitante'});
        }
    };
});
// -------------------------------------> events button
const languageDropdown = document.querySelector('.language-dropdown');
if (languageDropdown) {
    languageDropdown.addEventListener('click', changeButton);
} else {
    console.error('Elemento .language-dropdown não encontrado');
}
function changeButton(e) { 
    e.preventDefault();
    if (e.target.classList.contains('language-buttons')) {
        const lang = e.target.dataset.language;
        i18n.changeLanguage(lang); 
    };
}

