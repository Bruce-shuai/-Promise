function CutePromise(executor) {
  // value 记录异步任务的执行结果
  this.value = null;
  // reason 记录异步失败的原因
  this.reason = null;
  // status 记录当前状态，初始化是 pending
  this.status = 'pending';

  // 缓存两个队列，维护 resolved 和 rejected 各自的对应的处理函数
  this.onResolveQueue = [];
  this.onRejectedQueue = [];


  var self = this;

  // 定义 resolve 函数
  function resolve(value) {
    // 如果不是 pending 状态，直接返回
    if (self.status !== 'pending') {
      return;
    }
    // 异步任务成功，把结果赋值给value
    self.value = value;    // 思考一下 为什么这里用的是self 而不是 this。因为调用 resolve方法的时候，无手动指定调用的对象，如果是this.value，则默认this是全局对象
    // 当前状态切换为 resolved
    self.status = 'resolved';

    // 这里是异步代码，这是为了保证当同步代码执行完后才执行这里面的内容
    setTimeout(function() {
      // 批量执行 resolved 队列里的任务
      self.onResolveQueue.forEach(resolved => resolved(self.value)) 
    })
  }

  // 定义 reject 函数
  function reject(reason) {
    // 如果不是 pending 状态，直接返回
    if (self.status !== 'pending') {
      return;
    }
    self.reason = reason;
    // 当前状态切换为 rejected
    self.status = 'rejected';

    // 异步执行(在所有同步代码执行完后才执行)
    setTimeout(function() {
      self.onRejectedQueue.forEach(rejected => rejected(self.reason))
    })
  }

  // 把 resolve 和 reject 能力赋予给执行器
  executor(resolve, reject);
}

CutePromise.prototype.then = function(onResolved, onRejected) {
  // 注意，onResolved 和 onRejected必须是函数；如果不是，我们此处用一个透传来兜底
  if (typeof onResolved !== 'function') {
    onResolved = function(x) {return x};   // 这里的function(x) {return x}; 有什么用呢？
  }
  if (typeof onRejected !== 'function') {
    onRejected = function(e) {return e};
  }

  var self = this;  // 指向的是调用then的promise实例 ---> 但是这里为什么要用self呢？
  if (self.status === 'resolved') {
    onResolved(self.value);
  } else if (self.status === 'rejected') {
    onRejected(self.reason);
  } else if (self.status === 'pending') {  // 这里的目的是什么呢？ 后面链式then，我没有在then中手动使用resolve()方法
    console.log('------');  // 这里的代码似乎在链式调用中也没用到啊...?
    self.onResolveQueue.push(onResolved);
    self.onRejectedQueue.push(onRejected);
  }
  console.log('this', this);
  return this;  // 链式调用传统手艺
}

const cutePromise = new CutePromise(function (resolve, reject) {
  resolve('成了！');
});
cutePromise.then((value) => {
  console.log(value)
  console.log('我是第 1 个任务')
}).then(value => {
  console.log('我是第 2 个任务')
});
// 依次输出“成了！” “我是第 1 个任务” “我是第 2 个任务”
