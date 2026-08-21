import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up | Selectt Admin"
        description="Sign up for a Selectt Admin account."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
