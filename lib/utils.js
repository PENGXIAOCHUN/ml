/**
 * Created by yuht on 2016. 6. 15..
 */
utils = module.exports;
utils.mode = 'NO_DEBUG';
utils.math = require('./math');

utils.isNumber = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

utils.log = function(str) {
	if(utils.mode == 'DEBUG')
		console.log(str);
};

utils.print = function(str,arr){
	var strLog="";
	for(var i=0;i<arr.length;i++){
		strLog =(str+" "+i+" : ");
		for(var j=0;j<arr[i].length;j++){
			strLog +=(arr[i][j]+" ");
		}
		utils.log(strLog);
		strLog="";
	}
};