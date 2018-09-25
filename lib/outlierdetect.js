/**
 * Created by yuht on 2018. 7. 16..
 */

OutlierDetect = module.exports = function(options){
	var self = this;

	self.nodes = options['nodes'];
	self.K = 5;
}

OutlierDetect.prototype = {
	__calKDAndKN: function(){
		var self = this;

		for(var i=0; i<self.nodes.length; i++){
			var compList = [];
			for(var j=0; j<self.nodes.length; j++){
				compList.push({});
				compList[j].key=j;
				compList[j].distance=self.__getDis(self.nodes[i].dimension, self.nodes[j].dimension);
			}

			compList.sort(self.__compare('distance', true));

			for(var n=1; n<self.K; n++){
				self.nodes[i].kNeighbor.push(compList[n]);
				if(n == self.K-1)
					self.nodes[i].kDistance = compList[n].distance;
			}
		}
	},

	__calReachDis: function(){
		var self = this;

		for(var i=0; i<self.nodes.length; i++){
			var compList = self.nodes[i].kNeighbor;
			for(var n=0; n<compList.length; n++){
				var node = compList[n];
				var kDis = self.nodes[node.key].kDistance;
				if(kDis < node.distance){
					node.reachDis = node.distance;
				}else{
					node.reachDis = kDis;
				}
			}
		}
	},

	__calReachDensity: function(){
		var self = this;

		for(var i=0; i<self.nodes.length; i++){
			var compList = self.nodes[i].kNeighbor;
			var sum=0.0, rd=0.0;
			for(var n=0; n<compList.length; n++){
				sum += compList[n].reachDis;
			}
			rd = self.K/sum;
			self.nodes[i].reachDensity = rd;
		}		
	},

	__calLof: function(){
		var self = this;

		for(var i=0; i<self.nodes.length; i++){
			var compList = self.nodes[i].kNeighbor;
			var sum=0.0;
			for(var n=0; n<compList.length; n++){
				var node = compList[n];
				var rd = self.nodes[node.key].reachDensity;
				sum += rd/self.nodes[i].reachDensity
			}

			self.nodes[i].lof = sum/self.K;
		}		
	},

	__getDis: function(data1,data2){
		var dis = 0.0;
		
		if(data1.length == data2.length){
			for(var i=0; i<data1.length; i++){
				dis += Math.pow((data1[i]-data2[i]), 2);
			}
			dis = Math.pow(dis,0.5);
		}

		return dis;
	},

	__compare: function(property,rev){
		if(rev == 'undefined') rev = 1;
		else rev = (rev)?1:-1;

		return function(a, b){
			var value1 = a[property];
			var value2 = b[property];

			return rev * (value1-value2);
		}
	},

	get: function(){
		var self = this;

		self.__calKDAndKN();
		self.__calReachDis();
		self.__calReachDensity();
		self.__calLof();

		self.nodes.sort(self.__compare('lof',true));

		return self.nodes;
	}
};
