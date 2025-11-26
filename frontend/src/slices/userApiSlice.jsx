import apiSlice from "./apiSlice";


export const userApiSlice=apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        login:builder.mutation({
            query:(data)=>({
                url:'/api/users/login',
                method:'POST',
                body:data,
            }),
        }),
        logout:builder.mutation({
            query:()=>({
                url:'/api/users/logout',
                method:'POST',
                
            }),
        }),
        register:builder.mutation({
            query:(data)=>({
                url:'/api/users/',
                method:'POST',
                body:data,
            }),
        }),
        getUsers:builder.query({
            query:()=>({
                url:'/api/users/',
                method:'GET',
            })
        })


    })

    
})

export const{useLoginMutation,useLogoutMutation,useRegisterMutation,useGetUsersQuery}=userApiSlice