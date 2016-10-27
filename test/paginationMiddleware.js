/*jslint
    node
*/

"use strict";

var test = require("tape");
var paginationMiddleware = require("../src/paginationMiddleware");

// shorthand function to create tests
function createTest(description, config, query, result) {
    function next(t) {
        return function () {
            t.pass("next() method called successfully");
        };
    }
    var middleware = paginationMiddleware(config);
    var req = {
        query: query
    };
    test(description, function (t) {
        t.plan(2);
        middleware(req, undefined, next(t));
        t.deepEquals(
            req.pagination,
            result
        );
    });
}

createTest(
    "Testing default configuration parameters and that the '-' char is parsed correctly on the default key",
    {
        sort: {
            validKeys: ["-test", "me"]
        }
    },
    {},
    {
        sort: {
            test: false
        },
        limit: 5,
        skip: 0
    }
);

createTest(
    "Testing that the sort.default property is enough for config even without the sort.validKeys property",
    {
        sort: {
            default: "-created"
        }
    },
    {},
    {
        sort: {
            created: false
        },
        limit: 5,
        skip: 0
    }
);

createTest(
    "Testing that query params override default params and that the '-' char is parsed correctly on the key",
    {
        sort: {
            validKeys: ["test", "created"],
            default: "-age"
        }
    },
    {
        limit: 8,
        skip: 3,
        sort: "-created"
    },
    {
        sort: {
            created: false
        },
        limit: 8,
        skip: 3
    }
);

createTest(
    "Testing that multiple sort parameters are parsed correctly",
    {
        sort: {
            validKeys: ["age", "rating", "created"]
        }
    },
    {
        sort: ["-created", "age", "rating"]
    },
    {
        sort: {
            created: false,
            age: true,
            rating: true
        },
        limit: 5,
        skip: 0
    }
);

createTest(
    "Testing paginationMiddleware function",
    {
        limit: {
            min: 30,
            max: 190,
            default: 0
        },
        sort: {
            validKeys: ["email", "created", "firstName"],
            default: "-created"
        }
    },
    {
        limit: 0,
        skip: 40
    },
    {
        sort: {
            created: false
        },
        limit: 30,
        skip: 40
    }
);
