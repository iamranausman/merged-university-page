import Header from '../components/organisms/Header';
import Footer from '../components/organisms/Footer';


export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}