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
    images: [],
    price: 100,
    discount: 0
  };

  constructor(productId, {
  } = {}) {
    this.productId = productId;
  }

  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const item of elements) {
      subElements[item.dataset.element] = item;
    }

    return subElements;
  }

  onSubmit = (event) => {
    event.preventDefault();
    this.save();
  }

  dispatchEvent(type, id) {
    const event = new CustomEvent(type, { detail: id });

    this.element.dispatchEvent(event);
  }

  uploadImage = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change', async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
          referrer: ''
        });
        imageListContainer.append(this.productImage(file.name, result.data.link));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        fileInput.remove();
      }
    });

    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.click();
  };

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
            <input required="" id="title"
            value="" type="text" name="title" class="form-control" placeholder="Название товара">
          </fieldset>
          <div class="form-group form-group__half_left">
        </div>
        </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" id="description" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div>
        <ul class="sortable-list" data-element="imageListContainer">
            ${this.productImagesList()}
          </ul>
        </div>
        <button type="button" data-element="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
          ${this.categoriesSelect()}
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" id="price" type="number" name="price" class="form-control" placeholder="100">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" id="discount" type="number" name="discount" class="form-control" placeholder="0">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" id="quantity" type="number" class="form-control" name="quantity" placeholder="1">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" id="status" name="status">
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

  async save() {
    const productForSave = this.formDataProduct();
    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productForSave)
      });

      const typeEvent = this.productId ? 'product-updated' : 'product-saved';
      this.dispatchEvent(typeEvent, result.id);
    } catch (e) {
      throw new Error().message;
    }
  }

  formDataProduct() {
    const { productForm, imageListContainer } = this.subElements;
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !['images'].includes(item));
    const getValues = (item) => {
      return productForm.querySelector(`[name=${item}]`).value;
    };
    const values = {};
    for (const field of fields) {
      const value = getValues(field);
      if (formatToNumber.includes(field)) {
        values[field] = parseInt(value);
      } else {
        values[field] = value;
      }
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return values;
  }

  setFormData() {
    const { productForm } = this.subElements;
    const excludedFields = ['images'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    fields.forEach(item => {
      const element = productForm.querySelector(`#${item}`);
      element.value = this.product[item] || this.defaultFormData[item];
    });
  }

  productImagesList() {
    return this.product.images.map((item) => this.productImage(item.source, item.url).outerHTML).join('');
  }

  productImage(source, url) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(source)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(source)}</span>
        </span>

        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
    /* not working after add new image */
    // return `
    //   <li class="products-edit__imagelist-item sortable-list__item">
    //     <span>
    //       <img src="./icon-grab.svg" data-grab-handle alt="grab">
    //       <img class="sortable-table__cell-img" alt="${escapeHtml(url)}" src="${escapeHtml(source)}">
    //       <span>${escapeHtml(source)}</span>
    //     </span>

    //     <button type="button">
    //       <img src="./icon-trash.svg" alt="delete" data-delete-handle>
    //     </button>
    //   </li>
    // `;
  }


  categoriesSelect() {
    return `<select class="form-control" id="subcategory" name="subcategory">
      ${this.categories.map((item) => item.subcategories.map((subitem) => {
      this.subCategoryItem = {
        title: `${item.title} > ${subitem.title}`,
        id: subitem.id
      };
      return this.cateroyItem();
    })
    )}
    </select>`;
  }

  cateroyItem() {
    return `
      <option id=${this.subCategoryItem.id} value="progulki-i-detskaya-komnata">${this.subCategoryItem.title}</option>
    `;
  }

  initEventListeners() {
    const { productForm, uploadImage, imageListContainer } = this.subElements;
    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.uploadImage);
    imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    });
  }

  async render() {
    const categoriesData = this.loadCategoriesProducts();
    const productsData = this.productId && this.loadProductsList(this.productId);

    const [categoriesList, productResponse] = await Promise.all([
      categoriesData, productsData,
    ]);

    const [productInfo] = productResponse;
    this.product = productInfo ? productInfo : this.defaultFormData;
    this.categories = categoriesList;
    this.categoriesSelect();

    this.renderForm();

    if (this.product) {
      this.setFormData();
      this.initEventListeners();
    }
    return this.element;
  }

  renderForm() {
    const element = document.createElement('div');
    element.innerHTML = this.product
      ? this.template
      : this.getEmptyTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
  }

  getEmptyTemplate() {
    return `<div>
        <h1 class="page-title">Page not found</h1>
      </div>`;
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
}
