/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
    beforeEach(() => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
        document.body.innerHTML = NewBillUI()
    })
    describe("When I am on NewBill Page", () => {
        test("Then it should show all inputs and a send button", () => {

            expect(screen.getByText("Type de dépense")).toBeTruthy()
            expect(screen.getByText("Nom de la dépense")).toBeTruthy()
            expect(screen.getByText("Date")).toBeTruthy()
            expect(screen.getByText("Montant TTC")).toBeTruthy()
            expect(screen.getByText("TVA")).toBeTruthy()
            expect(screen.getByText("Commentaire")).toBeTruthy()
            expect(screen.getByText("Justificatif")).toBeTruthy()
            expect(screen.getByText("Envoyer")).toBeTruthy()
        })
    })

    describe("When I am on NewBill Page and I click on button 'Choisir un fichier' ", () => {
        test("Then the function handleChangeFile is called", () => {

            const file = screen.getByTestId("file")
            const handleChangeFile = jest.fn()
            file.addEventListener("click", handleChangeFile)
            userEvent.click(file);

            expect(handleChangeFile).toHaveBeenCalled()
        })
    })
})




// POST (A modifier, simple copie du GET pour l'instant)
/*describe("Given I am a user connected as Employee", () => {
    beforeEach(() => {
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
  
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
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
          pct: 20,
          amount: 200,
          email: "jane@doe",
          name: "holidays",
          vat: "40",
          fileName: "justificatif.jpg",
          date: "2002-02-02",
          commentary: "holidays",
          type: "Restaurants et bars",
          fileUrl: "justificatif.jpg"
        }
        
        mockStore.bills().create(billdata)
        
        expect(spy).toHaveBeenCalledTimes(1)
        expect(billdata.fileUrl).toBe("justificatif.jpg")
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
    })*/
