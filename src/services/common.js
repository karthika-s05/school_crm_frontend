exports.splitArrayIntoPairs=(arr)=> {
    const result = [];
    for (let i = 0; i < arr.length; i += 1) {
        const pair = arr.slice(i, i + 1);
        result.push(pair);
    }
    return result;
}

exports.splitArrayIntoPairs2=(arr)=> {
    const result = [];
    for (let i = 0; i < arr.length; i += 3) {
        const pair = arr.slice(i, i + 4);
        result.push(pair);
    }
    return result;
}