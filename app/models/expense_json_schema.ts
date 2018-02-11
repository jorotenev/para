export let expense_schema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "title": "ExpenseObject",
    "description": "timetmap regex from https://www.myintervals.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/ and modified to require tz",
    "type": "object",
    "definitions": {
        "timestamp": {
            "type": "string",
            "pattern": "^([\\+-]?\\d{4}(?!\\d{2}\\b))((-?)((0[1-9]|1[0-2])(\\3([12]\\d|0[1-9]|3[01]))?|W([0-4]\\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\\d|[12]\\d{2}|3([0-5]\\d|6[1-6])))([T\\s]((([01]\\d|2[0-3])((:?)[0-5]\\d)?|24\\:?00)([\\.,]\\d+(?!:))?)?(\\17[0-5]\\d([\\.,]\\d+)?)?([zZ]|([\\+-])([01]\\d|2[0-3]):?([0-5]\\d)?))?)?$"
        }
    },
    "properties": {
        "id": {"type": ["number", "null"]},
        "name": {"type": "string"},
        "amount": {"type": "number"},
        "tags": {"type": "array", "items": {"type": "string"}},
        "currency": {"type": "string", "pattern": "^[A-Z]{3}$"},
        "timestamp_utc": {
            "$ref": "#/definitions/timestamp"
        },
        "timestamp_utc_created": {
            "$ref": "#/definitions/timestamp"
        },
        "timestamp_utc_updated": {
            "$ref": "#/definitions/timestamp"
        }
    },
    "required": ["id", "name", "amount", "tags", "currency", "timestamp_utc", "timestamp_utc_created", "timestamp_utc_updated"]
};
