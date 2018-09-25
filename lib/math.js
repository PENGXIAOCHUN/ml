/**
 * Created by yuht on 2016. 6. 15..
 */
m = module.exports;

//Euclidean Distance
m.euclidean = function(x1,x2) {
	if(x1.length != x2.length)
		throw new Error("Enclidean Vector mismatch");
    var i;
    var distance = 0;
    for(i=0 ; i<x1.length; i++) {
        var dx = x1[i] - x2[i];
        distance += dx * dx;
    }
    
    return Math.sqrt(distance);
};

m.shape = function(mat) {
    var row = mat.length;
    var col = mat[0].length;
    return [row,col];
};

m.zeroVec = function(n) {
    var vec = [];
    while(vec.length < n)
        vec.push(0);
    return vec;
};

m.zeroMat = function(row,col) {
    var mat = [];
    while(mat.length < row)
        mat.push(m.zeroVec(col));
    return mat;
};

m.oneVec = function(n) {
    var vec = [];
    while(vec.length < n)
        vec.push(1);
    return vec;
};

m.sigmoid = function(x) {
    var sigmoid = (1. / (1 + Math.exp(-x)))
    if(sigmoid ==1) {
        sigmoid = 0.99999999999999; // Javascript Float Precision Problem.. This is a limit of javascript.
    } else if(sigmoid ==0) {
        sigmoid = 1e-14;
    }
    return sigmoid; // sigmoid cannot be 0 or 1;;
};

m.dSigmoid = function(x){
    a = m.sigmoid(x);
    return a * (1. - a);
};

m.maxVec = function(vec){
    var max = 0.0;
    var index = -1;
    for(var i=0; i<vec.length; i++){
        if(max<vec[i]) {
            max = vec[i];
            index = i;
        }
    }

    return {
        "max": max,
        "index": index
    }
};

m.randVec = function(n,lower,upper) {
    lower = (typeof lower !== 'undefined') ? lower : 0;
    upper = (typeof upper !== 'undefined') ? upper : 1;
    var vec = [];
    while(vec.length < n)
        vec.push(lower + (upper-lower) * Math.random());
    return vec;
};

m.randMat = function(row,col,lower,upper) {
    lower = (typeof lower !== 'undefined') ? lower : 0;
    upper = (typeof upper !== 'undefined') ? upper : 1;
    var mat = [];
    while(mat.length < row)
        mat.push(m.randVec(col,lower,upper));
    return mat;
};

m.transpose = function (mat) {
    var result = new Array(mat[0].length);
    for (var i = 0; i < mat[0].length; i++) {
        result[i] = new Array(mat.length);
        for (var j = 0; j < mat.length; j++) {
            result[i][j] = mat[j][i];
        }
    }
    return result;
};

m.addVec = function(vec1, vec2) {
    if(vec1.length === vec2.length) {
        var result = [];
        var i;
        for(i=0;i<vec1.length;i++)
            result.push(vec1[i]+vec2[i]);
        return result;
    } else {
        throw new Error("Length Error : not same.")
    }
}

m.addMatVec = function(mat,vec) {
    if(mat[0].length === vec.length) {
        var result = [];
        var i;
        for(i=0;i<mat.length;i++)
            result.push(m.addVec(mat[i],vec));
        return result;
    } else {
        throw new Error("Length Error : not same.")
    }
}

m.addMat = function (mat1, mat2) {
    if ((mat1.length === mat2.length) && (mat1[0].length === mat2[0].length)) {
        var result = new Array(mat1.length);
        for (var i = 0; i < mat1.length; i++) {
            result[i] = new Array(mat1[i].length);
            for (var j = 0; j < mat1[i].length; j++) {
                result[i][j] = mat1[i][j] + mat2[i][j];
            }
        }
        return result;
    } else {
        throw new Error('Matrix mismatch.');
    }
};

m.dotVec = function (vec1, vec2) {
    if (vec1.length === vec2.length) {
        var result = 0;
        for (var i = 0; i < vec1.length; i++) {
            result += vec1[i] * vec2[i];
        }
        return result;
    } else {
        throw new Error("Vector mismatch");
    }
};

m.mulMat = function (mat1, mat2) {
    if (mat1[0].length === mat2.length) {
        var result = new Array(mat1.length);

        for (var x = 0; x < mat1.length; x++) {
            result[x] = new Array(mat2[0].length);
        }


        var mat2_T = m.transpose(mat2);
        for (var i = 0; i < result.length; i++) {
            for (var j = 0; j < result[i].length; j++) {
                result[i][j] = m.dotVec(mat1[i],mat2_T[j]);
            }
        }
        return result;
    } else {
        throw new Error("Array mismatch");
    }
};

m.log2 = function(x){
    return Math.log(x)/Math.log(2);
};

m.entropy = function(vec){
    var ent = 0.0;
    var i,len=0;
    for(i=0; i<vec.length; i++){
        len += vec[i];
    }

    for(i=0; i<vec.length; i++) {
        var p = 1.*vec[i]/len;
        ent -= 1.*p*m.log2(p);
    }
    return ent;
};