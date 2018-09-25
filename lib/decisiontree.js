/**
 * Created by yuht on 2018. 8. 02..
 */
var utils = require('./utils');
var math = require('./utils').math;

DecisionTree=module.exports=function(options){
	var self = this;
	// must params
	self.data = options['data'];
	self.label = options['label'];
}

DecisionTree.prototype = {
	__calcEntropy: function(rows){
		var self = this;

		var numEntries = rows.length;
		var results = self.__uniqueCounts(rows); 
		var ent = 0.0;
	    var keys = Object.keys(results);
	    for(var i=0; i<keys.length; i++) {
	        var p = 1.*results[keys[i]]/numEntries;
	        ent -= 1.*p*math.log2(p);
	    }
	    return ent;
	},

	__uniqueCounts: function(rows){
		var results = {};
	    var i;
	    for(i=0; i<rows.length; i++) {
	        var currentLabel = rows[i][rows[i].length-1];
	        if(typeof results[currentLabel ] === 'undefined')
	            results[currentLabel] = 0;
	        results[currentLabel]++;
	    }

	    return results;
	},

	__calcDiscreteGain: function(baseLength, rows, col){
		var self = this;
		// init divide column from colinfo
		var divideSet = {};
		var keys = self.colinfo['divides'][col];
		for(var n=0; n<keys.length; n++){
			if(typeof divideSet[keys[n]] === 'undefined')
				divideSet[keys[n]] = [];
		}
		// load data from rows into divide column 
		for(var i=0; i<rows.length; i++){
			divideSet[rows[i][col]].push(rows[i]);
		}

		// var keys = Object.keys(divideSet);
		var gain=0.0;
		for(var n=0; n<keys.length; n++){
			gain += (1.*divideSet[keys[n]].length/baseLength) * self.__calcEntropy(divideSet[keys[n]]);
		}

		return {'gain': gain, 'set': divideSet, 'value': 0.0};
	},

	__calcSuccessiveGain: function(baseLength, rows, col){
		var self = this;

		rows.sort(function(a,b){
			return a[col]-b[col];
		});

		var meanFun = function(a,b){return (1.*(a+b))/2;}
		var meanData = [];

		for(var i=0; i<rows.length-1; i++){
			meanData.push(meanFun(rows[i][col],rows[i+1][col]));
		}

		var bestGain=1.0;
		var bestDivideSet={};
		var bestValue=0.0;
		for(var k=0; k<meanData.length; k++){
			var divideSet = {"positive": [], "negative": []};
			var gain=0.0;
			for(var i=0; i<rows.length; i++){
				if(rows[i][col]>meanData[k])
					divideSet['positive'].push(rows[i]);
				else
					divideSet['negative'].push(rows[i]);
			}

			var keys = Object.keys(divideSet);
			for(var n=0; n<keys.length; n++){
				gain += (1.*divideSet[keys[n]].length/baseLength) * self.__calcEntropy(divideSet[keys[n]]);
			}
			if(gain<bestGain){
				bestGain = gain;
				bestValue = meanData[k];
				bestDivideSet = divideSet;
			}
		}
	
		return {'gain': bestGain, 'set': bestDivideSet, 'value': bestValue};
	},

	__chooseBestFeature: function(rows){
		var self = this;

		var numFeature = self.data[0].length;
		var baseEntropy = self.__calcEntropy(rows);
		var bestGain = 0.0;
		var bestFeature = -1;
		var bestDivideSet={};
		var bestValue=0.0;
		var bestSuccessive=false;
		var columnCount = rows[0].length - 1;
		
		for(var col=0; col<columnCount; col++){
			var isSuccessive = self.colinfo['types'][col];
			var result = (isSuccessive)?self.__calcSuccessiveGain(rows.length, rows, col)
										:self.__calcDiscreteGain(rows.length, rows, col);
			var gain = baseEntropy - result['gain'];

			if(bestGain<gain){
				bestGain = gain;
				bestFeature = col;
				bestDivideSet = result['set'];
				bestValue = result['value'];
				bestSuccessive = isSuccessive;
			}
		}

		return {'col': bestFeature, 'gain': bestGain, 'set': bestDivideSet, 'value': bestValue};
	},

	__emptyNode: function(parentSet){
		var self = this;

		var keys = Object.keys(parentSet);
		var sets = [];
		for(var n=0; n<keys.length; n++){
			for(var i=0; i<parentSet[keys[n]].length; i++){
				sets.push(parentSet[keys[n]][i]);
			}
		}

		return new TreeNode({
			'result': self.__uniqueCounts(sets)
		});
	},

	__buildTree: function(rows){
		var self = this;

		var result = self.__chooseBestFeature(rows);

		if(result['gain'] > 0){
			var nodes = [];
			var divideSet = result['set'];
			var col = result['col'];
			var keys = Object.keys(divideSet);

			for(var i=0; i<keys.length; i++){
				if(divideSet[keys[i]].length>0) nodes.push(self.__buildTree(divideSet[keys[i]]));
				else{
					//Handle the case that the grouped sample set is empty.
					//The empty node category selects the category with the largest number of 
					//parent node sample data set categories
					nodes.push(self.__emptyNode(divideSet));
				}
			}
			var value = (self.colinfo['types'][col])? result['value'] : keys;

			return new TreeNode({
				'col': col,
				'value': value,
				'nodes': nodes
			});
		}else{
			return new TreeNode({
				'result': self.__uniqueCounts(rows)
			});
		}
	},

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

	__prune: function(){

	},

	train: function(){
		var self = this;

		var rows = [];
		for(var i=0; i<self.data.length; i++) {
		    rows.push(self.data[i]);
		    rows[i].push(self.label[i]);
		}

		self.colinfo = self.__calcColumnInfo(rows);
		self.tree = self.__buildTree(rows);

		return self.tree;
	},

	print: function(tree,indent){
		var self = this;

		indent = indent || '';
		if(typeof tree.result !== 'undefined'){
			process.stdout.write(indent);
        	console.log(tree.result);
		}
    	else {
    		process.stdout.write(indent);
    		if(self.colinfo['types'][tree.col])
    			console.log(tree.col+ ":>" + tree.value+",<="+ tree.value);
    		else
    			console.log(tree.col+':'+tree.value+'? ');
    		for(var i=0; i<tree.nodes.length; i++){
    			self.print(tree.nodes[i], indent+'	');
    		}
    	}
	}
};

function TreeNode(options){
	var self = this;

	self.col = (typeof options['col'] === 'undefined') ? -1 : options['col'];
	self.value = options['value'];
    self.result = options['result'];
    self.nodes = options['nodes'];
}