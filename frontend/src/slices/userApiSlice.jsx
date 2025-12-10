import apiSlice from "./apiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Login
    login: builder.mutation({
      query: (data) => ({
        url: "/users/login",
         method:"POST",
         body: data
      }),
      invalidatesTags: ["User"],
    }),

    // Logout
    logout: builder.mutation({
      query: () => ({
        url: "/users/logout", 
        method: "POST",
      }),
      invalidatesTags: ["User", "Chat", "Messages"],
    }),

    // Register new user
    register: builder.mutation({
      query: (formData) => ({
        url: "/users", 
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

    // Get all users
    getUsers: builder.query({
      query: () => ({
        url: "/users", 
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useGetUsersQuery,
} = userApiSlice;