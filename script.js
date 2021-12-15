function CutePromise(executor) {
  // value 记录异步任务的执行结果
  this.value = null;
  // reason 记录异步失败的原因
  this.reason = null;
  // status 记录当前状态，初始化是 pending
  this.status = 'pending';

  var self = this;

  // 定义 resolve 函数
  function resolve(value) {
    self.value = value;    // 思考一下 为什么这里用的是self 而不是 this。因为调用 resolve方法的时候，无手动指定调用的对象，如果是this.value，则默认this是全局对象
    // 当前状态切换为 resolved
    self.status = 'resolved';
  }

  // 定义 reject 函数
  function reject(reason) {
    self.reason = reason;
    // 当前状态切换为 rejected
    self.status = 'rejected';
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
  }
}

new CutePromise(function(resolve, reject){
  resolve('成了！')
}).then(function(value){
  console.log(value);
}, function(reason){
  console.log(reason);
})