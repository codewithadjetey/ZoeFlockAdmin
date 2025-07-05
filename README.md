# Zoe Flock Admin - Church Management System

[![Laravel](https://img.shields.io/badge/Laravel-10.x-red.svg)](https://laravel.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, comprehensive church management system built with Laravel and Next.js, designed to help churches manage their members, events, donations, and communications efficiently.

## 🚀 Current Version: v1.0.0

### ✨ Features

#### 🔐 Authentication & Authorization
- **Multi-role system**: Admin, Pastor, Member roles with granular permissions
- **Secure API authentication** using Laravel Sanctum
- **Role-based access control** with Spatie Laravel Permission
- **Password reset** and email verification
- **Dark mode support** with modern UI

#### 👥 Member Management
- **Complete member profiles** with contact information, demographics
- **Advanced search and filtering** capabilities
- **Member statistics** and analytics
- **Bulk operations** for member management
- **Profile pictures** and personal information

#### 📅 Event Management
- **Event creation and management** with detailed information
- **Calendar integration** for easy scheduling
- **Event categories** and recurring events
- **RSVP tracking** and attendance management

#### 💰 Donation Management
- **Secure donation tracking** with multiple payment methods
- **Donation categories** and reporting
- **Financial analytics** and insights
- **Tax receipt generation**

#### 📢 Communication Tools
- **Mass messaging** to members and groups
- **Email and SMS integration**
- **Communication templates**
- **Message history** and delivery tracking

#### 👥 Group Management
- **Small group organization** and management
- **Group hierarchies** and leadership structure
- **Group-specific communications**
- **Attendance tracking** for groups

#### ⚙️ System Administration
- **User management** with role assignments
- **Permission management** and role customization
- **System settings** and configuration
- **Audit logs** for security tracking

## 🛠 Tech Stack

### Backend (Laravel 12.x)
- **Framework**: Laravel 12.x with PHP 8.2+
- **Authentication**: Laravel Sanctum for API authentication
- **Authorization**: Spatie Laravel Permission for roles & permissions
- **Database**: MySQL/PostgreSQL with Eloquent ORM
- **API**: RESTful API with JSON responses
- **Validation**: Laravel's built-in validation system
- **Testing**: PHPUnit with Pest for testing

### Frontend (Next.js 14.x)
- **Framework**: Next.js 14.x with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API
- **UI Components**: Custom component library
- **Dark Mode**: Full dark mode support
- **Responsive**: Mobile-first responsive design

### Development Tools
- **Package Manager**: Composer (PHP), npm (Node.js)
- **Version Control**: Git with conventional commits
- **Code Quality**: Laravel Pint, ESLint, Prettier
- **Documentation**: Auto-generated API documentation
- **Deployment**: Docker-ready configuration

## 📋 Requirements

### System Requirements
- **PHP**: 8.2 or higher
- **Node.js**: 18.x or higher
- **Database**: MySQL 8.0+ or PostgreSQL 13+
- **Web Server**: Apache/Nginx
- **Memory**: Minimum 512MB RAM
- **Storage**: 1GB free space

### PHP Extensions
- BCMath PHP Extension
- Ctype PHP Extension
- JSON PHP Extension
- Mbstring PHP Extension
- OpenSSL PHP Extension
- PDO PHP Extension
- Tokenizer PHP Extension
- XML PHP Extension

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/zoe-flock-admin.git
cd zoe-flock-admin
```

### 2. Backend Setup (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=RolePermissionSeeder
php artisan serve
```

### 3. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/v1

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update profile

### Member Management
- `GET /api/v1/members` - List members
- `POST /api/v1/members` - Create member
- `GET /api/v1/members/{id}` - Get member details
- `PUT /api/v1/members/{id}` - Update member
- `DELETE /api/v1/members/{id}` - Delete member

### More endpoints available in the API documentation

## 🔮 Roadmap

### Version 1.1.0 (Q2 2024)
- [ ] **Mobile App Development**
  - React Native mobile application
  - Offline capability for member data
  - Push notifications for events
  - QR code check-in system
  - Mobile-first member portal

### Version 1.2.0 (Q3 2024)
- [ ] **Advanced Analytics**
  - Attendance trends and patterns
  - Donation analytics and forecasting
  - Member engagement metrics
  - Custom report builder

### Version 1.3.0 (Q4 2024)
- [ ] **Integration Features**
  - Calendar sync (Google, Outlook)
  - Payment gateway integration
  - Email marketing integration
  - Social media integration

### Version 2.0.0 (2025)
- [ ] **AI-Powered Features**
  - Smart member recommendations
  - Automated communication scheduling
  - Predictive analytics for attendance
  - AI-powered content suggestions

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards
- Follow PSR-12 coding standards for PHP
- Use TypeScript for all frontend code
- Write tests for new features
- Update documentation for API changes
- Follow conventional commit messages

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include system information and error logs
- Check existing issues before creating new ones

## ☕ Support the Project

If you find this project helpful, consider supporting its development:

### Buy Me a Coffee
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-%23FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/codewithado)

### Other Ways to Support
- ⭐ Star this repository
- 🐛 Report bugs and issues
- 💡 Suggest new features
- 📖 Improve documentation
- 🔧 Submit pull requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Laravel Team** for the amazing PHP framework
- **Vercel** for Next.js and deployment platform
- **Tailwind CSS** for the utility-first CSS framework
- **Spatie** for the Laravel Permission package
- **All contributors** who help improve this project

## 📞 Contact

- **Project Maintainer**: [Your Name](mailto:your-email@example.com)
- **GitHub Issues**: [Report Issues](https://github.com/your-username/zoe-flock-admin/issues)
- **Discussions**: [Join Discussions](https://github.com/your-username/zoe-flock-admin/discussions)

---

**Made with ❤️ for churches worldwide**
