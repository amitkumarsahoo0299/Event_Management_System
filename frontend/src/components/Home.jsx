import { Link } from "react-router-dom";
import './Home.css'; 

const Home = () => {
  return (
    <div className="home-container">
      <div className="overlay">
        <h1>Welcome to the Event Management System!</h1>
        <p>Your one-stop solution for organizing and managing events.</p>
        <Link to='/login' className="btn btn-light my-5">Get Started</Link>
      </div>
    </div>
  );
}

export default Home;
