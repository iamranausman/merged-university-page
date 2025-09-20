export const  VERIFICATION_EMAIL_TEMPLATE = (verifyCode: string): string => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">${verifyCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 10 Minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>Self Blog App</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
}

export const CONTACT_FORM_TEMPLATE = (first_name: string, last_name: string, email: string, website: string, subject: string, message: string) => {

  return `
  <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .section-title {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
            margin-top: 10px;
            color: #333;
        }
        .section-content {
            font-size: 16px;
            color: #444;
            padding-bottom: 10px;
            border-bottom: 1px solid #ddd;
        }
        .message {
            white-space: pre-line;
            padding-top: 10px;
            color: #333;
        }
        .footer {
            text-align: center;
            padding: 15px;
            font-size: 14px;
            color: #666;
        }
        .footer a {
            color: #E11D48;
            text-decoration: none;
        }
    </style>
</head>
<body>

<div class="container">
    <h2 style="text-align: center;">New Contact Form Submission</h2>

    <div>
        <div class="section-title">Name</div>
        <div class="section-content">${first_name} ${last_name}</div>

        <div class="section-title">Email</div>
        <div class="section-content">
            <a href="mailto:${email}">${email}</a>
        </div>

        <div class="section-title">Website</div>
        <div class="section-content">
            <a href="${website}" target="_blank">${website}</a>
        </div>

        <div class="section-title">Subject</div>
        <div class="section-content">
           ${subject}
        </div>

        <div class="section-title">Comment or Message</div>
        <div class="section-content message">
          ${message}
        </div>
    </div>

    <div class="footer">
        &copy; 2025 <a href="${process.env.NEXT_PUBLIC_API_HOST_URL}">${process.env.NEXT_PUBLIC_API_WEBSITE_NAME}</a>
    </div>
</div>

</body>
</html>

  `

}

export const SUBSCRIPTION_WELCOME_EMAIL = (username: string, randomPassword: string, email: string) =>{
  return `
  <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Our Newsletter!</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      background: #ff4081;
      color: white;
      padding: 15px;
      font-size: 24px;
      font-weight: bold;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 20px;
      text-align: center;
    }
    .content h2 {
      color: #333;
    }
    .content p {
      font-size: 16px;
      color: #666;
      line-height: 1.6;
    }
    .password-box {
      background: #ff4081;
      color: white;
      font-size: 18px;
      font-weight: bold;
      padding: 10px;
      margin: 10px 0;
      border-radius: 5px;
      display: inline-block;
    }
    .cta-button {
      display: inline-block;
      background: #ff4081;
      color: white;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 5px;
      font-size: 18px;
      margin-top: 15px;
      font-weight: bold;
    }
    .cta-button:hover {
      background: #e03572;
    }
    .footer {
      margin-top: 20px;
      font-size: 14px;
      text-align: center;
      color: #999;
    }
  </style>
</head>
<body>

  <div class="container">
    <div class="header">
      🎉 Welcome to ${process.env.NEXT_PUBLIC_API_WEBSITE_NAME}!
    </div>

    <div class="content">
      <h2>Hello, ${username} 👋</h2>
      <p>Thank you for subscribing to our newsletter! You’re now part of our exclusive community where you'll receive the latest updates, special offers, and premium content.</p>
      
      <p><strong>Your Account Details:</strong></p>
      <p class="password-box" style="color:white;">Your Password: ${randomPassword}</p>
      <br>
      <a href="${process.env.NEXT_PUBLIC_API_HOST_URL}/login" class="cta-button">Login Now</a>

      <p>If you have any questions, feel free to <a href="mailto:${process.env.ADMIN_Email}">contact us</a>. We're happy to help!</p>
    </div>

    <div class="footer">
      &copy; 2025 [${process.env.NEXT_PUBLIC_API_WEBSITE_NAME}]. All rights reserved. <br>
      <a href="${process.env.NEXT_PUBLIC_API_HOST_URL}/unsubscribe/?email=${email}">Unsubscribe</a> | <a href="${process.env.NEXT_PUBLIC_API_HOST_URL}">Visit Our Website</a>
    </div>
  </div>

</body>
</html>

  `
}

export const  OTP_VERIFICATION_EMAIL_TEMPLATE = (verifyCode: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>2 Step Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
  <h1 style="color: white; margin: 0;">2 Step Verification Code</h1>
</div>
<div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
  <p>Hello,</p>
  <p>Please enter the 6 digit code for successfull Login.</p>
  <div style="text-align: center; margin: 30px 0;">
    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">${verifyCode}</span>
  </div>
  <p>This code will expire in 10 Minutes for security reasons.</p>
  <p>Best regards,<br>${process.env.NEXT_PUBLIC_API_WEBSITE_NAME}</p>
</div>
<div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
  <p>This is an automated message, please do not reply to this email.</p>
</div>
</body>
</html>
`;
}

export const RESET_PASSWORD_EMAIL_TEMPLATE = (verifyCode: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Recover your password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
  <h1 style="color: white; margin: 0;">Recover your password Code</h1>
</div>
<div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
  <p>Hello,</p>
  <p>Please enter the 6 digit code for recovering the password.</p>
  <div style="text-align: center; margin: 30px 0;">
    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">${verifyCode}</span>
  </div>
  <p>This code will expire in 10 Minutes for security reasons.</p>
  <p>Best regards,<br>${process.env.NEXT_PUBLIC_API_WEBSITE_NAME}</p>
</div>
<div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
  <p>This is an automated message, please do not reply to this email.</p>
</div>
</body>
</html>
`;
}