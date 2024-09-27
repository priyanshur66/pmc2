import { QRCodeCanvas } from 'qrcode.react';
import { usePublicKey } from '@/store';


const MyQRCode = () => {
  console.log(usePublicKey.getState().publicKey)

  return (
    <div>
      {/* <h1>Your QR Code</h1> */}
      <QRCodeCanvas value="0xbb629c088b696f8c3500d0133692a1ad98a90baef9d957056ec4067523181e9a" />
    </div>
  );
};


export default MyQRCode;
