var fs=require('fs');
const LineReader = require('./linereader');

Csv2Json = module.exports=function(options){
	var self = this;

	self.srcfile = options['srcfile'];
	self.datacols = options['datacols'];
	self.labelcol = options['labelcol'];
	self.desccols = options['desccols'];
	self.data = [];
	self.label = [];
	self.desc = [];

	if(typeof options['isnorm'] !== 'undefined')
		self.isNorm = options['isnorm'];
	if(typeof self.isNorm === 'undefined')
		self.isNorm = true;

	if(typeof options['filters'] !== 'undefined')
		self.filters = options['filters'];
	if(typeof self.filters === 'undefined')
		self.filters = [];
}

Csv2Json.prototype = {
	__loadData: function(){
		var self = this;

		var reader = new LineReader(self.srcfile);
		reader.open();
		var line,index=-1;
		while(!reader._EOF){
			line = reader.next();
			if(line == null || line == "undefined" || line == "") continue;

			var arr = line.split(",");
			if(index>=0){
				self.data.push([]);
				self.desc.push([]);
				self.__loadStringOfData(arr, index);				
			}
			index++;
		}
		reader.close();		
	},

	__filter: function(arr){
		var self = this;
		var result = false;

		for(var i=0; i<self.filters.length; i++){
			var key = self.filters[i].key;
			var value = self.filters[i].value;
			if(parseFloat(arr[key]) >= value){
				result = true;
				break;
			}
		}
		return result;
	},

	__loadStringOfData(arr, index){
		var self = this;

		for(var i=0; i<arr.length; i++){
			if(i == self.labelcol){
				self.label.push(arr[i]);
			}
			else if(self.__checkLoadData(i)){
				self.data[index].push(parseFloat(arr[i]));
			}
			else if(self.__checkLoadDesc(i)){
				self.desc[index].push(arr[i]);
			}
		}
	},	

	__checkLoadDesc: function(index){
		var self = this;
		return self.__checkLoad(self.desccols, index);
	},

	__checkLoadData: function(index){
		var self = this;
		return self.__checkLoad(self.datacols, index);
	},

	__checkLoad: function(cols, index){
		for(var n=0; n<cols.length; n++){
			if(cols[n] === index) return true;
		}

		return false;		
	},	

	__calcNormMaxMin: function(){
		var self = this;
		var norm = [];
		for(var n=0; n<self.datacols.length; n++){
			norm.push([1000000.0,0.0]);
		}

		for(var i=0; i<self.data.length; i++){
			for(var j=0; j<self.data[i].length; j++){
				if(self.data[i][j]<norm[j][0]) norm[j][0] = self.data[i][j];
				if(self.data[i][j]>norm[j][1]) norm[j][1] = self.data[i][j];
			}
		}

		return norm;
	},

	__calcNorm: function(norm, colindex, number){
		if((number-norm[colindex][0]) == 0) return 0;

		return (number - norm[colindex][0])/(norm[colindex][1] - norm[colindex][0]);
	},

	__outputJSON: function(){
		var self = this;

		var json = {};
		json.names = self.desc;
		json.labels = self.label;
		json.data = [];

		if(self.isNorm) {
			var norm = self.__calcNormMaxMin();
			for(var i=0; i<self.data.length; i++){
				json.data.push([]);
				for(var j=0; j<self.data[i].length; j++){
					json.data[i].push(self.__calcNorm(norm, j, self.data[i][j]));
				}
			}
		}else{
			json.data = self.data;
		}

		return json;
	},

	transform: function(){
		var self = this;

		self.__loadData();
		return self.__outputJSON();
	}
}