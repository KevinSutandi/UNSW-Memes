<<<<<<< HEAD
=======
import { getData, setData } from "./dataStore";

export function clearV1() {
  const data = getData();
  data.users = [];
  data.channels = [];
  setData(data);
  return {};
}
>>>>>>> c582d17e2ac5f4ba9bb8d97f239e7bc6c5475fd1
