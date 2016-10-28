# express-pagination-middleware
[![GitHub release](https://img.shields.io/github/release/nikoskalogridis/express-pagination-middleware.svg)]()
[![Build Status](https://travis-ci.org/nikoskalogridis/express-pagination-middleware.svg?branch=master)](https://travis-ci.org/nikoskalogridis/express-pagination-middleware)
[![npm](https://img.shields.io/npm/dt/express-pagination-middleware.svg)]()
[![npm](https://img.shields.io/npm/l/express-pagination-middleware.svg)]()

This module exports a **function** that takes a configuration object parameter with the following
properties:

```
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
```

and returns an **express compatible middleware** `function (req, res, next)` that parses the following
parameters from the req.query object and sets an object on the req.pagination having the following
properties:

```
{
    sort: Object - with keys for the sort value fields and value a boolean denoting ascending order
                   or not
    limit: number - the limit of records to return (if not specified a default value from the
                    configuration object is used)
    skip: number - the number of records to return (if not specified this property has a 0 value)
}
```

### Use it

To use this module first install it in your project using *npm*

```
npm install --save express-pagination-middleware
```

then in your express application

```javascript
...
var paginationMiddleware = require("express-pagination-middleware");
var userPaginationMiddleware = paginationMiddleware({
    sort: {
        validKeys: ["created", "age", "email"]
    },
    limit: {
        min: 10,
        max: 500
    }
});

// matching the url http://.../users?sort=created&limit=20&skip=40
router.get("/users", usersPaginationMiddleware, function (req, res, next) {
    // now the req parameter will have pagination property with all the required info
    // req.pagination = {
    //     sort: {
    //         created: true
    //     },
    //     limit: 20,
    //     skip: 40
    // }
    Users
      .find()
      .sort(req.pagination.sort)
      .skip(req.pagination.skip)
      .limit(req.pagination.limit)
      .exec()
      .then(res.json.bind(res))
      .catch(next);
}
````

### Contributing

Feel free to contribute to this project but please open pull requests only on the **development** branch and make sure you include tests for new functionality or issues identified with the codebase.

**All PR's should pass the test build to be considered for merging.**
