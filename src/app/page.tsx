import Header from "./component/header";
import Footer from "./component/footer";
import { SignedIn } from "@clerk/nextjs";
import Body from "./component/body";
import ChatPage from "./component/displayChat";

export default function GuestHomePage() {
  return (
    <div className="bg-black ">
      <Header />

      <Body />
      <Footer />
    </div>
  );
}
