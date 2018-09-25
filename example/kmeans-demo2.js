/**
 * Created by yuht on 2018. 7. 03..
 */
var fs=require('fs');
var ml = require('../lib/ml');
var Domain = require('./domain'); 

/**
 * [srcFile description]
 * @type {String}
 * 0-domain, 1-tagSize, 2-tidSize, 3-xdrSize, 4-tagRatio, 5-xdrRatio, 6-tagDistribute, 7-xdrDistribute, 
 * 8-upPktSize, 9-downPktSize, 10-upFluxSize, 11-downFluxSize, 12-upAvgFluxSize, 13-downAvgFluxSize, 
 * 14-tidFlux, 15-xdrFlux, 16-isMain
 */
var domain = new Domain({
	"srcfile": "./data/onedomain-sample@0605.csv",
	"labelcols": [0,12],
	"datacols": [2,4]
});
var jsonObj = domain.create();


var kmeans = new ml.KMeans({
	"data": jsonObj.data,
	"radius": 0.1
});

var result = kmeans.cluster();
var clusters = result.cluster;

console.log("Cluster, Domain, DomianType");
for(var i=0; i<clusters.length;i++){
	for(var j=0;j<clusters[i].length;j++){
		console.log("Cluster "+i+", "+jsonObj.names[clusters[i][j]]+", "+jsonObj.labels[clusters[i][j]]);
	}
}

console.log("Cluster, comm, main, other");
for(var i=0; i<clusters.length;i++){
	var mainnum=0, commnum=0, othernum=0;
	for(var j=0;j<clusters[i].length;j++){
		if(jsonObj.labels[clusters[i][j]] == 0) commnum++;
		else if(jsonObj.labels[clusters[i][j]] == 1) mainnum++;
		else othernum++;
	}
	console.log("Cluster "+i+", "+mainnum+", "+commnum+", "+othernum);
}