import apiSlice from "./apiSlice";

export const chatApiSlice=apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        createChat: builder.mutation({
        query: (data) => ({
                 url: '/api/chat/create-chat',
                 method: 'POST',
                 body: data, 
}),
        }),

        getChat:builder.query({
            query:()=>({
            url:'/api/chat/get-chat',
            method:'GET',
            }),

        }),
    })
})
export const {useCreateChatMutation,
    useGetChatQuery}=chatApiSlice;