// 响应式化
let ARRAY_METHOD = [
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice'
]
let array_methods = Object.create( Array.prototype );
ARRAY_METHOD.forEach( method => {
  array_methods[method] = function () {
    // 调用原来的方法
    console.log('调用的是拦截的' + method + '方法');
    console.log(arguments)
    // 将数据进行响应式化
    for( let i = 0; i < arguments.length; i++ ){
      observe(arguments[i]); // 这里还是没办法解决，在引入 watcher 之后解决！
    }
    
    let res =  Array.prototype[method].apply(this, arguments);
    return res;
  }
});

// 将某一个对象的属性 访问 映射到 对象的某一个属性成员上
function proxy( target, prop, key ) {
  Object.defineProperty( target, key, {
    enumerable: true,
    configurable: true,
    get () {
      return target[prop][key]
    },
    set (newVal) {
      target[prop][key] = newVal;
    }
  }) 
}

JGVue.prototype.initData = function () {
  // 遍历 this._data 的成员，将 属性转换为响应式的，将 直接属性，代理到实例上
  let keys = Object.keys( this._data );

  // 响应式化
  observe( this._data , this );

  // 代理
  for( let i = 0; i < keys.length; i++ ){
    // 将 this._data[ keys[i] ] 映射到 this[keys[i]] 上
    // 就是要让 this 提供 keys[i] 这个属性
    // 在访问这个属性的时候 相当于在访问 this._data 的属性

    proxy( this, '_data', keys[i] );
  }
};

/** 将对象 o 变成响应式的, vm 就是 vue 实例，为了在调用时处理上下文 */
function observe ( obj, vm ) {
  // 之前没有对 obj 本身继续操作，这一次直接对 obj 进行判断
  if ( Array.isArray( obj) ) {
    // 对其每个元素进行处理
    obj.__proto__ = array_methods;
    for( let i = 0;i < obj.length;i++ ) {
      observe( obj[i], vm ) // 递归处理每一个数组元素
      defineReactive.call(vm, obj, i, obj[ i ], true);
      /** 
       * 上面这个操作有点疑问，这样操作会直接把数组给响应式化了，index 对应 值
       * 这样就可以直接通过索引值修改数组中的元素,但是Vue2.0里面是不支持这样的
       * 在3.0里面通过了 proxy 的操作可以达到
       */
    }
  } else {
    // 对其成员进行处理
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length;i++ ){
      let prop = keys[ i ]; // 属性名
      defineReactive.call(vm, obj, prop, obj[ prop ], true);
    }
  }
}

function defineReactive( target, key, value, enumerable ) {
  // 函数内部就是一个局部作用域，这个 value 就只在函数内使用的变量 （闭包）
  // 折中处理后 this 就是 vue 实例
  let that = this;

  if( typeof value === 'object' && value != null) {
    // 非数组的引用类型
    observe(value);  // 递归
  }


  Object.defineProperty( target, key, {
    configurable: true,
    enumerable: !!enumerable,

    get () {
      console.log(`读取 ${key} 属性`)
      return value;
    },
    set ( newVal ) {
      console.log(`设置的属性为 ${newVal} `)

      // 目的
      // 将重新赋值的数据变成响应式的，因此，如果传入的是对象类型，那么就需要使用 observe 将其转换成 响应式 
      if (typeof newVal === 'object' && newVal != null) {
        observe(newVal);
      }

      value = newVal;

      // 模板刷新（这 现在只是演示用）
      // 获取 vue 实例  watcher 就不会有这个问题
      // that.mountComponent();
      typeof that.mountComponent === 'function' && that.mountComponent();
      // 数组现在没有参与页面的渲染
      // 所以在数组上进行响应式的处理 不需要页面的刷新 即使这里无法调用也没有关系
    }
  })
}