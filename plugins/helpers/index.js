function to(promise) {
    return promise
        .then(data => {
            return [null, data];
        })
        .catch(err => [err]);
}

YouTubeGetID = function(url) {
    var ID = '';
    console.log(url, "TEST")
    url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
        return ID;
    }
    return url;
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

class Enum {
    constructor(data) {
        var rval = {};
        var index = 0;
        for (var i in data) {
            if (isObject(data[i])) {
                rval[Object.keys(data[i])[0]] = index = Object.values(data[i])[0];
            } else {
                rval[data[i]] = index;
            }
            index++;
        }
        return Object.freeze(rval);
    }
}

class Byte {
    constructor(data) {
        if (!isArray(data)) throw new Error("Byte input needs to be array");

        this.data = new Map();
        var index = 1;

        data.forEach(value => {
            this.data.set(value, index);
            index = index * 2;
        });

        this.getBit = this.getBit.bind(this);
        this.getByte = this.getByte.bind(this);
        this.getValue = this.getValue.bind(this);
        this.getMap = this.getMap.bind(this);

        return this;
    }

    getMap() {
        return this.data;
    }

    getBit(bit) {
        var value = this.data.get(bit);
        return value ? value : false;
    }

    getValue() {
        return obj => Object.values(this.data).reduce((a, b) => a + b);
    }

    getByte() {
        return (dec >>> this.getByte()).toString(2);
    }
}

function chunkify(arr, len) {

    var chunks = [],
        i = 0,
        n = arr.length;

    while (i < n) {
        chunks.push(arr.slice(i, i += len));
    }

    return chunks;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}



module.exports = {
    to: to,
    arrayContainsArray: arrayContainsArray,
    Enum: Enum,
    isObject: isObject,
    isClass: isClass,
    isArray: isArray,
    Byte: Byte,
    YouTubeGetID: YouTubeGetID,
    isNumber: isNumber,
    chunkify: chunkify,
    sleep: sleep,
    asyncForEach: asyncForEach
};