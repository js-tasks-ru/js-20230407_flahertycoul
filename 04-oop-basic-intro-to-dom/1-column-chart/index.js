export default class ColumnChart {
  chartHeight = 50;

  constructor({
    data = [],
    label = "",
    value = 0,
    link = "",
    formatHeading = data => data,
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
  }

  getChartColumns() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data
      .map(item => {
        const percent = (item / maxValue * 100).toFixed(0) + '%';
        return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}"></div>`;
      })
      .join('');
  }

  getTemplate() {
    return `
      <div class="column-chart ${!this.data.length ? 'column-chart_loading' : ''}" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ''}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
          <div data-element="body" class="column-chart__chart">${this.getChartColumns()}</div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element;
    if (!this.data.length) {
      this.element.classList.add('column-chart_loading');
    }
  }

  update(newData) {
    this.data = newData;
    this.render();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
