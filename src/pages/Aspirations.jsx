import AspirationWall from '../components/AspirationWall';
import { useSEO } from '../utils/seo';

const Aspirations = () => {
    useSEO(
        'Aspirasi | HMIF USD',
        'Sampaikan ide, kritik, dan saran untuk Himpunan Mahasiswa Informatika Universitas Sanata Dharma secara anonim.'
    );

    return (
        <AspirationWall />
    );
};

export default Aspirations;
