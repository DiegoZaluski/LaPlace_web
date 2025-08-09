
// ----------------> IAs
const urlParams = new URLSearchParams(window.location.search);// estudar mais esta parte
const mode = urlParams.get('mode');
// <----------------

//variaveis html bio
const container = document.querySelector('.container');
// -----------------> classe

class Paper {
    constructor(title,text,footer) {
        this.title = title;
        this.text = text;
        this.footer = footer;
    }
// ------------------> tags js 
    createTitle() {
        const h1 = document.createElement('h1');
        h1.className = 'model-title'; // Adiciona uma classe para estilização
        h1.textContent = this.title;
        container.appendChild(h1);
    }
    createText() {
        const p = document.createElement('p');
        p.className = 'model-description'; // Adiciona uma classe para estilização
        p.textContent = this.text;
        container.appendChild(p);
    }
    createFooter() {
        const footer = document.createElement('footer');
        container.appendChild(footer)
        footer.textContent = this.footer;
    }
// <----------------
}

// -----------------> call JSON
document.addEventListener('DOMContentLoaded', () => {
fetch('IAs.json')// olá mundo >_< 
.then(response => response.json())
.then(data => {
    const item = data.find(item => item.id === mode);// para encontar o primeiro elemento que satisfaça a condição

    if (item) {
// clear container
        container.innerHTML = ''; 
// create paper
        const paper = new Paper(item.title,item.description, item.footer);
        paper.createTitle();
        paper.createText();
        paper.createFooter();
    } else {    
        container.innerHTML = '<p>modelo não encontrado. página com problemas</p>';
        }
    })
    .catch(error => {
        console.error('Erro ao carregar dados:', error);
        container.innerHTML = '<p>Erro ao carregar dados. por favor, tente novamente mais tarde</p>';
    });
});


