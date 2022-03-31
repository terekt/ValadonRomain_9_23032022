/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import mockStore from "../__mocks__/store";
import router from "../app/Router";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {

            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            const windowIcon = screen.getByTestId('icon-window')
            expect(windowIcon.classList.contains("active-icon")).toBeTruthy(); //expect ajouté
        })
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills })
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })
    })

    describe("When I am on bills page but it is loading", () => { // Loading
        test("Then, Loading page should be rendered", () => {
            document.body.innerHTML = BillsUI({ loading: true });
            expect(screen.getAllByText("Loading...")).toBeTruthy();
        });
    });

    describe("When I am on bills page but back-end send an error message", () => { // Error
        test("Then, Error page should be rendered", () => {
            document.body.innerHTML = BillsUI({ error: "some error message" });
            expect(screen.getAllByText("Erreur")).toBeTruthy();
        });
    });

    describe("When I click on the icon eye", () => { // modal
        test("A modal should open", () => {

            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
            document.body.innerHTML = BillsUI({ data: bills })
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname })
            }
            const store = null
            const billsList = new Bills({ document, onNavigate, store, localStorage: window.localStorage })

            const eyebuttons = screen.getAllByTestId("icon-eye")
            const eyebutton = eyebuttons[0]
            $.fn.modal = jest.fn();
            const handleClickIconEye = jest.fn(billsList.handleClickIconEye(eyebutton))
            eyebutton.addEventListener("click", handleClickIconEye)
            userEvent.click(eyebutton);

            /*const modaleFile = document.querySelector(`div[class="modal fade show"]`)
            expect(modaleFile.classList.contains("show")).toBeTruthy()*/
            const modaleFile = screen.getByTestId('modaleFile')
            expect(modaleFile).toBeTruthy()
        })
    })

    describe('When I am on Bills Page and I click on the New Bill button', () => { // New bill
        test('Then it should render NewBill page', () => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
            document.body.innerHTML = BillsUI({ data: bills })
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname })
            }
            const store = null
            const billsTable = new Bills({ document, onNavigate, store, localStorage: window.localStorage })

            const pathname = ROUTES_PATH.NewBill
            const data = []
            const error = null
            const loading = false
            document.body.innerHTML = ROUTES({ pathname, data, error, loading })

            expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
        })
    })
});

// test d'intégration GET
describe("Given I am a user connected as an employee", () => {
    describe("When I navigate to Dashboard", () => {
        test("fetches bills from mock API GET", async () => {
            localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee", email: "a@a" })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);

            const contentBills = await screen.getByText("Transports");
            expect(contentBills).toBeTruthy();
        });
        describe("When an error occurs on API", () => {
            beforeEach(() => {
                jest.spyOn(mockStore, "bills");
                Object.defineProperty(window, "localStorage", {
                    value: localStorageMock,
                });
                window.localStorage.setItem(
                    "user",
                    JSON.stringify({
                        type: "Employee",
                        email: "a@a",
                    })
                );
                const root = document.createElement("div");
                root.setAttribute("id", "root");
                document.body.appendChild(root);
                router();
            });
            test("fetches bills from an API and fails with 404 message error", async () => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 404"));
                        },
                    };
                });
                window.onNavigate(ROUTES_PATH.Bills);
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 404/);
                expect(message).toBeTruthy();
            });

            test("fetches messages from an API and fails with 500 message error", async () => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 500"));
                        },
                    };
                });

                window.onNavigate(ROUTES_PATH.Bills);
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 500/);
                expect(message).toBeTruthy();
            });
        });
    });
});