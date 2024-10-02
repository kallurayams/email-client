const { logger } = require("../utils/logger");
const { HTTP_CODES, RESPONSE_MSGS } = require("../config/default");
const { errorResponse, successResponse } = require("../utils/service-utils");
const { Email } = require("../models/email");
const { Mailbox } = require("../models/mailbox");

const PAGE_SIZE = 5;

const getEmails = async ({ filter, page, user }) => {
  try {
    const query = { user: user.localUserId };

    if (filter) {
      const mailbox = await Mailbox.findOne({ name: filter });
      if (!mailbox) {
        return errorResponse(HTTP_CODES.Not_Found, RESPONSE_MSGS.Not_Found);
      }
      query.folderId = mailbox._id;
    }

    const [emails, totalEmails] = await Promise.all([
      Email.find(query)
        .sort({ updatedAt: -1 })
        .limit(PAGE_SIZE)
        .skip((page - 1) * PAGE_SIZE),
      Email.countDocuments(query),
    ]);

    const paginationData = {
      currentPage: page,
      totalPages: Math.ceil(totalEmails / PAGE_SIZE),
      totalEmails,
      pageSize: PAGE_SIZE,
    };

    return successResponse(HTTP_CODES.OK, RESPONSE_MSGS.Success, {
      emails,
      pagination: paginationData,
    });
  } catch (error) {
    logger.error(error);
    return errorResponse(
      HTTP_CODES.Internal_Server_Error,
      RESPONSE_MSGS.Internal_Error
    );
  }
};

module.exports = {
  getEmails,
};
