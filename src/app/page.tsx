import Header from "./component/header";
import Footer from "./component/footer";
import { SignedIn } from "@clerk/nextjs";
import Body from "./component/body";

export default function GuestHomePage() {
  return (
    <div className="bg-black ">
      <Header />
      <Body />
      <Footer />
    </div>
  );
}
