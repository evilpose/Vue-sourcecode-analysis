/**
 *  watcher 观测者, 用于 发射更新的行为
 */
class watcher {
  /**
   * 
   * @param {Object} vm JGVue 实例
   * @param {String | Function} expOrFn 
   *        如果是 渲染 watcher, 传入的就是渲染函数
   *        如果是 计算 watcher, 传入的就是路径表达式
   *        暂时只考虑 expOrFn 为函数
   */
  constructor( vm, expOrFn ) {
    this.vm = vm;
    this.getter = expOrFn;

    this.deps = [];   // 依赖项
    this.depIds = {}; // 是一个Set类型,用于保证 依赖项 的唯一性 ( 简化的代码暂不实现这一块 )


    // 一开始需要渲染: 真实 vue 中: this.lazy ? undefined : this.get()
    this.get();
  }

  /** 计算 触发 getter  */
  get () {
    this.getter.call( this.vm, this.vm );  // 解决了上下文的问题
  }

  /**
   * 执行, 并判断是懒加载, 还是同步执行, 还是异步执行
   * 我们现在只考虑 异步执行 ( 简化的是 同步执行 )
   */
  run () {
    this.get();
    // 在真正的 vue 中是调用 queueWatcher, 来触发 nextTick 进行异步的执行
  }

  /** 对外公开的函数, 用于 在 属性发生变化时触发的接口 */
  update() {
    this.run();
  }

  /** 清空依赖队列 */
  cleanupDep() {

  }
}