import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LocaleLink } from "@/components/locale-link";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { usePayment } from "@/hooks/use-payment";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Alert } from "@/components/ui/alert";

export default function PaymentSuccess() {

  
  const bookDetails = JSON.parse(localStorage.getItem("bookDetails") || "{}");
  const token = api.getToken()

  const updateBookRequest = async () => {
    try {

      const res = await fetch(`/update_book_request`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...bookDetails,
          status: "paid"
        })
      });

      if (res.ok){
        localStorage.removeItem("bookDetails");
      }
    }catch(e){
      alert("Error updating book request");
      console.error("Error updating book request",e)
    }
  }

  useEffect(()=>{
    if (bookDetails.book_id){
      updateBookRequest();
    }
  },[bookDetails])

 return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-24 sm:px-6">
        <div className="rounded-3xl border border-border/60 bg-surface p-6 sm:p-8 shadow-card text-center">
          <h1 className="font-display text-2xl sm:text-3xl text-foreground">
            Payment Successful
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you for your purchase! your order is confirmed and your book is now available for reading.
          </p>

          <LocaleLink
            to="/profile#books"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-teal px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
          >
            View Book
          </LocaleLink>
        </div>
      </main>
      <SiteFooter />
    </div>
 )
}