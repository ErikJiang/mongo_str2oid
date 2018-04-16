'use strict';

let logModel = require('./logModel');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const promiseWhile = (predicate, action) => {
    function loop() {
        if (!predicate()) return;
        return Promise.resolve(action()).then(loop);
    }
    return Promise.resolve().then(loop);
};

let page = 1;
let pageSize = 3;
let isFinished = false;

let condition = () => {
    return !isFinished;
}
let handler = () => {
    return logModel.find({}, { 'userId': 1 })
        // .sort({ userId: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .snapshot(true)
        .then(cursor => {
            isFinished = cursor.length ? false : true;
            page ++;
            console.log(`cursor.length: ${cursor.length}`);
            return cursor;
        })
        .then(cursor => {
            if (isFinished) return [];
            let requests = [];
            cursor.forEach(doc => {
                console.log(`doc.userId: ${doc.userId}`);
                console.log(`ObjectId(doc.userId): ${ObjectId(doc.userId)}`);

                requests.push({
                    'updateOne': {
                        'filter': { '_id': doc._id },
                        'update': { '$set': { 'userId': ObjectId(doc.userId) } }
                    }
                });
            });
            return requests;
        })
        .then(requests => {
            if (isFinished) return [];
            return logModel.bulkWrite(requests);
        });
}

return promiseWhile(condition, handler)
    .then(data => {
        process.exit(0);
    })
    .catch(err => {
        console.error(err.message);
        process.exit(1);
    });