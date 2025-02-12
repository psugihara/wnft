import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

import interRegular from "../font/Inter-Regular.woff";
import interSemiBold from "../font/Inter-SemiBold.woff";
import notoSansSymbols2 from "../font/NotoSansSymbols2-Regular.ttf";
import graphemeImages from "./graphemeImages.json";
import {
  darkTheme,
  fontWeight,
  lightTheme,
  wnftSize,
  ThemeStyles,
  WnftArgs,
  Accent,
  getCheckedImageUrl,
  getTitleSize,
  footerGradientHeight,
  avatarImageSize,
  featuredImageSize,
} from "./util.js";

export type { WnftArgs, Accent };
export async function getWnft(
  {
    title,
    accent,
    theme,
    address,
    displayName,
    featuredImageUrl: uncheckedFeaturedImageUrl,
    avatarUrl: uncheckedAvatarUrl,
  }: WnftArgs,
  options?: { size?: number }
): Promise<Buffer> {
  const themeStyles: ThemeStyles = theme === "light" ? lightTheme : darkTheme;

  const [featuredImageUrl, avatarUrl] = await Promise.all([
    getCheckedImageUrl({
      url: uncheckedFeaturedImageUrl,
      size: featuredImageSize,
    }),
    getCheckedImageUrl({
      url: uncheckedAvatarUrl,
      size: avatarImageSize,
    }),
  ]);

  const titleSize = getTitleSize({
    hasFeaturedImage: !!featuredImageUrl,
    titleLength: title.length,
  });

  const svgString = await satori(
    <div
      style={{
        backgroundColor: themeStyles.background,
        width: wnftSize,
        height: wnftSize,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {featuredImageUrl ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              width: featuredImageSize.width,
              height: featuredImageSize.height,
              display: "flex",
              position: "relative",
            }}
          >
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
              }}
              width={featuredImageSize.width}
              height={featuredImageSize.height}
              src={featuredImageUrl}
            />
          </div>

          <span
            style={{
              fontFamily: "Inter",
              fontWeight: fontWeight.semiBold,
              color: themeStyles.foreground,
              fontSize: titleSize,
              lineHeight: 1.13,
              display: "flex",
              paddingTop: 90,
              paddingLeft: 103,
              paddingRight: 103,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </span>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            width: wnftSize,
            paddingLeft: 108,
            paddingRight: 108,
          }}
        >
          <span
            style={{
              paddingBottom: 128,
              fontFamily: "Inter",
              fontWeight: fontWeight.semiBold,
              color: themeStyles[accent],
              fontSize: titleSize,
              letterSpacing: "-0.02em",
              lineHeight: 1.21,
            }}
          >
            {title}
          </span>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: themeStyles.background,
          display: "flex",
          paddingBottom: 112,
          paddingLeft: 112,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: -footerGradientHeight + 2, // Need a little offset to stop clipping
            height: footerGradientHeight,
            backgroundImage: `linear-gradient(0deg, ${themeStyles.background}, ${themeStyles.backgroundNoOpacity})`,
          }}
        />

        <div
          style={{
            width: avatarImageSize.width,
            height: avatarImageSize.height,
            position: "relative",
            display: "flex",
          }}
        >
          {avatarUrl ? (
            <img
              style={{
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                borderRadius: avatarImageSize.width,
                display: "flex",
                borderWidth: 4,
                borderColor:
                  theme === "light"
                    ? themeStyles.foregroundSecondary
                    : themeStyles.foregroundTertiary,
                borderStyle: "solid",
              }}
              width={avatarImageSize.width}
              height={avatarImageSize.height}
              src={avatarUrl}
            />
          ) : (
            <div
              style={{
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: avatarImageSize.width,
                backgroundColor: themeStyles[accent],
              }}
            />
          )}
        </div>

        <div
          style={{
            paddingLeft: 52,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span
            style={{
              fontFamily: "Inter",
              fontWeight: fontWeight.semiBold,
              fontSize: 75,
              color: themeStyles.foreground,
              letterSpacing: "-0.02em",
              paddingTop: 19,
            }}
          >
            {displayName}
          </span>

          <span
            style={{
              fontFamily: "Inter",
              fontWeight: fontWeight.regular,
              fontSize: 61,
              letterSpacing: "-0.013em",
              color: themeStyles.textTertiary,
              paddingTop: 4,
            }}
          >
            {address}
          </span>
        </div>
      </div>
    </div>,
    {
      width: wnftSize,
      height: wnftSize,
      fonts: [
        {
          name: "Inter",
          data: interRegular,
          weight: fontWeight.regular,
          style: "normal",
        },
        {
          name: "Inter",
          data: interSemiBold,
          weight: fontWeight.semiBold,
          style: "normal",
        },
        {
          name: "Noto Sans Symbols 2",
          data: notoSansSymbols2,
        },
      ],
      graphemeImages: graphemeImages as Record<string, string>,
    }
  );

  const resvg = new Resvg(svgString, {
    fitTo: {
      mode: "width",
      value: options?.size ?? wnftSize,
    },
    font: {
      loadSystemFonts: false,
    },
  });

  const pngData = resvg.render();

  return pngData.asPng();
}
