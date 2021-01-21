JGVue.prototype.mount = function() {
  // 需要提供一个 render 方法: 生成 虚拟DOM
  this.render = this.createRenderFn();  // 带有缓存( Vue 本身是可以带有 render 成员的 )

  this.mountComponent();
}

JGVue.prototype.mountComponent = function() {
  // 执行 mountComponent()
  let mount = () => { 
    this.update( this.render() );
  }
  mount(); //本质上应该交给 watcher 来调用

  // 为什么
  // this.update(this.render() );  // 使用发布订阅模式,渲染和计算的行为应该交给 watcher 来完成
}

// 这里是生成 render 函数，目的是缓存 抽象语法树 （我们使用的 虚拟DOM 来模拟）
JGVue.prototype.createRenderFn = function () {
  let ast = getVNode(this._template);
  console.log(ast);

  // Vue: 将 AST + data => VNode
  // 我们： 带有坑的 VNode + data => 含有数据的 VNode
  return function render () {
    // 将 带坑 的 VNode 转换为 带数据的 VNode
    let _tmp = combine(ast, this._data);
    console.log(_tmp);
    return _tmp;
  }
}

// 将虚拟DOM渲染到页面中：diff算法就在这儿
JGVue.prototype.update = function ( vnode ) {
  // 简化，直接生成 HTML DOM replaceChild 到页面中
  // 父元素 replaceChild （新元素，旧元素）
  let realDom = parseVNode(vnode)
  console.log(realDom);

  this._parent.replaceChild(realDom, document.querySelector('#root'));
  // 这个算法是不负责任的
  // 每次都会将页面中的DOM全部替换
}