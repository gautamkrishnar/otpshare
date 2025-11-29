<div align="center">
  <img src="packages/frontend/public/otp-logo.svg" alt="OTP Manager Logo" width="120" height="120">

  # OTP Manager

  ### 🔐 Enterprise-Grade One-Time Password Management

  *Streamline OTP distribution and tracking for teams, organizations, and families*

  [![Build Status](https://img.shields.io/github/actions/workflow/status/gautamkrishnar/otpshare/publish-container.yml?branch=master)](https://github.com/gautamkrishnar/otpshare/actions)
  [![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

## Overview

OTP Manager is a self-hosted, enterprise-ready solution for managing and distributing one-time passwords across your organization. Whether you're managing guest WiFi access, temporary credentials, event passes, or service vouchers, OTP Manager provides a secure, efficient, and user-friendly platform for OTP lifecycle management.

## Features

### Core Capabilities
- **📱 Centralized OTP Distribution** - Single source of truth for all one-time passwords
- **👥 Multi-User Support** - Manage OTP access across unlimited users and teams
- **✅ Real-time Status Tracking** - Instant visibility into OTP usage and availability
- **📊 Advanced Admin Dashboard** - Comprehensive management interface with bulk operations
- **🔒 Role-Based Access Control (RBAC)** - Granular permissions for admins and regular users
- **📥 Smart Import System** - Multiple import methods including plain text, PDF parsing, and bulk paste
- **🔌 TP-Link Omada Integration** - Native PDF import support for Omada Controller voucher exports
- **🔄 Vendor Parser Framework** - Extensible architecture for adding more network equipment integrations
- **📁 Bulk Operations** - Import, delete, and mark multiple OTPs as used in one action
- **🔍 Search & Filter** - Quickly find OTPs with advanced search and filtering capabilities
- **📈 Usage Analytics** - Track OTP consumption patterns and statistics

## Quick Start

### Container Deployment (Recommended)

#### Prerequisites
- Podman or Docker

#### Using Docker/Podman Compose

```bash
# Clone the repository
git clone https://github.com/gautamkrishnar/otpshare.git
cd otpshare

# Copy and configure environment
cp .env.example .env
# Edit .env with your configuration

# Start the application, this uses the pre-built Image
podman compose up -d
# or
docker compose up -d
```

The application will be available at `http://localhost:{PORT-GIVEN-IN-ENV}`

#### Default Credentials (First Run)
On first startup, you'll be prompted to create an admin account. No default credentials are set for security.

### Local Development

#### Prerequisites
- Node.js >= 20.11.0
- Yarn 4.0.2 (managed via corepack)

```bash
# Enable corepack (if not already enabled)
corepack enable

# Install dependencies
yarn install

# Build shared types
yarn workspace @otpshare/shared build

# Run in development mode
yarn dev
```

Access the application at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

### Importing OTPs

#### TP-Link Omada Integration
1. Log in to your TP-Link Omada Controller
2. Navigate to **Guest Portal > Vouchers**
3. Select vouchers and click **Export** (saves as PDF)
4. In OTP Manager, go to **Admin Dashboard > OTP Management**
5. Click **Import OTPs** and select **Voucher Export**
6. Choose **TP-Link Omada** as vendor
7. Upload the exported PDF file
8. OTPs are automatically extracted and imported!

#### Plain Text Import
1. Create a text file with one OTP per line
2. In OTP Manager, go to **Admin Dashboard > OTP Management**
3. Click **Import OTPs** and select **Plain Text**
4. Paste your codes or upload the file
5. Click **Import**

## Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and commit (`git commit -m 'Add amazing feature'`)
4. **Push to your fork** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

```bash
# Run linting
yarn lint

# Format code
yarn format

# Type checking
yarn build

# Run all checks
yarn check
```

### Code Quality Standards
- ✅ TypeScript strict mode enabled
- ✅ All new features must include appropriate types
- ✅ Follow existing code style (enforced by Biome)
- ✅ Write meaningful commit messages
- ✅ Update documentation for new features

## Supported Integrations

### Current Integrations
- ✅ **TP-Link Omada** - Import vouchers directly from PDF exports
- ✅ **Plain Text** - Import from text files (one code per line)
- ✅ **Manual Entry** - Bulk paste codes into the admin interface

### Coming Soon
- 🔜 **UniFi Network** - Ubiquiti guest portal voucher imports
- 🔜 **Cisco Meraki** - Guest WiFi voucher integration
- 🔜 **Aruba Networks** - ClearPass guest access codes
- 🔜 **Ruckus Wireless** - SmartZone voucher exports
- 🔜 **MikroTik** - User manager voucher integration
- 🔜 **pfSense/OPNsense** - Captive portal voucher integration
- 🔜 **CSV/Excel** - Universal spreadsheet import
- 🔜 **REST API** - Programmatic OTP import from external systems

Want to see support for a specific platform? [Request an integration](https://github.com/gautamkrishnar/otpshare/issues/new?labels=enhancement,integration)!

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.


## Support & Community

- 🐛 **Report Issues**: [GitHub Issues](https://github.com/gautamkrishnar/otpshare/issues/new?labels=bug)
- 💡 **Feature Requests**: [GitHub Issues](https://github.com/gautamkrishnar/otpshare/issues/new?labels=enhancement)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/gautamkrishnar/otpshare/discussions)
- ⭐ **Star this project** if you find it useful!


<div align="center">
  Made with ❤️ and TypeScript
</div>
