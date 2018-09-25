/**
 * Created by yuht on 2016. 6. 16..
 */
var fs=require('fs');
var ml = require('../lib/ml');
var JsonObj=JSON.parse(fs.readFileSync('./logistic_data.txt'));
var data = JsonObj.data;

var x=[],y=[];

for(var i=0; i<data.length-10; i++){
	x.push([])
	x[i].push(data[i][0]);
	x[i].push(data[i][1]);
	y.push(data[i][2]);
}

var classifier = new ml.Logistic({
    'data' : x,
    'label' : y,
    'epochs' : 600,
    'step' : 0.01
});


classifier.train();

var xx = [], yy=[];
var j=0;
for(var i=data.length-10; i<data.length; i++){
	xx.push([]);
	xx[j].push(data[i][0]);
	xx[j].push(data[i][1]);
	yy.push(data[i][2]);
	j++;
}

var result = classifier.predict(xx);
var str;
for(var i=0; i<result.length; i++){
	str = (result[i]>0.75)?1:0;
	console.log("Predict Value="+str+", Real Value="+yy[i]+" | P="+result[i]);
}