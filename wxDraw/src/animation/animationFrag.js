/*
 * @Author: Thunderball.Wu 
 * @Date: 2017-09-29 16:34:09 
 * @Last Modified by: Thunderball.Wu
 * @Last Modified time: 2017-10-16 19:36:37
 */

import { AnimationTimer } from "./animationTimer.js"
import { util } from '../util/utils.js';
import { specialOption } from './specialAtrribute.js';


var FRAGOPTION = {
    onStart: function () {
        // 动画碎片开始的函数
    },
    onLooping: function () {
        //在动画重复执行的时候 需要循环的函数 这里 可能需要一些传参
    },
    onEnd: function () {
        // 动画结束 的时候 执行
    },
    duration: 1000,// 毫秒
    easing: "linear",// 缓动函数 


}

function genExe(exe, atrribute, object) {
    console.log('exe', exe);

    if (!isNaN(Number(exe))) {//表达式 是个数字
        let temAtrr;
        if (object.Shape.Option[atrribute]||object.Shape.Option[atrribute]===0) {
            temAtrr = parseFloat(exe) - parseFloat(object.Shape.Option[atrribute]);
        } else {
            temAtrr = parseFloat(exe) - parseFloat(object.Shape[specialOption[object.type][atrribute]][atrribute]);//一些特殊的属性

        }
        // console.log('temAtrr', temAtrr);
        return temAtrr;
    }

    if (exe.indexOf('+=') == 0) {
        let tem = exe.split('=')[1];

        return tem;
    }


    if (exe.indexOf('-=') == 0) {
        let tem = exe.split('=')[1];

        return -1 * tem;
    }

}

function getSpecialAtrribute(object, atrribute) {
    return object.Shape[specialOption[object.type][atrribute]][atrribute];//一些特殊的属性
}

export const AnimationFrag = function (object, atrribute, exe, option, bus) {
    // 这里是动画碎片 更改 obj的地方 但是 问题就在这里 这应该是 最简单的功能 就是对比目标 
    // 添加 delta
    // 一旦完成 那这个 running就等于 false 而对于时间 的控制 不应该在这里 控制时间 来 控制 动画 
    // 假比 是 linear 传进来的 deatla 时间 就是 均衡的
    // 那这一刻增加的东西就是 均衡的 

    // ATRRIBUTE 是对象的时候 那就是几个属性 一起改变


    let _temOption = util.extend(option, FRAGOPTION);
    this.object = object;
    this.source = 0;
    this.genFlag = false;
    /**
  * 若果是对象的形式 
  * 那么 就不能直接 使用exe的形式了 
  * 而是将每一个对象拆开 然后 一个一个的 进行 升级 
  * a {
  *   "a":"+=100",
  *    "b":"-=100"
  * 
  * }
  * 
  * 那就是 
  * 先把a出来
  * 
  */

    this.bus = bus;

    this.complete = false;
    this.running = false;
    this.started = false;
    this.duration = _temOption.duration;
    this.atrribute = atrribute;
    this.atrributeList = [];// 如果atrribute是对象的形式
    if (typeof atrribute == "object") {
        this.genFlag = true;

        this.genAtrributeList(atrribute);
    } else {
        this.incre = genExe(exe, atrribute, object);
        this.exe = exe;// 这是为了及时更新属性
    }
    // console.log(this.object);
    this.timer = new AnimationTimer(_temOption.duration, _temOption.easing);
    this.oriOption = _temOption;
    this.endCallFrag = null;// 用于动画叠加调用

    this.onEnd = _temOption.onEnd;
    this.onLooping = _temOption.onLooping;
    this.onStart = _temOption.onStart;

    this._aniWrapbus = null;
}

