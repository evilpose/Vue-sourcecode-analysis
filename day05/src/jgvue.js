function JGVue( options ) {
  this._data = options.data;
  // vue 是字符串，这里是DOM
  let elm = document.querySelector( options.el );
  this._template = elm;
  this._parent = elm.parentNode;

  this.initData(); // 将 data 进行响应式转化，进行代理

  this.mount(); // 挂载
}