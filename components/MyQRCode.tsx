import { QRCodeCanvas } from 'qrcode.react';
import { usePublicKey } from '@/store';


const MyQRCode = () => {
  const { publicKey, setPublicKey } = usePublicKey();


  return (
    <div>
      {/* <h1>Your QR Code</h1> */}
      <QRCodeCanvas value={publicKey} />
    </div>
  );
};


export default MyQRCode;
