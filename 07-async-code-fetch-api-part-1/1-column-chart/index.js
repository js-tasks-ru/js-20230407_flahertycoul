import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  element;
  subElements;

  constructor({
    label = "",
    value = 0,
    link = "",
    url = "",
    range = {
      from: new Date(),
      to: new Date(),
    },
    formatHeading = data => data,
  } = {}) {
    this.label = label;
    this.value = value;
    this.link = link;
    this.url = new URL(url, BACKEND_URL);
    this.range = range;

    this.formatHeading = formatHeading;
    this.render();
    this.update(this.range.from, this.range.to);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  getTemplate() {
    return `
      <div class="column-chart column-chart_loading style="--chart-height:${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ''}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
          </div>
          <div data-element="body" class="column-chart__chart">
          </div>
        </div>
      </div>
    `;
  }

  async loadData(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    return await fetchJson(this.url);
  }


  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getHeaderTotalValue(chardData) {
    return this.formatHeading(chardData.reduce((a, b) => a + b));
  }

  getChartColumns(chardData) {
    const maxValue = Math.max(...chardData);
    const scale = this.chartHeight / maxValue;
    return chardData
      .map(item => {
        const percent = (item / maxValue * 100).toFixed(0) + '%';
        return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}"></div>`;
      })
      .join('');
  }

  changeRange(from, to) {
    this.range.from = from;
    this.range.to = to;
  }

  async update(from, to) {
    this.element.classList.add('column-chart_loading');
    const data = await this.loadData(from, to);
    const chardData = Object.values(data);

    this.changeRange(from, to);
    if (chardData && chardData.length) {
      this.subElements.header.innerHTML = this.getHeaderTotalValue(chardData);
      this.subElements.body.innerHTML = this.getChartColumns(chardData);
      this.element.classList.remove('column-chart_loading');
    }

    this.data = data;
    return this.data;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

}
