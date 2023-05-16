import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements;

  constructor(headersConfig, {
    data = [],
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    url = "",
    isSortLocally = false,
  } = {}) {
    this.data = data;
    this.sorted = sorted;
    this.url = new URL(url, BACKEND_URL);
    this.headersConfig = headersConfig;
    this.isSortLocally = isSortLocally;
    this.render();
    this.updateComponent();
  }

  initEventListeners() {
    this.subElements.header.addEventListener('click', this.onClickSort);
  }

  onClickSort = (event) => {
    const element = event.target.closest('[data-sortable="true"]');
    const toggleOrder = (order) => {
      return order === 'asc' ? 'desc' : 'asc';
    };


    if (element) {
      const { id, order } = element.dataset;
      const stateOrder = toggleOrder(order);
      element.dataset.order = stateOrder;

      if (this.isSortLocally) {
        this.sortOnClient(id, stateOrder);
      } else {
        this.sortOnServer(id, stateOrder);
      }
    }
  }

  sortOnClient(id, order) {
    const sortedData = this.sortList(id, order);
    this.subElements.body.innerHTML = this.getBodyLinks(sortedData);
  }

  async sortOnServer(id, order) {
    const data = await this.loadData(id, order);
    this.renderRows(data);
  }

  sortList(fieldValue, orderValue) {
    console.log('this.data', this.data)
    const newData = [...this.data];
    const sortValue = this.headersConfig.find(value => value.id === fieldValue);
    const sortWay = (orderValue && orderValue === "desc") ? -1 : 1;
    const sortData = newData.sort((a, b) => {
      if (sortValue.sortType === 'number') {
        return sortWay * (a[fieldValue] - b[fieldValue]);
      } else if (sortValue.sortType === 'string') {
        return sortWay * a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en']);
      } else {
        throw new Error(`error type`);
      }
    });

    return sortData;
  }

  renderRows(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  async loadData (...props) {
    // this.showLoader();

    const data = await this.load(...props);

    // this.hideLoader();

    return data;
  }

  async load(id, order) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);

    return await fetchJson(this.url);
  }


  getTemplateHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headersConfig.map((item) => this.getHeaderData(item)).join('')}
      </div>
      `;
  }

  getTemplateBody(sortedList) {
    const listMap = sortedList ? sortedList : this.data;
    console.log('sortedList', sortedList);
    return `
      <div data-element="body" class="sortable-table__body">
        ${listMap.map((item) => this.getBodyLinks(item)).join('')}
      </div>
    `;
  }

  getBodyLinks(item) {
    return `
      <a href="/products/${item.id}" class="sortable-table__row" key=${item.id}>
        ${this.getBodyLink(item)}
      </a>
    `;
  }

  getBodyLink(item) {
    const header = this.headersConfig.map(({ id, template }) => {
      return { id, template };
    });
    return header.map(({ id, template }) => {
      return template
        ? template(item[id]) :
        `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getHeaderData(item) {
    return `
      <div class="sortable-table__cell" data-id=${item.id} data-sortable=${item.sortable} data-order=${this.sorted.order}>
        <span>${item.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `;
  }

  get template() {
    return `
      <div class="sortable-table">
        ${this.getTemplateHeader()}
        ${this.getTemplateBody()}

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          No products
        </div>
      </div>
    `;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
    this.initEventListeners(element);
  }

  async updateComponent() {
    console.log('this.sorted', this.sorted);
    const {id, order} = this.sorted;
    const data = await this.loadData(id, order);
    const chardData = Object.values(data);
    this.renderRows(data);
    this.initEventListeners();
    if (chardData && chardData.length) {
      this.subElements.body.innerHTML = this.getTemplateBody(data);
    }
  }

  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    console.log('this.data', this.data);
    rows.innerHTML = this.getBodyLinks(data);

    this.subElements.body.append(...rows.childNodes);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
