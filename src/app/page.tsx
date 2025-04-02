import Header from "./component/header";
import Footer from "./component/footer";
import { SignedIn } from "@clerk/nextjs";
import Body from "./component/body";
import { SignedOut } from "@clerk/nextjs/dist/types/components.server";

export default function GuestHomePage() {
  return (
    <div className="bg-neutral-900">
      <Header />
      <Body />
      <Footer />
    </div>
  );
}
