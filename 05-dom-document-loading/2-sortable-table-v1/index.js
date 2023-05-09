export default class SortableTable {
  element;
  subElements;
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  getTemplateHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map((item) => this.getHeaderData(item)).join('')}
      </div>
    `;
  }

  getHeaderData(item) {
    return `
      <div class="sortable-table__cell" data-id="title" data-sortable="true" data-order="asc">
        <span>${item.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
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
    const header = this.headerConfig.map(({ id, template }) => {
      return { id, template };
    });
    console.log('header', header);
    return header.map(({id, template}) => {
      return template
        ? template(item[id]) :
        `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  };

  sort(fieldValue, orderValue) {
    const sortedList = this.sortList(fieldValue, orderValue);
    const currentCoumn = this.element.querySelector(`.sortable-table__cell[data-id=${fieldValue}]`);

    currentCoumn.dataset.order = orderValue;

    this.subElements.body.innerHTML = this.getTemplateBody(sortedList);
  }

  sortList(fieldValue, orderValue) {
    const newData = [...this.data];
    const sortValue = this.headerConfig.find(value => value.id === fieldValue);
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

  get template() {
    return `
      <div class="sortable-table">
        ${this.getTemplateHeader()}
        ${this.getTemplateBody()}
      </div>
    `;
  }


  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
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
