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

# 发布订阅模式

任务：

- 代理方法 ( app.name, app._data.name )
- 事件模型 ( node: event 模块 )
- vue 中 Observer 与 Watcher 和 Dep

代理方法，就是要将 app._data 中的成员给 映射到 app 上

由于需要在更新数据的时候，更新页面的内容
所以 app._data 访问的成员与 app 访问的成员应该是同一个成员

由于 app._data 已经是响应式的对象了，所以只需要让 app 访问的成员去访问 app._data 的对应的成员就可以了

例如：

````js
app.name 转换为 app._data.name
app.xxx 转换为 app._data.xxx
````

引入了一个函数 proxy( target, src, prop ) target 相当于上面的 app, src 相当于上面的 _data 或 app._data, prop 相当于name/xxx, 将target的操作 映射到 src.prop 上，这里是因为当时没有 `proxy` 语法 ( ES6 )

之前处理的 rectify 方法已经不行了，我们需要一个新的方法来处理

提供一个 Observer 的方法，在这个方法当中 对 属性进行处理，也可以将这个方法封装到 initData 方法中。

## 接视 proxy

```js
app._data.name
// vue 设计，不希望访问 _ 开头的数据
// vue 中的潜规则：
// _ 开头的数据默认为是私有属性
// $ 开头的是只读数据
app.name
// 将 对 _data.xxx 的访问 交给里 实例

// 重点：访问 app 的 xxx 就是在访问 app._data.xxx
```

假设：

```js
var o1 = { name: '张三' };
// 要有一个对象 o2 ，在访问 o2.name 的时候想要访问的是 o1.name
Object.defineProperty(o2, 'name',{
  get(){
    return o1.name;
  }
});
```

访问 app 的 xxx 就是在访问 app._data.xxx

```js
Object.defineProperty( app, 'name', {
  get() {
    return app._data.name;
  }
  set( newVal ) {}
    app._data.name = newVal;
})
```

将属性的操作转换为 参数

```js
fucntion proxy( app, key) {
  Object.defineProperty( app, key, {
    get() {
      return app._data[key];
    }
    set( newVal ) {}
      app._data[key] = newVal;
  })
}
```

问题：

在 vue 中不仅仅只是有 data 属性, properties 等等 都会挂载到 vue 实例上

```js
fucntion proxy( app, prop,  key) {
  Object.defineProperty( app, key, {
    get() {
      return app[prop][key];
    }
    set( newVal ) {}
      app[prop][key] = newVal;
  })
}

// 如果将 data 的成员映射到 实例上
proxy( 实例, '_data', 属性名 ) 
// 如果要 _properties 的成员映射到实例上
proxy( 实例, '_properties, 属性名 )
```

## 发布订阅模式

目标：解耦，让各个模块之间没有紧密的联系

现在的处理办法 属性在更新的 时候 调用 mountComponent 方法。

问题： mountComponent 更新的是什么？？（now） 全部的页面 -> 当前虚拟DOM对应的页面DOM

在 Vue 中，整个的更新是按照组件为单位进行 **判断**，以节点为单位继续更新

- 如果代码中没有自定义组件，那么在比较算法的时候，我们会将全部的模板 对应的 虚拟DOM 进行比较
- 如果代码中含有 自定义 组件，那么在比较算法的时候，就会判断更新的是哪一些组件中的属性，只会判断更新数组的组件，其他组件不会更新。

复杂的页面是由很多组件构成。每一个属性要更新的时候都要调用 更新的方法？

**目标，如果修改了什么属性，就尽可能只更新这些属性对应的页面 DOM**

这样就一定不能将更新的代码写死。

例子：预售 某个东西卖的很好，没有现货，向老板预定，东西到了老板通知我。

老板就是发布者
订阅什么东西作为中间的媒介
我是订阅者

使用代码的结构来描述：

1. 老板提供一个 账本（数组）
2. 我可以根据需求订阅我的商品 （老板要记录下来 谁 定了什么东西， 在数组中 存储 某些东西）
3. 等待，可以做其他的事情
4. 当货品来到的时候，老板就查看账本，挨个打电话。（ 遍历数组， 取出数组的元素来使用 ）

实际上 就是 事件模型

1. 有一个 event 对象
2. on, off, emit 方法

实现事件模型，思考怎么用？

1. event 是一个全局对象
2. event.on('事件名', 处理函数) 订阅事件
  1. 事件可以连续订阅
  2. 可以移除：event.off()
    1. 移除所有
    2. 移除一个类型的事件
    3. 移除某一个类型的某一个处理函数
3. 写别的代码
4. event.emit('事件名',参数) 先前注册的事件处理函数就会依次调用

原因：

1. 描述发布订阅模式
2. 后面会使用到的事件

发布订阅模式 ( 形式不局限于函数, 形式可以是对象等 ):

1. 中间的**全局的容器**,用来**存储**可以被触发的东西( 函数, 对象 )
2. 需要一个方法,可以往容器中**传入**东西 ( 函数, 对象 )
3. 需要一个方法,可以将容器中的东西取出来使用**使用** ( 函数使用, 对象的办法调用 )

Vue 模型

页面中的变更 ( diff ) 是以组件为单位

