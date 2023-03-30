import { authRegister, clearV1, dmList} from './httpHelper';
import { AuthReturn, dmCreateReturn } from './interfaces';

const ERROR = { error: expect.any(String) };

describe('testing dmListV1', () => {
    let user: AuthReturn, user2: AuthReturn;
    let dm: dmCreateReturn;
    beforeEach(() => {
      clearV1();
      user = authRegister(
        'onlyfortestttt06@gmail.com',
        'testpw0005',
        'Jonah',
        'Meggs'
      );
      user2 = authRegister(
        'testing123445@gmail.com', 
        'mina282', 
        'Mina', 
        'Kov'
        );
    });
  
    afterEach(() => {
      clearV1();
    });
  
    // test when there are multiple dms in the list
    test('the token taken is invalid', () => {
        expect(dmList('alminaaaaascnj')).toStrictEqual(ERROR);
        }); 

    test('valid user but there are no dms in the list', () => {

    });

    test('valid user with only one dm in the list', () => {            
        dm = dmCreate(user.token, user.dmId);

        expect(dmList(user.token)).toStrictEqual({
            dms: [
                {
                    dmId: dm.dmId,
                    name: dm.name,
                },
            ],
        });
    });

    test('valid user with multiple dms in the list', () => {

    });

    // tListAfterLeaveDm
});
