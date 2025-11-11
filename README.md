# EduFund - Educational Crowdfunding Platform

A comprehensive full-stack crowdfunding platform designed specifically for educational fundraising. Students can create campaigns for their educational needs while donors can discover and support meaningful educational causes.

## Features

### For Students
- **Campaign Creation & Management**: Create detailed fundraising campaigns with images, goals, and descriptions
- **Campaign Review Workflow**: Automatic review process for campaign approval
- **Real-time Analytics**: Track donations, views, shares, and campaign performance
- **Profile Management**: Manage student profiles with verification workflow
- **Campaign Updates**: Post updates and milestones to keep donors informed
- **Milestone Celebrations**: Automatic celebrations when reaching funding milestones

### For Donors
- **Campaign Discovery**: Browse campaigns with advanced filters (category, location, university)
- **Featured Campaigns**: Highlighted campaigns on the homepage carousel
- **Donation Tracking**: Complete donation history and receipt generation
- **Donor Wall**: Recognition wall showing top donors and recent contributions
- **Favorites System**: Bookmark and track favorite campaigns
- **Social Sharing**: Share campaigns on social media platforms
- **Comments**: Engage with students through campaign comments

### For Administrators
- **Campaign Review**: Approve or reject submitted campaigns
- **Profile Verification**: Verify student profiles and documentation
- **Platform Analytics**: Comprehensive dashboard with platform-wide metrics
- **User Management**: Manage users across all roles
- **Content Moderation**: Monitor and moderate platform content

### Platform Features
- **Multi-role Authentication**: Student, Donor, and Admin roles
- **Secure Payment Processing**: Donation tracking and management
- **Email Notifications**: Automated email system for key events
- **Image Upload**: Campaign image management with thumbnails
- **Responsive Design**: Mobile-friendly interface with TailwindCSS
- **Real-time Updates**: Live campaign statistics and notifications

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Backend
- **Node.js & Express** - Server framework
- **MySQL** - Relational database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Sharp** - Image processing
- **Nodemailer** - Email service

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **CORS** - Cross-origin resource sharing

## Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **MySQL** 8.0+ or XAMPP/MAMP
- **Git** for version control

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/lkiwan/edufund.git
cd edufund
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory based on `.env.example`:

```env
# Database Configuration
DB_HOST=10.255.255.254
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=edufund
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# API Keys (Optional)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

4. **Set up the database**

Start your MySQL server (XAMPP/MAMP or standalone), then initialize the database:

```bash
node create-database.js
node initialize-tables.js
```

5. **Seed sample data (optional)**
```bash
node seed-sample-data.js
node add-test-user.js
```

### Running the Application

**Development Mode:**

Start the backend server:
```bash
npm start
# or
node server.js
```
Server runs on `http://localhost:5000`

Start the frontend dev server (in a new terminal):
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

**Production Build:**
```bash
npm run build
npm run serve
```

## Project Structure

```
edufund/
├── src/
│   ├── components/          # React components
│   │   ├── layout/         # Navigation, Footer
│   │   ├── ui/             # Reusable UI components
│   │   ├── DonationModal.jsx
│   │   ├── DonorWall.jsx
│   │   ├── FavoriteButton.jsx
│   │   ├── MilestoneCelebration.jsx
│   │   └── ShareButtons.jsx
│   ├── pages/              # Page components
│   │   ├── Home.jsx
│   │   ├── Discover.jsx
│   │   ├── CampaignDetails.jsx
│   │   ├── CreateCampaign.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── DonorDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── Login.jsx
│   ├── services/           # API services
│   │   └── api.js
│   ├── utils/              # Utility functions
│   │   ├── currency.js
│   │   └── toast.js
│   ├── data/               # Static data
│   │   ├── moroccoLocations.js
│   │   └── moroccoUniversities.js
│   ├── styles/             # CSS files
│   │   └── index.css
│   ├── App.jsx
│   ├── Routes.jsx
│   └── index.jsx
├── routes/                 # Express routes
│   └── profileRoutes.js
├── public/                 # Static assets
│   └── assets/
├── uploads/                # User uploaded files
│   └── campaigns/
├── scripts/                # Database scripts
│   ├── seed-campaigns.js
│   └── migrate-and-seed.js
├── server.js               # Express server
├── package.json
├── vite.config.mjs         # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── README.md
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user

### Campaigns
- `GET /api/campaigns` - List all campaigns (with filters)
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns` - Create new campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /api/campaigns/:id/updates` - Get campaign updates
- `POST /api/campaigns/:id/updates` - Post campaign update
- `GET /api/campaigns/:id/comments` - Get campaign comments
- `POST /api/campaigns/:id/comments` - Post comment

### Donations
- `GET /api/donations` - List donations
- `POST /api/donations` - Create donation
- `GET /api/campaigns/:id/donations` - Get campaign donations

### Favorites
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites/:campaignId` - Add to favorites
- `DELETE /api/favorites/:campaignId` - Remove from favorites

