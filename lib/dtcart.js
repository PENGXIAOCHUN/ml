/**
 * Created by yuht on 2018. 8. 10..
 */
var utils = require('./utils');
var math = require('./utils').math;

function TreeNode(options){
	var self = this;

	self.col = (typeof options['col'] === 'undefined') ? -1 : options['col'];
	self.value = options['value'];
    self.result = options['result'];
    self.alpha = options['alpha'];
    self.tb = options['tb'];
    self.fb = options['fb'];
}

DecisionTreeCart=module.exports=function(options){
	var self = this;
	// must params
	self.data = options['data'];
	self.label = options['label'];
}

DecisionTreeCart.prototype = {
	__calcColumnInfo: function(values){
		var types=[];
		var divides=[];
		var columnCount = values[0].length-1;

		for(var col=0; col<columnCount; col++){
			var columnValues = {};
			var curValue;
			for(var i=0; i<values.length; i++){
				curValue = values[i][col];
				if(i==0){
					types.push(utils.isNumber(curValue))
				}

				if(!types[col]){
					if(typeof columnValues[curValue] === 'undefined')
			            columnValues[curValue] = 0;
			        columnValues[curValue]++;
				}else{
					break;
				}
			}
			divides.push(Object.keys(columnValues));
		}

		return{'types': types, 'divides': divides};
	},
};