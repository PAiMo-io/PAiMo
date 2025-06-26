export const template = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{title}}</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f4f7;
      font-family:
        Segoe UI,
        Tahoma,
        sans-serif;
    "
  >
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="background-color: #f4f4f7"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              padding: 30px 20px;
              border-radius: 10px;
            "
          >
            <tr>
              <td align="center">
                <img
                  src="{{appUrl}}/paimo_logo.png"
                  alt="PAiMO Logo"
                  width="160"
                  style="margin-bottom: 20px"
                />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 0 20px">
                <h2 style="color: #222; font-size: 24px">
                  {{subTitle}}
                </h2>
                <p style="font-size: 16px; line-height: 1.6; color: #333">
                  {{{intro}}}
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 20px">
                <!-- BUTTON USING TABLE -->
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td
                      bgcolor="#007bff"
                      style="border-radius: 6px; text-align: center"
                    >
                      <a
                        href="{{verifyUrl}}"
                        target="_blank"
                        style="
                          display: inline-block;
                          padding: 14px 28px;
                          font-size: 16px;
                          color: #ffffff;
                          text-decoration: none;
                          border-radius: 6px;
                        "
                      >
                        {{confirmButton}}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 20px">
                <p style="font-size: 14px; color: #555">
                  {{fallbackTip}}
                </p>
                <p
                  style="word-break: break-all; font-size: 14px; color: #007bff"
                >
                  <a
                    href="{{verifyUrl}}"
                    style="color: #007bff; text-decoration: none"
                  >
                    {{verifyUrl}}
                  </a>
                </p>
              </td>
            </tr>
            <tr>
              <td
                align="center"
                style="padding-top: 30px; font-size: 12px; color: #888"
              >
                You’re receiving this because you signed up for PAiMO.<br />
                &copy; {{year}} PAiMO. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
