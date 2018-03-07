import {ExpenseIdType, IExpense} from "~/models/expense";

export interface TimePeriod {
    from_dt_local: string,
    to_dt_local: string
}

type currency = string;
export type StatisticsResult = { currency: number }

export enum HTTPMethod {
    POST = "POST",
    DELETE = "DELETE",
    GET = "GET",
    PUT = "PUT"
}

export enum Order {
    asc = 'asc',
    desc = 'desc'
}

export interface GetListOpts {
    start_from: IExpense | null,
    batch_size?: number
    sort_order?: Order,
    sort_on?: keyof IExpense
}

export interface SyncResponse {
    to_add: IExpense[]
    to_update: IExpense[]
    to_remove: ExpenseIdType[]
}

export type SyncRequest = IExpense[]