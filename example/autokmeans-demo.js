/**
 * Created by yuht on 2018. 7. 03..
 */
var fs=require('fs');
var ml = require('../lib/ml');
var JsonObj=JSON.parse(fs.readFileSync('./data/topic_json.txt'));
var nodes = JsonObj.nodeList;

var autokmeans = new ml.AutoKMeans({
	"data": JsonObj.data,
	"weight": 0.70
});

var names=[];
for(var i=0; i<nodes.length; i++){
	names.push(nodes[i].name);
}


var result = autokmeans.cluster();
var clusters = result.cluster;

for(var i=0; i<clusters.length;i++){
	var str ="";
	for(var j=0;j<clusters[i].length;j++){
		str += names[clusters[i][j]]+",";
	}
	console.log("Cluster "+i+": "+str);
}