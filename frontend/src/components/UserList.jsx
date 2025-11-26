import React from 'react'
import { useGetUsersQuery } from '../slices/userApiSlice'
import { useCreateChatMutation } from '../slices/chatApiSlice'
import { Row, Col } from 'react-bootstrap'
import '../styles/sidebar.css'

const UserList = ({ searchTerm = '', onSelectUser }) => {
  const { data: users = [], isLoading, isError } = useGetUsersQuery()
  const [createChat] = useCreateChatMutation()

  const filteredUser = users.filter(user =>
    user?.name?.toLowerCase().includes(searchTerm?.toLowerCase() || '')
  )

  const handleUserClick = async (user) => {
    try {
      const chat = await createChat({ userId: user._id }).unwrap()
      onSelectUser(chat._id, user)
    } catch (err) {
      console.error('Error creating chat', err)
    }
  }

  if (isLoading) return <p>Users are Loading.....</p>
  if (isError) return <p>There is an error showing</p>

  return (
    <div className='sidebar'>
      {filteredUser.length > 0 ? (
        filteredUser.map(user => (
          <Row
            key={user._id}
            className='p-2'
            onClick={() => handleUserClick(user)} // ✅ Fixed here
          >
            <Col className='user'>
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className='profile-pic'
                />
              ) : (
                <p className='pro-pic'>
                  {user?.name
                    ? user.name
                        .split(' ')
                        .map(word => word[0])
                        .join('')
                        .toUpperCase()
                    : ''}
                </p>
              )}

              <span className='m-1 fw-bold'>{user.name}</span>
              <p className='m-1'>{user.email}</p>
            </Col>
          </Row>
        ))
      ) : (
        <p>No Users Found...</p>
      )}
    </div>
  )
}

export default UserList
