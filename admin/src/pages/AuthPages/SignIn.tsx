import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | Selectt Admin"
        description="Sign in to the Selectt Admin panel."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
