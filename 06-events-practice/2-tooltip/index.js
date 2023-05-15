class Tooltip {
  static instance
  element

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  getOver = (event) => {
    const element = event.target.closest('[data-tooltip]');
    if (element) {
      this.render(element.dataset.tooltip);
      document.addEventListener('pointermove', this.getMove);
    }
  }

  getOut = () => {
    this.remove();
    document.removeEventListener('pointermove', this.getMove);
  }

  getMove = (event) => {
    this.moveTooltip(event);
  }

  initialize() {
    document.addEventListener('pointerover', this.getOver);
    document.addEventListener('pointerout', this.getOut);
  }

  render(html) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = html;
    document.body.append(this.element);
  }

  moveTooltip(event) {
    const shift = 10;
    const left = event.clientX + shift;
    const top = event.clientY + shift;

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.element = null;
    this.remove();
  }
}

export default Tooltip;
