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
    step = 20,
    start = 1,
    end = start + step,
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;
    this.render();
  }

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loading) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(
        id,
        order,
        this.start,
        this.end,
      );
      this.update(data);
      this.loading = false;
    }
  };

  initEventListeners() {
    this.subElements.header.addEventListener('click', this.onClickSort);
    if (!this.isSortLocally) {
      document.addEventListener('scroll', this.onWindowScroll);
    }
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
      this.sorted = {
        id,
        order: stateOrder
      };

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
    const start = 1;
    const end = start + this.step;
    const data = await this.loadData(id, order, start, end);
    this.renderRows(data);
  }

  sortList(fieldValue, orderValue) {
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

  addRows(data) {
    this.data = data;
    this.subElements.body.innerHTML = this.getTemplateBody(data);
  }

  renderRows(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.addRows(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  displayLoader(status) {
    const statusLoader = status === "add" ? "add" : "remove";
    this.element.classList[statusLoader]('sortable-table_loading');
  }

  async loadData(...props) {
    this.displayLoader('add');

    const data = await this.load(...props);
    this.displayLoader('remove');

    return data;
  }

  async load(id, order, start, end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

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

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    const element = wrapper.firstElementChild;
    const { id, order } = this.sorted;
    this.element = element;
    this.subElements = this.getSubElements(element);
    const data = await this.loadData(id, order, this.start, this.end);
    this.renderRows(data);
    this.initEventListeners();
  }

  update(data) {
    const rows = document.createElement('div');

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTemplateBody(data);

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

    if (!this.isSortLocally) {
      document.removeEventListener('scroll', this.onWindowScroll);
    }
  }
}
