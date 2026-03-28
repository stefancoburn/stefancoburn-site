import satori from 'satori';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Read fonts at module level - resolve from project root
const projectRoot = process.cwd();
const fontBold = readFileSync(resolve(projectRoot, 'src/fonts/Lato-Bold.ttf'));
const fontRegular = readFileSync(resolve(projectRoot, 'src/fonts/Lato-Regular.ttf'));

export async function generateOgImage(title: string, subtitle?: string): Promise<Buffer> {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#faf5ef',
          padding: '60px',
          fontFamily: 'Lato',
        },
        children: [
          // Top accent bar
          {
            type: 'div',
            props: {
              style: {
                width: '80px',
                height: '6px',
                backgroundColor: '#d4764e',
                borderRadius: '3px',
              },
            },
          },
          // Middle section - title
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'center',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: title.length > 60 ? 42 : title.length > 40 ? 52 : 64,
                      fontWeight: 700,
                      color: '#1a1a1a',
                      lineHeight: 1.2,
                      letterSpacing: '-0.02em',
                    },
                    children: title,
                  },
                },
                ...(subtitle
                  ? [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: 24,
                            fontWeight: 400,
                            color: '#555',
                            marginTop: '16px',
                          },
                          children: subtitle,
                        },
                      },
                    ]
                  : []),
              ],
            },
          },
          // Bottom branding
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 20,
                      fontWeight: 400,
                      color: '#555',
                      letterSpacing: '0.02em',
                    },
                    children: 'stefancoburn.com',
                  },
                },
                // Small accent square
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#d4764e',
                      borderRadius: '2px',
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Lato',
          data: fontBold,
          weight: 700,
          style: 'normal' as const,
        },
        {
          name: 'Lato',
          data: fontRegular,
          weight: 400,
          style: 'normal' as const,
        },
      ],
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return png;
}
