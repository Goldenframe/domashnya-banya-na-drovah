import React, { Suspense, lazy } from "react";
import {
  Route,
  Navigate,
  createHashRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Loader from "./components/Loader.jsx";
import Home from "./components/Home.jsx";

const Register = lazy(() => import("./components/Register.jsx"));
const Login = lazy(() => import("./components/Login.jsx"));
const UserAccount = lazy(() =>
  import("./components/UserComponents/UserAccount.jsx")
);
const AdminAccount = lazy(() =>
  import("./components/AdminComponents/AdminAccount.jsx")
);
const PageNotFound = lazy(() =>
  import("./components/UserComponents/PageNotFound.jsx")
);
const ForgotPassword = lazy(() => import("./components/ForgotPassword.jsx"));

const router = createHashRouter(
  createRoutesFromElements(
    <>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/userAccount/:userId/*" element={<UserAccount />} />
      <Route path="/adminAccount/:userId/*" element={<AdminAccount />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" />} />
    </>
  )
);

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
