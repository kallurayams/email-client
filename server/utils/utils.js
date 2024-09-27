const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

module.exports = {
    convertToObjectId: (id) => {
        let isValid = mongoose.Types.ObjectId.isValid(id);
        if (isValid) {
            let mongoId = mongoose.Types.ObjectId(id);
            return mongoId;
        } else {
            return null;
        }
    },
    //Generate a random localId
    generateLocalId: () => {
        return uuidv4();
    }
}