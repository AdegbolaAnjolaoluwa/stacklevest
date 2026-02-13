const logger = require("./logger");

/**
 * Basic validation helper for request bodies
 * @param {Object} body - The request body to validate
 * @param {string[]} requiredFields - List of fields that must be present
 * @returns {string|null} - Error message or null if valid
 */
const validateFields = (body, requiredFields) => {
    for (const field of requiredFields) {
        if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
            return `Missing or empty required field: ${field}`;
        }
    }
    return null;
};

module.exports = {
    validateFields
};
