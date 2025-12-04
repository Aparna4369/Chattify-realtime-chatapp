import apiSlice from "./apiSlice";


 const messageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
   
    sendMessage: builder.mutation({
      query: (data) => ({
        url: "/chat/new-message", 
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Messages", id: "LIST" }],
    }),

    
    getMessages: builder.query({
      query: (chatId) => ({
        url: `/chat/get-all-messages/${chatId}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((msg) => ({ type: "Messages", id: msg._id })),
              { type: "Messages", id: "LIST" },
            ]
          : [{ type: "Messages", id: "LIST" }],
    }),

   
    deleteMessage: builder.mutation({
      query: (id) => ({
        url: `/chat/message/${id}`, 
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Messages", id }, 
        { type: "Messages", id: "LIST" }
      ],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetMessagesQuery,
  useDeleteMessageMutation,
} = messageApiSlice;
