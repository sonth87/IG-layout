"use client";

import { boothMono, boothSerif } from "./fonts";
import { BoothHome } from "./Home";
import { floorStyle } from "./ui";

// The booth's lobby as IG Layout's hanging tag shows it while being pulled (the real screen,
// nothing to tap). Loaded only when the tag is touched.

const noop = () => {};

export default function BoothPreview() {
  return (
    <div className={`${boothSerif.variable} ${boothMono.variable} relative h-full w-full overflow-hidden text-[#f3e9d6]`} style={floorStyle}>
      <BoothHome preview onSolo={noop} onRoom={noop} onUpload={noop} onOpen={noop} />
    </div>
  );
}
