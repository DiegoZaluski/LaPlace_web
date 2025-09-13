document.addEventListener('DOMContentLoaded', () => {
// ----------------> i18n 
    i18n.updatePage();//➕➕➕
// ----------------> example of dynamic update 
});
// -------------------------------------> events button
const languageDropdown = document.querySelector('.language-dropdown');
if (languageDropdown) {
    languageDropdown.addEventListener('click', changeButton);
} else {
    console.error('Element .language-dropdown not found');
}
function changeButton(e) { 
    e.preventDefault();
    if (e.target.classList.contains('language-buttons')) {
        const lang = e.target.dataset.language;
        i18n.changeLanguage(lang); 
    };
}

