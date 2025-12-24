import React from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth';

const Navbar = () => {
    const user = authService.getUser();

    return (
        <nav className="navbar">
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <img src="/odtu-logo.png" alt="ODTÜ" style={{height: '40px'}} />
                <img src="/chess-logo.png" alt="Chess" style={{height: '40px'}} />
                <Link to="/dashboard" className="navbar-brand">
                    METU NCC - NetChess
                </Link>
            </div>
            <ul className="navbar-nav">
                <li><Link to="/dashboard" className="nav-link">Dashboard</Link></li>
                <li><Link to="/games" className="nav-link">Games</Link></li>
                {authService.hasAnyRole(['ORGANIZER', 'ADMIN']) && (
                    <li><Link to="/tournaments" className="nav-link">Tournaments</Link></li>
                )}
                {authService.hasAnyRole(['MANAGER', 'ADMIN']) && (
                    <li><Link to="/manager" className="nav-link">Manager</Link></li>
                )}
                {authService.hasRole('ADMIN') && (
                    <li><Link to="/admin" className="nav-link">Admin</Link></li>
                )}
                {(authService.hasRole('ORGANIZER') || authService.hasRole('ADMIN')) && (
                    <Link to="/puzzles" className="nav-link">Puzzles</Link>
                )}
                <li>
          <span className={`badge badge-${user?.roles[0]?.toLowerCase() || 'player'}`}>
            {user?.username}
          </span>
                </li>
                <li>
                    <button onClick={() => authService.logout()} className="btn btn-danger">
                        Logout
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;