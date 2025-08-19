// The [[...]] syntax in the folder names is a Next.js feature called "Optional Catch-all Segments." Clerk uses this to handle complex routing paths within the sign-in/up flow (like multi-factor authentication) automatically.
// The <SignIn /> and <SignUp /> components are fully functional forms provided by Clerk. They handle user input, validation, and communication with the Clerk service.
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignUp />
    </div>
  );
}