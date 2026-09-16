import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { CreatePaymentPayload } from "@/lib/payfast";


type BookDetails ={
    request_id: string,
    book_id:string,
    book_name:string,
    price: number,
    status: string
    currency: string,
    reader_id : string,
    reader_email: string,
    reader_name: string,
    payment_type: string

}


type PaymentCtx = {
bookDetails : BookDetails
setBookDetails : (bookDetails: BookDetails) => void
}

const Ctx = createContext<PaymentCtx>({
bookDetails: {
    request_id: "",
    book_id:"",
    book_name: "",
    price: 0,
    status: "",
    currency: "",
    reader_id: "",
    reader_email: "",
    reader_name:"",
    payment_type: ""
},
setBookDetails: () => {}
})

export function PaymentProvider({ children }: { children: ReactNode }) {
    const [bookDetails,setBookDetails] = useState<BookDetails>({
        request_id: "",
        book_id:"",
        book_name:"",
        price: 0,
        status: "paid",
        currency: "",
        reader_id: "",
        reader_email: "",
        reader_name:"",
        payment_type: "payfast"
    })
    return (
        <Ctx.Provider value={{bookDetails,setBookDetails}}>
            {children}
        </Ctx.Provider>
    )
}

export const usePayment = () => useContext(Ctx)