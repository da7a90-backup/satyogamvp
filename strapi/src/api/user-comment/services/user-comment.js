'use strict';

/**
 * user-comment service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-comment.user-comment');
