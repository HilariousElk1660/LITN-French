import { useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from 'react-router-dom'

import RootLayout from './routes/__root'
import LocaleLayout from './routes/_locale.$locale'
import IndexPage from './routes/_locale.$locale.index'
import HomePage from './routes/_locale.$locale.home'
import CataloguePage from './routes/_locale.$locale.catalogue'
import BookPage from './routes/_locale.$locale.book.$id'
import LoginPage from './routes/_locale.$locale.login'
import SignupPage from './routes/_locale.$locale.signup'
import ProfilePage from './routes/_locale.$locale.profile'
import AdminPage from './routes/_locale.$locale.admin'
import ReaderPage from './routes/_locale.$locale.read.$id'
import IndexRoot from './routes/_locale.$locale.index'
import { ForgotPasswordPage } from './routes/_locale.$locale.forgot-password'
import { withLocalePath, resolvePreferredLocale } from './lib/i18n'
import CheckoutPage from './routes/_locale.$locale.checkout'
import PaymentCancelled from './routes/_locale.$locale.cancelled'
import PaymentSuccess from './routes/_locale.$locale.success'

function RedirectToPreferredLocale() {
  const navigate = useNavigate()
  useEffect(() => {
    const locale = resolvePreferredLocale()
    navigate(withLocalePath('/', locale), { replace: true })
  }, [navigate])
  return null
}

function NotFound() {
  return <Navigate to="/" replace />
}

function NotImplemented({ name }: { name?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{name ?? 'Page'} not implemented</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page is not yet migrated. Go back to the catalogue.</p>
        <div className="mt-4">
          <a href="/" className="text-teal-bright hover:underline">Home</a>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<RedirectToPreferredLocale />} />

          <Route path=":locale" element={<LocaleLayout />}>
            <Route index element={<IndexPage />} />
            <Route path="home" element={<HomePage />} />
            <Route path="catalogue" element={<CataloguePage />} />
            <Route path="book/:id" element={<BookPage />} />
            <Route path="read/:id" element={<ReaderPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="payment/cancelled" element={<PaymentCancelled />} />
            <Route path="payment/success" element={<PaymentSuccess />} />
            <Route path="author/:id" element={<NotImplemented name="Author" />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
