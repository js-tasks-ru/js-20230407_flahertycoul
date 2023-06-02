export default class SortableList {

  constructor({
    items = []
  } = {}) {
    this.items = items;

    this.render();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.className = 'sortable-list';

    this.addItems();
    this.initEventListeners();
  }

  addItems() {
    this.items.map((item) => {
      return item.classList.add('sortable-list__item');
    });

    this.element.append(...this.items);
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', event => {
      this.onPointerDown(event);
    });
  }

  dragStart(element, event) {
    this.draggingElem = element;
    const { x, y } = element.getBoundingClientRect();
    let shiftX = event.clientX - element.getBoundingClientRect().left;
    let shiftY = event.clientY - element.getBoundingClientRect().top;
    const { offsetWidth, offsetHeight } = element;

    this.pointerShift = {
      x: event.clientX - x,
      y: event.clientY - y
    };
    this.draggingElem.style.position = 'absolute';
    this.draggingElem.style.zIndex = 1000;
    this.element.append(this.draggingElem);
    this.moveAt(event.pageX, event.pageY, shiftX, shiftY);

    this.draggingElem.style.width = `${offsetWidth}px`;
    this.draggingElem.style.height = `${offsetHeight}px`;
    this.draggingElem.classList.add('sortable-list__item_dragging');
    console.log('pointerShift', this.pointerShift);
    document.addEventListener('pointermove', this.onMouseMove(element, event));
    this.addDocumentEventListeners();
  }

  addDocumentEventListeners() {
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  moveAt(pageX, pageY, shiftX, shiftY) {
    this.draggingElem.style.left = pageX - shiftX + 'px';
    this.draggingElem.style.top = pageY - shiftY + 'px';
  }

  onMouseMove(element, event) {
    let shiftX = event.clientX - element.getBoundingClientRect().left;
    let shiftY = event.clientY - element.getBoundingClientRect().top;
    this.moveAt(event.pageX, event.pageY, shiftX, shiftY);
  }

  onPointerDown(event) {
    const element = event.target.closest('.sortable-list__item');

    if (element) {
      if (event.target.closest('[data-grab-handle]')) {
        event.preventDefault();

        this.dragStart(element, event);
      }

      if (event.target.closest('[data-delete-handle]')) {
        event.preventDefault();
        element.remove();
      }
    }
  }

  update() {

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
