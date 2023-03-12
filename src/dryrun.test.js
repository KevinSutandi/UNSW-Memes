import { authRegisterV1 } from './auth.js';

import { channelsCreateV1, channelsListV1 } from './channels.js';

import { clearV1 } from './other.js';

describe('testing return for clear', () => {
  authRegisterV1('email@email.com', 'password', 'first', 'last');
  clearV1();
  authRegisterV1('email@email.com', 'password', 'first', 'last');
  clearV1();
});

describe('testing type returned for authRegisterV1', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Test output type definition', () => {
    const data = authRegisterV1(
      'onlyfortest00@gmail.com',
      'testpw0000',
      'EL_001',
      'YIU'
    );
    expect(typeof data === 'object').toBe(true);
    expect('authUserId' in data).toBe(true);
    expect(typeof data.authUserId === 'number').toBe(true);
  });
});

describe('testing type returned for channelsCreate', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Test output type definition', () => {
    const data = authRegisterV1(
      'onlyfortest00@gmail.com',
      'testpw0000',
      'EL_001',
      'YIU'
    );
    const channel = channelsCreateV1(data.authUserId, 'dongo', true);
    expect(typeof channel === 'object').toBe(true);
    expect('channelId' in channel).toBe(true);
    expect(typeof channel.channelId === 'number').toBe(true);
  });
});

describe('testing type returned for channelsList', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Test output type definition', () => {
    const name = 'dongo';
    const data = authRegisterV1(
      'onlyfortest00@gmail.com',
      'testpw0000',
      'EL_001',
      'YIU'
    );
    const channel = channelsCreateV1(data.authUserId, 'dongo', true);
    const list = channelsListV1(data.authUserId);
    expect(typeof channel === 'object').toBe(true);
    expect('channelId' in channel).toBe(true);
    expect(typeof channel.channelId === 'number').toBe(true);
    expect(typeof list.channels[0] === 'object').toBe(true);
    expect('channelId' in list.channels[0]).toBe(true);
    expect('name' in list.channels[0]).toBe(true);
    expect(typeof list.channels[0].channelId === 'number').toBe(true);
    expect(list.channels[0].channelId === channel);
    expect(typeof list.channels[0].name === 'string').toBe(true);
    expect(list.channels[0].name === name).toBe(true);
  });
});
