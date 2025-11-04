'use strict';

/**
 * retreat-application service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::retreat-application.retreat-application');
