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

    // 将数据进行响应式化
    for( let i = 0; i < arguments.length; i++ ){
      reactify(arguments[i]);
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
  for (let i = 0; i < keys.length; i++ ){
    // 这里将 对象 this._data[ keys[i] ] 变成响应式的
    reactify( this._data, this);
  }

  // 代理
  for( let i = 0; i < keys.length; i++ ){
    // 将 this._data[ keys[i] ] 映射到 this[keys[i]] 上
    // 就是要让 this 提供 keys[i] 这个属性
    // 在访问这个属性的时候 相当于在访问 this._data 的属性

    proxy( this, '_data', keys[i] );
  }
};

// 将对象响应式化
function reactify (o, vm) {
  let keys = Object.keys(o);

  for( let i = 0; i < keys.length; i++ ){
    let key = keys[ i ];  // 属性名
    let value = o[key];
    if(Array.isArray(value)) {
      // 数组
      value.__proto__ = array_methods;  // 数组就响应式了
      for( let j = 0; j < value.length; j++) {
        reactify( value[j] , vm); //递归
      }
    } else {
      // 对象或者值类型
      defineReactive.call(vm, o, key, value, true);
    }

    // 只需要在这里添加代理即可 （问题：在这里写的代码回递归）
    // 如果在这里 将属性映射到 Vue 实例上，那么就表示 Vue 实例可以使用属性 key
    /*
      {
        data: {
          name: 'jack',
          child: { name: 'jim'}
        }
      }
    */

  }
}

function defineReactive( target, key, value, enumerable ) {
  // 函数内部就是一个局部作用域，这个 value 就只在函数内使用的变量 （闭包）
  // 折中处理后 this 就是 vue 实例
  let that = this;

  if( typeof value === 'Object' && value != null && !Array.isArray(value)) {
    // 非数组的引用类型
    reactify(value);  // 递归
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

      // 临时处理方式
      if (typeof newVal === 'object' && newVal != null) {
        value = reactify(newVal);
      } else {
        value = newVal;
      }

      // 模板刷新（这 现在只是演示用）
      // 获取 vue 实例  watcher 就不会有这个问题
      that.mountComponent();
    }
  })
}