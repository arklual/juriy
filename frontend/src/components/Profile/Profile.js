import './profile.css';

import ProfileMain from './ProfileMain/ProfimeMain';
import Unauthorized from '../Unauthorized/Unauthorized';

const Profile = (props) => {
    const isLoggedIn = localStorage.getItem("jwt") != undefined;
    
    return (
      <div className='profile_wrapper'>
        {
          isLoggedIn ? <ProfileMain/> : <Unauthorized target="профилем"/>
        }
      </div>
    )
}

export default Profile;