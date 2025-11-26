import apiSlice from "./apiSlice"

export const messageApiSlice=apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        sendMessage:builder.mutation({
            query:(data)=>({             //send a new message
                url:'/api/chat/new-message',
                method:'POST',
                body:data,
            }),
        }),
        getMessages:builder.query({
            query:(chatId)=>({           
            url:`/api/chat/get-all-messages/${chatId}`,
            method:'GET',
             }),

        }),
    })
})
export const {useSendMessageMutation,
    useGetMessagesQuery}=messageApiSlice;


