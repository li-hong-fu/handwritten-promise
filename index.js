
// 构造promise类
class Promise {
    constructor(executor) {
        // 添加属性
        this.PromiseState = 'pending';
        this.PromiseResult = null;
        const _this = this;

        // 添加回调对象
        this.callbacks = [];

        // 成功函数
        function resolve(value) {
            // 判断状态，状态改变不可逆转
            if (_this.PromiseState != 'pending') return;
            // 修改状态
            _this.PromiseState = 'fulfilled';
            // 设置对象结果值
            _this.PromiseResult = value;

            // 实现异步执行
            setTimeout(() => {
                // 调用成功回调函数
                _this.callbacks.forEach(item => item.onResolved(value));
            })
        }

        // 失败函数
        function reject(value) {
            // 判断状态，状态改变不可逆转
            if (_this.PromiseState != 'pending') return;
            // 修改状态
            _this.PromiseState = 'rejected';
            // 设置对象结果值
            _this.PromiseResult = value;

            // 实现异步执行
            setTimeout(() => {
                // 调用成功回调函数
                _this.callbacks.forEach(item => item.onRejected(value));
            })

        }

        // 使用try catch捕捉异常
        try {
            // 同步调用『执行器函数』
            executor(resolve, reject)
        } catch (e) {
            reject(e)
        }

    }

    // then方法封装
    then(onResolved, onRejected) {

        const self = this;

        // 链式回调判断回调函数参数
        if (typeof onResolved !== 'function') onResolved = value => value;
        if (typeof onRejected !== 'function') onRejected = reason => { throw reason };

        return new Promise((resolve, reject) => {
            // 封装callback函数
            function callback(type) {
                // 使用try catch捕捉异常
                try {
                    // 获取回调函数的执行结果
                    let result = type(self.PromiseResult);

                    // 判断执行结果是否一个promise
                    result instanceof Promise ? result.then(resolve, reject) : resolve(result);

                    // 判断执行结果是否一个promise
                    // if (result instanceof Promise) {
                    //     result.then(v => {
                    //         resolve(v)
                    //     }, r => {
                    //         reject(r)
                    //     })
                    // } else {
                    //     resolve(result)
                    // }
                } catch (e) {
                    reject(e)
                }
            }

            // 执行回调函数
            if (this.PromiseState === 'fulfilled') {
                // 实现异步执行
                setTimeout(() => {
                    callback(onResolved)
                })
            }
            if (this.PromiseState === 'rejected') {
                // 实现异步执行
                setTimeout(() => {
                    callback(onRejected)
                })
            }

            // 判断pending
            if (this.PromiseState === 'pending') {
                this.callbacks.push({
                    onResolved: function () {
                        callback(onResolved)
                    },
                    onRejected: function () {
                        callback(onRejected)
                    }
                })
            }
        })
    }

    // catch方法封装
    catch(onRejected) {
        return this.then(undefined, onRejected);
    }

    // resolve方法封装
    static resolve(value) {
        // 返回promise对象
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {
                value.then(v => {
                    resolve(v)
                }, r => {
                    reject(r)
                })
            } else {
                // 状态设置为成功
                resolve(value);
            }
        })
    }

    // reject方法封装
    static reject(reason) {
        // 返回promise对象
        return new Promise((resolve, reject) => {
            reject(reason);
        });
    }

    // all 方法封装
    static all(promises) {
        // 返回promise对象
        return new Promise((resolve, reject) => {
            // 成功计算
            let count = 0;
            let array = [];
            // 遍历
            for (let i = 0; i < promises.length; i++) {

                promises[i].then(v => {
                    count++;
                    // 当前promise对象成功的结果存入数组中
                    array[i] = v;
                    // 判断是否所有状态成功
                    if (count === promises.length) resolve(array);
                }, r => {
                    reject(r);
                })
            }
        })
    }

    // race 方法封装
    static race(promises) {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(v => {
                    // 修改返回对象的状态为成功
                    resolve(v);
                }, r => {
                    // 修改返回对象的状态为失败
                    reject(r);
                })
            }
        });
    }
}
