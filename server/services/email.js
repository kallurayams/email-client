const { logger } = require("../utils/logger");
const { HTTP_CODES, RESPONSE_MSGS } = require("../config/default");
const { User } = require("../models/user");
const { errorResponse, successResponse } = require("../utils/service-utils");


const exportable = {
    initialEmailSync: async (params) => {
        try {
            let { userId } = params;
            const response = await User.findOne({ _id: userId }).select({_id: 0, task: 1}).lean();
            if (!response || !response.task?.length) {
                return errorResponse(HTTP_CODES.User_Not_Found, RESPONSE_MSGS.User_Not_Found);
            }
            let initialTask = response.task.filter(task => task.type === "initial-sync");
            if (!initialTask?.length) {
                return errorResponse(HTTP_CODES.Data_Not_Found, RESPONSE_MSGS.Data_Not_Found);
            }
            initialTask = initialTask[0];

            //Using total and completed values, calculate percentage
            let percentage = 0;
            if (initialTask.total > 0) {
                percentage = Math.round(((initialTask.completed ?? 0) / initialTask.total) * 100);
            }

            return successResponse(HTTP_CODES.Success, RESPONSE_MSGS.Success, {percentage: percentage});
        } catch (error) {
            logger.error(error);
            return errorResponse(HTTP_CODES.Internal_Server_Error, RESPONSE_MSGS.Internal_Error);
        }
    }
};

module.exports = exportable;