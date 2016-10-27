/*
    Pagination middleware

    This module exports a function that takes a configuration object parameter with the following
    properties:
    {
        sort: {
            validKeys: Array of strings (case sensitive),
            default: String (optional, by default assigned to the first element of the
                        validKeys array with ascending sorting order unless prefixed by a "-")
        },
        limit: {
            min: number (optional, default: 5),
            max: number (optional, default: 100),
            default: number (optional, defaults to min)
        }
    }
    and returns an express compatible middleware function (req, res, next) that parses the following
    parameters from the req.query object and sets an object on the req.pagination having the following
    properties:
    {
        sort: Object - with keys for the sort value fields and value a boolean denoting ascending order
                       or not
        limit: number - the limit of records to return (if not specified a default value from the
                        configuration object is used)
        skip: number - the number of records to return (if not specified this property has a 0 value)
    }
*/

/*jslint
    node
*/

"use strict";

function paginationMiddleware(config) {
    if (typeof config !== "object" || config === null) {
        throw new Error("The config parameter is mandatory and should be an object!");
    }
    config.limit = config.limit || {};
    config.limit.min = config.limit.min === undefined
        ? 5
        : config.limit.min;
    config.limit.max = config.limit.max === undefined
        ? 100
        : config.limit.max;
    config.limit.default = config.limit.default === undefined
        ? config.limit.min
        : config.limit.default;
    config.sort = config.sort || {};
    if (
        !config.sort.default &&
        (
            !Array.isArray(config.sort.validKeys) ||
            config.sort.validKeys.length === 0
        )
    ) {
        throw new Error("sort.validKeys should be a non empty array of strings or a sort.defaultKey should be defined!");
    }

    config.sort.default = config.sort.default || config.sort.validKeys[0];

    var defaultSortIsAscending = config.sort.default.substring(0, 1) !== "-";

    return function (req, ignore, next) {
        var sortKeys = Array.isArray(req.query.sort)
            ? req.query.sort
            : req.query.sort
                ? [req.query.sort]
                : [];

        var sortObject = sortKeys.reduce(function (c, key) {
            var ascending = key.substring(0, 1) !== "-";
            if (!ascending) {
                key = key.substr(1);
            }
            if (
                key &&
                config.sort.validKeys.indexOf(key) !== -1
            ) {
                c[key] = ascending;
            }
            return c;
        }, {});

        if (Object.keys(sortObject).length === 0) {
            sortObject[
                defaultSortIsAscending
                    ? config.sort.default
                    : config.sort.default.substr(1)
            ] = defaultSortIsAscending;
        }
        req.pagination = {
            limit: Math.max(
                Math.min(
                    parseInt(req.query.limit, 10) || config.limit.min,
                    config.limit.max
                ),
                config.limit.min
            ),
            sort: sortObject,
            skip: parseInt(req.query.skip, 10) || 0
        };

        next();
    };
}

module.exports = paginationMiddleware;
