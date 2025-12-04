import apiSlice from "./apiSlice";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createChat: builder.mutation({
      query: (data) => ({
        url: "/chat/create-chat", 
        method: "POST",
        body: data,
      }),
    }),
    getChat: builder.query({
      query: () => ({
        url: "/chat/get-chat", 
        method: "GET",
      }),
    }),
    createGroupChat: builder.mutation({
      query: (data) => ({
        url: "/chat/group", 
        method: "POST",
        body: data,
      }),
    }),
    renameGroup: builder.mutation({
      query: (data) => ({
        url: "/chat/rename",
        method: "PUT",
        body: data,
      }),
    }),
    addUserToGroup: builder.mutation({
      query: (data) => ({
        url: "/chat/addToGroup", 
        method: "PUT",
        body: data,
      }),
    }),
    removeUserFromGroup: builder.mutation({
      query: (data) => ({
        url: "/chat/removeFromGroup",
        method: "PUT",
        body: data,
      }),
    }),
    getAllMessages: builder.query({
      query: (chatId) => `/chat/get-all-messages/${chatId}`, 
      providesTags: (result, error, chatId) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Messages', id: _id })),
              { type: 'Messages', id: `CHAT_${chatId}` },
            ]
          : [{ type: 'Messages', id: `CHAT_${chatId}` }],
    }),
    newMessage: builder.mutation({
      query: (data) => ({
        url: "/chat/new-message", 
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Messages", id: `CHAT_${arg.chatId}` }],
    }),
    
deleteChat: builder.mutation({
  query: (chatId) => ({
    url: `/chat/chat/${chatId}`, 
    method: 'DELETE',
  }),

  
  invalidatesTags: ['Chats']
}),
  }),
});

export const {
  useCreateChatMutation,
  useGetChatQuery,
  useCreateGroupChatMutation,
  useRenameGroupMutation,
  useAddUserToGroupMutation,
  useRemoveUserFromGroupMutation,
  useNewMessageMutation,
  useGetAllMessagesQuery,
   useDeleteChatMutation, 
} = chatApiSlice;