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
            beforeEach(() => {
                const html = NewBillUI();
                document.body.innerHTML = html;
            });

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