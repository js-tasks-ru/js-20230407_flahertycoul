export default class NotificationMessage {
  static activeMessage


  constructor(message = '',
    {
      duration = 100000,
      type = 'success'
    } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.seconds = duration / 1000;
    this.render();
  }

  getTemplate() {
    return `
        <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
          <div class="timer"></div>
          <div class="inner-wrapper">
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">
              ${this.message}фывф
              ${this.seconds}s
            </div>
          </div>
        </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }



  show(parent = document.body) {
    if (NotificationMessage.activeMessage) {
      NotificationMessage.activeMessage.remove();
    }
    this.countdown();


    parent.append(this.element);
    setTimeout(() => {
      this.remove();
    }, this.duration);

    NotificationMessage.activeMessage = this;
  }



  update() {
    this.render();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
