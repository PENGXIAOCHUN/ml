/**
 * Created by yuht on 2018. 7. 02..
 */
var utils = require('./utils');
var math = require('./utils').math;

AutoKMeans=module.exports=function(options){
	var self = this;
	// must params
	self.data = options['data'];
	self.weight = options['weight'];
	self.__center = [];
	self.__centerData = [];
	self.__epoch=0;
	self.__costJ = 1000;	

	// optional params
	self.distance = self.__getDistanceFunction(options['distance']);

	if(typeof options['epochs'] !== 'undefined')
		self.epochs = options['epochs'];
	if(typeof self.epochs === 'undefined') 
		self.epochs = 100;

	if(typeof options['first'] != 'undefined')
		self.first = options['first'];

	self.__autoCenter();
	self.__init();
}

AutoKMeans.prototype = {
	__getDistanceFunction: function(option){
		if(typeof options === 'undefined') {
        	return math.euclidean;
	    } else if (typeof options === 'function') {
	        return options;
	    } else if (options['type'] === 'euclidean') {
	        return math.euclidean;
	    } else if (options['type'] === 'pearson') {
	        return math.pearson;
	    }
	},

	__init: function(){
		var self = this;

		self.k = self.__center.length;
		for(var k=0; k<self.k; k++){
			self.__centerData.push(self.data[self.__center[k]]);
		}

		// utils.print("centerData: ", self.__centerData);
	},

	__autoCenter: function(){
		var self = this;

		if(typeof self.first === 'undefined')
			self.first = Math.floor(Math.random()*self.data.length);	
		self.__center.push(self.first);

		var maxDis = 0.0,dis,index;
		for(var i=0; i<self.data.length; i++){
			dis = self.distance(self.data[i], self.data[self.first]);
			if(dis>maxDis) {
				maxDis = dis;
				index = i;
			}
		}
		// utils.log("MaxDis: "+ maxDis +", maxDisIndex: "+ index);
		self.__center.push(index);
		
		var autos = 200;	//default iterator number
		var oldCenterSize = 0;	//prev iterator center size

		for(var n=0; n<autos; n++){
			var distances = [];
			var dataIndexs = [];
			for(var i=0; i<self.data.length; i++){
				if(!self.__contains(i)){
					distances.push(self.__getMinDisToCenter(i));
					dataIndexs.push(i);
				}
			}

			var result = math.maxVec(distances);
			var avgDis = self.__getAvgDisOfCenter();

			// utils.log("maxDis: "+ result.max +", center avgDis: "+ avgDis + ", index: "+ dataIndexs[result.index]);

			if(result.max > (self.weight * avgDis)){
				self.__center.push(dataIndexs[result.index]);
			}

			if(oldCenterSize == self.__center.length) break;
			else oldCenterSize = self.__center.length;
		}
	},

	__contains: function(index){
		var self = this;
		
		var i=self.__center.length;
		while(i--){
			if(self.__center[i] === index){
				return true;
			}
		}

		return false;
	},

	__getMinDisToCenter: function(index){
		var self = this;

		var minDis=100000, dis;
		for(var j=0; j<self.__center.length; j++){
			dis = self.distance(self.data[index], self.data[self.__center[j]]);
			if(dis<minDis) {
				minDis = dis;
			}
		}

		// console.log("__getMinDisToCenter： "+ minDis);
		return minDis;
	},

	__getAvgDisOfCenter: function(){
		var self = this;
		var dis=0.0,index=0;
		for(var i=0; i<self.__center.length; i++){
			for(var j=i+1; j<self.__center.length; j++){
				// console.log("merg: "+self.__center[i]+", "+self.__center[j]);
				dis += self.distance(self.data[self.__center[i]], self.data[self.__center[j]]);
				index++;
			}
		}

		return dis/index;
	},

	__calcCostJ: function(c){
		var self = this;
		var sum=0;
		var vi;

		for(var n=0;n<self.k;n++){
			for(var i=0;i<c[n].length;i++){
				vi=c[n][i];
				sum += self.distance(self.data[vi],self.__centerData[n]);
			}		
		}

		return sum;		
	},

	__calcCentroid: function(c){
		var self = this;
		var sum=0;
		for(var n=0;n<self.k;n++){
			for(var j=0;j<self.__centerData[n].length;j++){
				if(c[n].length==0) continue;
				for(var i=0;i<c[n].length;i++){
					sum += self.data[c[n][i]][j];
				}
				self.__centerData[n][j]=sum/c[n].length;
				sum=0;
			}	
		}		
	},

	cluster: function(){
		var self = this;
		self.__epoch++;
		utils.log("-------------iterate "+ self.__epoch +"-----------------");
		// utils.print("【Centroid】",self.__center);

		var curCostJ;
		var cluster=[];

		for(var k=0;k<self.k;k++){
			cluster.push([]);
		}

		for(var i=0;i<self.data.length;i++){
			var bestmatch=0;
			for(k=0;k<self.k;k++){
				if(self.distance(self.data[i],self.__centerData[k]) < self.distance(self.data[i],self.__centerData[bestmatch])){
					bestmatch = k;
				}
			}

			cluster[bestmatch].push(i);
		}
		
		curCostJ=self.__calcCostJ(cluster);
		utils.log("curCostJ="+curCostJ+", CostJ="+self.__costJ);
		
		if(curCostJ<=(self.__costJ-0.00001) && self.__epoch<self.epochs) {
			self.__costJ = curCostJ;
			self.__calcCentroid(cluster);
			utils.print("【Cluster】",cluster);
			
			self.cluster();
		}

		return {
			"cluster": cluster,
			"center": self.__center
		};
	},

	printCenterInfo: function(){
		var self = this;
		console.log("Total cluster: "+self.__center.length +", "+self.__center);
	}
};