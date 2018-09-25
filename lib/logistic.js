/**
 * Created by yuht on 2016. 6. 17..
 */
var utils = require('./utils');
var math = require('./utils').math;

Logistic = module.exports = function (options) {
	var self = this;
	// must params
	self.data = self.__initData(options['data']);
	self.label = options['label'];
	self.w = math.oneVec(self.data[0].length);
	self.epoch=0;
	// optional params
	if(typeof options['epochs'] !== 'undefined')
		self.epochs = options['epochs'];
	if(typeof self.epochs === 'undefined') 
		self.epochs = 100;

	if(typeof options['step'] !== 'undefined')
		self.step = options['step'];
	if(typeof self.step === 'undefined') 
		self.step = 0.01;

	if(typeof options['algorithm'] !== 'undefined')
		self.algorithm = options['algorithm'];
	if(typeof self.algorithm === 'undefined') 
		self.algorithm = 1;
}

Logistic.prototype = {
	__initData: function(arr){
		var self = this;
		var matrix = [];
		for(var i=0; i<arr.length; i++){
			matrix.push([]);
			matrix[i].push(1.0);
			for(var j=0; j<arr[i].length; j++){
				matrix[i].push(arr[i][j]);
			}
		}
		return matrix;
	},

	__norm2: function(beta,j){
		var self = this;
		var sum = .0;

		for(var j=0; j<beta.length; j++){
			sum += Math.pow(self.__derivative(beta,j),2);
		}

		return Math.sqrt(sum);
	},

	__fitting: function(beta,vector){
		var sum=.0;

		for(var j=0; j<vector.length; j++){
			sum += beta[j] * vector[j];
		}

		return math.sigmoid(sum);
	},

	__derivative: function(beta,j){
		var self = this;
		var sum = .0;

		for(var i=0; i<self.data.length; i++){
			sum += self.data[i][j] *(self.__fitting(beta,self.data[i]) - self.label[i]);
		}

		return sum;
	},

	train: function(){
		var self = this;
		var beta = self.w;

		if(self.epoch>self.epochs || self.__norm2(beta)<=0.01){
			return;
		}

		for(var j=0; j<beta.length; j++){
			self.w[j] = beta[j] - self.__derivative(beta,j)*self.step;
		}

		utils.log("epochs="+self.epoch+", w norm2="+ self.__norm2(beta));
		self.epoch++;
		self.train();
	},

	predict: function(x){
		var self = this;
		var matrix = self.__initData(x);
		var plabel= [];
		for(var i=0; i<matrix.length; i++){
			plabel.push(self.__fitting(self.w, matrix[i]));
		}

		return plabel;
	}
};