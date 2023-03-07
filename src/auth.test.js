// test for userregister

// invalid email, invalid userid
// email not matched;
// password not correct

import {authRegisterV1} from './auth.js';
const ERROR = { error: expect.any(String) };

describe('testing authRegisterV1', () => {
    
    test('Test successful authRegister, without non-alphanumeric', () => {
        let result = authRegisterV1('onlyfortest00@gmail.com', 'testpw0000', 'EL_001', 'YIU');
        expect(result).toBe('el001yiu');
    });

    // for too long user handle- cut at 20th character; convert to lower cases as well
    test('Test successful authRegister with cut-off name', () => {
        let result = authRegisterV1('onlyfortest01@gmail.com', 'testpw0001', 'abcdefghijklm', 'YIUopqrst');
        expect(result).toBe('abcdefghijklmyiuopqr');
    });

    // one userid has already been taken, append the smallest number after
    test('Test successful authRegister with ID already be used', () => {
        let result = authRegisterV1('onlyfortest02@gmail.com', 'testpw0002', 'abcdefghijklm', 'YIUopqrst');
        expect(result).toBe('abcdefghijklmyiuopqr0');
    });

    // one userid has already been taken, append the smallest number after again
    test('Test successful authRegister with ID already be used.2', () => {
        let result = authRegisterV1('onlyfortest03@gmail.com', 'testpw0003', 'abcdefghijklm', 'YIUopqrst');
        expect(result).toBe('abcdefghijklmyiuopqr1');
    });
    
    test('Test invalid email', () => {
        expect(authRegisterV1('onlyfortest03gmail.com', 'testpw0003', 'abcdefghijklm', 'YIUopqrst')).toStrictEqual(ERROR);
    });

    test('Test already used email', () => {
        expect(authRegisterV1('onlyfortest03@gmail.com', 'testpw0004', 'EL0000', 'EVE0000')).toStrictEqual(ERROR);
    });

    test('Test too short password', () => {
        expect(authRegisterV1('onlyfortest04@gmail.com', 'tpw', 'EL0001', 'EVE001')).toStrictEqual(ERROR);
    });


    test('Test too long nameFirst', () => {
        expect(authRegisterV1('onlyfortest05@gmail.com', 'testpw0005', 'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop0', 'EVE002')).toStrictEqual(ERROR);
    });

    test('Test too long nameLast', () => {
        expect(authRegisterV1('onlyfortest06@gmail.com', 'testpw0005', 'EL0002','qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop9')).t09oStrictEqual(ERROR);
    });
})