class Paper {
  constructor(container) {
    this.title = "";
    this.text = "";
    this.footer = "";
    this.container = container;
  }

  setData({ title = "", description = "", footer = "" } = {}) {
    this.title = title;
    this.text = description;
    this.footer = footer;
    return this;
  }

  createTitle() {
    if (!this.title) return;
    const h1 = document.createElement("h1");
    h1.className = "model-title";
    h1.textContent = this.title;
    this.container.appendChild(h1);
  }

  createText() {
    if (!this.text) return;
    const p = document.createElement("p");
    p.className = "model-description";
    p.textContent = this.text;
    this.container.appendChild(p);
  }

  createFooter() {
    if (!this.footer) return;
    const footer = document.createElement("footer");
    footer.textContent = this.footer;
    this.container.appendChild(footer);
  }

  clear() {
    this.container.innerHTML = "";
  }

  render() {
    this.clear();
    this.createTitle();
    this.createText();
    this.createFooter();
  }
}

export default Paper;
