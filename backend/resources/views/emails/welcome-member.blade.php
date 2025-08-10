<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Zoe Flock Admin</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .credentials {
            background-color: #e0e7ff;
            border: 1px solid #4F46E5;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .credentials h3 {
            color: #4F46E5;
            margin-top: 0;
        }
        .credential-item {
            margin: 10px 0;
        }
        .credential-label {
            font-weight: bold;
            color: #4F46E5;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to Zoe Flock Admin!</h1>
    </div>
    
    <div class="content">
        <p>Dear {{ $member->full_name }},</p>
        
        <p>Welcome to Zoe Flock Admin! Your member account has been successfully created, and we've automatically generated a user account for you to access our system.</p>
        
        <div class="credentials">
            <h3>Your Login Credentials</h3>
            <div class="credential-item">
                <span class="credential-label">Email:</span> {{ $member->email }}
            </div>
            <div class="credential-item">
                <span class="credential-label">Password:</span> {{ $password }}
            </div>
        </div>
        
        <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
        
        <p>You can now access your account using these credentials. If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
        <div style="text-align: center;">
            <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/auth/login" class="button">
                Login to Your Account
            </a>
        </div>
        
        <p>Best regards,<br>The Zoe Flock Admin Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} Zoe Flock Admin. All rights reserved.</p>
    </div>
</body>
</html> 