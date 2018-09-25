/**
 * Created by yuht on 2018. 7. 16..
 */
var ml = require('../lib/ml');

var labels = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q'];
var names = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q'];
var dimensions = [[2, 3],[2, 4],[1, 4],[1, 3],[2, 2],[3, 2],[8, 7],[8, 6 ],[7, 7],[7, 6],[8, 5],[100, 2],[8, 20],[8, 19],[7, 18],[7, 17],[8, 21]];

var nodes=[];
for(var i=0; i<labels.length; i++){
	nodes.push({
		"label": labels[i],
		"name": names[i],
		"dimension": dimensions[i],
		"kDistance": 0.0,
		"distance": 0.0,
		"kNeighbor": [],
		"reachDensity": 0.0,
		"reachDis": 0.0,
		"lof": 0.0
	});
}

var outlier = new ml.OutlierDetect({"nodes": nodes});

var result = outlier.get();

for(var i=0; i<result.length; i++){
	console.log(result[i].label+", "+ result[i].lof);
}