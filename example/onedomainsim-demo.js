var Csv2Json = require('../lib/csv2json'); 
var utils = require('../lib/utils');
var math = require('../lib/utils').math;
/**
 * [csv2json description]
 * @type {String}
 * 0-一级域名, 1-端口, 2-业务名称, 3-终端数, 4-tac数, 5-话单数, 6-上行流量, 7-下行流量, 8-上行包数, 9-下行包数
 */
var csv2json = new Csv2Json({
	"srcfile": "./data/ondomain-behavior@0603.csv",
	"labelcol": 2,
	"desccols": [0,1],
	"datacols": [3,4,5,6,7,8,9],
	// "filters": [{"key":2,"value":10}],
});

var jsonObj = csv2json.transform();

function transformData(values){
	var dimensions=[];
	for(var i=0; i<values.length; i++){
		dimensions.push([]);
		if(values[i][4]>0)
			dimensions[i].push(values[i][3]/values[i][4]);
		else
			dimensions[i].push(0.0);
		if(values[i][6]>0)
			dimensions[i].push(values[i][5]/values[i][6]);
		else
			dimensions[i].push(0.0);
		dimensions[i].push((values[i][3]+values[i][4])/(values[i][5]+values[i][6]));
	}

	return dimensions;
}

function calcSim(dimensions, threshold){
	var result = [];
	for(var i=0; i<dimensions.length; i++){
		var distances = [];
		for(var j=0; j<dimensions.length; j++){
			distances.push(math.euclidean(dimensions[i], dimensions[j]));
		}
		var minObj = minVec(i, distances);
		// if(i==0) {
		// 	console.log(distances);
		// 	console.log(minObj);
		// }
		if(minObj.min<threshold){
			var row = [];
			row.push(i);
			row.push(minObj.index);
			row.push(minObj.min);
			result.push(row);
		}
	}

	print(result);
}

function print(result){
	var len = result.length;
	var tp = 0;
	for(var i=0; i<len; i++){
		if(jsonObj.labels[result[i][0]] == jsonObj.labels[result[i][1]]) tp++;
	}
	var precision = ((1.0*tp)/(1.0*len))*100;
	console.log("Precision: "+ precision + "%");
	for(var i=0; i<len; i++){
		console.log(jsonObj.labels[result[i][0]]+","+jsonObj.names[result[i][0]]+"; "
			+jsonObj.labels[result[i][1]]+","+jsonObj.names[result[i][1]]+"; "+result[i][2]);
	}
}

function minVec(curindex, vec){
    var min = 0.0;
    var index = -1;
    for(var i=0; i<vec.length; i++){
    	if(i==curindex) continue;
    	if(min==0.0) {
    		min = vec[i];
    		index = i;
        } else{
        	if(vec[i]<min){
        		min = vec[i];
        		index = i;
        	}
        }
    }

    return {
        "min": min,
        "index": index
    }	
}

// var dimensions = transformData(jsonObj.data);
// console.log(dimensions);
calcSim(transformData(jsonObj.data), 0.1);