import React, { Suspense, lazy } from "react";
import {
  Route,
  Navigate,
  createHashRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Loader from "@/shared/ui/loader";
import Home from "@/pages/home";

const Register = lazy(() => import("@/pages/register"));
const Login = lazy(() => import("@/pages/login"));
const UserAccount = lazy(() =>
  import("@/pages/user-account")
);
const AdminAccount = lazy(() =>
  import("@/pages/admin-account")
);
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));

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
