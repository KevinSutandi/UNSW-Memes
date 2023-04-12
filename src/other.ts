import { getData, setData } from './dataStore';

export function clearV1(): Record<string, never> {
  const data = getData();
  data.users = [];
  data.channels = [];
  data.dm = [];
  setData(data);

  return {};
}
