import { SignIn, useUser } from "@clerk/nextjs";

export default function Page() {
  const { isSignedIn } = useUser();

  return (
    <div className="flex justify-center items-center h-screen">
      {!isSignedIn && <SignIn />}
    </div>
  );
}
