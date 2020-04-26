function to(promise) {
    return promise
        .then(data => {
            return [null, data];
        })
        .catch(err => [err]);
}


function arrayContainsArray(superset, subset) {
    if (!superset || !subset)
        return false;
    return subset.every(function(value) {
        return superset.indexOf(value) >= 0;
    });
}

var isObject = object => {
    return typeof object == "object" && !Array.isArray(object);
};

var isArray = object => {
    return typeof object == "object" && Array.isArray(object);
};

var isClass = v => {
    return typeof v === "function" && /^\s*class\s+/.test(v.toString());
};

function isNumber(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0)
}

module.exports = {
    to: to,
    arrayContainsArray: arrayContainsArray,
    isObject: isObject,
    isClass: isClass,
    isArray: isArray
};