import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0
  };


  constructor(productId, {
    url = "",
    categories = [],
    product = {}
  } = {}) {
    this.productId = productId;
    this.categories = categories;
    this.product = product;
  }

  onSubmit = (event) => {
    event.preventDefault();

    this.save();
  }

  async loadCategoriesProducts() {
    return await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  async loadProductsList(id) {
    return await fetchJson(`${BACKEND_URL}/api/rest/products?id=${id}`);
  }

  get template() {
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
          </fieldset>
        </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer"><ul class="sortable-list"><li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="https://i.imgur.com/MWorX2R.jpg">
          <input type="hidden" name="source" value="75462242_3746019958756848_838491213769211904_n.jpg">
          <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="https://i.imgur.com/MWorX2R.jpg">
        <span>75462242_3746019958756848_838491213769211904_n.jpg</span>
        </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button></li></ul></div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory">
          <option value="progulki-i-detskaya-komnata">Детские товары и игрушки &gt; Прогулки и детская комната</option>
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" class="form-control" placeholder="100">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" class="form-control" placeholder="0">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" name="quantity" placeholder="1">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            Сохранить товар
          </button>
        </div>
      </form>
    </div>
    `;
  }

  save() {

  }

  categoriesSelect() {

  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    const element = wrapper.firstElementChild;
    this.element = element;
    const productsData = this.productId ?
      this.loadProductsList(this.productId)
      : Promise.resolve(this.defaultFormData);

    const categoriesData = this.loadCategoriesProducts();

    const [productResponse, categoriesList] = await Promise.all([
      productsData, categoriesData
    ]);

    const [productInfo] = productResponse;
    this.product = productInfo;
    this.categories = categoriesList;
  }
}
