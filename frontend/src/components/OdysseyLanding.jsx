import RightGrid from "./RightGrid";

export default function OdysseyLanding() {
  return (
    <div
      className="mx-auto max-w-[1600px] grid grid-cols-[1fr_900px] items-center"
      style={{
        minHeight: "calc(100vh - 80px)", // subtract navbar height
        marginTop: "10px", // offset so it visually centers under the navbar
      }}
    >
      {/* left column: headline */}
      <div className="pl-16 flex items-center justify-start">
        <h1 className="font-vogue text-[8rem] leading-none tracking-tight">
          Odyssey
        </h1>
      </div>

      {/* right column: grid panel */}
      <div className="w-[900px] -translate-x-20 flex items-center justify-center">
        <RightGrid />
      </div>
    </div>
  );
}
