import './NewNavbar.css';
import mangoLogo from '../../src/images/mango-logo.png';
const NewNavbar = () => {
  return (
    <nav className="home-navbar">
      <div className="navbar-brand">
            <img src={mangoLogo} alt="Mango Logo" className="logo-image" />
            Mango
            </div>
    </nav>
  );
};
export default NewNavbar;