import { getData, setData } from './dataStore';

export function clearV1(): Record<string, never> {
  const data = getData();
  data.users = [];
  data.channels = [];
  data.dm = [];
  data.resetCodes = [];
  removeImages();
  setData(data);

  return {};
}

function removeImages() {
  const path = './img';
  const fs = require('fs');
  fs.readdirSync(path).forEach((file: any) => {
    // remove any file with .jpg except for default
    if (file.endsWith('.jpg') && file !== 'default.jpg') {
      fs.unlinkSync(`${path}/${file}`);
    }
  });
}
