function to(promise) {
    return promise
        .then(data => {
            return [null, data];
        })
        .catch(err => [err]);
}

function limitLength(what, min, max) {
    if (typeof what != "string")
        return false;

    if (!what.length)
        return false;

    if (what.length > max)
        return false;

    if (what.length < min)
        return false;

    return true;
}

class Lock {
    constructor(limit) {
        this.locks = [];
        this.limit = limit || 500;
    }

    lock(key) {
        if (this.locks.length >= this.limit)
            return -1;

        if (this.locked(key))
            return false;
        this.locks.push(key);
        return true;
    }

    unlock(key) {
        if (this.locked(key)) {
            var index = this.locks.indexOf(key);
            if (index != -1) {
                this.locks.splice(index, 1);
            }
            return true;
        }
        return false;
    }

    locked(key) {
        if (this.locks.includes(key))
            return true;
        return false;
    }
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

class Recent {
    constructor(keep, key) {
        this.keep = keep;
        this.recent = [];
        this.key = key;
        return this;
    }

    add(thing) {
        if (this.recent.filter(a => a[this.key] == thing[this.key]).length > 0)
            return false;

        if (this.recent.length == this.keep) this.recent.pop();

        this.recent.unshift(thing);
    }

    get() {
        return this.recent.map(a => {
            var b = {...a }
            delete b.key;
            return b;
        });
    }
}

function parseItems(string) {
    var items = string.split(";");
    return items.map((pair) => {
        var k = pair.split(":");
        return {
            id: Number(k[0]),
            permanentEnchant: Number(k[1]),
        };
    });
}

function responseError(res, toSend) {
    res.status(403);
    res.json({
        data: null,
        error: toSend,
    });
}

function responseOk(res, toSend) {
    res.status(200);
    res.json({
        data: toSend,
        error: null,
    });
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
    asyncForEach: asyncForEach,
    Recent: Recent,
    parseItems: parseItems,
    responseError: responseError,
    responseOk: responseOk,
    Lock: Lock,
    limitLength: limitLength
};
