/**
 * Created by yuht on 2018. 9. 17..
 */
var utils = require('./utils');
var math = require('./utils').math;

FCMeans=module.exports=function(options){
	self.data = options['data'];
	self.m = options['m'];
	self.k = options['k'];
	self.limit = options['limit'];


	if(typeof options['maxcycle'] !== 'undefined')
		self.maxcycle = options['maxcycle'];
	if(typeof self.maxcycle === 'undefined') 
		self.maxcycle = 100;
}

FCMeans.prototype = {
	cluster: function(){
		var self = this;

		var umatrix = [];	//划分矩阵 [聚类个数][样本个数]
		var numpattern = self.data.length;	// 样本个数

		//验证输入参数的有效性   
        if (self.k >= numpattern || m <= 1)   
            return false;  

        //随机选取初始化隶属度   
        for (var i=0; i<self.k; i++){   
        	umatrix.push([]);
        	for(var j=0; j<self.numpattern; j++){
        		umatrix[i].push(Math.random());
        	}
        }


	}
};
//https://github.com/ArrowLuo/FCMFrame/blob/master/src/com/ccit/main/FCMAlgorithm.java
//https://blog.csdn.net/u010498696/article/details/45507071
//https://github.com/ArrowLuo/FCMFrame/blob/master/%E8%81%9A%E7%B1%BB%E4%B9%8BFCM%E7%AE%97%E6%B3%95%E5%8E%9F%E7%90%86%E5%8F%8A%E5%BA%94%E7%94%A8.pdf
//http://read.pudn.com/downloads76/sourcecode/java/281469/FCM/src/fcm/FCM.java__.htm