AnimationFrag.prototype = {
    updateAnimation: function () {
        //获取时间  以及计算出来 的变化时间 来  如果现在的时间 一加到达 
        if (this.complete) {
            // if (this.endCallFrag) {
            //     this.endCallFrag.updateAnimation(); // 朝后调用
            // } else {
            //     this.bus.dispatch('animationComplete', "no", this.object.Shapeid);
            // }
            return false;
        }

        if (this.timer.isOver()) {
            this.onEnd();
            this.complete = true;
            this.running = false;
            // if (this.endCallFrag) {
            //     // console.log('朝后调用');
            //     this.endCallFrag.updateSourceAndtarget();//更新 起始源  在动画叠加中 有用
            //     // 更新 endcall的 source
            //     this.endCallFrag.updateAnimation(); // 朝后调用
            // }//@todo 有了 wraper 这里的 超后调用就可以 拆掉了

            this._aniWrapbus.dispatch('fragAniOver', 'no', 'me');// 这里不需要传一个 特定的 东西


            return false;

        }
        if (!this.started && !this.complete) {
            if (!this.genFlag) { // 如果是 单点动画
                // this.source = this.object.Shape.Option[this.atrribute];// 最初动画开始的属性
                this.source = this.object.Shape.Option[this.atrribute]||this.object.Shape.Option[this.atrribute]==0 ? this.object.Shape.Option[this.atrribute] : this.object.Shape[specialOption[this.object.type][this.atrribute]][this.atrribute];//两种拿取source得方法
            }
            this.started = true;
            this.running = true;
            this.onStart();
            this.timer.start();

        } else {
            this.onLooping();
            this.updateAtrribute();
        }

    },
    updateAtrribute: function () {
        // console.log('x', this.source + this.target * this.timer.getGoesByTime() / this.duration);
        // console.log('cx', this.object.Shape[this.atrribute]);
        if (!this.genFlag) {
            if (this.object.Shape.Option[this.atrribute]||this.object.Shape.Option[this.atrribute]==0) {
                this.object.Shape.Option[this.atrribute] = this.source + this.incre * this.timer.getGoesByTime() / this.duration;

            } else {
                this.object.Shape[specialOption[this.object.type][this.atrribute]][this.atrribute] = this.source + this.incre * this.timer.getGoesByTime() / this.duration;
               console.log(this.object);
            }
        } else {
            this.atrributeList.forEach(function (item) {

                if (this.object.Shape.Option[item.attr]||this.object.Shape.Option[this.atrr]==0) {
                    this.object.Shape.Option[item.attr] = item.source + item.incre * this.timer.getGoesByTime() / this.duration;

                } else {
                    this.object.Shape[specialOption[this.object.type][item.attr]][item.attr] = item.source + item.incre * this.timer.getGoesByTime() / this.duration;
                    // console.log(this);
                }
                // this.object.Shape.Option[item.attr] = item.source + item.incre * this.timer.getGoesByTime() / this.duration;
            }, this);
        }
    },
    genAtrributeList: function (atrribute) {
        //生成 属性 更改列表
        let _keys = Object.keys(atrribute);
        var _self = this;
        // console.log(_self);
        _keys.forEach(function (item) {
            _self.atrributeList.push({ "attr": item, "incre": genExe(atrribute[item], item, _self.object), "source": _self.object.Shape.Option[item]||_self.object.Shape.Option[item]==0? _self.object.Shape.Option[item] : _self.object.Shape[specialOption[_self.object.type][item]][item] });//两种拿取source得方法
        });

    },
    updateSourceAndtarget: function () {
        if (!this.genFlag) {
            this.source = this.object.Shape.Option[this.atrribute]||this.object.Shape.Option[this.atrribute]==0? this.object.Shape.Option[this.atrribute] : this.object.Shape[specialOption[this.object.type][this.atrribute]][this.atrribute];//两种拿取source得方法

            this.incre = genExe(this.exe, this.atrribute, this.object);
        } else {
            // this.atrributeList.forEach(function(item){
            //     item.source = this.object.Shape.Option[item.attr];

            // },this);
            this.genAtrributeList(this.atrribute);
        }
    },
    addWrapBus(bus) {
        this._aniWrapbus = bus;
    },
    restart() {
        this.complete = false;
        this.running = false;
        this.started = false;
        this.timer = new AnimationTimer(this.oriOption.duration, this.oriOption.easing);
    }
}


