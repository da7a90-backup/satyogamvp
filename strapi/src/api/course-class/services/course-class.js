'use strict';

/**
 * course-class service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::course-class.course-class');
