import mongoose from "mongoose"
import BackendError from "./BackendError"

export type MongooseAdditionals = any[]
export type MongooseMatch<T> = { [P in keyof mongoose.Document<T>]?: any }

export interface Pagination<Data> {
    data: Data[]
    hasNext: boolean
    next: number | null

    pages: number
    count: number
}

export interface PagedFindProps<DocumentInterface = any> {
    match?: mongoose.FilterQuery<DocumentInterface & { _id: mongoose.ObjectId | string }>
    project?: any
    sort?: string | { [key: string]: -1 | 1 | 'asc' | 'desc' } | undefined | null
    populate?: mongoose.PopulateOptions | mongoose.PopulateOptions[]
    items?: number
    page?: number
}

export async function PagedFind<T>(
    Model: mongoose.Model<T>,
    {
        match = {},
        project = { password: 0, security: 0 },
        sort = undefined,
        populate = undefined,
        items = 10,
        page = 0
    }: PagedFindProps<T>
): Promise<Pagination<T>> {
    const fullQuery: any = { $and: [match] }

    if (page && (typeof page !== 'number' || page < 0 || isNaN(+page))) {
        throw BackendError('InvalidPage')
    }

    let count = await Model.countDocuments(fullQuery)

    let data: any = await Model.find(fullQuery, project)
        .sort(sort)
        .skip(items * page)
        .limit(items + 1)

    if (populate) {
        count = await Model.countDocuments(fullQuery).populate(populate)
        data = await Model.find(fullQuery, project)
            .populate(populate)
            .sort(sort)
            .skip(items * page)
            .limit(items + 1)
    }

    const hasNext = data.length === items + 1
    const next = hasNext ? page + 1 : null
    const pages = Math.ceil(count / items)

    return {
        data: data.slice(0, items),
        next,
        hasNext,
        pages,
        count
    }
}

type PagedAggregateOptions<T extends mongoose.Document<any> = any> = {
    preMatchAdditionals?: MongooseAdditionals
    match?: MongooseMatch<T>
    items?: number
    page?: number
    additionals?: MongooseAdditionals
    sort?: string | any
}
export async function PagedAggregate<T = any, Document extends mongoose.Document<any> = any>(
    schema: mongoose.Model<Document>,
    { match = {}, additionals = [], items = 25, page = 0, preMatchAdditionals = [], sort }: PagedAggregateOptions<Document>
): Promise<Pagination<T>> {
    if (page !== undefined && typeof page !== 'number') {
        throw new Error('InvalidPage')
    }

    if (items <= 0) {
        throw new Error('InvalidItems')
    }

    if (sort) {
        additionals.push({ $sort: sort })
    }

    let fullQuery: any[] = [...preMatchAdditionals, ...additionals]

    if (additionals.length > 0 && additionals[0].$geoNear !== undefined) {
        fullQuery = [additionals[0], ...preMatchAdditionals, ...additionals.slice(1)]
    }

    const query = [
        ...fullQuery,
        {
            $facet: {
                data: [{ $skip: items * page }, { $limit: items + 1 }],
                count: [{ $count: 'totalCount' }]
            }
        }
    ]

    try {
        const result = await schema.aggregate(query)

        const count = (result[0]?.count[0]?.totalCount as number | undefined) ?? 0
        const data = result[0].data as T[]

        const hasNext = data.length === items + 1

        return {
            data: data ? data.slice(0, items) : [],
            next: hasNext ? page + 1 : null,
            hasNext,
            count,
            pages: Math.ceil(count / items)
        }
    } catch (err: unknown) {
        throw err
    }
}

