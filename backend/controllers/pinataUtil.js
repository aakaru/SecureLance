import axios from 'axios';
import FormData from 'form-data';

const PINATA_API_KEY = '8b821bd1282177a062e3';
const PINATA_API_SECRET = '743cef66935901aa90dd006104b91e96d112af872d13cd6aa975868858abd18e';

export async function uploadFileToPinata(filePath, fileStream) {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const data = new FormData();
  data.append('file', fileStream, { filepath: filePath });

  const res = await axios.post(url, data, {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {
      ...data.getHeaders(),
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET,
    },
  });
  return res.data.IpfsHash;
}