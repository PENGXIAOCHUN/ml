/**
 * Created by yuht on 2018. 7. 03..
 */
var ml = require('../lib/ml');
var Csv2Json = require('./csv2json'); 

/**
 * [srcFile description]
 * @type {String}
 * 0-domain, 1-tagSize, 2-tidSize, 3-xdrSize, 4-tagRatio, 5-xdrRatio, 6-tagDistribute, 7-xdrDistribute, 
 * 8-upPktSize, 9-downPktSize, 10-upFluxSize, 11-downFluxSize, 12-upAvgFluxSize, 13-downAvgFluxSize, 
 * 14-tidFlux, 15-xdrFlux, 16-isMain
 */
var csv2json = new Csv2Json({
	"srcfile": "./data/onedomain-sample@0605.csv",
	"labelcol": 13,
	"desccols": [0],
	"datacols": [4,5,6,7],
	"filters": [{"key":2,"value":10}]
});

var jsonObj = csv2json.transform();

var nodes=[];
for(var i=0; i<jsonObj.labels.length; i++){
	nodes.push({
		"label": jsonObj.labels[i],
		"name": jsonObj.names[i],
		"dimension": jsonObj.data[i],
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

var dimensions=[],labels=[],names=[],lofs=[];
for(var i=0; i<result.length; i++){
	// console.log(result[i].name+", "+ result[i].lof);
	dimensions.push(result[i].dimension);
	labels.push(result[i].label);
	names.push(result[i].name);
	lofs.push(result[i].lof);
}

var autokmeans = new ml.AutoKMeans({
	"data": dimensions,
	"weight": 0.50
	// "first": 0
});

var result = autokmeans.cluster();
var clusters = result.cluster;

// console.log("Cluster, Domain, Lof, DomianType");
// for(var i=0; i<clusters.length;i++){
// 	for(var j=0;j<clusters[i].length;j++){
// 		console.log("Cluster "+i+", "+names[clusters[i][j]]+", "+lofs[clusters[i][j]]+", "+labels[clusters[i][j]]);
// 	}
// }

console.log("Cluster, main, comm, other");
for(var i=0; i<clusters.length;i++){
	var mainnum=0, commnum=0, othernum=0;
	for(var j=0;j<clusters[i].length;j++){
		if(labels[clusters[i][j]] == 0) mainnum++;
		else if(labels[clusters[i][j]] == 1) commnum++;
		else othernum++;
	}
	console.log("Cluster "+i+", "+mainnum+", "+commnum+", "+othernum);
}