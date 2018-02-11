import {ExpenseConstructor} from "~/models/expense";


export let ten_expenses: ExpenseConstructor[] = [
    {
        "id": 1,
        "name": "server id 1",
        "amount": 12,
        "currency": "EUR",
        "tags": [
            "work",
            "sport"
        ],
        "timestamp_utc": "2017-10-29T09:09:21.853071Z",
        "timestamp_utc_created": "2017-10-29T09:09:21.853071Z",
        "timestamp_utc_updated": "2017-10-29T09:09:21.853071Z",
    },
    {
        "id": 2,
        "name": "server id 2",
        "amount": 118,
        "currency": "EUR",
        "tags": [
            "vacation"
        ],
        "timestamp_utc": "2017-10-29T09:10:21.853071Z",
        "timestamp_utc_created": "2017-10-29T09:10:21.853071Z",
        "timestamp_utc_updated": "2017-10-29T09:10:21.853071Z",
    },
    {
        "id": 3,
        "name": "server id 3",
        "amount": 159,
        "currency": "EUR",
        "tags": [
            "vacation",
            "work",
            "home"
        ],
        "timestamp_utc": "2017-10-29T09:11:21.853071Z",
        "timestamp_utc_created": "2017-10-29T09:11:21.853071Z",
        "timestamp_utc_updated": "2017-10-29T09:11:21.853071Z",
    },
    {
        "id": 4,
        "name": "server id 4",
        "amount": 5,
        "currency": "EUR",
        "tags": [
            "vacation",
            "sport",
            "vacation"
        ],
        "timestamp_utc": "2017-10-29T09:12:21.853071Z",
        "timestamp_utc_created": "2017-10-29T09:12:21.853071Z",
        "timestamp_utc_updated": "2017-10-29T09:12:21.853071Z",
    },
    {
        "id": 5,
        "name": "server id 5",
        "amount": 184,
        "currency": "EUR",
        "tags": [
            "sport",
            "home",
            "vacation"
        ],
        "timestamp_utc": "2017-10-29T09:13:21.853071Z",
        "timestamp_utc_created": "2017-10-29T09:13:21.853071Z",
        "timestamp_utc_updated": "2017-10-29T09:13:21.853071Z",
    },
    {
        "id": 6,
        "name": "server id 6",
        "amount": 191,
        "currency": "EUR",
        "tags": [
            "work"
        ],
        "timestamp_utc": "2017-10-29T09:14:21.853071Z",
        "timestamp_utc_created": "2017-10-29T09:14:21.853071Z",
        "timestamp_utc_updated": "2017-10-29T09:14:21.853071Z",
    },
    {
        "id": 7,
        "name": "server id 7",
        "amount": 134,
        "currency": "EUR",
        "tags": [
            "vacation",
            "home",
            "vacation"
        ],
        "timestamp_utc": "2017-10-29T09:15:21.853071Z",
        "timestamp_utc_created": "2017-10-29T09:15:21.853071Z",
        "timestamp_utc_updated": "2017-10-29T09:15:21.853071Z",
    },
    {
        "id": 8,
        "name": "server id 8",
        "amount": 132,
        "currency": "EUR",
        "tags": [],
        "timestamp_utc": "2017-10-29T09:16:21.853071Z",
        "timestamp_utc_created": "2017-10-29T09:16:21.853071Z",
        "timestamp_utc_updated": "2017-10-29T09:16:21.853071Z",
    },
    {
        "id": 9,
        "name": "server id 9",
        "amount": 71,
        "currency": "EUR",
        "tags": [
            "vacation",
            "vacation"
        ],
        "timestamp_utc": "2017-10-29T09:17:21.853071Z",
        "timestamp_utc_created": "2017-10-29T09:17:21.853071Z",
        "timestamp_utc_updated": "2017-10-29T09:17:21.853071Z",
    },
    {
        "id": 10,
        "name": "server id 10",
        "amount": 95,
        "currency": "EUR",
        "tags": [
            "vacation",
            "vacation",
            "work"
        ],
        "timestamp_utc": "2017-10-29T09:18:21.853071Z",
        "timestamp_utc_created": "2017-10-29T09:18:21.853071Z",
        "timestamp_utc_updated": "2017-10-29T09:18:21.853071Z",
    }
];
export const SINGLE_EXPENSE : ExpenseConstructor= Object.freeze(ten_expenses[0]);
