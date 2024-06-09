import { apiSlice } from "./api"

export const roleApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getDataPer: builder.query({
            query: params => ({
                url: `/data_per_${params.time}?departement=${params.departement}&start_date=${params.start}&end_date=${params.end}&${params.columns}`,
                method: 'GET',
            }),
        }),

        getAnnualSumData: builder.query({
            query: params => ({
                url: `/annual_sum_data?dataset=${params.dataset}&annee=${params.annee}&${params.columns}`,
                method: 'GET',
            }),
        }),

        getTmpPressionAnnualData: builder.query({
            query: params => ({
                url: `/average_tntxm_pmerr_per_time?departement=${params.departement}&start_date=${params.start}&end_date=${params.end}&column_time=${params.column_time}`,
                method: 'GET',
            }),
        }),

        getDataGaz: builder.query({
            query: () => ({
                url: '/gaz',
                method: 'GET'
            })
        })
    }),
})

export const {
    useGetDataPerQuery,
    useGetAnnualSumDataQuery,
    useGetTmpPressionAnnualDataQuery,
    useGetDataGazQuery
} = roleApiSlice