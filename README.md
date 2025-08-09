# Por que Vanilla JavaScript?

## 🎯 Objetivo Deste Documento
Este documento explica a decisão de usar JavaScript puro (Vanilla JS) em partes do projeto LaPlace, destacando os benefícios dessa abordagem e como ela se encaixa nos objetivos gerais do projeto.

## 🚀 Benefícios do Vanilla JavaScript

### 🎯 Maior Controle
- **Sem abstrações desnecessárias**: Trabalhar diretamente com a API do navegador oferece controle total sobre o comportamento da aplicação.
- **Performance otimizada**: Elimina a sobrecarga de frameworks, resultando em tempos de carregamento mais rápidos.
- **Sem dependências externas**: Reduz significativamente o tamanho do bundle final da aplicação.

### 🛠️ Manutenção e Escalabilidade
- **Código mais previsível**: Sem "mágica" por trás dos bastidores, fica mais fácil depurar problemas.
- **Melhor entendimento dos fundamentos**: Desenvolver com Vanilla JS fortalece a compreensão dos conceitos básicos de JavaScript e do DOM.
- **Flexibilidade total**: Facilita a integração com outras bibliotecas ou frameworks no futuro, se necessário.

### 🎨 Estrutura do Projeto
O projeto LaPlace utiliza uma abordagem híbrida:
- **React** para componentes complexos e reativos
- **Vanilla JS** para funcionalidades específicas onde o controle total é essencial
- **Web Components** para criar elementos reutilizáveis

## 🧩 Quando Usar Vanilla JS no Projeto
1. **Performance crítica**: Para operações que exigem máximo desempenho.
2. **Funcionalidades leves**: Para features simples que não justificam o overhead do React.
3. **Integrações de baixo nível**: Quando é necessário acessar APIs nativas do navegador.

## 📚 Recursos Úteis
- [MDN Web Docs](https://developer.mozilla.org/)
- [You Might Not Need a Framework](https://youmightnotneed.com/framework/)
- [JavaScript.info](https://javascript.info/)

---
Iniciado por **Zaluski** ❤️
