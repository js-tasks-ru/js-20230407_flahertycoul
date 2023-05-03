export default class SortableTable {
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

  getTemplateBody() {
    return `
    <div data-element="body" class="sortable-table__body">
      ${this.data.map((item) => this.getBodyItem(item)).join('')}
    </div>
    `;
  }

  getBodyItem(item) {
    return `
    <a href="/products/${item.id}" class="sortable-table__row" key=${item.id}>
        <div class="sortable-table__cell">
          <img class="sortable-table-image" alt="Image" src="http://magazilla.ru/jpg_zoom1/246743.jpg">
        </div>
        <div class="sortable-table__cell">${item.title}</div>

        <div class="sortable-table__cell">${item.quantity}</div>
        <div class="sortable-table__cell">${item.price}</div>
        <div class="sortable-table__cell">${item.sales}</div>
      </a>
    `;
  }

  sort(fieldValue, orderValue) {
    const sortedList = this.sortList(fieldValue, orderValue);
    document.body.innerHTML = this.getTemplateBody(sortedList);
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
        return null;
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

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}
