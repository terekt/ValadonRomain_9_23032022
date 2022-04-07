/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store.js";
import store from '../__mocks__/store';
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
    beforeEach(() => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
        document.body.innerHTML = NewBillUI()
    })

    describe('When I am on NewBill Page', () => {
        test('The form is displayed and then submitted', async () => {
            const html = NewBillUI();
            document.body.innerHTML = html;
            const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) };
            const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage });

            await waitFor(() => screen.getByTestId('form-new-bill'));
            const newForm = screen.getByTestId('form-new-bill');

            expect(newForm).toBeTruthy();

            const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
            newForm.addEventListener('submit', handleSubmit);
            fireEvent.submit(newForm);

            expect(handleSubmit).toBeCalled();
        });

        describe('When I click on button change file', () => {
            test('Recognize if a file is a jpeg', () => {
                const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) };

                const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });
                const blob = new Blob(['image'], { type: 'image/jpeg' });
                const file = new File([blob], 'file.jpeg', { type: 'image/jpeg' });
                const inputFile = screen.getByTestId('file');
                const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

                inputFile.addEventListener('change', handleChangeFile);
                fireEvent.change(inputFile, { target: { files: [file] } });

                expect(inputFile.files[0].name).toBe('file.jpeg');
                expect(handleChangeFile).toBeCalled();
            });

            test('Recognize if a file has a wrong type', () => {
                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({ pathname });
                };
                const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage });
                const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
                const inputFile = screen.getByTestId('file');

                inputFile.addEventListener('change', handleChangeFile);
                fireEvent.change(inputFile, {
                    target: {
                        files: [
                            new File(['image.txt'], 'image.txt', { type: 'image/txt' }),
                        ],
                    },
                });
                expect(inputFile.files[0].name).not.toBe('image.jpg');
            });
        });
    });
});


// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
    beforeEach(() => {
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
  
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "jane@doe"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
  
    describe("When I navigate to NewBill page", () => {
      test("Then create new bill to mock API POST", async () => {
        document.body.innerHTML = NewBillUI()
        const spy = jest.spyOn(mockStore, "bills")
        const billdata={
          status: "pending",
          pct: 60,
          amount: 600,
          email: "jane@doe",
          name: "test123",
          vat: "60",
          fileName: "test.jpg",
          date: "2006-06-06",
          commentary: "test123",
          type: "Restaurants et bars",
          fileUrl: "test.jpg"
        }
        
        mockStore.bills().create(billdata)
        
        expect(spy).toHaveBeenCalledTimes(1)
        expect(billdata.fileUrl).toBe("test.jpg")
      })
    })
  
    describe("When an error occurs on API", () => {
      test("Then it fails with 404 message error", async () => {      
        jest.spyOn(mockStore, "bills")
        const rejected = mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {return Promise.reject(new Error("Erreur 404"))}
          }
        })
  
        window.onNavigate(ROUTES_PATH.NewBill)
        await new Promise(process.nextTick);
  
        expect(rejected().create).rejects.toEqual(new Error("Erreur 404"))
      })
      
      test("Then create new bill to an API and fails with 500 message error", async () => {
        jest.spyOn(mockStore, "bills")
        const rejected = mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {return Promise.reject(new Error("Erreur 500"))}
          }
        })
  
        window.onNavigate(ROUTES_PATH.NewBill)
        await new Promise(process.nextTick);
  
        expect(rejected().create).rejects.toEqual(new Error("Erreur 500"))
      })
    })
  })