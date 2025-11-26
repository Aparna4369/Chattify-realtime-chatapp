import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import '../styles/header.css';
import logo from '../assets/logo.png';
import { logout } from '../slices/authSlice';
import { useLogoutMutation } from '../slices/userApiSlice';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { MdLogout, MdOutlineLogin } from 'react-icons/md';


function Header() {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();
  
  
 
 

  const logoutHandler = async () => {
    console.log("Logout button clicked ✅");
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }

  

  };
 

 


  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container>
        <Navbar.Brand className="head">
          <img src={logo} className="logo" alt="App Logo" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          
          <div className="ms-auto d-flex align-items-center gap-3">
           
            {userInfo ? (
              <>
                {/* Profile Picture & Name */}
                <div className="d-flex align-items-center text-white">
                  {userInfo.image ? (
                    <img
                      src={userInfo.image}
                      alt={userInfo.name}
                      className="user-pic"
                      style={{
                        width: "35px",
                        height: "35px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: "8px",
                      }}
                    />
                  ) : (
                    <div
                      className="user-pic bg-primary text-white d-flex align-items-center 
                      justify-content-center"
                      style={{
                        width: "35px",
                        height: "35px",
                        borderRadius: "50%",
                        fontWeight: "bold",
                        marginRight: "8px",
                      }}
                    >
                      {userInfo.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="fw-bold text-success">{userInfo.name}</span>
                </div>

                {/* Logout Button */}
                <span
                  className="logout"
                  onClick={logoutHandler}
                  style={{ cursor: 'pointer', fontSize: '22px' }}
                  title="Logout"
                >
                  <MdLogout />
                </span>
              </>
            ) : (
              <Nav.Link href="/login" className="logout">
                <MdOutlineLogin /> Login
              </Nav.Link>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
