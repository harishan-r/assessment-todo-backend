export default (db) => {
    const { TODO_COLLECTION } = process.env;
    const collection = db.collection(TODO_COLLECTION);

    async function insertOne(todo) {
        return await collection.insertOne(todo);
    }

    async function findAll(userID) {
        return await collection.find({ userID }).toArray();
    }
    
    async function findOne(id) {
        return await collection.findOne({ _id: id });
    }

    async function findOneByToDoID(id) {
        return await collection.findOne({ todoID: id });
    }

    async function flipComplete(todoID, completed) {
        return await collection.updateOne({ todoID: todoID }, { $set: { completed: completed } });
    }

    async function updateName(todoID, name) {
        return await collection.updateOne({ todoID: todoID }, { $set: { name: name } });
    }

    return {
        insertOne,
        findAll,
        findOne,
        findOneByToDoID,
        flipComplete,
        updateName
    };
};