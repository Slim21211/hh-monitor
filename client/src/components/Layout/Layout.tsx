import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { useLocation, Link } from 'react-router-dom';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className={styles.root}>
      <AppBar position="static" className={styles.appBar}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" className={styles.logoLink}>
              HH Vacancy Monitor
            </Link>
          </Typography>
          <nav className={styles.nav}>
            <Link 
              to="/search" 
              className={`${styles.navLink} ${location.pathname === '/search' ? styles.active : ''}`}
            >
              Поиск
            </Link>
            <Link 
              to="/results" 
              className={`${styles.navLink} ${location.pathname === '/results' ? styles.active : ''}`}
            >
              Результаты
            </Link>
          </nav>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" className={styles.container}>
        <Box className={styles.content}>
          {children}
        </Box>
      </Container>
    </div>
  );
};

export default Layout;