### Admin
- `GET /api/admin/campaigns/pending` - Get pending campaigns
- `PUT /api/admin/campaigns/:id/approve` - Approve campaign
- `PUT /api/admin/campaigns/:id/reject` - Reject campaign
- `GET /api/admin/users` - List all users
- `GET /api/admin/analytics` - Platform analytics

### Analytics
- `GET /api/analytics/campaign/:id` - Campaign analytics
- `GET /api/analytics/student/:userId` - Student analytics

### Profiles
- `GET /api/profiles/:userId` - Get user profile
- `PUT /api/profiles/:userId` - Update profile
- `PUT /api/admin/profiles/:userId/approve` - Approve profile
- `PUT /api/admin/profiles/:userId/reject` - Reject profile

For detailed API documentation, see [COMPLETE_API_REFERENCE.md](COMPLETE_API_REFERENCE.md)

## Database Schema

### Core Tables
- **users** - User accounts (email, password, role)
- **campaigns** - Campaign information
- **donations** - Donation records
- **campaign_updates** - Campaign progress updates
- **campaign_comments** - User comments
- **favorites** - User favorite campaigns
- **campaign_metrics** - Campaign analytics
- **profiles** - Extended user profile information
- **share_tracking** - Social media share tracking

## Development Workflow

### Adding Test Data
```bash
node add-test-user.js          # Add test users
node seed-sample-data.js       # Add sample campaigns
```

### Testing Features
```bash
node test-admin-functionality.js    # Test admin features
node test-campaign-review.js        # Test review workflow
node test-favorites.js              # Test favorites system
```

### Database Management
```bash
node create-database.js        # Create database
node initialize-tables.js      # Create tables
node setup-profile-tables.js   # Setup profile tables
```

## Environment Configuration

The application supports different environments through the `.env` file:

- **Development**: Full logging, CORS enabled, hot reload
- **Production**: Optimized build, secure configurations

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt password encryption
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Controlled cross-origin access
- **File Upload Validation**: Image type and size restrictions
- **Role-based Access Control**: Protected admin routes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Documentation

Additional documentation available:
- [Admin System Documentation](ADMIN_SYSTEM_DOCUMENTATION.md)
- [Campaign Review Workflow](CAMPAIGN_REVIEW_WORKFLOW.md)
- [Complete API Reference](COMPLETE_API_REFERENCE.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- [GoFundMe Feature Comparison](GOFUNDME_FEATURE_COMPARISON.md)
- [Donor Wall Feature](DONOR_WALL_FEATURE.md)
- [Milestone Celebrations](MILESTONE_CELEBRATIONS_FEATURE.md)

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists: `node create-database.js`

### Frontend Cannot Connect to Backend
- Ensure backend is running on port 5000
- Check Vite proxy configuration in `vite.config.mjs`
- Verify CORS settings in `server.js`

### Image Upload Failures
- Check `uploads/campaigns/` directory exists
- Verify write permissions
- Ensure file size is under limit

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
- GitHub Issues: https://github.com/lkiwan/edufund/issues
- Email: omar.arhoune@gmail.com

## Acknowledgments

Built with modern web technologies and best practices for educational crowdfunding.
