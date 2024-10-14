import xssFilters from "xss-filters"

export const mongoRegexSearch = (search: string, fields: string[]): Record<string, RegExp>[] => {
    const MAX_SEARCH_LENGTH = 100
    const MAX_SPLITTED_ELEMENTS = 5

    const regexs: Record<string, RegExp>[] = []

    const words = xssFilters
        .inHTMLData(search)
        .slice(0, MAX_SEARCH_LENGTH)
        .split(' ')
        .map((i) => i.trim())

    const uniqueWords = [...new Set(words)]

    for (let i = 0; i < Math.min(MAX_SPLITTED_ELEMENTS, uniqueWords.length); i++) {
        const text = uniqueWords[i]

        for (const field of fields) {
            regexs.push({ [field]: new RegExp(text, 'ig') })
        }
    }

    return regexs
}