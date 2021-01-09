# Vue 与模板

使用步骤

1. 编写 页面 模板
  1. 直接在 HTML 标签中写 标签
  2. 使用 template
  3. 使用 单文件 ( <template>) 
2. 创建 Vue 实例
  1. 在 Vue 的构造函数中提供：data，methods，computed，watcher，props...
3. 将 Vue 挂载到 页面 中 ( mount )

# 数据驱动模型

Vue 的执行流程

1. 获得模板：模板中有 “坑”
2. 利用 Vue 构造函数中所提供的数据来“填坑”，得到可以在页面显示的“标签了”
3. 将标签加替换页面中原来有坑的标签

Vue 利用 我们提供的数据 和 页面中 模板 生成了一个新的 HTML 标签 （node元素），替换到了 页面中 放置模板的位置。

我们该怎么实现呢？？？？

# 简单的模板渲染


# 虚拟DOM

目标：

1. 怎么将真正的 DOM 转换为 虚拟DOM
2. 怎么将虚拟 DOM 转换为 真正的DOM

思路与深拷贝类似

# 函数柯里化

参考资料：

- [函数式编程](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/)
- [维基百科](https://zh.wikipedia.org/wiki/%E6%9F%AF%E9%87%8C%E5%8C%96)

概念：
1. 柯里化：一个函数原本有多个参数，只传入**一个**参数，生成一个新函数，由新函数接收剩下的参数来运行得到的结构。
2. 偏函数：一个函数原本有多个参数，只传入**一部分**参数，生成一个新函数，由新函数接收剩下的参数来运行得到的结构。
3. 高阶函数：一个函数参数是一个函数，该函数对参数这个函数进行加工，得到一个函数，这个加工用的函数就是高阶函数。

为什么要使用柯里化？为了提升性能，使用柯里化可以缓存一部分能力。

使用两个案例来说明：

1. 判断元素
2. 虚拟DOM 的 render 方法

1. 判断元素：

Vue 本质上是使用 HTML 的字符串作为模板的，将字符串的 模板 转换为 AST，再转换为 VNode。

- 模板 -> AST
- VNode -> DOM
- DOM -> VNode

哪一个阶段最消耗性能？
最消耗性能的是字符串解析（ 模板 -> AST ）

例子：let s = "1 + 2 * ( 3 + 4 * ( 5 + 6 ) )" 
写一个程序，解析这个表达式，得到结果
我们一般会将这个表达式转换为 “波兰式” 表达式，然后使用栈结构来运算

在 Vue 中，每一个标签可以是真正的 HTML 标签，也可以是自定义组件，问怎么区分？

在 Vue 源码中其实将所有可用的 HTML 标签已经存起来了

假设这里只考虑几个标签：

```js
let tag = 'div,p,a,img,ul,li'.split(',');
```

需要一个函数，判断一个标签名是否为 内置的 标签

```js
function isHTMLTag (tagName) {
  tagName = tagName.toLowerCase();
  if ( tags.indexOf( tagName ) > -1) return true;
  return false;
}
```

模板是任意编写的，可以写的很简单，也可以写的很复杂，indexOf 内部也是要循环的

如果有 6 中内置标签，而模板中有 10 个标签需要判断，那么就需要执行 60 次循环

2. 虚拟DOM 的 render 方法

思考：vue 项目 *模板 转换为 抽象语法树* 需要执行几次？？？

- 页面一开始加载需要渲染
- 每一个属性（响应式）数据在发生变化的时候 要渲染
- watch, computed 等等

day01 写的代码每次需要渲染的时候，模板就会被解析一次。（注意：这里我们简化了解析方法。）

render 的作用是将 虚拟DOM 转换为 真正的DOM 加载到页面中

- 虚拟 DOM 可以降级理解为抽象语法树 AST
- 一个项目运行的时候，模板是不会变的，就表示 AST 是不会变的

我们可以将代码进行优化，将 虚拟DOM 缓存起来，生成一个函数，函数只需要传入数据 就可以得到 真正的DOM


# 讨论
- 这样的闭包会内存泄吗？
  - 性能一定是会有问题的
  - 尽可能的提高性能


# 响应式原理

- 我们在使用 Vue 的时候，赋值属性获得属性都是直接使用的 Vue 实例
- 我们在设置属性值的时候，伴随的 页面的数据更新

```js
function defineReactive( target, key, value, enumerable ) {
  // 函数内部就是一个局部作用域，这个 value 就只在函数内使用的变量 （闭包）
  Object.defineProperty( target, key, {
    configurable: true,
    enumerable: !!enumerable,

    get () {
      console.log(`读取 o 的 ${key} 属性`)
      return value;
    },
    set ( newVal ) {
      console.log(`设置 o 的属性为 ${newVal} `)
      value = newVal
    }
  })
}
```

实际开发中对象一般是有多级的

```js
let o = {
  list: [
    {}
  ],
  ads: [
    {}
  ],
  user: {

  }
}
```

递归处理

对于对象可以使用递归 响应式化，但是数组我们也需要处理

- push 
- pop
- shift
- unshift
- reverse
- sort
- splice

1. 在改变数组的数据的时候，要发出通知
    1. Vue2 中 的缺陷，数组发生变化，设置 length 没法通知( Vue3 中使用 Proxy 的语法解决了这个问题)
2. 加入的元素应该变成响应式的

技巧：如果一个函数已经定义了，但是我们需要扩展其功能，我们一般的处理方法：

1. 使用一个临时的函数名存储函数
2. 重新定义原来的函数
3. 定义扩展的功能
4. 调用临时的那个函数

扩展数组的 push 和 pop 怎么处理呢？？？

- 修改要进行响应式化的数组的原型 (__proto__)