- 如果页面中只有一个组件 ( Vue实例 ), 不会有性能损失
- 但是如果页面中有多个组件 ( 多 watcher 的一种情况 ), 第一次会有 多个组件的 watcher 存入到 全局 watcher 中.
  - 如果修改了局部的数据 ( 其中一个组件的数据 )
  - 表示只会对该组件进行 diff 算法, 也就是说只会重新生成该组件的 抽象语法树
  - 只会访问该组件的 watcher
  - 也就表示**再次**往全局存储的只有该组件的 watcher
  - 页面更新的时候也就只需要更新一部分

diff

我们先根据真实DOM生成一颗 virtual DOM ，当 virtual DOM 某个节点的数据改变后会生成一个新的 Vnode ，然后 Vnode 和 oldVnode 作对比，发现有不一样的地方就直接修改在真实的DOM上，然后使 oldVnode 的值为 Vnode 。

diff的过程就是调用名为 patch 的函数，比较新旧节点，一边比较一边给 真实的DOM 打补丁。

# 改写 observer 函数

缺陷：

- 无法处理数组
- 响应式无法在中间集成 watcher 处理
- 我们实现 rectify 需要和实例紧紧的绑定在一起，分离*（解耦）

# 引入 watcher

问题:

- 模型 (图)
- 关于 this 问题

实现:
  1. 只考虑修改后刷新 ( 响应式 )
  2. 再考虑依赖收集 ( 优化 )

在 Vue 中提供一个构造函数 watcher
watcher 会有一些方法:

- get() 用来**计算**或**执行处理函数**
- updata() 公共的外部方法, 该方法出触发内部的 run 方法
- run() 运行,用来判断内部是使用异步运行还是同步运行等, 这个方法最终会调用内部的 get 方法
- cleanupDep() 简单理解为清楚队列

watcher有一个属性 vm 表示的就是 当前的 vue 实例

# 引入 Dep 对象

该对象提供 依赖收集 ( depend ) 的功能, 和 派发更新 ( notify ) 的功能

在 notify 中去调用 watcher 的 update 方法



# Watcher 与 Dep

之前将 渲染 watcher 放在全局作用域上，这样处理是有问题的

- vue 项目中，包含很多的组件，各个组件是**自治**
  - 那么 watcher 就可能会有多个
  - 每一个 watcher 用于描述一个组件的渲染行为 或 计算行为
    - 子组件发生数据的更新，页面需要重新渲染 （真正的Vue中是局部渲染）
    - 例如 Vue 中推荐是使用 计算属性 来代替 复杂的插值表达式
      - 计算属性是会伴随其使用的属性变化而变化的
      - `name: () => this.firstName + this.lastName`
        - 计算属性 依赖于 属性 firstName 和属性 lastName
        - 只要被依赖的属性发生变化，那么就会促使计算属性 **重新计算** （ watcher ）
- 依赖收集与派发更新是怎么运行起来的

**我们在访问的时候，就会进行收集，在修改的时候就会进行更新，那么收集什么就更新什么**

所谓的依赖收集，**实际上就是告诉当前的 watcher 什么属性被访问了**
那么在这个 watcher 计算的时候 或 渲染页面的时候 就会 将 这些收集到属性进行更新

如何将 我们的属性 与 当前 watcher 关联起来

- 在全局 准备一个 targetStack （ watcher 栈 简单理解为 watcher 数组， 把一个操作中需要使用的 watcher 都储存起来 ）
- 在 watcher 调用 get 方法时候，将 当前 watcher 放到全局，在get执行结束之后，将这个全局的 watcher 移除。提供了：pushTarget popTarget
- 在每一个属性中都有一个 Dep 对象

我们在访问对象属性的时候（get），我们的渲染watcher就在全局中
将 属性 与 watcher 相关联，其实就是将当前渲染的watcher存储到属性相关的dep中
同时，将 dep 也存储到当前全局的 watcher 中 （互相引用）

- 属性引用了当前的渲染 watcher，属性知道谁渲染它
- 当前渲染 watcher 引用了 访问的属性 （ Dep ），当前的 watcher 渲染了什么属性

dep 中有一个方法，叫 notify() 
内部就是将 dep 中的 subs 取出来依次调用其 update 方法
subs 中存储了 **知道渲染什么属性的 watcher**

# Observer 对象

## 主要起到的作用是数据发生读取或者访问的时候，在进行依赖收集的时候，对子成员进行收集。

# 梳理 watcher 与 Dep 与 属性的关系

假设： 有三个属性 name, age, gender。 页面将三个属性渲染出来  

# vue 源码解读

1. 各个文件夹的作用
2. Vue 的初始化流程

## 各个文件夹的作用

1. compiler 编译用的
  - vue 使用**字符串**作为模板
  - 在编译文件夹中存放对 模板字符串的 解析的算法，抽象语法树，优化等
2. core 核心，vue 构造函数，以及生命周期等方法的部分
3. platforms 平台
  - 针对 运行的 环境（设备），有不同的实现
  - 也是 vue 的入口
4. server 服务端，主要是将 vue 用在服务端的处理代码（略）
5. sfc，单文件组件 （略）
6. shared 公共工具，方法


