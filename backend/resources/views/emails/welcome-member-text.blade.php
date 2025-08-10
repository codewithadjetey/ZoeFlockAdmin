Welcome to Zoe Flock Admin!

Dear {{ $member->full_name }},

Welcome to Zoe Flock Admin! Your member account has been successfully created, and we've automatically generated a user account for you to access our system.

Your Login Credentials:
Email: {{ $member->email }}
Password: {{ $password }}

Important: Please change your password after your first login for security purposes.

You can now access your account using these credentials. If you have any questions or need assistance, please don't hesitate to contact our support team.

Login to your account: {{ config('app.frontend_url', 'http://localhost:3000') }}/auth/login

Best regards,
The Zoe Flock Admin Team

---
This is an automated message. Please do not reply to this email.
© {{ date('Y') }} Zoe Flock Admin. All rights reserved. 