/**
 * Created by yuht on 2016. 6. 15..
 */
var utils = require('./utils');
var math = require('./utils').math;

KMeans=module.exports=function(options){
	var self = this;
	// must params
	self.data = options['data'];
	self.r = options['radius'];
	self.__center = [];
	self.__epoch=0;
	self.__costJ = 1000;
	// optional params
	self.distance = self.__getDistanceFunction(options['distance']);

	if(typeof options['epochs'] !== 'undefined')
		self.epochs = options['epochs'];
	if(typeof self.epochs === 'undefined') 
		self.epochs = 100;

	if(typeof options['autos'] !== 'undefined')
		self.autos = options['autos']
	if(typeof self.autos === 'undefined')
		self.autos = 300;

	if(typeof options['step'] !== 'undefined')
		self.step = options['step']
	if(typeof self.step === 'undefined')
		self.step = 0.2;

	if(typeof options['k'] !== 'undefined')
		self.k = options['k'];
	if(typeof self.k === 'undefined'){
		if(typeof options['centers'] !== 'undefined')
			self.k = self.__autoRandomK(options['centers'],self.autos);
		else
			self.k = self.__autoRandomK([],self.autos);
	}
	else
		self.__randomK();
}

KMeans.prototype = {
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

	__autoRandomK: function(arr,autos){
		var self = this;
		var num=0,index;
		while(num<autos){
			num++;
			index = Math.floor(Math.random()*self.data.length);	
			if(!self.__checkClusterCenter(arr,index)){
				arr.push(index);
				utils.log("__autoRandomK--> find k"+ arr.length +", random number: "+num)
				num=0;
			}
		}
		// utils.log("__autoRandomK--> not find k, max random number: "+ autos);
		
		self.__defineClusterCenter(arr);
		return arr.length;
	},

	__randomK: function(step){
		var self = this;
		var arr=[],num=0;
		var index=Math.floor(Math.random()*self.data.length);
		for(var i=0;i<self.k;i++){
			while(self.__checkClusterCenter(arr,index)){
				num++;
				index = Math.floor(Math.random()*self.data.length);	
				if(num % 100 == 0){
					self.r -= step;
				}
			}
			arr.push(index);
		}

		utils.log("__randomK: random "+num);
		self.__defineClusterCenter(arr);
	},

	__checkClusterCenter: function(arr,index){
		var self=this;
		var chk=false,dist,i;
		for(i=0;i<arr.length;i++){
			if(arr[i]==index){
				chk=true;
				break;
			}

			dist=self.distance(self.data[arr[i]],self.data[index]);
			
			if(dist<self.r){
				chk=true;
				break;
			}
		}
		return chk;	
	},

	__defineClusterCenter: function(arr){
		var self = this;
		var index;
		for(var i=0;i<arr.length;i++){
			index=arr[i];
			self.__center.push([]);
			for(var j=0;j<self.data[index].length;j++){
				self.__center[i].push(self.data[index][j]);
			}
		}
	},

	__calcCostJ: function(c){
		var self = this;
		var sum=0;
		var vi;

		for(var n=0;n<self.k;n++){
			for(var i=0;i<c[n].length;i++){
				vi=c[n][i];
				sum += self.distance(self.data[vi],self.__center[n]);
			}		
		}

		return sum;		
	},

	__calcCentroid: function(c){
		var self = this;
		var sum=0;
		for(var n=0;n<self.k;n++){
			for(var j=0;j<self.__center[n].length;j++){
				if(c[n].length==0) continue;
				for(var i=0;i<c[n].length;i++){
					sum += self.data[c[n][i]][j];
				}
				self.__center[n][j]=sum/c[n].length;
				sum=0;
			}	
		}		
	},

	// customCenter: function(arr){
	// 	var self = this;
	// 	self.k = self.__autoRandomK(arr, self.autos);
	// },

	cluster: function(){
		var self = this;
		self.__epoch++;
		utils.log("-------------iterate "+ self.__epoch +"-----------------");
		// utils.print("【Centroid】",self.__center);

		var i,k,curCostJ;
		var cluster=[];

		for(k=0;k<self.k;k++){
			cluster.push([]);
		}

		for(i=0;i<self.data.length;i++){
			var bestmatch=0;
			for(k=0;k<self.k;k++){
				if(self.distance(self.data[i],self.__center[k]) < self.distance(self.data[i],self.__center[bestmatch])){
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
	}
};