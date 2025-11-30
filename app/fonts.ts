// app/fonts.ts
import localFont from "next/font/local";

export const raleway = localFont({
    src: [
        {
            path: "./fonts/raleway/Raleway-VariableFont_wght.woff2",
            weight: "100 900",
            style: "normal",
        },
    ],
    variable: "--font-raleway",
    weight: "100 900", // full supported range
    style: "normal",
    display: "swap",
});