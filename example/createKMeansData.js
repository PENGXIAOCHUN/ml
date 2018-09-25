/**
 * Created by yuht on 2018. 7. 03..
 */
var fs=require('fs');
const LineReader = require('../lib/linereader');

function CreateKMeansData(srcFile, dstFile, attr){
	this.srcFile = srcFile;
	this.dstFile = dstFile;
	this.data = [];
	this.attr = attr;
	this.attrNorm = [];
}

CreateKMeansData.prototype = {
	__loadData: function(){
		var self = this;

		var reader = new LineReader(self.srcFile);
		reader.open();
		var line,index=0;
		while(!reader._EOF){
			line = reader.next();
			if(index ==0) {
				index++;
				continue;
			}
	
			if(line == null || line == "undefined" || line == "") continue;

			var arr = line.split(",");
			if(parseInt(arr[2])>=10){
				self.data.push([]);
				self.__loadStringOfData(arr, index-1);
				index++;
			}
		}
		reader.close();
	},

	__loadStringOfData: function(arr, index){
		var self = this;

		for(var i=0; i<arr.length; i++){
			if(self.__checkLoad(i)){
				if(i==0) self.data[index].push(arr[i]);
				else self.data[index].push(parseFloat(arr[i]));
			}
		}
	},

	__checkLoad: function(index){
		var self = this;

		for(var n=0; n<self.attr.length; n++){
			if(self.attr[n] === index) return true;
		}

		return false;
	},

	__calcNormData: function(){
		var self = this;

		for(var n=0; n<self.attr.length; n++){
			self.attrNorm.push([10000.0,0.0]);
		}

		for(var i=0; i<self.data.length; i++){
			for(var j=1; j<self.data[i].length; j++){
				if(self.data[i][j]<self.attrNorm[j][0]) self.attrNorm[j][0] = self.data[i][j];
				if(self.data[i][j]>self.attrNorm[j][1]) self.attrNorm[j][1] = self.data[i][j];
			}
		}
	},

	__calcNorm: function(colindex, number){
		var self = this;
		if((number-self.attrNorm[colindex][0]) == 0) return 0;

		return (number - self.attrNorm[colindex][0])/(self.attrNorm[colindex][1] - self.attrNorm[colindex][0]);
	},

	__saveData: function(){
		var self = this;
		try{
			var writeStream = fs.createWriteStream(self.dstFile , {'flags': 'a'});
			var number;
			var last;
			writeStream.write("{\"nodeList\": [\r\n");
			for(var i=0; i<self.data.length; i++){
				last = self.data[i].length -1;
				if(i==0) writeStream.write("{\"name\": \""+ self.data[i][0]+"\", \"isMain\": "+ self.data[i][last] +"}\r\n");
				else writeStream.write(",{\"name\": \""+ self.data[i][0]+"\", \"isMain\": "+ self.data[i][last] +"}\r\n");
			}
			writeStream.write("], \"data\": [\r\n");
			for(var i=0; i<self.data.length; i++){
				writeStream.write("[");
				for(var j=1; j<self.data[i].length-1; j++){
					number = self.data[i][j];
					if(j==1) writeStream.write(""+self.__calcNorm(j,number));
					else writeStream.write(","+self.__calcNorm(j,number));
				}
				if(i != self.data.length-1) writeStream.write("],\r\n");
				else  writeStream.write("]\r\n");
			}
			writeStream.write("]}");			
		}catch(e){
			console.log(e);
		}

	},

	start: function(){
		var self = this;

		self.__loadData();
		self.__calcNormData();
		console.log(self.attrNorm);
		self.__saveData();
	}
};

/**
 * [srcFile description]
 * @type {String}
 * 0-domain, 1-tagSize, 2-tidSize, 3-xdrSize, 4-tagRatio, 5-xdrRatio, 6-tagDistribute, 7-xdrDistribute, 
 * 8-upPktSize, 9-downPktSize, 10-upFluxSize, 11-downFluxSize, 12-upAvgFluxSize, 13-downAvgFluxSize, 14-isMain
 */
var srcFile = "./imei-domain-stat-test@0605.csv";
var dstFile = "./imei-domain-stat-test@0605-kmeans-0456710111213.txt";
var attr = [0,4,5,6,7,10,11,12,13,14];

var create = new CreateKMeansData(srcFile, dstFile, attr);
create.start();
