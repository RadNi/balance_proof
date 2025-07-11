import Connect from "@/components/connect";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#add7ff] to-[#fffac2]">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-black sm:text-[5rem] text-center">
          Prove ETH Balance In <span className="text-text-[#d0679d]">Zero-Knowledge</span>
        </h1>
        <span className="text-center text-black">
          Enter the amount you wish to prove exceeds your ETH balance, then click Generate Proof. The output will be logged in the console.
        </span>
        <span className="text-center" style={{ color: 'grey' }}>
          Changing the tab may slow down the proof generation!
        </span>
        <Connect />
      </div>
    </main>
  );
}
